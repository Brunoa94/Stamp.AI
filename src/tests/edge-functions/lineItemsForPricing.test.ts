// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  parseLineItemsForPricing,
  priceLineItems,
} from "../../../supabase/functions/_shared/lineItemsForPricing";

/**
 * Payment intents and orders must be priced from the catalog for EVERY line
 * item. Previously items without blueprint_id/printify_variant_id were
 * silently skipped, which disabled price validation for real checkouts (the
 * client sends Printify `variant_id`, not `printify_variant_id`).
 */

describe("parseLineItemsForPricing", () => {
  it("accepts Printify line items using variant_id", () => {
    const result = parseLineItemsForPricing([
      { blueprint_id: 145, variant_id: 4012, quantity: 2, print_areas: {} },
    ]);
    expect(result).toEqual({
      items: [{ blueprint_id: 145, printify_variant_id: 4012, quantity: 2 }],
      errors: [],
    });
  });

  it("prefers printify_variant_id when present and coerces numeric strings", () => {
    const result = parseLineItemsForPricing([
      { blueprint_id: "145", printify_variant_id: "4012", variant_id: "999", quantity: "1" },
    ]);
    expect(result.items).toEqual([{ blueprint_id: 145, printify_variant_id: 4012, quantity: 1 }]);
  });

  it("defaults a missing quantity to 1", () => {
    expect(parseLineItemsForPricing([{ blueprint_id: 1, variant_id: 2 }]).items[0].quantity).toBe(1);
  });

  it.each([undefined, null, "x", {}, []])("rejects a missing or empty list: %j", (raw) => {
    const result = parseLineItemsForPricing(raw);
    expect(result.items).toEqual([]);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("rejects an item without blueprint_id instead of skipping it", () => {
    const result = parseLineItemsForPricing([
      { blueprint_id: 145, variant_id: 4012, quantity: 1 },
      { product_id: "printify-product", variant_id: 4012, quantity: 1 },
    ]);
    expect(result.errors).toEqual([expect.stringContaining("Line item 1")]);
  });

  it("rejects an item without any variant id", () => {
    expect(parseLineItemsForPricing([{ blueprint_id: 145, quantity: 1 }]).errors).toHaveLength(1);
  });

  it.each([0, -1, 1.5, "abc", 100])("rejects invalid quantity %s", (quantity) => {
    expect(parseLineItemsForPricing([{ blueprint_id: 145, variant_id: 4012, quantity }]).errors).toHaveLength(1);
  });
});

describe("priceLineItems", () => {
  const variants = [
    { blueprint_id: 145, printify_variant_id: 4012, price_cents: 2500 },
    { blueprint_id: 145, printify_variant_id: 4013, price_cents: 2700 },
  ];
  const products = [{ blueprint_id: 145, display_title: "Heavy Cotton Tee" }];

  it("prices every item from the catalog and sums the subtotal", () => {
    const result = priceLineItems(
      [
        { blueprint_id: 145, printify_variant_id: 4012, quantity: 2 },
        { blueprint_id: 145, printify_variant_id: 4013, quantity: 1 },
      ],
      variants,
      products,
    );
    expect(result.success).toBe(true);
    expect(result.subtotal_cents).toBe(7700);
    expect(result.items[0]).toEqual({
      blueprint_id: 145,
      printify_variant_id: 4012,
      quantity: 2,
      unit_price_cents: 2500,
      total_cents: 5000,
      product_name: "Heavy Cotton Tee",
    });
  });

  it("fails when a variant has no catalog price", () => {
    const result = priceLineItems(
      [{ blueprint_id: 145, printify_variant_id: 9999, quantity: 1 }],
      variants,
      products,
    );
    expect(result.success).toBe(false);
    expect(result.errors).toEqual([expect.stringContaining("9999")]);
  });

  it("fails when the catalog price is null or zero", () => {
    const result = priceLineItems(
      [{ blueprint_id: 145, printify_variant_id: 4012, quantity: 1 }],
      [{ blueprint_id: 145, printify_variant_id: 4012, price_cents: null }],
      [],
    );
    expect(result.success).toBe(false);
  });

  it("fails on an empty list", () => {
    expect(priceLineItems([], variants, products).success).toBe(false);
  });
});
