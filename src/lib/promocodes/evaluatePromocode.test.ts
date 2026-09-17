import { describe, expect, it } from "vitest";
import {
  evaluatePromocode,
  type PromocodeRowT,
} from "./evaluatePromocode";

const NOW = new Date("2026-09-15T12:00:00Z");

const base: PromocodeRowT = {
  promocode_id: "p1",
  code: "SAVE10",
  type: "percentage",
  value: 10,
  created_at: "2026-01-01T00:00:00Z",
  expires_at: null,
  max_uses: null,
  used_count: 0,
  is_active: true,
};

describe("evaluatePromocode", () => {
  it("applies a percentage discount to the subtotal", () => {
    const result = evaluatePromocode(base, { subtotal: 50, now: NOW });

    expect(result).toEqual({
      isValid: true,
      message: "promoCodeApplied",
      appliedPromo: { code: "SAVE10", type: "percentage", value: 10, discountValue: 5 },
    });
  });

  it("clamps a fixed discount to the subtotal", () => {
    const result = evaluatePromocode(
      { ...base, type: "numeric", value: 80 },
      { subtotal: 50, now: NOW },
    );

    expect(result.appliedPromo?.discountValue).toBe(50);
  });

  it("rejects a missing row as an invalid code", () => {
    expect(evaluatePromocode(null, { subtotal: 50, now: NOW })).toEqual({
      isValid: false,
      message: "invalidPromoCode",
      appliedPromo: null,
    });
  });

  it("rejects an inactive code", () => {
    const result = evaluatePromocode({ ...base, is_active: false }, { subtotal: 50, now: NOW });

    expect(result.isValid).toBe(false);
    expect(result.message).toBe("invalidPromoCode");
  });

  it("rejects an expired code", () => {
    const result = evaluatePromocode(
      { ...base, expires_at: "2026-09-15T11:59:59Z" },
      { subtotal: 50, now: NOW },
    );

    expect(result.isValid).toBe(false);
    expect(result.message).toBe("promoCodeExpired");
  });

  it("accepts a code that expires in the future", () => {
    const result = evaluatePromocode(
      { ...base, expires_at: "2026-09-15T12:00:01Z" },
      { subtotal: 50, now: NOW },
    );

    expect(result.isValid).toBe(true);
  });

  it("rejects a code whose usage limit is reached", () => {
    const result = evaluatePromocode(
      { ...base, max_uses: 3, used_count: 3 },
      { subtotal: 50, now: NOW },
    );

    expect(result.isValid).toBe(false);
    expect(result.message).toBe("promoCodeLimitReached");
  });

  it("accepts a code under its usage limit", () => {
    const result = evaluatePromocode(
      { ...base, max_uses: 3, used_count: 2 },
      { subtotal: 50, now: NOW },
    );

    expect(result.isValid).toBe(true);
  });

  it("rejects a non-positive subtotal", () => {
    const result = evaluatePromocode(base, { subtotal: 0, now: NOW });

    expect(result.isValid).toBe(false);
    expect(result.message).toBe("cartTotalInvalid");
  });
});
