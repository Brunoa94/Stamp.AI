// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../supabase/functions/_shared/supabase.ts", () => ({
  supabaseRest: vi.fn(),
}));

import { supabaseRest } from "../../../supabase/functions/_shared/supabase.ts";
import {
  assertLineItemsMatchOrderItems,
  claimOrderFulfillment,
  lineItemsMatchOrderItems,
  normalizeVariantId,
  PENDING_PRINTIFY_ORDER_ID,
  setOrderPrintifyOrderId,
} from "../../../supabase/functions/_shared/orderFulfillment.ts";

/**
 * create-printify-order binds every Printify order to a paid database order:
 * the request line items must equal the order's items, and an order may only
 * be claimed for fulfillment once.
 */
describe("normalizeVariantId", () => {
  it("makes numeric and text variant ids comparable", () => {
    expect(normalizeVariantId(42)).toBe("42");
    expect(normalizeVariantId("42")).toBe("42");
  });

  it.each([null, undefined, "", "abc", 0, -1, 1.5, "4.2"])("rejects %j", (value) => {
    expect(normalizeVariantId(value)).toBeNull();
  });
});

describe("lineItemsMatchOrderItems", () => {
  const orderItems = [
    { variant_id: "42", quantity: 2, product_id: "p1" },
    { variant_id: "77", quantity: 1, product_id: "p2" },
  ];

  it("accepts the same variants and quantities in any order", () => {
    const lineItems = [
      { variant_id: 77, quantity: 1 },
      { variant_id: 42, quantity: 2 },
    ];
    expect(lineItemsMatchOrderItems(lineItems, orderItems)).toBe(true);
    expect(() => assertLineItemsMatchOrderItems(lineItems, orderItems)).not.toThrow();
  });

  it("sums repeated variants before comparing", () => {
    const lineItems = [
      { variant_id: 42, quantity: 1 },
      { variant_id: 42, quantity: 1 },
      { variant_id: 77, quantity: 1 },
    ];
    expect(lineItemsMatchOrderItems(lineItems, orderItems)).toBe(true);
  });

  it("treats a missing quantity as 1", () => {
    expect(lineItemsMatchOrderItems([{ variant_id: 42 }], [{ variant_id: "42", quantity: 1 }])).toBe(true);
  });

  it("rejects a different quantity", () => {
    const lineItems = [
      { variant_id: 42, quantity: 3 },
      { variant_id: 77, quantity: 1 },
    ];
    expect(lineItemsMatchOrderItems(lineItems, orderItems)).toBe(false);
    expect(() => assertLineItemsMatchOrderItems(lineItems, orderItems)).toThrow(
      expect.objectContaining({ errorId: "ORDER_LINE_ITEMS_MISMATCH", status: 400 }),
    );
  });

  it("rejects extra, missing or substituted variants", () => {
    expect(lineItemsMatchOrderItems([...orderItems, { variant_id: 99, quantity: 1 }], orderItems)).toBe(false);
    expect(lineItemsMatchOrderItems([orderItems[0]], orderItems)).toBe(false);
    expect(lineItemsMatchOrderItems([orderItems[0], { variant_id: 99, quantity: 1 }], orderItems)).toBe(false);
  });

  it("rejects empty lists and invalid variant ids", () => {
    expect(lineItemsMatchOrderItems([], orderItems)).toBe(false);
    expect(lineItemsMatchOrderItems(orderItems, [])).toBe(false);
    expect(lineItemsMatchOrderItems([{ variant_id: "abc", quantity: 1 }], [{ variant_id: "abc", quantity: 1 }])).toBe(false);
    expect(lineItemsMatchOrderItems([{ variant_id: 42, quantity: 0 }], [{ variant_id: "42", quantity: 0 }])).toBe(false);
  });
});

describe("claimOrderFulfillment", () => {
  const orderId = "123e4567-e89b-12d3-a456-426614174000";

  beforeEach(() => {
    vi.mocked(supabaseRest).mockReset();
  });

  it("claims an unfulfilled order with a conditional PATCH", async () => {
    vi.mocked(supabaseRest).mockResolvedValue({ data: [{ id: orderId }], error: null, status: 200 });

    await expect(claimOrderFulfillment(orderId)).resolves.toBeUndefined();

    expect(supabaseRest).toHaveBeenCalledWith(
      `orders?id=eq.${orderId}&printify_order_id=is.null`,
      "PATCH",
      expect.objectContaining({ printify_order_id: PENDING_PRINTIFY_ORDER_ID }),
      { prefer: "return=representation" },
    );
  });

  it("returns 409 when the order is already claimed or fulfilled", async () => {
    vi.mocked(supabaseRest).mockResolvedValue({ data: [], error: null, status: 200 });

    await expect(claimOrderFulfillment(orderId)).rejects.toMatchObject({
      errorId: "ORDER_FULFILLMENT_IN_PROGRESS",
      status: 409,
    });
  });

  it("fails on a database error", async () => {
    vi.mocked(supabaseRest).mockResolvedValue({ data: null, error: { message: "boom" }, status: 500 });

    await expect(claimOrderFulfillment(orderId)).rejects.toThrow("Could not claim order for fulfillment");
  });

  it("stores the Printify id and can release the claim", async () => {
    vi.mocked(supabaseRest).mockResolvedValue({ data: null, error: null, status: 204 });

    await setOrderPrintifyOrderId(orderId, "pf-1");
    await setOrderPrintifyOrderId(orderId, null);

    expect(supabaseRest).toHaveBeenNthCalledWith(
      1,
      `orders?id=eq.${orderId}`,
      "PATCH",
      expect.objectContaining({ printify_order_id: "pf-1" }),
    );
    expect(supabaseRest).toHaveBeenNthCalledWith(
      2,
      `orders?id=eq.${orderId}`,
      "PATCH",
      expect.objectContaining({ printify_order_id: null }),
    );
  });
});
