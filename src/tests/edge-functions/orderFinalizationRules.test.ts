import { describe, expect, it } from "vitest";
import {
  buildOrderItemRows,
  buildOrderRow,
  chargeMatchesPricing,
  includedVatCents,
  matchCartItems,
  orderIdempotencyKey,
  parseCartSnapshotItems,
  parseStoredPricing,
  parseVatRateBps,
  type CartItemRowI,
} from "../../../supabase/functions/_shared/orderFinalizationRules";
import { withoutOrderId } from "../../../supabase/functions/_shared/checkoutPricingRules";

const storedMetadata = {
  promo_code: null,
  subtotal_cents: 5997,
  discount_cents: 0,
  shipping_cost_cents: 499,
  total_cents: 6496,
  priced_items: [
    { blueprint_id: 12, variant_id: 101, quantity: 2, unit_price_cents: 1999, product_id: "p1" },
    { blueprint_id: 12, variant_id: 102, quantity: 1, unit_price_cents: 1999, product_id: "p2" },
  ],
};

const cartRow = (overrides: Partial<CartItemRowI>): CartItemRowI => ({
  id: "c1",
  product_id: "p1",
  variant_id: "101",
  quantity: 2,
  product_name: "Kids Tee",
  variant_name: "Black / S",
  custom_image_url: "https://cdn.example/img.png",
  ...overrides,
});

describe("parseStoredPricing", () => {
  it("reads the server pricing stored on the transaction", () => {
    const pricing = parseStoredPricing(storedMetadata);
    expect(pricing).toMatchObject({ subtotalCents: 5997, shippingCents: 499, totalCents: 6496, promoCode: null });
    expect(pricing?.items).toHaveLength(2);
  });

  it("rejects missing or inconsistent pricing", () => {
    expect(parseStoredPricing(null)).toBeNull();
    expect(parseStoredPricing({ ...storedMetadata, priced_items: [] })).toBeNull();
    expect(parseStoredPricing({ ...storedMetadata, total_cents: 50 })).toBeNull();
    expect(parseStoredPricing({ ...storedMetadata, subtotal_cents: 100, total_cents: 599 })).toBeNull();
    expect(parseStoredPricing({ ...storedMetadata, priced_items: [{ ...storedMetadata.priced_items[0], unit_price_cents: 0 }] })).toBeNull();
  });
});

describe("chargeMatchesPricing", () => {
  const pricing = parseStoredPricing(storedMetadata)!;
  it("requires the exact EUR amount", () => {
    expect(chargeMatchesPricing(64.96, "EUR", pricing)).toBe(true);
    expect(chargeMatchesPricing(64.96, "eur", pricing)).toBe(true);
    expect(chargeMatchesPricing(64.95, "EUR", pricing)).toBe(false);
    expect(chargeMatchesPricing(64.96, "USD", pricing)).toBe(false);
  });
});

describe("includedVatCents", () => {
  it("extracts VAT from VAT-inclusive totals", () => {
    expect(includedVatCents(12100, 2100)).toBe(2100);
    expect(includedVatCents(6496, 2100)).toBe(1127);
    expect(includedVatCents(6496, 0)).toBe(0);
  });

  it("parses the configured rate with a 21% default", () => {
    expect(parseVatRateBps(undefined)).toBe(2100);
    expect(parseVatRateBps("900")).toBe(900);
    expect(parseVatRateBps("abc")).toBe(2100);
    expect(parseVatRateBps("-1")).toBe(2100);
  });
});

describe("matchCartItems", () => {
  const pricing = parseStoredPricing(storedMetadata)!;
  const rows = [cartRow({}), cartRow({ id: "c3", product_id: "p2", variant_id: "102", quantity: 1, product_name: "Mug" })];

  it("pairs every paid item with its cart row", () => {
    const matched = matchCartItems(pricing.items, rows, true);
    expect(matched?.map((item) => item.cartItem?.id)).toEqual(["c1", "c3"]);
  });

  it("strictly rejects extra, missing or altered rows", () => {
    expect(matchCartItems(pricing.items, [...rows, cartRow({ id: "c9", product_id: "p9" })], true)).toBeNull();
    expect(matchCartItems(pricing.items, [rows[0]], true)).toBeNull();
    expect(matchCartItems(pricing.items, [rows[0], { ...rows[1], quantity: 5 }], true)).toBeNull();
  });

  it("keeps unmatched items with a generic name when only enriching", () => {
    const matched = matchCartItems(pricing.items, [rows[0]], false);
    expect(matched?.map((item) => item.cartItem?.id ?? null)).toEqual(["c1", null]);
  });
});

describe("parseCartSnapshotItems", () => {
  it("keeps identity and display fields only", () => {
    const [item] = parseCartSnapshotItems([{ ...cartRow({}), unit_price: 1, variant_id: 101 }])!;
    expect(item).toEqual(cartRow({}));
  });

  it("drops non-web image URLs and rejects malformed rows", () => {
    expect(parseCartSnapshotItems([cartRow({ custom_image_url: "javascript:alert(1)" })])![0].custom_image_url).toBeNull();
    expect(parseCartSnapshotItems([])).toBeNull();
    expect(parseCartSnapshotItems([{ ...cartRow({}), quantity: 0 }])).toBeNull();
    expect(parseCartSnapshotItems([{ ...cartRow({}), product_name: { evil: true } }])).toBeNull();
  });
});

describe("order rows", () => {
  const pricing = parseStoredPricing({ ...storedMetadata, promo_code: "WELCOME5", discount_cents: 500, total_cents: 5996 })!;

  it("builds a paid order in cents from the stored pricing", () => {
    const row = buildOrderRow({
      provider: "stripe",
      paymentId: "pi_1",
      userId: "u1",
      customerEmail: "a@example.com",
      shippingAddress: { first_name: "Ann", last_name: "Lee", phone: "1" },
      billingAddress: null,
      pricing,
      vatRateBps: 2100,
      orderNumber: "ORD-1",
    });
    expect(row).toMatchObject({
      user_id: "u1",
      status: "confirmed",
      payment_status: "paid",
      payment_provider: "stripe",
      subtotal: 5997,
      discount_amount: 500,
      shipping_cost: 499,
      total_amount: 5996,
      tax_amount: includedVatCents(5996, 2100),
      promo_code: "WELCOME5",
      currency: "EUR",
      customer_name: "Ann Lee",
      idempotency_key: orderIdempotencyKey("stripe", "pi_1"),
    });
    expect(row.billing_address).toEqual(row.shipping_address);
  });

  it("prices order items from the server, not the cart", () => {
    const matched = matchCartItems(pricing.items, [cartRow({})], false)!;
    const [first, second] = buildOrderItemRows("o1", matched);
    expect(first).toMatchObject({ order_id: "o1", product_id: "p1", variant_id: "101", quantity: 2, unit_price: 1999, total_price: 3998, product_name: "Kids Tee" });
    expect(second).toMatchObject({ product_id: "p2", variant_id: "102", unit_price: 1999, product_name: "Custom Product", custom_image_url: "" });
  });
});

describe("withoutOrderId", () => {
  it("strips client order ids from checkout metadata", () => {
    expect(withoutOrderId({ order_id: "x", orderId: "y", cartId: "c" })).toEqual({ cartId: "c" });
    expect(withoutOrderId(null)).toEqual({});
  });
});
