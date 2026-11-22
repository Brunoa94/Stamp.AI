import { describe, expect, it } from "vitest";
import { authorizeFulfillment } from "./fulfillmentAuthorization.ts";

const ADDRESS = { first_name: "Ana", address1: "Rua 1", city: "Lisboa", country: "PT" };
const PAID_ORDER = {
  id: "11111111-1111-1111-1111-111111111111",
  payment_status: "paid",
  printify_order_id: null,
  shipping_address: ADDRESS,
};
const PAID_SOCK = [{
  status: "succeeded",
  metadata: { priced_items: [{ blueprint_id: 10, variant_id: 20, quantity: 1 }] },
}];

function errorIdOf(run: () => unknown): string | undefined {
  try {
    run();
  } catch (error) {
    return (error as { errorId?: string }).errorId;
  }
  return undefined;
}

describe("authorizeFulfillment", () => {
  it("ships the paid items to the order's stored address", () => {
    const result = authorizeFulfillment({
      order: PAID_ORDER,
      payments: PAID_SOCK,
      lineItems: [{ blueprint_id: 10, variant_id: 20, quantity: 1 }],
    });

    expect(result.addressTo).toEqual(ADDRESS);
  });

  it("refuses more items than the checkout paid for", () => {
    expect(errorIdOf(() => authorizeFulfillment({
      order: PAID_ORDER,
      payments: PAID_SOCK,
      lineItems: [{ blueprint_id: 10, variant_id: 20, quantity: 50 }],
    }))).toBe("ITEMS_NOT_PAID");
  });

  it("refuses an order that was already sent to Printify", () => {
    expect(errorIdOf(() => authorizeFulfillment({
      order: { ...PAID_ORDER, printify_order_id: "abc" },
      payments: PAID_SOCK,
      lineItems: [{ blueprint_id: 10, variant_id: 20, quantity: 1 }],
    }))).toBe("ALREADY_FULFILLED");
  });

  it("refuses an order the server has not recorded as paid", () => {
    expect(errorIdOf(() => authorizeFulfillment({
      order: { ...PAID_ORDER, payment_status: "pending" },
      payments: PAID_SOCK,
      lineItems: [{ blueprint_id: 10, variant_id: 20, quantity: 1 }],
    }))).toBe("ORDER_NOT_PAID");
  });

  it("refuses an order without a stored shipping address", () => {
    expect(errorIdOf(() => authorizeFulfillment({
      order: { ...PAID_ORDER, shipping_address: null },
      payments: PAID_SOCK,
      lineItems: [{ blueprint_id: 10, variant_id: 20, quantity: 1 }],
    }))).toBe("INVALID_REQUEST_BODY");
  });

  it("refuses when no single succeeded payment priced the order", () => {
    expect(errorIdOf(() => authorizeFulfillment({
      order: PAID_ORDER,
      payments: [],
      lineItems: [{ blueprint_id: 10, variant_id: 20, quantity: 1 }],
    }))).toBe("ITEMS_NOT_PAID");
  });
});
