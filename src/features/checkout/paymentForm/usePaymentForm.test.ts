import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePaymentForm } from "./usePaymentForm";

// Mock Stripe hooks
const mockStripe = {
  confirmCardPayment: vi.fn(),
};

const mockElements = {
  getElement: vi.fn(),
};

vi.mock("@stripe/react-stripe-js", () => ({
  useStripe: () => mockStripe,
  useElements: () => mockElements,
  CardElement: vi.fn(),
}));

// Mock payment intent mutation
const mockMutateAsync = vi.fn();

vi.mock("@/queries", () => ({
  useCreatePaymentIntent: () => ({
    mutateAsync: mockMutateAsync,
  }),
}));

// Mock the billing details mapper
vi.mock("@/mappers/mapShippingAddressToBillingDetails", () => ({
  mapShippingAddressToBillingDetails: vi.fn((address) => ({
    name: `${address.first_name} ${address.last_name}`,
    email: address.email,
    address: {
      city: address.city,
      country: address.country,
      line1: address.address1,
      postal_code: address.zip,
      state: address.region,
    },
  })),
}));

const mockShippingAddress = {
  first_name: "John",
  last_name: "Doe",
  email: "john@example.com",
  phone: "1234567890",
  country: "US",
  region: "CA",
  address1: "123 Main St",
  address2: "",
  city: "Los Angeles",
  zip: "90001",
};

const mockLineItems = [
  { product_id: "prod_123", variant_id: 1, quantity: 1 },
];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe("usePaymentForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(
        () =>
          usePaymentForm({
            amount: 100,
            lineItems: mockLineItems,
            shippingAddress: mockShippingAddress,
          }),
        { wrapper: createWrapper() }
      );

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.selectedTestMethod).toBe("visa");
    });

    it("should expose test payment methods", () => {
      const { result } = renderHook(
        () =>
          usePaymentForm({
            amount: 100,
            lineItems: mockLineItems,
            shippingAddress: mockShippingAddress,
          }),
        { wrapper: createWrapper() }
      );

      expect(result.current.testPaymentMethods).toHaveProperty("visa");
      expect(result.current.testPaymentMethods).toHaveProperty("declined");
      expect(result.current.testPaymentMethods).toHaveProperty("insufficient_funds");
    });
  });

  describe("test mode", () => {
    it("should allow changing test method", () => {
      const { result } = renderHook(
        () =>
          usePaymentForm({
            amount: 100,
            lineItems: mockLineItems,
            shippingAddress: mockShippingAddress,
            testMode: true,
          }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.setSelectedTestMethod("declined");
      });

      expect(result.current.selectedTestMethod).toBe("declined");
    });

    it("should call onSuccess with payment intent in test mode", async () => {
      const onSuccess = vi.fn();

      mockMutateAsync.mockResolvedValue({
        clientSecret: "secret_123",
        paymentIntentId: "pi_test_123",
      });

      const { result } = renderHook(
        () =>
          usePaymentForm({
            amount: 100,
            lineItems: mockLineItems,
            shippingAddress: mockShippingAddress,
            testMode: true,
            onSuccess,
          }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
      });

      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ id: "pi_test_123", status: "succeeded" }),
        mockLineItems
      );
    });
  });

  describe("handlePayPalSuccess", () => {
    it("should call onSuccess with formatted PayPal details", async () => {
      const onSuccess = vi.fn();

      const { result } = renderHook(
        () =>
          usePaymentForm({
            amount: 100,
            lineItems: mockLineItems,
            shippingAddress: mockShippingAddress,
            onSuccess,
          }),
        { wrapper: createWrapper() }
      );

      const paypalDetails = {
        id: "paypal_order_123",
        captureId: "capture_456",
        status: "COMPLETED",
        payerEmail: "payer@example.com",
      };

      await act(async () => {
        await result.current.handlePayPalSuccess(paypalDetails, mockLineItems);
      });

      expect(onSuccess).toHaveBeenCalledWith(
        {
          id: "paypal_order_123",
          status: "COMPLETED",
          paypal_capture_id: "capture_456",
          paypal_payer_email: "payer@example.com",
        },
        mockLineItems
      );
    });
  });

  describe("error handling", () => {
    it("should handle payment API error", async () => {
      mockMutateAsync.mockRejectedValue(new Error("Payment service unavailable"));

      const onError = vi.fn();

      const { result } = renderHook(
        () =>
          usePaymentForm({
            amount: 100,
            lineItems: mockLineItems,
            shippingAddress: mockShippingAddress,
            testMode: true,
            onError,
          }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
      });

      expect(result.current.error).toBe("Payment service unavailable");
      expect(onError).toHaveBeenCalledWith("Payment service unavailable");
    });

    it("should handle card confirmation error", async () => {
      mockMutateAsync.mockResolvedValue({
        clientSecret: "secret_123",
        paymentIntentId: "pi_123",
      });

      mockElements.getElement.mockReturnValue({ type: "card" });

      mockStripe.confirmCardPayment.mockResolvedValue({
        error: { message: "Your card was declined" },
        paymentIntent: null,
      });

      const onError = vi.fn();

      const { result } = renderHook(
        () =>
          usePaymentForm({
            amount: 100,
            lineItems: mockLineItems,
            shippingAddress: mockShippingAddress,
            testMode: false,
            onError,
          }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
      });

      expect(result.current.error).toBe("Your card was declined");
      expect(onError).toHaveBeenCalledWith("Your card was declined");
    });

    it("should set error to generic message for non-Error exceptions", async () => {
      mockMutateAsync.mockRejectedValue("Unknown error string");

      const onError = vi.fn();

      const { result } = renderHook(
        () =>
          usePaymentForm({
            amount: 100,
            lineItems: mockLineItems,
            shippingAddress: mockShippingAddress,
            testMode: true,
            onError,
          }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
      });

      expect(result.current.error).toBe("Payment failed");
    });

    it("should handle card element not found error", async () => {
      mockMutateAsync.mockResolvedValue({
        clientSecret: "secret_123",
        paymentIntentId: "pi_123",
      });

      mockElements.getElement.mockReturnValue(null);

      const onError = vi.fn();

      const { result } = renderHook(
        () =>
          usePaymentForm({
            amount: 100,
            lineItems: mockLineItems,
            shippingAddress: mockShippingAddress,
            testMode: false,
            onError,
          }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
      });

      expect(result.current.error).toBe("Card element not found");
      expect(onError).toHaveBeenCalledWith("Card element not found");
    });
  });

  describe("loading state", () => {
    it("should set loading during payment processing", async () => {
      let resolvePayment: (value: any) => void;
      const paymentPromise = new Promise((resolve) => {
        resolvePayment = resolve;
      });

      mockMutateAsync.mockImplementation(() => paymentPromise);

      const { result } = renderHook(
        () =>
          usePaymentForm({
            amount: 100,
            lineItems: mockLineItems,
            shippingAddress: mockShippingAddress,
            testMode: true,
          }),
        { wrapper: createWrapper() }
      );

      expect(result.current.loading).toBe(false);

      let submitPromise: Promise<void>;
      act(() => {
        submitPromise = result.current.handleSubmit({ preventDefault: vi.fn() } as any);
      });

      // Allow the async function to start
      await act(async () => {
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolvePayment!({
          clientSecret: "secret_123",
          paymentIntentId: "pi_123",
        });
        await submitPromise;
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe("successful payment flow", () => {
    it("should call onSuccess when card payment succeeds", async () => {
      const onSuccess = vi.fn();

      mockMutateAsync.mockResolvedValue({
        clientSecret: "secret_123",
        paymentIntentId: "pi_123",
      });

      mockElements.getElement.mockReturnValue({ type: "card" });

      mockStripe.confirmCardPayment.mockResolvedValue({
        error: null,
        paymentIntent: { id: "pi_123", status: "succeeded" },
      });

      const { result } = renderHook(
        () =>
          usePaymentForm({
            amount: 100,
            lineItems: mockLineItems,
            shippingAddress: mockShippingAddress,
            testMode: false,
            onSuccess,
          }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
      });

      expect(onSuccess).toHaveBeenCalledWith(
        { id: "pi_123", status: "succeeded" },
        mockLineItems
      );
    });

    it("should not call onSuccess when payment status is not succeeded", async () => {
      const onSuccess = vi.fn();

      mockMutateAsync.mockResolvedValue({
        clientSecret: "secret_123",
        paymentIntentId: "pi_123",
      });

      mockElements.getElement.mockReturnValue({ type: "card" });

      mockStripe.confirmCardPayment.mockResolvedValue({
        error: null,
        paymentIntent: { id: "pi_123", status: "processing" },
      });

      const { result } = renderHook(
        () =>
          usePaymentForm({
            amount: 100,
            lineItems: mockLineItems,
            shippingAddress: mockShippingAddress,
            testMode: false,
            onSuccess,
          }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
      });

      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe("setError", () => {
    it("should allow manually setting error", () => {
      const { result } = renderHook(
        () =>
          usePaymentForm({
            amount: 100,
            lineItems: mockLineItems,
            shippingAddress: mockShippingAddress,
          }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.setError("Custom error message");
      });

      expect(result.current.error).toBe("Custom error message");
    });

    it("should allow clearing error", () => {
      const { result } = renderHook(
        () =>
          usePaymentForm({
            amount: 100,
            lineItems: mockLineItems,
            shippingAddress: mockShippingAddress,
          }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.setError("Some error");
      });

      expect(result.current.error).toBe("Some error");

      act(() => {
        result.current.setError(null);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("request body construction", () => {
    it("should include payment method and confirm flag in test mode", async () => {
      mockMutateAsync.mockResolvedValue({
        clientSecret: "secret_123",
        paymentIntentId: "pi_123",
      });

      const { result } = renderHook(
        () =>
          usePaymentForm({
            amount: 150,
            lineItems: mockLineItems,
            shippingAddress: mockShippingAddress,
            testMode: true,
          }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
      });

      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 150,
          currency: "usd",
          payment_method: "pm_card_visa",
          confirm: true,
        })
      );
    });

    it("should not include payment method in non-test mode", async () => {
      mockMutateAsync.mockResolvedValue({
        clientSecret: "secret_123",
        paymentIntentId: "pi_123",
      });

      mockElements.getElement.mockReturnValue({ type: "card" });
      mockStripe.confirmCardPayment.mockResolvedValue({
        error: null,
        paymentIntent: { id: "pi_123", status: "succeeded" },
      });

      const { result } = renderHook(
        () =>
          usePaymentForm({
            amount: 200,
            lineItems: mockLineItems,
            shippingAddress: mockShippingAddress,
            testMode: false,
          }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
      });

      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.not.objectContaining({
          payment_method: expect.any(String),
          confirm: true,
        })
      );
    });
  });
});
