// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  assertLineItemsMatchOrder,
  assertOrderFulfillable,
} from "../../../supabase/functions/_shared/fulfillmentGuard";

/**
 * create-printify-order must only ship what the customer actually paid for:
 * the stored order has to be paid, owned by the caller and not yet fulfilled,
 * and the requested line items must be exactly the order's items.
 */

const paidOrder = {
  id: "order_1",
  user_id: "user_1",
  payment_status: "paid",
  status: "pending",
  printify_order_id: null,
};

describe("assertOrderFulfillable", () => {
  it("accepts the owner's paid, unfulfilled order", () => {
    expect(() => assertOrderFulfillable(paidOrder, { userId: "user_1", isServiceRole: false })).not.toThrow();
  });

  it("lets the service role fulfil any paid order", () => {
    expect(() => assertOrderFulfillable(paidOrder, { userId: "service-role", isServiceRole: true })).not.toThrow();
  });

  it("rejects another user's order", () => {
    expect(() => assertOrderFulfillable(paidOrder, { userId: "user_2", isServiceRole: false })).toThrow(
      expect.objectContaining({ status: 403 }),
    );
  });

  it("rejects an unpaid order", () => {
    expect(() =>
      assertOrderFulfillable({ ...paidOrder, payment_status: "pending" }, { userId: "user_1", isServiceRole: false }),
    ).toThrow(expect.objectContaining({ errorId: "ORDER_NOT_PAID", status: 402 }));
  });

  it.each([
    { status: "confirmed", printify_order_id: null },
    { status: "pending", printify_order_id: "pf_1" },
    { status: "cancelled", printify_order_id: null },
  ])("rejects an order that is already fulfilled or closed (%j)", (patch) => {
    expect(() => assertOrderFulfillable({ ...paidOrder, ...patch }, { userId: "user_1", isServiceRole: false })).toThrow(
      expect.objectContaining({ errorId: "ORDER_ALREADY_FULFILLED", status: 409 }),
    );
  });

  it("allows retrying after an unsuccessful confirmation", () => {
    expect(() =>
      assertOrderFulfillable(
        { ...paidOrder, status: "unsuccessful_confirmation" },
        { userId: "user_1", isServiceRole: false },
      ),
    ).not.toThrow();
  });
});

describe("assertLineItemsMatchOrder", () => {
  const orderItems = [
    { variant_id: "4012", quantity: 2 },
    { variant_id: "7000", quantity: 1 },
  ];

  it("accepts line items that mirror the order items in any order", () => {
    expect(() =>
      assertLineItemsMatchOrder(
        [
          { variant_id: 7000, quantity: 1 },
          { variant_id: 4012, quantity: 2 },
        ],
        orderItems,
      ),
    ).not.toThrow();
  });

  it("aggregates duplicate variants before comparing", () => {
    expect(() =>
      assertLineItemsMatchOrder(
        [
          { variant_id: 4012, quantity: 1 },
          { variant_id: 4012, quantity: 1 },
          { variant_id: 7000 },
        ],
        orderItems,
      ),
    ).not.toThrow();
  });

  it.each([
    [[{ variant_id: 4012, quantity: 3 }, { variant_id: 7000, quantity: 1 }], "quantity differs"],
    [[{ variant_id: 4012, quantity: 2 }], "an item is missing"],
    [[{ variant_id: 4012, quantity: 2 }, { variant_id: 7000, quantity: 1 }, { variant_id: 1, quantity: 1 }], "an extra item"],
    [[{ quantity: 2 }, { variant_id: 7000, quantity: 1 }], "a variant is missing"],
  ])("rejects when %s", (lineItems) => {
    expect(() => assertLineItemsMatchOrder(lineItems, orderItems)).toThrow(
      expect.objectContaining({ errorId: "LINE_ITEMS_MISMATCH", status: 400 }),
    );
  });

  it("rejects an order without items", () => {
    expect(() => assertLineItemsMatchOrder([{ variant_id: 4012, quantity: 1 }], [])).toThrow(
      expect.objectContaining({ errorId: "LINE_ITEMS_MISMATCH" }),
    );
  });
});
