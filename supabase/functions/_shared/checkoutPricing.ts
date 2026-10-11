/**
 * Server-side checkout pricing.
 *
 * The amount a payment provider charges is decided here, never by the
 * client: every line item is priced from catalog_products.selling_price_cents,
 * the discount is recomputed from the promo code, and shipping follows the
 * free-shipping rule. The client's total is only accepted when it matches.
 */

import { FunctionError } from "./errors.ts";
import { supabaseRest } from "./supabase.ts";
import { fetchPrintify } from "./fetchWithTimeout.ts";
import { validateEnvVars } from "./validators.ts";
import {
  computeCheckoutTotals,
  evaluatePromoDiscount,
  isWithinTolerance,
  normalizeLineItems,
  type CheckoutLineItemT,
  type CheckoutTotalsT,
  type PromoRowI,
} from "./checkoutPricingRules.ts";

export interface PricedCheckoutItemI {
  blueprintId: number;
  variantId: number;
  quantity: number;
  unitPriceCents: number;
  productId?: string;
}

export interface CheckoutPricingI extends CheckoutTotalsT {
  items: PricedCheckoutItemI[];
  promoCode: string | null;
}

interface CatalogPriceRowI {
  blueprint_id: number;
  selling_price_cents: number | null;
  is_active: boolean | null;
}

interface VariantRowI {
  blueprint_id: number;
  printify_variant_id: number;
  is_available: boolean | null;
}

interface PrintifyProductI {
  blueprint_id?: number;
  variants?: Array<{ id: number; is_enabled: boolean }>;
}

function rejectLineItems(message: string): never {
  throw new FunctionError(400, "INVALID_LINE_ITEMS", message);
}

/** Existing Printify products are priced through their blueprint. */
async function resolveProductBlueprint(item: Extract<CheckoutLineItemT, { kind: "product" }>, userId: string): Promise<number> {
  const ownership = await supabaseRest<Array<{ user_id: string | null }>>(
    `products?printify_product_id=eq.${encodeURIComponent(item.productId)}&select=user_id`, "GET",
  );
  if (ownership.error) throw new Error("Could not verify product ownership");
  if (ownership.data?.some((product) => product.user_id !== null && product.user_id !== userId)) {
    throw new FunctionError(404, "PRODUCT_NOT_FOUND", "Product not found");
  }
  const response = await fetchPrintify(
    `/v1/shops/${validateEnvVars.printifyShopId()}/products/${encodeURIComponent(item.productId)}.json`,
    validateEnvVars.printifyToken(),
  );
  if (response.status === 404) rejectLineItems(`Unknown product ${item.productId}`);
  if (!response.ok) throw new Error(`Printify product lookup failed (${response.status})`);

  const product = await response.json() as PrintifyProductI;
  const variant = product.variants?.find((candidate) => candidate.id === item.variantId);
  if (!product.blueprint_id || !variant?.is_enabled) {
    throw new FunctionError(400, "VARIANT_NOT_AVAILABLE", `Variant ${item.variantId} is not available`);
  }
  return product.blueprint_id;
}

async function loadPromo(code: string): Promise<PromoRowI | null> {
  const result = await supabaseRest<PromoRowI[]>(
    `promocodes?code=eq.${encodeURIComponent(code)}&select=code,type,value,is_active,expires_at,max_uses,used_count`,
    "GET",
  );
  if (result.error) throw new Error("Could not load promo code");
  return result.data?.[0] ?? null;
}

export async function priceCheckout(
  { lineItems, promoCode, userId }: { lineItems: unknown; promoCode?: unknown; userId: string },
): Promise<CheckoutPricingI> {
  const normalized = normalizeLineItems(lineItems);
  if (!normalized) rejectLineItems("Every line item needs a product, a variant and a quantity from 1 to 99");

  const items: Array<Omit<PricedCheckoutItemI, "unitPriceCents">> = [];
  for (const item of normalized) {
    items.push(item.kind === "blueprint"
      ? { blueprintId: item.blueprintId, variantId: item.variantId, quantity: item.quantity }
      : { blueprintId: await resolveProductBlueprint(item, userId), variantId: item.variantId, quantity: item.quantity, productId: item.productId });
  }

  const blueprintIds = [...new Set(items.map((item) => item.blueprintId))];
  const catalog = await supabaseRest<CatalogPriceRowI[]>(
    `catalog_products?blueprint_id=in.(${blueprintIds.join(",")})&select=blueprint_id,selling_price_cents,is_active`,
    "GET",
  );
  if (catalog.error || !catalog.data) throw new Error("Could not load catalog prices");
  const prices = new Map<number, number>();
  for (const row of catalog.data) {
    if (row.is_active && typeof row.selling_price_cents === "number" && row.selling_price_cents > 0) {
      prices.set(row.blueprint_id, row.selling_price_cents);
    }
  }
  const unpriced = blueprintIds.filter((id) => !prices.has(id));
  if (unpriced.length) {
    throw new FunctionError(400, "PRODUCT_NOT_PRICED", `No selling price for blueprint ${unpriced.join(", ")}`);
  }

  // Catalog variants must exist and be available; existing Printify products
  // were already checked against the provider's own enabled variants.
  const catalogItems = items.filter((item) => !item.productId);
  if (catalogItems.length) {
    const variantIds = [...new Set(catalogItems.map((item) => item.variantId))];
    const variants = await supabaseRest<VariantRowI[]>(
      `product_variants?blueprint_id=in.(${blueprintIds.join(",")})&printify_variant_id=in.(${variantIds.join(",")})&select=blueprint_id,printify_variant_id,is_available`,
      "GET",
    );
    if (variants.error || !variants.data) throw new Error("Could not load catalog variants");
    const available = new Set(
      variants.data.filter((row) => row.is_available !== false).map((row) => `${row.blueprint_id}:${row.printify_variant_id}`),
    );
    const missing = catalogItems.find((item) => !available.has(`${item.blueprintId}:${item.variantId}`));
    if (missing) {
      throw new FunctionError(400, "VARIANT_NOT_AVAILABLE", `Variant ${missing.variantId} is not available`);
    }
  }

  const priced = items.map((item) => ({ ...item, unitPriceCents: prices.get(item.blueprintId)! }));
  const subtotalCents = priced.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);

  const code = typeof promoCode === "string" ? promoCode.trim().toUpperCase() : "";
  if (!code) return { ...computeCheckoutTotals(subtotalCents), items: priced, promoCode: null };

  const discount = evaluatePromoDiscount(await loadPromo(code), subtotalCents, new Date());
  if (!discount.ok) throw new FunctionError(400, "INVALID_PROMO_CODE", discount.reason);
  return { ...computeCheckoutTotals(subtotalCents, discount), items: priced, promoCode: code };
}

/** The client total is a confirmation of what the customer saw, never the price. */
export function requireClientTotal(pricing: CheckoutPricingI, clientTotalCents: number): void {
  if (!isWithinTolerance(pricing.totalCents, clientTotalCents)) {
    throw new FunctionError(
      400,
      "PRICE_MISMATCH",
      `Server total ${pricing.totalCents} cents does not match client total ${clientTotalCents} cents`,
    );
  }
}

/** Stored on payment_transactions; fulfilment and promo redemption read it. */
export function pricingMetadata(pricing: CheckoutPricingI) {
  return {
    promo_code: pricing.promoCode,
    subtotal_cents: pricing.subtotalCents,
    discount_cents: pricing.discountCents,
    shipping_cost_cents: pricing.shippingCents,
    total_cents: pricing.totalCents,
    priced_items: pricing.items.map((item) => ({
      blueprint_id: item.blueprintId,
      variant_id: item.variantId,
      quantity: item.quantity,
      unit_price_cents: item.unitPriceCents,
      ...(item.productId ? { product_id: item.productId } : {}),
    })),
  };
}

/** Short form for provider metadata, which has tight size limits. */
export function providerPricingMetadata(pricing: CheckoutPricingI): Record<string, string> {
  return {
    ...(pricing.promoCode ? { promo_code: pricing.promoCode } : {}),
    subtotal_cents: String(pricing.subtotalCents),
    discount_cents: String(pricing.discountCents),
    shipping_cost_cents: String(pricing.shippingCents),
  };
}
