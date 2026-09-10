// @vitest-environment node
import { describe, expect, it } from "vitest";
import { verifyStripePayment, verifyPayPalPayment, verifyMolliePayment, requirePaymentCurrency } from "../../supabase/functions/_shared/paymentProof.ts";
import { authorizeRefund, type RefundOrder, type RefundPayment } from "../../supabase/functions/process-refund/authorization.ts";

describe("Provider payment proofs", () => {
  const stripe = { status: "succeeded", amount_received: 1000, currency: "usd", metadata: { user_id: "owner" } };
  const paypal = { status: "COMPLETED", purchase_units: [{ custom_id: JSON.stringify({ user_id: "owner" }), payments: { captures: [{ id: "CAPTURE", status: "COMPLETED", amount: { value: "10.00", currency_code: "USD" } }] } }] };
  const mollie = { status: "paid", metadata: { user_id: "owner" }, amount: { value: "10.00", currency: "EUR" } };
  it("uses the Stripe amount received", () => expect(verifyStripePayment(stripe, "owner").amount).toBe(10));
  it.each([null, {}, { user_id: "other" }])("requires Stripe ownership: %j", (metadata) => {
    expect(() => verifyStripePayment({ ...stripe, metadata }, "owner")).toThrow();
  });
  it("does not recover a credit purchase as merchandise", () => {
    expect(() => verifyStripePayment({ ...stripe, metadata: { ...stripe.metadata, type: "credit_purchase" } }, "owner")).toThrow();
  });
  it.each(["APPROVED", "CREATED"])("rejects uncaptured PayPal order %s", (status) => {
    expect(() => verifyPayPalPayment({ ...paypal, status }, "owner")).toThrow();
  });
  it.each(["PENDING", "DECLINED", "REFUNDED", "PARTIALLY_REFUNDED"])("rejects PayPal capture %s", (status) => {
    const payment = structuredClone(paypal);
    payment.purchase_units[0].payments.captures[0].status = status;
    expect(() => verifyPayPalPayment(payment, "owner")).toThrow();
  });
  it("requires a capture even on a completed PayPal order", () => {
    expect(() => verifyPayPalPayment({ ...paypal, purchase_units: [{ custom_id: paypal.purchase_units[0].custom_id }] }, "owner")).toThrow();
  });
  it("rejects another PayPal user's payment", () => expect(() => verifyPayPalPayment(paypal, "other")).toThrow());
  it("accepts a completed owned capture", () => expect(verifyPayPalPayment(paypal, "owner")).toMatchObject({ amount: 10, currency: "USD", captureId: "CAPTURE" }));
  it("allows a full-refund retry without permitting recovery of that payment", () => {
    const refunded = structuredClone(paypal);
    refunded.purchase_units[0].payments.captures[0].status = "REFUNDED";
    expect(() => verifyPayPalPayment(refunded, "owner")).toThrow();
    expect(verifyPayPalPayment(refunded, "owner", true).captureId).toBe("CAPTURE");
    expect(() => verifyPayPalPayment(refunded, "other", true)).toThrow();
  });
  it("accepts Mollie's paid status", () => expect(verifyMolliePayment(mollie, "owner").currency).toBe("EUR"));
  it("requires Mollie ownership", () => expect(() => verifyMolliePayment({ ...mollie, metadata: null }, "owner")).toThrow());
  it("rejects refunded Mollie payments", () => expect(() => verifyMolliePayment({ ...mollie, amountRefunded: { value: "1.00" } }, "owner")).toThrow());
  it("compares provider currency, not caller-supplied currency", () => {
    expect(() => requirePaymentCurrency(verifyMolliePayment(mollie, "owner"), "USD")).toThrow();
  });
});

describe("Refund authorization", () => {
  const order: RefundOrder = { id: "order", user_id: "owner", status: "cancelled", payment_status: "paid", printify_order_id: null, currency: "USD" };
  const payment: RefundPayment = { order_id: "order", user_id: "owner", status: "succeeded", payment_provider: "stripe", amount: 10, currency: "usd", stripe_payment_intent_id: "pi_owned", paypal_order_id: null, paypal_capture_id: null, mollie_payment_id: null };
  const request = { order_id: "order", payment_provider: "stripe" as const };
  const caller = { userId: "owner", isServiceRole: false };
  it("resolves refund details from the stored payment", () => expect(authorizeRefund(request, order, payment, caller)).toEqual({ providerId: "pi_owned", verificationId: "pi_owned", amount: 10, currency: "USD" }));
  it("rejects a forged provider ID alongside an owned order", () => expect(() => authorizeRefund({ ...request, stripe_payment_intent_id: "pi_victim" }, order, payment, caller)).toThrow());
  it("rejects a payment from another order", () => expect(() => authorizeRefund(request, order, { ...payment, order_id: "other" }, caller)).toThrow());
  it("rejects a payment from another user", () => expect(() => authorizeRefund(request, order, { ...payment, user_id: "other" }, caller)).toThrow());
  it.each(["pending", "confirmed", "shipped", "delivered"])("rejects ineligible order status %s", (status) => expect(() => authorizeRefund(request, { ...order, status }, payment, caller)).toThrow());
  it.each([0, -10, 5, 11, NaN, Infinity])("rejects invalid/full-refund amount %s", (amount) => expect(() => authorizeRefund({ ...request, amount }, order, payment, caller)).toThrow());
  it("rejects a currency mismatch", () => expect(() => authorizeRefund({ ...request, currency: "EUR" }, order, payment, caller)).toThrow());
  it("requires service-role calls to use the order's payment too", () => expect(() => authorizeRefund({ ...request, stripe_payment_intent_id: "pi_victim" }, order, payment, { userId: "service-role", isServiceRole: true })).toThrow());
});
