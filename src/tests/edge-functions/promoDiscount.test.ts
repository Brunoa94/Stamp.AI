// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  calculatePromoDiscountCents,
  normalizePromoCode,
} from "../../../supabase/functions/_shared/promoDiscount";

/**
 * Discounts must be computed from the promocodes table on the server. These
 * rules mirror src/app/api/validate-promocode/route.ts so the amount the
 * customer saw is the amount the server accepts.
 */

describe("normalizePromoCode", () => {
  it("trims and upper-cases", () => {
    expect(normalizePromoCode("  summer10 ")).toBe("SUMMER10");
  });
  it("returns null for empty or non-string input", () => {
    expect(normalizePromoCode("   ")).toBeNull();
    expect(normalizePromoCode(undefined)).toBeNull();
    expect(normalizePromoCode(42)).toBeNull();
  });
  it("rejects codes with unexpected characters", () => {
    expect(normalizePromoCode("DROP TABLE")).toBeNull();
    expect(normalizePromoCode("a".repeat(65))).toBeNull();
  });
});

describe("calculatePromoDiscountCents", () => {
  it("applies a percentage of the subtotal, rounded to the cent", () => {
    expect(calculatePromoDiscountCents({ type: "percentage", value: 10 }, 2999)).toBe(300);
  });

  it("treats a numeric promo value as major currency units", () => {
    // value 5.00 => 500 cents
    expect(calculatePromoDiscountCents({ type: "numeric", value: 5 }, 2999)).toBe(500);
  });

  it("never exceeds the subtotal", () => {
    expect(calculatePromoDiscountCents({ type: "numeric", value: 100 }, 2999)).toBe(2999);
    expect(calculatePromoDiscountCents({ type: "percentage", value: 150 }, 2999)).toBe(2999);
  });

  it("never goes negative", () => {
    expect(calculatePromoDiscountCents({ type: "numeric", value: -5 }, 2999)).toBe(0);
  });

  it("is zero without a promo or without a subtotal", () => {
    expect(calculatePromoDiscountCents(null, 2999)).toBe(0);
    expect(calculatePromoDiscountCents({ type: "numeric", value: 5 }, 0)).toBe(0);
  });

  it("ignores unknown promo types", () => {
    expect(calculatePromoDiscountCents({ type: "mystery", value: 5 }, 2999)).toBe(0);
  });
});
