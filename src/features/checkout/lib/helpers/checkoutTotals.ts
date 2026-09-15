/**
 * Checkout Totals
 *
 * Pure computation of the checkout money rows (subtotal, shipping,
 * discount, total) from the cart subtotal and an applied promo code.
 *
 * Promo semantics: "percentage" and "numeric" reduce the subtotal and
 * shipping is charged on the discounted subtotal; "fixed_total" (e.g.
 * REDUCE_TOTAL) sets the final all-inclusive order total to the promo
 * value — shipping becomes free and the discount absorbs the rest, so
 * the breakdown rows always add up to the charged total.
 */

import type { PromoCodeValidationResult } from "@/schemas/promocode";
import { getDiscountValue } from "./promoCodeHelpers";

/** Free shipping threshold in euros */
const FREE_SHIPPING_THRESHOLD = 60;
/** Shipping cost in euros for orders below threshold */
const SHIPPING_COST = 4.99;

export type CheckoutTotalsType = {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  totalInCents: number;
};

function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

export function computeCheckoutTotals(
  subtotalInCents: number,
  validationResult: PromoCodeValidationResult | null
): CheckoutTotalsType {
  const subtotal = subtotalInCents / 100;
  const promo = validationResult?.isValid
    ? validationResult.appliedPromo
    : null;

  if (promo?.type === "fixed_total") {
    const total = roundToCents(Math.min(promo.value, subtotal));

    return {
      subtotal,
      shipping: 0,
      discount: roundToCents(subtotal - total),
      total,
      totalInCents: Math.round(total * 100),
    };
  }

  const discount = getDiscountValue(validationResult);
  const subtotalAfterDiscount = subtotal - discount;
  const shipping =
    subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = roundToCents(subtotal + shipping - discount);

  return {
    subtotal,
    shipping,
    discount,
    total,
    totalInCents: Math.round(total * 100),
  };
}
