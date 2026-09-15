// @vitest-environment node
import { describe, expect, it } from "vitest";
import { resolveStoredOrderContext } from "../../../supabase/functions/_shared/storedOrderContext";

/**
 * When a webhook fires and no order exists yet, the server rebuilds the order
 * from what was stored with the payment: the payment_recovery snapshot written
 * by the checkout page, the payment_transactions metadata written at intent
 * creation, or the provider's own metadata. Nothing here waits on the browser.
 */

const cartItems = [
  { id: "item_1", product_id: "prod_1", variant_id: "4012", quantity: 1, printify_blueprint_id: 145, is_selected: true },
];
const lineItems = [{ blueprint_id: 145, variant_id: 4012, quantity: 1, print_areas: {} }];
const shippingAddress = { first_name: "Jane", last_name: "Doe", email: "jane@example.com", address1: "Main 1" };

describe("resolveStoredOrderContext", () => {
  it("prefers the payment_recovery snapshot", () => {
    const context = resolveStoredOrderContext({
      recovery: {
        user_id: "user_1",
        user_email: "owner@example.com",
        cart_snapshot: { cart_items: cartItems },
        shipping_address: shippingAddress,
        line_items: lineItems,
        metadata: { promo_code: "save10" },
      },
      transactionMetadata: { user_id: "user_other", line_items: [], promo_code: "OTHER" },
    });

    expect(context).toEqual({
      owner: { userId: "user_1", userEmail: "owner@example.com" },
      source: { cartItems, lineItems },
      shippingAddress,
      billingAddress: null,
      promoCode: "OTHER",
      recoveryRecorded: true,
    });
  });

  it("falls back to the payment_transactions metadata written at intent creation", () => {
    const context = resolveStoredOrderContext({
      recovery: null,
      transactionMetadata: {
        user_id: "user_1",
        user_email: "user@example.com",
        line_items: lineItems,
        shipping_address: shippingAddress,
        promo_code: "SAVE10",
      },
    });

    expect(context).toEqual({
      owner: { userId: "user_1", userEmail: "user@example.com" },
      source: { cartItems: null, lineItems },
      shippingAddress,
      billingAddress: null,
      promoCode: "SAVE10",
      recoveryRecorded: false,
    });
  });

  it("parses JSON-encoded provider metadata (Stripe stores strings)", () => {
    const context = resolveStoredOrderContext({
      providerMetadata: {
        user_id: "user_1",
        user_email: "user@example.com",
        line_items: JSON.stringify(lineItems),
        shipping_address: JSON.stringify(shippingAddress),
        promo_code: "",
      },
    });

    expect(context?.source.lineItems).toEqual(lineItems);
    expect(context?.shippingAddress).toEqual(shippingAddress);
    expect(context?.promoCode).toBeNull();
  });

  it("returns null without a payment owner", () => {
    expect(resolveStoredOrderContext({ transactionMetadata: { line_items: lineItems } })).toBeNull();
    expect(
      resolveStoredOrderContext({ transactionMetadata: { user_id: "service-role", line_items: lineItems } }),
    ).toBeNull();
  });

  it("returns null when nothing describes the items", () => {
    expect(resolveStoredOrderContext({ transactionMetadata: { user_id: "user_1" } })).toBeNull();
    expect(
      resolveStoredOrderContext({ providerMetadata: { user_id: "user_1", line_items: "not json" } }),
    ).toBeNull();
  });

  it("ignores a malformed shipping address instead of failing", () => {
    const context = resolveStoredOrderContext({
      transactionMetadata: { user_id: "user_1", line_items: lineItems, shipping_address: "oops" },
    });
    expect(context?.shippingAddress).toBeNull();
  });
});
