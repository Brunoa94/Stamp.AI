import { describe, expect, it } from "vitest";
import {
  computeCheckoutTotals,
  evaluatePromoDiscount,
  isWithinTolerance,
  matchesPricedItems,
  normalizeLineItems,
  type PromoRowI,
} from "../../../supabase/functions/_shared/checkoutPricingRules";

const NOW = new Date("2026-10-10T12:00:00Z");

function promo(overrides: Partial<PromoRowI> = {}): PromoRowI {
  return {
    code: "SAVE10", type: "percentage", value: 10, is_active: true,
    expires_at: null, max_uses: null, used_count: 0, ...overrides,
  };
}

describe("normalizeLineItems", () => {
  it("accepts blueprint and existing-product items with string variant ids", () => {
    expect(normalizeLineItems([
      { blueprint_id: 145, print_provider_id: 99, variant_id: "12100", quantity: 2 },
      { product_id: "6ac25f8de766fb5d890a1c57", variant_id: 62327, quantity: 1 },
    ])).toEqual([
      { kind: "blueprint", blueprintId: 145, variantId: 12100, quantity: 2 },
      { kind: "product", productId: "6ac25f8de766fb5d890a1c57", variantId: 62327, quantity: 1 },
    ]);
  });

  it.each([
    ["missing items", undefined],
    ["no items", []],
    ["no product reference", [{ variant_id: 1, quantity: 1 }]],
    ["zero quantity", [{ blueprint_id: 145, variant_id: 1, quantity: 0 }]],
    ["fractional quantity", [{ blueprint_id: 145, variant_id: 1, quantity: 1.5 }]],
    ["quantity above 99", [{ blueprint_id: 145, variant_id: 1, quantity: 100 }]],
    ["missing variant", [{ blueprint_id: 145, quantity: 1 }]],
    ["malformed product id", [{ product_id: "../orders", variant_id: 1, quantity: 1 }]],
  ])("rejects %s", (_name, raw) => {
    expect(normalizeLineItems(raw)).toBeNull();
  });
});

describe("evaluatePromoDiscount", () => {
  it("computes percentage and numeric discounts in cents", () => {
    const percentage = evaluatePromoDiscount(promo(), 4997, NOW);
    expect(percentage).toMatchObject({ ok: true, discountCents: 500 });
    expect(percentage.ok && percentage.exactDiscountCents).toBeCloseTo(499.7);
    expect(evaluatePromoDiscount(promo({ type: "numeric", value: 5 }), 4997, NOW)).toEqual({ ok: true, discountCents: 500, exactDiscountCents: 500 });
  });

  it("never discounts below zero or above the subtotal", () => {
    expect(evaluatePromoDiscount(promo({ type: "numeric", value: 100 }), 2499, NOW)).toMatchObject({ discountCents: 2499 });
  });

  it.each([
    ["missing", null, "invalidPromoCode"],
    ["inactive", promo({ is_active: false }), "invalidPromoCode"],
    ["unsupported type", promo({ type: "fixed_total" }), "invalidPromoCode"],
    ["expired", promo({ expires_at: "2026-10-10T12:00:00Z" }), "promoCodeExpired"],
    ["exhausted", promo({ max_uses: 3, used_count: 3 }), "promoCodeLimitReached"],
  ])("rejects a %s code", (_name, row, reason) => {
    expect(evaluatePromoDiscount(row, 4997, NOW)).toEqual({ ok: false, reason });
  });
});

describe("computeCheckoutTotals", () => {
  it.each([
    [5999, 499],
    [6000, 0],
    [6001, 0],
  ])("charges shipping by subtotal %i cents", (subtotal, shipping) => {
    expect(computeCheckoutTotals(subtotal)).toEqual({
      subtotalCents: subtotal, discountCents: 0, shippingCents: shipping, totalCents: subtotal + shipping,
    });
  });

  it("applies the free-shipping threshold after the discount", () => {
    const discount = evaluatePromoDiscount(promo(), 6500, NOW);
    if (!discount.ok) throw new Error("expected a valid promo");
    expect(computeCheckoutTotals(6500, discount)).toEqual({
      subtotalCents: 6500, discountCents: 650, shippingCents: 499, totalCents: 6349,
    });
  });
});

describe("isWithinTolerance", () => {
  it("allows one cent of UI rounding and nothing more", () => {
    expect(isWithinTolerance(4997, 4996)).toBe(true);
    expect(isWithinTolerance(4997, 4995)).toBe(false);
    expect(isWithinTolerance(4997, Number.NaN)).toBe(false);
  });
});

describe("matchesPricedItems", () => {
  const priced = [
    { blueprint_id: 145, variant_id: 1, quantity: 2 },
    { blueprint_id: 441, variant_id: 7, quantity: 1, product_id: "abc123" },
  ];

  it("accepts the paid items in any order, split or merged", () => {
    expect(matchesPricedItems(normalizeLineItems([
      { product_id: "abc123", variant_id: 7, quantity: 1 },
      { blueprint_id: 145, variant_id: 1, quantity: 1 },
      { blueprint_id: 145, variant_id: 1, quantity: 1 },
    ])!, priced)).toBe(true);
  });

  it.each([
    ["a different variant", [{ blueprint_id: 145, variant_id: 2, quantity: 2 }, { product_id: "abc123", variant_id: 7, quantity: 1 }]],
    ["a different product", [{ blueprint_id: 1525, variant_id: 1, quantity: 2 }, { product_id: "abc123", variant_id: 7, quantity: 1 }]],
    ["more units", [{ blueprint_id: 145, variant_id: 1, quantity: 3 }, { product_id: "abc123", variant_id: 7, quantity: 1 }]],
    ["an extra item", [{ blueprint_id: 145, variant_id: 1, quantity: 2 }, { product_id: "abc123", variant_id: 7, quantity: 1 }, { blueprint_id: 157, variant_id: 3, quantity: 1 }]],
    ["a missing item", [{ blueprint_id: 145, variant_id: 1, quantity: 2 }]],
  ])("rejects %s", (_name, raw) => {
    expect(matchesPricedItems(normalizeLineItems(raw)!, priced)).toBe(false);
  });
});
