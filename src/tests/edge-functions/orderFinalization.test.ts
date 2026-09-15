// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  buildOrderInsert,
  buildOrderItemInserts,
  decideExistingOrder,
  generateOrderNumber,
  resolveOrderSourceItems,
  toPricingLineItems,
} from "../../../supabase/functions/_shared/orderFinalization";
import {
  buildIdempotencyKey,
  parseIdempotencyKey,
} from "../../../supabase/functions/_shared/paymentReference";
import { calculateOrderTotals } from "../../../supabase/functions/_shared/orderTotals";

/**
 * Orders are minted by the server from a payment proof plus an order source
 * (cart snapshot or Printify line items). These helpers hold the pure
 * decisions: idempotency keys, source normalisation, row mapping, and who may
 * reuse an existing order.
 */

describe("idempotency keys", () => {
  it("builds provider-prefixed keys and parses them back", () => {
    expect(buildIdempotencyKey("stripe", "pi_123")).toBe("stripe_pi_123");
    expect(parseIdempotencyKey("stripe_pi_123")).toEqual({ provider: "stripe", paymentId: "pi_123" });
    expect(parseIdempotencyKey("paypal_8AB_CD")).toEqual({ provider: "paypal", paymentId: "8AB_CD" });
    expect(parseIdempotencyKey("mollie_tr_abc")).toEqual({ provider: "mollie", paymentId: "tr_abc" });
  });

  it.each(["", "unknown_x", "stripe_", "stripe", undefined])("rejects malformed key %j", (key) => {
    expect(parseIdempotencyKey(key)).toBeNull();
  });
});

describe("resolveOrderSourceItems", () => {
  const cartItems = [
    {
      id: "item_1",
      product_id: "prod_1",
      product_name: "Tee",
      variant_id: "4012",
      variant_name: "M / Black",
      quantity: 2,
      unit_price: 999, // ignored: prices always come from the catalog
      custom_image_url: "https://img/1.png",
      printify_blueprint_id: 145,
      is_selected: true,
    },
    {
      id: "item_2",
      product_id: "prod_2",
      variant_id: "4013",
      quantity: 1,
      printify_blueprint_id: 145,
      is_selected: false,
    },
    {
      id: "item_3",
      product_id: "prod_3",
      product_name: "Mug",
      variant_id: "7000",
      quantity: 1,
      product: { blueprint_id: 68, name: "Mug (relation)" },
    },
  ];

  it("uses only the selected cart items and reads the blueprint from the item or its product", () => {
    const result = resolveOrderSourceItems({ cartItems });
    expect(result.errors).toEqual([]);
    expect(result.items).toEqual([
      {
        blueprint_id: 145,
        printify_variant_id: 4012,
        quantity: 2,
        product_id: "prod_1",
        product_name: "Tee",
        variant_name: "M / Black",
        custom_image_url: "https://img/1.png",
      },
      {
        blueprint_id: 68,
        printify_variant_id: 7000,
        quantity: 1,
        product_id: "prod_3",
        product_name: "Mug",
        variant_name: null,
        custom_image_url: "",
      },
    ]);
  });

  it("reports an empty selection instead of buying everything", () => {
    const result = resolveOrderSourceItems({
      cartItems: cartItems.map((item) => ({ ...item, is_selected: false })),
    });
    expect(result.items).toEqual([]);
    expect(result.errors).toHaveLength(1);
  });

  it("falls back to Printify line items when there is no cart snapshot", () => {
    const result = resolveOrderSourceItems({
      lineItems: [
        {
          blueprint_id: 145,
          print_provider_id: 99,
          variant_id: 4012,
          quantity: 1,
          print_areas: { front: [{ src: "https://img/front.png", scale: 1 }] },
        },
      ],
    });
    expect(result.errors).toEqual([]);
    expect(result.items).toEqual([
      {
        blueprint_id: 145,
        printify_variant_id: 4012,
        quantity: 1,
        product_id: null,
        product_name: null,
        variant_name: null,
        custom_image_url: "https://img/front.png",
      },
    ]);
  });

  it("rejects a cart item that cannot be priced from the catalog", () => {
    const result = resolveOrderSourceItems({
      cartItems: [{ id: "x", product_id: "p", variant_id: "12", quantity: 1 }],
    });
    expect(result.items).toEqual([]);
    expect(result.errors[0]).toContain("blueprint");
  });

  it("rejects a source without any items", () => {
    expect(resolveOrderSourceItems({}).errors).toHaveLength(1);
    expect(resolveOrderSourceItems({ cartItems: [], lineItems: [] }).errors).toHaveLength(1);
  });

  it("maps to pricing line items", () => {
    const { items } = resolveOrderSourceItems({ cartItems });
    expect(toPricingLineItems(items)).toEqual([
      { blueprint_id: 145, printify_variant_id: 4012, quantity: 2 },
      { blueprint_id: 68, printify_variant_id: 7000, quantity: 1 },
    ]);
  });
});

describe("buildOrderInsert", () => {
  const totals = calculateOrderTotals({ subtotalCents: 6998, discountCents: 700 });
  const context = {
    provider: "stripe" as const,
    paymentId: "pi_123",
    userId: "user_1",
    userEmail: "user@example.com",
    currency: "eur",
    shippingAddress: { first_name: "Jane", last_name: "Doe", email: "jane@example.com", phone: "+31" },
    billingAddress: null,
    promoCode: "SAVE10",
    promoValue: 10,
  };

  it("mints a PAID order with server totals in cents, keyed on the payment", () => {
    const order = buildOrderInsert(context, totals, "ORD-1");
    expect(order).toEqual({
      user_id: "user_1",
      order_number: "ORD-1",
      customer_email: "jane@example.com",
      customer_name: "Jane Doe",
      customer_phone: "+31",
      shipping_address: context.shippingAddress,
      billing_address: context.shippingAddress,
      subtotal: 6998,
      discount_amount: 700,
      shipping_cost: 0,
      tax_amount: totals.tax_cents,
      total_amount: 6298,
      currency: "EUR",
      payment_status: "paid",
      status: "pending",
      payment_method: "stripe",
      payment_provider: "stripe",
      promo_code: "SAVE10",
      promo_value: 10,
      idempotency_key: "stripe_pi_123",
    });
  });

  it("falls back to the account email and null names without an address", () => {
    const order = buildOrderInsert({ ...context, shippingAddress: null, promoCode: null, promoValue: null }, totals, "ORD-2");
    expect(order).toMatchObject({
      customer_email: "user@example.com",
      customer_name: null,
      customer_phone: null,
      shipping_address: null,
      billing_address: null,
      promo_code: null,
      promo_value: null,
    });
  });
});

describe("buildOrderItemInserts", () => {
  it("zips priced catalog lines with the source items, using catalog prices in cents", () => {
    const sourceItems = [
      {
        blueprint_id: 145,
        printify_variant_id: 4012,
        quantity: 2,
        product_id: "prod_1",
        product_name: null,
        variant_name: "M / Black",
        custom_image_url: "https://img/1.png",
      },
    ];
    const priced = [
      { blueprint_id: 145, printify_variant_id: 4012, quantity: 2, unit_price_cents: 2500, total_cents: 5000, product_name: "Heavy Cotton Tee" },
    ];
    expect(buildOrderItemInserts("order_1", priced, sourceItems)).toEqual([
      {
        order_id: "order_1",
        product_id: "prod_1",
        product_name: "Heavy Cotton Tee",
        variant_id: "4012",
        variant_name: "M / Black",
        quantity: 2,
        unit_price: 2500,
        total_price: 5000,
        custom_image_url: "https://img/1.png",
        design_config: { custom_image_url: "https://img/1.png", reusable_image_url: "https://img/1.png" },
      },
    ]);
  });

  it("throws when priced lines and source items do not line up", () => {
    expect(() => buildOrderItemInserts("order_1", [], [{
      blueprint_id: 1, printify_variant_id: 1, quantity: 1, product_id: null, product_name: null, variant_name: null, custom_image_url: "",
    }])).toThrow();
  });
});

describe("decideExistingOrder", () => {
  it("creates when nothing exists", () => {
    expect(decideExistingOrder(null, "user_1")).toBe("create");
  });
  it("reuses the caller's own order", () => {
    expect(decideExistingOrder({ id: "o", user_id: "user_1", payment_status: "paid" }, "user_1")).toBe("reuse");
  });
  it("refuses to hand out another user's order", () => {
    expect(() => decideExistingOrder({ id: "o", user_id: "user_2", payment_status: "paid" }, "user_1")).toThrow();
  });
});

describe("generateOrderNumber", () => {
  it("is deterministic for a given clock and random source", () => {
    expect(generateOrderNumber(1700000000000, 0.5)).toBe(generateOrderNumber(1700000000000, 0.5));
    expect(generateOrderNumber(1700000000000, 0.5)).toMatch(/^ORD-1700000000000-[A-Z0-9]{6}$/);
  });
});
