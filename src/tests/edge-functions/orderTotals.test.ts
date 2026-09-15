// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  DEFAULT_ORDER_TOTALS_CONFIG,
  calculateIncludedVatCents,
  calculateOrderTotals,
  calculateShippingCents,
  reconcileChargedAmount,
  resolveOrderTotalsConfig,
} from "../../../supabase/functions/_shared/orderTotals";

/**
 * Single source of truth for order money math. Every server-side path that
 * prices an order (payment intents, finalize-order, webhooks, recovery) must
 * agree with the checkout page, so the defaults mirror the client constants.
 */

describe("resolveOrderTotalsConfig", () => {
  it("uses the NL defaults when no env is provided", () => {
    expect(resolveOrderTotalsConfig({})).toEqual(DEFAULT_ORDER_TOTALS_CONFIG);
    expect(DEFAULT_ORDER_TOTALS_CONFIG).toEqual({
      vatRateBasisPoints: 2100,
      shippingCostCents: 499,
      freeShippingThresholdCents: 6000,
    });
  });

  it("reads overrides from the environment", () => {
    expect(
      resolveOrderTotalsConfig({
        ORDER_VAT_RATE_BPS: "900",
        ORDER_SHIPPING_COST_CENTS: "350",
        ORDER_FREE_SHIPPING_THRESHOLD_CENTS: "10000",
      }),
    ).toEqual({
      vatRateBasisPoints: 900,
      shippingCostCents: 350,
      freeShippingThresholdCents: 10000,
    });
  });

  it.each(["abc", "-1", "1.5", ""])("ignores invalid override %j", (value) => {
    expect(resolveOrderTotalsConfig({ ORDER_VAT_RATE_BPS: value }).vatRateBasisPoints).toBe(2100);
  });
});

describe("calculateShippingCents", () => {
  const config = DEFAULT_ORDER_TOTALS_CONFIG;
  it("charges shipping below the free threshold", () => {
    expect(calculateShippingCents(5999, 0, config)).toBe(499);
  });
  it("is free at or above the threshold", () => {
    expect(calculateShippingCents(6000, 0, config)).toBe(0);
    expect(calculateShippingCents(9000, 0, config)).toBe(0);
  });
  it("checks the threshold against the discounted subtotal", () => {
    expect(calculateShippingCents(6500, 1000, config)).toBe(499);
  });
  it("still charges shipping on a fully discounted cart", () => {
    expect(calculateShippingCents(1000, 1000, config)).toBe(499);
  });
  it("is zero for an empty order", () => {
    expect(calculateShippingCents(0, 0, config)).toBe(0);
  });
});

describe("calculateIncludedVatCents", () => {
  it("extracts the VAT portion from a tax-inclusive amount", () => {
    // 121.00 gross at 21% => 21.00 VAT
    expect(calculateIncludedVatCents(12100, 2100)).toBe(2100);
  });
  it("rounds to the nearest cent", () => {
    // 29.99 gross at 21% => 5.2045 => 5.20
    expect(calculateIncludedVatCents(2999, 2100)).toBe(520);
  });
  it("is zero for a zero rate or zero amount", () => {
    expect(calculateIncludedVatCents(2999, 0)).toBe(0);
    expect(calculateIncludedVatCents(0, 2100)).toBe(0);
  });
});

describe("calculateOrderTotals", () => {
  it("adds shipping below the threshold and reports tax-inclusive VAT", () => {
    const totals = calculateOrderTotals({ subtotalCents: 2500, discountCents: 0 });
    expect(totals).toEqual({
      subtotal_cents: 2500,
      discount_cents: 0,
      shipping_cents: 499,
      tax_cents: calculateIncludedVatCents(2999, 2100),
      total_cents: 2999,
    });
  });

  it("applies the discount before the free-shipping check, like the checkout page", () => {
    // 65.00 - 10.00 = 55.00 < 60.00 => shipping applies
    const totals = calculateOrderTotals({ subtotalCents: 6500, discountCents: 1000 });
    expect(totals.shipping_cents).toBe(499);
    expect(totals.total_cents).toBe(5999);
  });

  it("gives free shipping when the discounted subtotal reaches the threshold", () => {
    const totals = calculateOrderTotals({ subtotalCents: 7000, discountCents: 1000 });
    expect(totals.shipping_cents).toBe(0);
    expect(totals.total_cents).toBe(6000);
  });

  it("clamps the discount to the subtotal and never goes negative", () => {
    const totals = calculateOrderTotals({ subtotalCents: 1000, discountCents: 5000 });
    expect(totals.discount_cents).toBe(1000);
    expect(totals.total_cents).toBe(499);
    expect(calculateOrderTotals({ subtotalCents: 1000, discountCents: -5 }).discount_cents).toBe(0);
  });

  it("returns all zeros for an empty order", () => {
    expect(calculateOrderTotals({ subtotalCents: 0, discountCents: 0 })).toEqual({
      subtotal_cents: 0,
      discount_cents: 0,
      shipping_cents: 0,
      tax_cents: 0,
      total_cents: 0,
    });
  });

  it("honours a custom config", () => {
    const totals = calculateOrderTotals({
      subtotalCents: 1000,
      discountCents: 0,
      config: { vatRateBasisPoints: 0, shippingCostCents: 100, freeShippingThresholdCents: 5000 },
    });
    expect(totals).toMatchObject({ shipping_cents: 100, tax_cents: 0, total_cents: 1100 });
  });

  it.each([NaN, Infinity, -1, 10.5])("rejects invalid subtotal %s", (subtotalCents) => {
    expect(() => calculateOrderTotals({ subtotalCents, discountCents: 0 })).toThrow();
  });
});

describe("reconcileChargedAmount", () => {
  const totals = calculateOrderTotals({ subtotalCents: 2500, discountCents: 0 });

  it("accepts a charge equal to the server total in the same currency", () => {
    expect(
      reconcileChargedAmount(totals, { amount: 29.99, currency: "EUR" }, "eur"),
    ).toEqual({ ok: true, differenceCents: 0 });
  });

  it("rejects any difference, even a single cent", () => {
    expect(
      reconcileChargedAmount(totals, { amount: 29.98, currency: "EUR" }, "EUR"),
    ).toMatchObject({ ok: false, differenceCents: 1, reason: "AMOUNT_MISMATCH" });
  });

  it("rejects a currency mismatch", () => {
    expect(
      reconcileChargedAmount(totals, { amount: 29.99, currency: "USD" }, "EUR"),
    ).toMatchObject({ ok: false, reason: "CURRENCY_MISMATCH" });
  });

  it("rejects a zero-total order", () => {
    const empty = calculateOrderTotals({ subtotalCents: 0, discountCents: 0 });
    expect(reconcileChargedAmount(empty, { amount: 0, currency: "EUR" }, "EUR").ok).toBe(false);
  });
});
