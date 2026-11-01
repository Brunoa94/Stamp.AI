import { beforeEach, describe, expect, it, vi } from "vitest";
import { processStripeReturn } from "../stripeReturnProcessor";
import { processPayPalReturn } from "../payPalReturnProcessor";
import { processMollieReturn } from "../mollieReturnProcessor";
import { LocalCartStorageService } from "@/shared/services/localCartStorageService";
import type { UserI } from "@/supabase/types";

/**
 * Guest checkout: once a return page has finalised the order, the paid
 * (selected) items leave the guest's local cart. A failed, cancelled or
 * unfinished payment keeps the cart so the guest can try again.
 */

const mocks = vi.hoisted(() => ({
  fulfillStoredCheckout: vi.fn(),
  capturePayPalOrder: vi.fn(),
  isRetryablePayPalDecline: vi.fn(),
  resolveMollieCheckoutSession: vi.fn(),
  buildMollieOrderContext: vi.fn(),
}));

vi.mock("../checkoutStorageService", () => ({
  CheckoutStorageService: {
    getStripeCheckoutData: () => ({ cartId: "cart-1", amount: 2500, lineItems: [] }),
    clearStripeCheckoutData: vi.fn(),
    getPayPalCheckoutData: () => ({ cartId: "cart-1", amount: 2500, lineItems: [] }),
    clearPayPalCheckoutData: vi.fn(),
    clearMollieCheckoutData: vi.fn(),
  },
}));
vi.mock("../claimPaymentFinalization", () => ({
  claimPaymentFinalization: () => true,
}));
vi.mock("../paymentFinalizationLockService", () => ({
  PaymentFinalizationLockService: { markFinalized: vi.fn(), release: vi.fn() },
}));
vi.mock("../storedCheckoutFulfillmentService", () => ({
  fulfillStoredCheckout: mocks.fulfillStoredCheckout,
}));
vi.mock("../payPalCaptureService", () => ({
  capturePayPalOrder: mocks.capturePayPalOrder,
  isRetryablePayPalDecline: mocks.isRetryablePayPalDecline,
}));
vi.mock("../mollieReturnContextService", () => ({
  resolveMollieCheckoutSession: mocks.resolveMollieCheckoutSession,
  buildMollieOrderContext: mocks.buildMollieOrderContext,
}));
vi.mock("../paymentReturnRecoveryService", () => ({
  recordPaymentRecoverySafely: vi.fn(),
}));
vi.mock("@/lib/observability/errorCapture", () => ({ captureError: vi.fn() }));

const GUEST: UserI = {
  id: "anon-1",
  email: "",
  created_at: "2026-10-01T00:00:00Z",
  is_anonymous: true,
};
const REGISTERED: UserI = { ...GUEST, id: "user-1", email: "a@b.c", is_anonymous: false };

function context(user: UserI) {
  return {
    user,
    t: (key: string) => key,
    fulfillOrder: vi.fn().mockResolvedValue({ orderNumber: "ORD-1" }),
    update: vi.fn(),
  };
}

/** Two local items; only the first was selected for this payment. */
function seedLocalCart() {
  for (const productId of ["paid", "kept"]) {
    LocalCartStorageService.addItem({
      productId,
      variantId: "101",
      productName: "Tee",
      unitPrice: 2500,
      quantity: 1,
      customImageUrl: null,
      blueprintId: 6,
      printProviderId: 99,
    });
  }
  const [paid] = LocalCartStorageService.getItems();
  LocalCartStorageService.setSelection([paid.id]);
}

function localProductIds() {
  return LocalCartStorageService.getItems().map((item) => item.productId);
}

describe("guest local cart on the payment return pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    seedLocalCart();
    mocks.fulfillStoredCheckout.mockResolvedValue({ orderNumber: "ORD-1" });
    mocks.capturePayPalOrder.mockResolvedValue({ ok: true, captureId: "cap-1" });
    mocks.resolveMollieCheckoutSession.mockResolvedValue({ paymentId: "tr_1", cartId: "cart-1" });
    mocks.buildMollieOrderContext.mockResolvedValue({
      amount: 25,
      cartSnapshot: { id: "cart-1", cart_items: [] },
      shippingAddress: {},
      lineItems: [],
    });
  });

  describe("Stripe", () => {
    it("removes the paid items once the order is finalised", async () => {
      await processStripeReturn("pi_1", context(GUEST));

      expect(localProductIds()).toEqual(["kept"]);
    });

    it("keeps the cart when finalisation throws", async () => {
      mocks.fulfillStoredCheckout.mockRejectedValue(new Error("db down"));

      await processStripeReturn("pi_1", context(GUEST));

      expect(localProductIds()).toEqual(["paid", "kept"]);
    });

    it("keeps the cart when the return has no payment", async () => {
      await processStripeReturn(null, context(GUEST));

      expect(localProductIds()).toEqual(["paid", "kept"]);
    });

    it("leaves localStorage alone for a registered user", async () => {
      await processStripeReturn("pi_1", context(REGISTERED));

      expect(localProductIds()).toEqual(["paid", "kept"]);
    });
  });

  describe("PayPal", () => {
    const approved = { token: "EC-1", payerId: "PAYER" };

    it("removes the paid items once the order is finalised", async () => {
      await processPayPalReturn(approved, context(GUEST));

      expect(localProductIds()).toEqual(["kept"]);
    });

    it("keeps the cart when the guest cancelled", async () => {
      await processPayPalReturn({ token: null, payerId: null }, context(GUEST));

      expect(localProductIds()).toEqual(["paid", "kept"]);
    });

    it("keeps the cart when the payment was declined", async () => {
      mocks.capturePayPalOrder.mockResolvedValue({ ok: false, error: "declined" });
      mocks.isRetryablePayPalDecline.mockReturnValue(true);

      await processPayPalReturn(approved, context(GUEST));

      expect(localProductIds()).toEqual(["paid", "kept"]);
    });

    it("keeps the cart when finalisation throws", async () => {
      mocks.fulfillStoredCheckout.mockRejectedValue(new Error("db down"));

      await processPayPalReturn(approved, context(GUEST));

      expect(localProductIds()).toEqual(["paid", "kept"]);
    });
  });

  describe("Mollie", () => {
    it("removes the paid items once the order is finalised", async () => {
      const verify = vi.fn().mockResolvedValue({ status: "paid" });

      await processMollieReturn("tr_1", verify, context(GUEST));

      expect(localProductIds()).toEqual(["kept"]);
    });

    it.each(["failed", "canceled", "expired", "open"] as const)(
      "keeps the cart when the payment is %s",
      async (status) => {
        const verify = vi.fn().mockResolvedValue({ status });

        await processMollieReturn("tr_1", verify, context(GUEST));

        expect(localProductIds()).toEqual(["paid", "kept"]);
      },
    );

    it("keeps the cart when finalisation throws", async () => {
      const verify = vi.fn().mockResolvedValue({ status: "paid" });
      const ctx = context(GUEST);
      ctx.fulfillOrder.mockRejectedValue(new Error("db down"));

      await processMollieReturn("tr_1", verify, ctx);

      expect(localProductIds()).toEqual(["paid", "kept"]);
    });
  });
});
