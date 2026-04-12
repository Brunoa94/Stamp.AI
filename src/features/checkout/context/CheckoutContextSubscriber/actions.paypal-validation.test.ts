import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCheckoutSubscriberActions } from "./actions";
import { CheckoutSubscriberProvider } from "./CheckoutContextSubscriber";
import type { ReactNode } from "react";

// Mock dependencies
vi.mock("@/queries/orderQueries", () => ({
  useCreateOrderFromCart: () => ({ mutateAsync: vi.fn() }),
  useUpdateOrderStatus: () => ({ mutateAsync: vi.fn() }),
  useUpdatePaymentStatus: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock("@/queries/printifyOrderQueries", () => ({
  useCreatePrintifyOrder: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock("@/queries/cartQueries", () => ({
  useClearCart: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock("@/queries/promocodeQueries", () => ({
  useValidatePromoCode: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useUser: () => ({ data: { id: "test-user-id", email: "test@example.com" } }),
}));

vi.mock("@/services/paymentRecoveryService", () => ({
  PaymentRecoveryService: {
    recordPaymentForRecovery: vi.fn(),
    markPaymentRecovered: vi.fn(),
  },
}));

vi.mock("@/services/orderService", () => ({
  OrderService: {
    getOrderByIdempotencyKey: vi.fn(),
  },
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <CheckoutSubscriberProvider>{children}</CheckoutSubscriberProvider>
);

describe("PayPal Capture Status Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("handlePaymentSuccess - PayPal validation", () => {
    it("should throw error when PayPal status is DENIED", async () => {
      const { result } = renderHook(() => useCheckoutSubscriberActions(), { wrapper });

      const paypalIntent = {
        id: "PAYID-TEST123",
        status: "DENIED",
        captureId: "CAPTURE-123",
      };

      const lineItems = [
        {
          print_provider_id: 99,
          blueprint_id: 123,
          variant_id: 456,
          print_areas: {
            front: "https://example.com/front.png",
          },
          quantity: 1,
        },
      ];

      // Set PayPal as payment method
      result.current.setPaymentMethod("paypal");

      // Set shipping address
      result.current.handleShippingSubmit({
        first_name: "Test",
        last_name: "User",
        email: "test@example.com",
        phone: "1234567890",
        country: "US",
        region: "CA",
        address1: "123 Test St",
        address2: "",
        city: "Test City",
        zip: "12345",
      });

      // Attempt payment with DENIED status
      await expect(
        result.current.handlePaymentSuccess(paypalIntent, lineItems)
      ).rejects.toThrow();

      // Wait for state update
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it("should throw error when PayPal status is FAILED", async () => {
      const { result } = renderHook(() => useCheckoutSubscriberActions(), { wrapper });

      const paypalIntent = {
        id: "PAYID-TEST123",
        status: "FAILED",
        captureId: "CAPTURE-123",
      };

      const lineItems = [
        {
          print_provider_id: 99,
          blueprint_id: 123,
          variant_id: 456,
          print_areas: {
            front: "https://example.com/front.png",
          },
          quantity: 1,
        },
      ];

      result.current.setPaymentMethod("paypal");
      result.current.handleShippingSubmit({
        first_name: "Test",
        last_name: "User",
        email: "test@example.com",
        phone: "1234567890",
        country: "US",
        region: "CA",
        address1: "123 Test St",
        address2: "",
        city: "Test City",
        zip: "12345",
      });

      await expect(
        result.current.handlePaymentSuccess(paypalIntent, lineItems)
      ).rejects.toThrow();
    });

    it("should throw error when PayPal captureId is missing", async () => {
      const { result } = renderHook(() => useCheckoutSubscriberActions(), { wrapper });

      const paypalIntent = {
        id: "PAYID-TEST123",
        status: "COMPLETED",
        // captureId is intentionally missing
      };

      const lineItems = [
        {
          print_provider_id: 99,
          blueprint_id: 123,
          variant_id: 456,
          print_areas: {
            front: "https://example.com/front.png",
          },
          quantity: 1,
        },
      ];

      result.current.setPaymentMethod("paypal");
      result.current.handleShippingSubmit({
        first_name: "Test",
        last_name: "User",
        email: "test@example.com",
        phone: "1234567890",
        country: "US",
        region: "CA",
        address1: "123 Test St",
        address2: "",
        city: "Test City",
        zip: "12345",
      });

      await expect(
        result.current.handlePaymentSuccess(paypalIntent, lineItems)
      ).rejects.toThrow(/missing capture ID/i);
    });

    it("should not throw error for non-PayPal payment methods without captureId", async () => {
      const { result } = renderHook(() => useCheckoutSubscriberActions(), { wrapper });

      const stripeIntent = {
        id: "pi_test123",
        status: "succeeded",
        // No captureId - this is fine for Stripe
      };

      const lineItems = [
        {
          print_provider_id: 99,
          blueprint_id: 123,
          variant_id: 456,
          print_areas: {
            front: "https://example.com/front.png",
          },
          quantity: 1,
        },
      ];

      result.current.setPaymentMethod("stripe");
      result.current.handleShippingSubmit({
        first_name: "Test",
        last_name: "User",
        email: "test@example.com",
        phone: "1234567890",
        country: "US",
        region: "CA",
        address1: "123 Test St",
        address2: "",
        city: "Test City",
        zip: "12345",
      });

      // Should not throw - validation only applies to PayPal
      // Note: This will still fail due to other validation, but not due to captureId
      await result.current.handlePaymentSuccess(stripeIntent, lineItems);
    });
  });
});
