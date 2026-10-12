import { describe, expect, it } from "vitest";
import { resolveDisplayPriceCents, resolveSaleDisplay } from "./pricing";

describe("launch pricing", () => {
  it("prefers promotional cents to regular and computed prices", () => {
    expect(resolveDisplayPriceCents({ promotional_price: 1999, selling_price_cents: 3000, totalPriceCents: 3500 })).toBe(1999);
    expect(resolveSaleDisplay({ promotional_price: 1999, selling_price_cents: 3000,
      original_price_cents: 9999, is_on_sale: false, discount_percent: 80 })).toEqual({
      isPromotional: true, isOnSale: true, originalPrice: 30, discountPercent: 33,
    });
  });
  it("preserves regular, computed, fallback, and legacy sale behavior", () => {
    expect(resolveDisplayPriceCents({ promotional_price: null, selling_price_cents: 3000 })).toBe(3000);
    expect(resolveDisplayPriceCents({ totalPriceCents: 2000 })).toBe(2000);
    expect(resolveDisplayPriceCents({})).toBe(2500);
    expect(resolveDisplayPriceCents({}, { useFallback: false })).toBe(0);
    expect(resolveSaleDisplay({ original_price_cents: 4000, is_on_sale: true, discount_percent: 25 })).toEqual({
      isPromotional: false, isOnSale: true, originalPrice: 40, discountPercent: 25,
    });
  });
});
