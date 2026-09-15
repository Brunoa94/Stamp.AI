/**
 * Server-Side Order Totals
 *
 * Single source of truth for order money math. Every server-side path that
 * prices an order (payment intent creation, finalize-order, webhooks, payment
 * recovery) and the client display mapper consume these rules, so the total
 * the customer sees is the total the server accepts.
 *
 * Conventions:
 *  - All amounts are integer CENTS.
 *  - Catalog prices are VAT-inclusive (standard for EU consumer shops), so VAT
 *    is reported as the portion included in the total and never added on top.
 *  - Shipping is free once the discounted subtotal reaches the threshold,
 *    otherwise a flat fee applies (mirrors the checkout page).
 *
 * This module is dependency-free on purpose: it is imported by Deno edge
 * functions, Next.js API routes and vitest alike.
 */

export interface OrderTotalsConfigI {
  /** ISO 4217 currency the catalog is priced in; payments in any other currency are rejected. */
  currency: string;
  /** VAT rate in basis points (2100 = 21%). */
  vatRateBasisPoints: number;
  /** Flat shipping fee in cents charged below the free-shipping threshold. */
  shippingCostCents: number;
  /** Discounted subtotal (cents) from which shipping is free. */
  freeShippingThresholdCents: number;
}

export interface OrderTotalsI {
  subtotal_cents: number;
  discount_cents: number;
  shipping_cents: number;
  /** VAT included in total_cents (informational, tax-inclusive pricing). */
  tax_cents: number;
  total_cents: number;
}

export interface ChargedAmountI {
  /** Amount charged by the provider in MAJOR currency units (e.g. 29.99). */
  amount: number;
  currency: string;
}

export type ChargeReconciliationReasonT = "AMOUNT_MISMATCH" | "CURRENCY_MISMATCH" | "EMPTY_ORDER";

export interface ChargeReconciliationI {
  ok: boolean;
  differenceCents: number;
  reason?: ChargeReconciliationReasonT;
}

/** Defaults for the Netherlands: 21% VAT, EUR 4.99 shipping, free from EUR 60. */
export const DEFAULT_ORDER_TOTALS_CONFIG: OrderTotalsConfigI = {
  currency: "EUR",
  vatRateBasisPoints: 2100,
  shippingCostCents: 499,
  freeShippingThresholdCents: 6000,
};

const ENV_KEYS: Record<Exclude<keyof OrderTotalsConfigI, "currency">, string> = {
  vatRateBasisPoints: "ORDER_VAT_RATE_BPS",
  shippingCostCents: "ORDER_SHIPPING_COST_CENTS",
  freeShippingThresholdCents: "ORDER_FREE_SHIPPING_THRESHOLD_CENTS",
};

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function parseNonNegativeInteger(raw: string | undefined): number | null {
  if (raw === undefined || !/^\d+$/.test(raw.trim())) return null;
  const parsed = Number(raw.trim());
  return Number.isSafeInteger(parsed) ? parsed : null;
}

/**
 * Resolve the totals configuration from an environment map, falling back to
 * the defaults for missing or malformed values. Pass `Deno.env.toObject()` or
 * `process.env`.
 */
export function resolveOrderTotalsConfig(
  env: Record<string, string | undefined>,
): OrderTotalsConfigI {
  const config = { ...DEFAULT_ORDER_TOTALS_CONFIG };
  for (const key of Object.keys(ENV_KEYS) as Array<keyof typeof ENV_KEYS>) {
    const override = parseNonNegativeInteger(env[ENV_KEYS[key]]);
    if (override !== null) config[key] = override;
  }
  const currency = env.ORDER_CURRENCY?.trim().toUpperCase();
  if (currency && /^[A-Z]{3}$/.test(currency)) config.currency = currency;
  return config;
}

/**
 * Shipping for an order. Empty orders ship nothing; otherwise the flat fee
 * applies until the discounted subtotal reaches the free-shipping threshold
 * (a fully discounted cart still pays shipping, like the checkout page).
 */
export function calculateShippingCents(
  subtotalCents: number,
  discountCents: number,
  config: OrderTotalsConfigI,
): number {
  if (subtotalCents <= 0) return 0;
  const discountedSubtotal = subtotalCents - discountCents;
  return discountedSubtotal >= config.freeShippingThresholdCents ? 0 : config.shippingCostCents;
}

/** VAT portion included in a tax-inclusive amount, rounded to the cent. */
export function calculateIncludedVatCents(grossCents: number, vatRateBasisPoints: number): number {
  if (grossCents <= 0 || vatRateBasisPoints <= 0) return 0;
  const netCents = (grossCents * 10000) / (10000 + vatRateBasisPoints);
  return Math.round(grossCents - netCents);
}

export interface CalculateOrderTotalsInputI {
  subtotalCents: number;
  discountCents?: number;
  config?: OrderTotalsConfigI;
}

export function calculateOrderTotals({
  subtotalCents,
  discountCents = 0,
  config = DEFAULT_ORDER_TOTALS_CONFIG,
}: CalculateOrderTotalsInputI): OrderTotalsI {
  if (!isNonNegativeInteger(subtotalCents)) {
    throw new RangeError(`Invalid subtotal: ${subtotalCents}`);
  }
  if (typeof discountCents !== "number" || !Number.isFinite(discountCents)) {
    throw new RangeError(`Invalid discount: ${discountCents}`);
  }

  const discount = Math.min(Math.max(Math.round(discountCents), 0), subtotalCents);
  const shipping = calculateShippingCents(subtotalCents, discount, config);
  const total = subtotalCents - discount + shipping;

  return {
    subtotal_cents: subtotalCents,
    discount_cents: discount,
    shipping_cents: shipping,
    tax_cents: calculateIncludedVatCents(total, config.vatRateBasisPoints),
    total_cents: total,
  };
}

/** Convert a provider amount in major units to integer cents. */
export function majorUnitsToCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Compare what the provider actually charged with the server-computed total.
 * Exact match required: any difference means the client tampered with the
 * amount or the catalog changed between checkout and payment.
 */
export function reconcileChargedAmount(
  totals: OrderTotalsI,
  charged: ChargedAmountI,
  expectedCurrency: string,
): ChargeReconciliationI {
  if (totals.total_cents <= 0) {
    return { ok: false, differenceCents: majorUnitsToCents(charged.amount), reason: "EMPTY_ORDER" };
  }
  if (charged.currency.toUpperCase() !== expectedCurrency.toUpperCase()) {
    return { ok: false, differenceCents: 0, reason: "CURRENCY_MISMATCH" };
  }
  const differenceCents = Math.abs(majorUnitsToCents(charged.amount) - totals.total_cents);
  if (differenceCents !== 0) {
    return { ok: false, differenceCents, reason: "AMOUNT_MISMATCH" };
  }
  return { ok: true, differenceCents: 0 };
}

/**
 * Compare the total a client claims it will pay with the server total. Used
 * before a payment intent is created so a tampered amount never reaches the
 * provider.
 */
export function reconcileClientTotalCents(
  totals: OrderTotalsI,
  clientTotalCents: number,
): ChargeReconciliationI {
  const differenceCents = Math.abs(Math.round(clientTotalCents) - totals.total_cents);
  if (totals.total_cents <= 0) {
    return { ok: false, differenceCents, reason: "EMPTY_ORDER" };
  }
  return differenceCents === 0
    ? { ok: true, differenceCents: 0 }
    : { ok: false, differenceCents, reason: "AMOUNT_MISMATCH" };
}

export interface PricingMetadataI {
  promo_code: string | null;
  subtotal_cents: number;
  discount_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
}

/**
 * Server-computed pricing snapshot stored alongside a payment (provider
 * metadata and payment_transactions.metadata) so later steps can finalize the
 * order with the same promo code and audit the amount charged.
 */
export function toPricingMetadata(totals: OrderTotalsI, promoCode: string | null): PricingMetadataI {
  return {
    promo_code: promoCode,
    subtotal_cents: totals.subtotal_cents,
    discount_cents: totals.discount_cents,
    shipping_cents: totals.shipping_cents,
    tax_cents: totals.tax_cents,
    total_cents: totals.total_cents,
  };
}
