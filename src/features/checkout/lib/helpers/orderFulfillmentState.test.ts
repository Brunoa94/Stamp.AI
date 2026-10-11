import { describe, expect, it } from "vitest";
import { AppError } from "@/shared/services/errorClient";
import {
  isAlreadyFulfilledError,
  needsFulfillment,
} from "./orderFulfillmentState";

describe("needsFulfillment", () => {
  const paid = { payment_status: "paid", status: "confirmed", printify_order_id: null };

  it("is true for a paid order that was never sent to Printify", () => {
    expect(needsFulfillment(paid)).toBe(true);
  });

  it("is false once the order is at Printify, failed or unpaid", () => {
    expect(needsFulfillment({ ...paid, printify_order_id: "p_1" })).toBe(false);
    expect(needsFulfillment({ ...paid, status: "unsuccessful_confirmation" })).toBe(false);
    expect(needsFulfillment({ ...paid, status: "cancelled" })).toBe(false);
    expect(needsFulfillment({ ...paid, payment_status: "refunded" })).toBe(false);
  });
});

describe("isAlreadyFulfilledError", () => {
  it("recognises the ALREADY_FULFILLED code only", () => {
    expect(isAlreadyFulfilledError(new AppError("x", "ALREADY_FULFILLED"))).toBe(true);
    expect(isAlreadyFulfilledError(new AppError("x", "ITEMS_NOT_PAID"))).toBe(false);
    expect(isAlreadyFulfilledError(new Error("ALREADY_FULFILLED"))).toBe(false);
  });
});
