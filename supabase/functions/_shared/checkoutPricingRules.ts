/**
 * Pure checkout pricing rules shared by the payment Edge Functions.
 *
 * Kept free of Deno-specific imports so the Vitest suite in
 * src/tests/edge-functions/checkoutPricingRules.test.ts can import it
 * directly. The promo and shipping rules mirror the checkout UI
 * (useCheckoutPricing) and the /api/validate-promocode route
 * (evaluatePromocode); a divergence makes every affected checkout fail
 * with PRICE_MISMATCH instead of silently charging a different amount.
 */

export const FREE_SHIPPING_THRESHOLD_CENTS = 6000;
export const SHIPPING_COST_CENTS = 499;
/** Rounding slack between the UI's euro arithmetic and these cent rules. */
export const PRICE_TOLERANCE_CENTS = 1;
export const MAX_ITEM_QUANTITY = 99;

export type CheckoutLineItemT =
  | { kind: "blueprint"; blueprintId: number; variantId: number; quantity: number }
  | { kind: "product"; productId: string; variantId: number; quantity: number };

export interface PromoRowI {
  code: string;
  type: string;
  value: number;
  is_active: boolean;
  expires_at: string | null;
  max_uses: number | null;
  used_count: number;
}

export type PromoRejectionT =
  | "invalidPromoCode"
  | "promoCodeExpired"
  | "promoCodeLimitReached";

export type PromoDiscountT =
  | { ok: true; discountCents: number; exactDiscountCents: number }
  | { ok: false; reason: PromoRejectionT };

export interface CheckoutTotalsT {
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function toPositiveInteger(value: unknown): number | null {
  const numeric = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  return isPositiveInteger(numeric) ? numeric : null;
}

/**
 * Validates and normalizes the line items a client sent. Returns null when
 * any item is unusable: every item must be priceable, so nothing is skipped.
 */
export function normalizeLineItems(raw: unknown): CheckoutLineItemT[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const items: CheckoutLineItemT[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") return null;
    const item = entry as Record<string, unknown>;
    const variantId = toPositiveInteger(item.variant_id);
    const quantity = item.quantity;
    if (variantId === null || !isPositiveInteger(quantity) || quantity > MAX_ITEM_QUANTITY) {
      return null;
    }

    const blueprintId = toPositiveInteger(item.blueprint_id);
    if (blueprintId !== null) {
      items.push({ kind: "blueprint", blueprintId, variantId, quantity });
      continue;
    }

    if (typeof item.product_id === "string" && /^[A-Za-z0-9]{1,64}$/.test(item.product_id)) {
      items.push({ kind: "product", productId: item.product_id, variantId, quantity });
      continue;
    }

    return null;
  }

  return items;
}

/** Same lifecycle and discount rules as evaluatePromocode, in cents. */
export function evaluatePromoDiscount(
  row: PromoRowI | null,
  subtotalCents: number,
  now: Date,
): PromoDiscountT {
  if (!row || !row.is_active || (row.type !== "percentage" && row.type !== "numeric")) {
    return { ok: false, reason: "invalidPromoCode" };
  }
  if (row.expires_at !== null && new Date(row.expires_at).getTime() <= now.getTime()) {
    return { ok: false, reason: "promoCodeExpired" };
  }
  if (row.max_uses !== null && row.used_count >= row.max_uses) {
    return { ok: false, reason: "promoCodeLimitReached" };
  }

  const value = Number(row.value);
  const raw = row.type === "percentage" ? subtotalCents * (value / 100) : value * 100;
  const exactDiscountCents = Math.max(0, Math.min(raw, subtotalCents));
  return { ok: true, discountCents: Math.round(exactDiscountCents), exactDiscountCents };
}

/**
 * Shipping is free from €60 after discount. The threshold uses the unrounded
 * discount, as the checkout UI does.
 */
export function computeCheckoutTotals(
  subtotalCents: number,
  discount: { discountCents: number; exactDiscountCents: number } = { discountCents: 0, exactDiscountCents: 0 },
): CheckoutTotalsT {
  const shippingCents = subtotalCents - discount.exactDiscountCents >= FREE_SHIPPING_THRESHOLD_CENTS
    ? 0
    : SHIPPING_COST_CENTS;
  return {
    subtotalCents,
    discountCents: discount.discountCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents - discount.discountCents,
  };
}

export function isWithinTolerance(serverTotalCents: number, clientTotalCents: number): boolean {
  return Number.isFinite(clientTotalCents) &&
    Math.abs(serverTotalCents - clientTotalCents) <= PRICE_TOLERANCE_CENTS;
}

export interface PricedItemRecordI {
  blueprint_id: number;
  variant_id: number;
  quantity: number;
  product_id?: string;
}

/** Existing Printify products are identified by product, catalog items by blueprint. */
function itemRef(item: { productId?: string; blueprintId?: number }): string {
  return item.productId ? `p:${item.productId}` : `b:${item.blueprintId}`;
}

/** Order-independent identity of a set of line items. */
export function lineItemsKey(items: Array<{ productId?: string; blueprintId?: number; variantId: number; quantity: number }>): string {
  const totals = new Map<string, number>();
  for (const item of items) {
    const key = `${itemRef(item)}:${item.variantId}`;
    totals.set(key, (totals.get(key) ?? 0) + item.quantity);
  }
  return [...totals].map(([key, quantity]) => `${key}x${quantity}`).sort().join(",");
}

/** True when the requested items are exactly the items a payment priced. */
export function matchesPricedItems(requested: CheckoutLineItemT[], priced: PricedItemRecordI[]): boolean {
  const requestedKey = lineItemsKey(requested.map((item) => item.kind === "product"
    ? { productId: item.productId, variantId: item.variantId, quantity: item.quantity }
    : { blueprintId: item.blueprintId, variantId: item.variantId, quantity: item.quantity }));
  const pricedKey = lineItemsKey(priced.map((item) => ({
    productId: item.product_id, blueprintId: item.blueprint_id, variantId: item.variant_id, quantity: item.quantity,
  })));
  return requestedKey === pricedKey;
}

/**
 * Client checkout metadata minus any order id: orders are linked to payments
 * server-side, so a client-chosen order id must never reach a webhook.
 */
export function withoutOrderId(metadata: unknown): Record<string, unknown> {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return {};
  const { order_id: _orderId, orderId: _camelOrderId, ...rest } = metadata as Record<string, unknown>;
  return rest;
}
