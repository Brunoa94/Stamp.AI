/**
 * Server-Side Price Service
 *
 * CRITICAL SECURITY: This service fetches prices from the database,
 * NOT from client-provided data. Use this to compute the amount that is
 * actually charged and to reject tampered totals (C4 / SEC-06).
 *
 * All prices are stored and returned in CENTS to avoid floating point issues.
 */

import { supabaseRest } from "./supabase.ts";
import { FunctionError } from "./errors.ts";

export interface LineItemForPricingI {
  blueprint_id: number;
  printify_variant_id: number;
  quantity: number;
}

export interface PricedLineItemI extends LineItemForPricingI {
  unit_price_cents: number;
  total_cents: number;
  product_name?: string;
}

export interface ServerPricingResultI {
  success: boolean;
  subtotal_cents: number;
  items: PricedLineItemI[];
  errors: string[];
}

interface ProductVariantRowI {
  blueprint_id: number;
  printify_variant_id: number;
  price_cents: number | null;
  color: string | null;
  size: string | null;
}

interface CatalogProductRowI {
  blueprint_id: number;
  display_title: string;
}

interface PromocodeRowI {
  code: string;
  type: string;
  value: number;
  is_active: boolean;
  expires_at: string | null;
  max_uses: number | null;
  used_count: number;
}

/**
 * Shipping rule. Must stay in sync with the client rule in
 * src/features/checkout/lib/hooks/useCheckoutPricing.ts and
 * src/shared/mappers/services/cartServiceMapper.ts.
 *
 * TODO(shipping): shipping is a flat rule, not fetched per variant/country
 * (product_variants has no shipping columns). Residual risk: the rule can
 * drift from what the client displays, but the client can no longer choose
 * its own shipping amount.
 */
export const FREE_SHIPPING_THRESHOLD_CENTS = 6000;
export const SHIPPING_COST_CENTS = 499;

/** Maximum quantity per line item; guards against absurd totals. */
const MAX_QUANTITY_PER_ITEM = 100;
/** Maximum promo code length accepted from the client. */
const MAX_PROMO_CODE_LENGTH = 64;
/** Rounding tolerance between client and server totals, in cents. */
const TOTAL_TOLERANCE_CENTS = 1;

function toPositiveInt(value: unknown): number | null {
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
    return null;
  }
  return n;
}

export interface NormalizeLineItemsResultI {
  items: LineItemForPricingI[];
  errors: string[];
}

/**
 * Normalize client line items into the shape the catalog is keyed by.
 *
 * Accepts either `variant_id` (what the checkout's PrintifyLineItem sends)
 * or `printify_variant_id`. EVERY item must carry a blueprint id and a
 * variant id; anything else is an error, never silently skipped.
 */
export function normalizeLineItemsForPricing(rawItems: unknown): NormalizeLineItemsResultI {
  const errors: string[] = [];
  const items: LineItemForPricingI[] = [];

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { items, errors: ["line_items must be a non-empty array"] };
  }

  rawItems.forEach((raw, index) => {
    if (!raw || typeof raw !== "object") {
      errors.push(`Line item ${index}: must be an object`);
      return;
    }
    const item = raw as Record<string, unknown>;

    const blueprintId = toPositiveInt(item.blueprint_id);
    const variantId = toPositiveInt(item.variant_id ?? item.printify_variant_id);
    const quantity = item.quantity === undefined ? 1 : toPositiveInt(item.quantity);

    if (blueprintId === null) {
      errors.push(`Line item ${index}: missing or invalid blueprint_id`);
    }
    if (variantId === null) {
      errors.push(`Line item ${index}: missing or invalid variant_id`);
    }
    if (quantity === null || quantity > MAX_QUANTITY_PER_ITEM) {
      errors.push(`Line item ${index}: invalid quantity`);
    }
    if (blueprintId === null || variantId === null || quantity === null || quantity > MAX_QUANTITY_PER_ITEM) {
      return;
    }

    items.push({ blueprint_id: blueprintId, printify_variant_id: variantId, quantity });
  });

  return { items, errors };
}

/**
 * Fetch authoritative prices from the database for given line items.
 * Returns pricing calculated server-side, not from client data.
 */
export async function computeServerSidePricing(
  lineItems: LineItemForPricingI[],
): Promise<ServerPricingResultI> {
  const errors: string[] = [];
  const pricedItems: PricedLineItemI[] = [];

  if (!lineItems || lineItems.length === 0) {
    return {
      success: false,
      subtotal_cents: 0,
      items: [],
      errors: ["No line items provided"],
    };
  }

  const blueprintIds = [...new Set(lineItems.map((item) => item.blueprint_id))];
  const variantIds = [...new Set(lineItems.map((item) => item.printify_variant_id))];

  const productsResult = await supabaseRest<CatalogProductRowI[]>(
    `catalog_products?blueprint_id=in.(${blueprintIds.join(",")})&select=blueprint_id,display_title`,
    "GET",
  );

  const productMap = new Map<number, string>();
  if (productsResult.data) {
    for (const product of productsResult.data) {
      productMap.set(product.blueprint_id, product.display_title);
    }
  }

  // Fetch variant prices from database - THIS IS THE SOURCE OF TRUTH
  const variantsResult = await supabaseRest<ProductVariantRowI[]>(
    `product_variants?blueprint_id=in.(${blueprintIds.join(",")})&printify_variant_id=in.(${variantIds.join(",")})&select=blueprint_id,printify_variant_id,price_cents,color,size`,
    "GET",
  );

  if (variantsResult.error || !variantsResult.data) {
    return {
      success: false,
      subtotal_cents: 0,
      items: [],
      errors: ["Failed to fetch variant prices from database"],
    };
  }

  const priceMap = new Map<string, number>();
  for (const variant of variantsResult.data) {
    if (typeof variant.price_cents !== "number" || variant.price_cents < 0) continue;
    priceMap.set(`${variant.blueprint_id}:${variant.printify_variant_id}`, variant.price_cents);
  }

  let subtotalCents = 0;

  for (const item of lineItems) {
    const unitPriceCents = priceMap.get(`${item.blueprint_id}:${item.printify_variant_id}`);

    if (unitPriceCents === undefined) {
      errors.push(
        `Price not found for blueprint ${item.blueprint_id}, variant ${item.printify_variant_id}`,
      );
      continue;
    }

    if (item.quantity <= 0 || !Number.isInteger(item.quantity)) {
      errors.push(`Invalid quantity for variant ${item.printify_variant_id}`);
      continue;
    }

    const totalCents = unitPriceCents * item.quantity;
    subtotalCents += totalCents;

    pricedItems.push({
      ...item,
      unit_price_cents: unitPriceCents,
      total_cents: totalCents,
      product_name: productMap.get(item.blueprint_id),
    });
  }

  return {
    success: errors.length === 0,
    subtotal_cents: subtotalCents,
    items: pricedItems,
    errors,
  };
}

export interface PromoDiscountResultI {
  code: string;
  type: "percentage" | "numeric";
  value: number;
  discount_cents: number;
}

/**
 * Look up a promo code with the service key and compute its discount from
 * the promocode definition. Throws INVALID_PROMO_CODE for unknown, inactive,
 * expired or exhausted codes.
 */
export async function resolvePromoDiscountCents(
  promoCode: string,
  subtotalCents: number,
  now: Date = new Date(),
): Promise<PromoDiscountResultI> {
  const normalized = promoCode.trim().toUpperCase();
  if (!normalized || normalized.length > MAX_PROMO_CODE_LENGTH) {
    throw new FunctionError(400, "INVALID_PROMO_CODE", "Promo code is invalid");
  }

  const result = await supabaseRest<PromocodeRowI[]>(
    `promocodes?code=eq.${encodeURIComponent(normalized)}&select=code,type,value,is_active,expires_at,max_uses,used_count&limit=1`,
    "GET",
  );

  const row = result.data?.[0];
  if (result.error || !row || !row.is_active) {
    throw new FunctionError(400, "INVALID_PROMO_CODE", "Promo code is invalid");
  }
  if (row.expires_at !== null && new Date(row.expires_at).getTime() <= now.getTime()) {
    throw new FunctionError(400, "INVALID_PROMO_CODE", "Promo code has expired");
  }
  if (row.max_uses !== null && row.used_count >= row.max_uses) {
    throw new FunctionError(400, "INVALID_PROMO_CODE", "Promo code usage limit reached");
  }
  if (row.type !== "percentage" && row.type !== "numeric") {
    throw new FunctionError(400, "INVALID_PROMO_CODE", "Promo code is invalid");
  }
  if (typeof row.value !== "number" || !Number.isFinite(row.value) || row.value < 0) {
    throw new FunctionError(400, "INVALID_PROMO_CODE", "Promo code is invalid");
  }

  // Same rule as src/lib/promocodes/evaluatePromocode.ts, in cents.
  const rawCents = row.type === "percentage"
    ? Math.round(subtotalCents * (row.value / 100))
    : Math.round(row.value * 100);
  const discountCents = Math.max(0, Math.min(rawCents, subtotalCents));

  return { code: row.code, type: row.type, value: row.value, discount_cents: discountCents };
}

export function computeShippingCents(subtotalCents: number, discountCents: number): number {
  return subtotalCents - discountCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_COST_CENTS;
}

export interface PriceOrderRequestInputI {
  line_items: unknown;
  /** Client total in cents (what the client intends to pay). */
  clientTotalCents: number;
  promo_code?: unknown;
  /** Backward-compat hints. Must equal the server-computed values when present. */
  shipping_cost_cents?: unknown;
  discount_cents?: unknown;
}

export interface ServerOrderPricingI {
  items: PricedLineItemI[];
  subtotal_cents: number;
  shipping_cost_cents: number;
  discount_cents: number;
  promo_code: string | null;
  /** The amount to charge, in cents. */
  total_cents: number;
}

function optionalCentsHint(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
    throw new FunctionError(400, "INVALID_PRICING_INPUT", `${field} must be a non-negative integer`);
  }
  return value;
}

/**
 * Price an order request entirely server-side and verify the client's
 * intended total matches. The returned total_cents is what MUST be charged.
 *
 * Throws FunctionError (400) with one of:
 *  - INVALID_LINE_ITEMS: missing/empty/unpriceable items
 *  - INVALID_PROMO_CODE: promo code cannot be applied
 *  - INVALID_PRICING_INPUT: malformed hints, or discount claimed without a promo code
 *  - PRICE_MISMATCH: client total differs from the server total by > 1 cent
 */
export async function priceOrderRequest(
  input: PriceOrderRequestInputI,
): Promise<ServerOrderPricingI> {
  const normalized = normalizeLineItemsForPricing(input.line_items);
  if (normalized.errors.length > 0) {
    throw new FunctionError(400, "INVALID_LINE_ITEMS", normalized.errors.join("; "));
  }

  const pricing = await computeServerSidePricing(normalized.items);
  if (!pricing.success) {
    throw new FunctionError(400, "INVALID_LINE_ITEMS", pricing.errors.join("; "));
  }

  const shippingHint = optionalCentsHint(input.shipping_cost_cents, "shipping_cost_cents");
  const discountHint = optionalCentsHint(input.discount_cents, "discount_cents");

  let promoCode: string | null = null;
  let discountCents = 0;
  if (input.promo_code !== undefined && input.promo_code !== null && input.promo_code !== "") {
    if (typeof input.promo_code !== "string") {
      throw new FunctionError(400, "INVALID_PROMO_CODE", "promo_code must be a string");
    }
    const promo = await resolvePromoDiscountCents(input.promo_code, pricing.subtotal_cents);
    promoCode = promo.code;
    discountCents = promo.discount_cents;
  }

  if (discountHint !== undefined && discountHint !== discountCents) {
    throw new FunctionError(
      400,
      "INVALID_PRICING_INPUT",
      promoCode
        ? "discount_cents does not match the promo code discount"
        : "A discount requires a valid promo_code",
    );
  }

  const shippingCents = computeShippingCents(pricing.subtotal_cents, discountCents);
  if (shippingHint !== undefined && shippingHint !== shippingCents) {
    throw new FunctionError(
      400,
      "PRICE_MISMATCH",
      `Shipping cost has changed (expected ${shippingCents} cents)`,
    );
  }

  const totalCents = pricing.subtotal_cents + shippingCents - discountCents;

  if (
    !Number.isFinite(input.clientTotalCents) ||
    Math.abs(totalCents - input.clientTotalCents) > TOTAL_TOLERANCE_CENTS
  ) {
    throw new FunctionError(
      400,
      "PRICE_MISMATCH",
      `Order total has changed: server computed ${totalCents} cents, client sent ${input.clientTotalCents} cents. Please refresh the checkout page.`,
    );
  }

  return {
    items: pricing.items,
    subtotal_cents: pricing.subtotal_cents,
    shipping_cost_cents: shippingCents,
    discount_cents: discountCents,
    promo_code: promoCode,
    total_cents: totalCents,
  };
}

/**
 * Remove client-controlled keys that the server owns. `order_id` in
 * particular must never come from the client at creation time: the DB order
 * is created after payment and linked through payment_transactions.order_id.
 */
const RESERVED_METADATA_KEYS = new Set([
  "order_id",
  "user_id",
  "user_email",
  "line_items",
  "shipping_address",
  "promo_code",
  "subtotal_cents",
  "shipping_cost_cents",
  "discount_cents",
  "total_cents",
]);

export function sanitizeClientMetadata(metadata: unknown): Record<string, unknown> {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return {};
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata as Record<string, unknown>)) {
    if (RESERVED_METADATA_KEYS.has(key)) continue;
    clean[key] = value;
  }
  return clean;
}

/** Pricing fields worth persisting alongside the transaction. */
export function pricingMetadata(pricing: ServerOrderPricingI): Record<string, unknown> {
  return {
    subtotal_cents: pricing.subtotal_cents,
    shipping_cost_cents: pricing.shipping_cost_cents,
    discount_cents: pricing.discount_cents,
    total_cents: pricing.total_cents,
    ...(pricing.promo_code ? { promo_code: pricing.promo_code } : {}),
  };
}
