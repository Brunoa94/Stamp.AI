import { beforeEach, describe, expect, it, vi } from "vitest";
import { StripeService } from "./stripeService";
import { computeCheckoutTotals } from "@/features/checkout/lib/helpers/checkoutTotals";
import type { CreatePaymentIntentPayloadI } from "@/types/payment";

const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ functions: { invoke } }),
}));
vi.mock("./authHelpers", () => ({
  getAuthenticatedHeaders: async () => ({ Authorization: "Bearer test" }),
}));

describe("StripeService checkout amounts", () => {
  beforeEach(() => {
    invoke.mockReset();
    invoke.mockResolvedValue({
      data: { success: true, clientSecret: "secret", paymentIntentId: "pi_test" },
      error: null,
    });
  });

  it.each([false, true])("sends a €0.50 fixed-total checkout in currency units (confirm=%s)", async (confirm) => {
    const totals = computeCheckoutTotals(2499, {
      isValid: true,
      message: "Applied",
      appliedPromo: {
        code: "REDUCE_TOTAL",
        type: "fixed_total",
        value: 0.5,
        discountValue: 24.49,
      },
    });
    const payload: CreatePaymentIntentPayloadI = {
      amount: totals.totalInCents,
      currency: "eur",
      line_items: [],
      shipping_address: {} as CreatePaymentIntentPayloadI["shipping_address"],
      confirm,
      metadata: { cartId: "cart_test" },
    };

    await StripeService.createPaymentIntent(payload);

    expect(invoke).toHaveBeenCalledWith("create-payment-intent", {
      body: { ...payload, amount: 0.5 },
      headers: { Authorization: "Bearer test" },
    });
    expect(payload.amount).toBe(50);
  });

  it("converts an ordinary checkout total including shipping", async () => {
    const totals = computeCheckoutTotals(2499, null);
    await StripeService.createPaymentIntent({
      amount: totals.totalInCents,
      currency: "eur",
      line_items: [],
      shipping_address: {} as CreatePaymentIntentPayloadI["shipping_address"],
    });

    expect(invoke.mock.calls[0][1].body.amount).toBe(29.98);
  });

  it("keeps credit purchases in their existing currency units", async () => {
    await StripeService.createCreditPayment({ amount: 5, credits: 10 });
    expect(invoke).toHaveBeenCalledWith("create-credit-payment", {
      body: { amount: 5, credits: 10, currency: "eur" },
      headers: { Authorization: "Bearer test" },
    });
  });
});
