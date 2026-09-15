/**
 * Promo Code Discounts
 *
 * The discount is always derived from the `promocodes` row on the server;
 * client-provided discount amounts are never trusted. These rules mirror the
 * checkout page (src/app/api/validate-promocode/route.ts) so the customer's
 * displayed total matches the server total.
 *
 * Dependency-free: shared by Deno edge functions and Next.js API routes.
 */

export type PromoCodeTypeT = "percentage" | "numeric";

export interface PromoCodeRuleI {
  /** `percentage` => value is a percent of the subtotal; `numeric` => value in major currency units. */
  type: PromoCodeTypeT | string;
  value: number;
}

const PROMO_CODE_PATTERN = /^[A-Z0-9_-]{1,64}$/;

/** Upper-case, trimmed code or null when the input is not a usable code. */
export function normalizePromoCode(code: unknown): string | null {
  if (typeof code !== "string") return null;
  const normalized = code.trim().toUpperCase();
  return PROMO_CODE_PATTERN.test(normalized) ? normalized : null;
}

/** Discount in cents for the given rule, clamped to [0, subtotal]. */
export function calculatePromoDiscountCents(
  promo: PromoCodeRuleI | null | undefined,
  subtotalCents: number,
): number {
  if (!promo || subtotalCents <= 0 || !Number.isFinite(promo.value)) return 0;

  let rawCents = 0;
  if (promo.type === "percentage") {
    rawCents = (subtotalCents * promo.value) / 100;
  } else if (promo.type === "numeric") {
    rawCents = promo.value * 100;
  }

  return Math.min(Math.max(Math.round(rawCents), 0), subtotalCents);
}
