import { describe, expect, it } from "vitest";
import { computeCheckoutTotals } from "../checkoutTotals";
import type { PromoCodeValidationResult } from "@/schemas/promocode";

function buildPromoResult(
  overrides: Partial<
    NonNullable<PromoCodeValidationResult["appliedPromo"]>
  > = {}
): PromoCodeValidationResult {
  return {
    isValid: true,
    message: "Promo code applied.",
    appliedPromo: {
      code: "REDUCE_TOTAL",
      type: "fixed_total",
      value: 0.5,
      discountValue: 0,
      ...overrides,
    },
  };
}

describe("computeCheckoutTotals", () => {
  it("charges shipping below the free-shipping threshold without a promo", () => {
    const totals = computeCheckoutTotals(2499, null);

    expect(totals.subtotal).toBe(24.99);
    expect(totals.shipping).toBe(4.99);
    expect(totals.discount).toBe(0);
    expect(totals.total).toBe(29.98);
    expect(totals.totalInCents).toBe(2998);
  });

  it("gives free shipping at or above the threshold without a promo", () => {
    const totals = computeCheckoutTotals(6000, null);

    expect(totals.shipping).toBe(0);
    expect(totals.total).toBe(60);
    expect(totals.totalInCents).toBe(6000);
  });

  it("applies a numeric discount and charges shipping on the discounted subtotal", () => {
    const totals = computeCheckoutTotals(
      6500,
      buildPromoResult({ code: "TEN_OFF", type: "numeric", value: 10, discountValue: 10 })
    );

    expect(totals.discount).toBe(10);
    expect(totals.shipping).toBe(4.99);
    expect(totals.total).toBe(59.99);
    expect(totals.totalInCents).toBe(5999);
  });

  it("applies a percentage discount through its validated discountValue", () => {
    const totals = computeCheckoutTotals(
      10000,
      buildPromoResult({ code: "HALF", type: "percentage", value: 50, discountValue: 50 })
    );

    expect(totals.discount).toBe(50);
    expect(totals.shipping).toBe(4.99);
    expect(totals.total).toBe(54.99);
  });

  it("reduces the whole order to the fixed total for REDUCE_TOTAL", () => {
    const totals = computeCheckoutTotals(2499, buildPromoResult());

    expect(totals.subtotal).toBe(24.99);
    expect(totals.shipping).toBe(0);
    expect(totals.discount).toBe(24.49);
    expect(totals.total).toBe(0.5);
    expect(totals.totalInCents).toBe(50);
  });

  it("keeps the breakdown rows adding up to the fixed total", () => {
    const totals = computeCheckoutTotals(12345, buildPromoResult());

    expect(totals.subtotal + totals.shipping - totals.discount).toBeCloseTo(
      totals.total,
      10
    );
    expect(totals.totalInCents).toBe(50);
  });

  it("never raises the total above the subtotal for a fixed_total promo", () => {
    const totals = computeCheckoutTotals(30, buildPromoResult());

    expect(totals.total).toBe(0.3);
    expect(totals.discount).toBe(0);
    expect(totals.totalInCents).toBe(30);
  });

  it("ignores promos whose validation result is invalid", () => {
    const totals = computeCheckoutTotals(2499, {
      isValid: false,
      message: "Invalid promo code.",
      appliedPromo: null,
    });

    expect(totals.discount).toBe(0);
    expect(totals.total).toBe(29.98);
  });
});
