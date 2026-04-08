import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import { useCheckoutSubscriberActions } from "./actions";
import { CheckoutSubscriberContext } from "./CheckoutContextSubscriber";
import { CheckoutSubscriberContextState } from "./types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock dependencies
vi.mock("@/queries/orderQueries", () => ({
  useCreateOrderFromCart: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
  }),
}));

vi.mock("@/queries/printifyOrderQueries", () => ({
  useCreatePrintifyOrder: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
  }),
}));

vi.mock("@/queries/cartQueries", () => ({
  useClearCart: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
  }),
}));

vi.mock("@/queries/promocodeQueries", () => ({
  useValidatePromoCode: () => ({
    mutateAsync: vi.fn().mockResolvedValue({
      isValid: true,
      appliedPromo: { code: "TEST10", value: 10, type: "percentage", discountValue: 5 },
    }),
  }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useUser: () => ({
    data: { id: "user-123", email: "test@example.com" },
  }),
}));

function createMockStore(initialState: CheckoutSubscriberContextState) {
  let state = initialState;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    setState: (newState: CheckoutSubscriberContextState) => {
      state = newState;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

const defaultState: CheckoutSubscriberContextState = {
  cart: null,
  cartItems: [],
  isLoading: false,
  error: null,
  shippingAddress: null,
  paymentStatus: "idle",
  message: "",
  testMode: false,
  isProcessingPayment: false,
  triggerPayment: false,
  selectedPaymentMethod: "stripe",
  paymentSuccessDetails: null,
  paymentErrorDetails: null,
  promoCode: null,
  promoValue: 0,
  promoType: null,
  promoError: null,
  subtotal: 100,
  shippingCost: 10,
  discount: 0,
  total: 110,
  orderAmount: 110,
};

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

function createWrapper(store: ReturnType<typeof createMockStore>) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(
        CheckoutSubscriberContext.Provider,
        { value: store },
        children
      )
    );
  };
}

describe("useCheckoutSubscriberActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("handlePaymentSuccess", () => {
    it("should throw error when shipping address is missing", async () => {
      const store = createMockStore({
        ...defaultState,
        shippingAddress: null,
      });

      const { result } = renderHook(() => useCheckoutSubscriberActions(), {
        wrapper: createWrapper(store),
      });

      const paymentIntent = { id: "pi_123" };
      const lineItems = [{ product_id: "prod_123", variant_id: 1, quantity: 1 }];

      await act(async () => {
        await result.current.handlePaymentSuccess(paymentIntent, lineItems);
      });

      const state = store.getState();
      expect(state.paymentStatus).toBe("error");
      expect(state.message).toBe("Shipping address missing. Unable to finalize order.");
      expect(state.paymentErrorDetails).not.toBeNull();
    });

    it("should throw error when line items are empty", async () => {
      const store = createMockStore({
        ...defaultState,
        shippingAddress: mockShippingAddress,
      });

      const { result } = renderHook(() => useCheckoutSubscriberActions(), {
        wrapper: createWrapper(store),
      });

      const paymentIntent = { id: "pi_123" };

      await act(async () => {
        await result.current.handlePaymentSuccess(paymentIntent, []);
      });

      const state = store.getState();
      expect(state.paymentStatus).toBe("error");
      expect(state.message).toBe("No order items found for Printify order creation.");
    });

    it("should set isProcessingPayment to true initially", async () => {
      const store = createMockStore({
        ...defaultState,
        shippingAddress: mockShippingAddress,
      });

      const { result } = renderHook(() => useCheckoutSubscriberActions(), {
        wrapper: createWrapper(store),
      });

      const paymentIntent = { id: "pi_123" };
      const lineItems = [{ product_id: "prod_123", variant_id: 1, quantity: 1 }];

      // Start the payment processing
      const promise = result.current.handlePaymentSuccess(paymentIntent, lineItems);

      // Check that processing started
      expect(store.getState().isProcessingPayment).toBe(true);
      expect(store.getState().message).toBe("Payment confirmed. Finalizing your order...");

      await act(async () => {
        await promise;
      });
    });

    it("should set success state when payment succeeds", async () => {
      const store = createMockStore({
        ...defaultState,
        shippingAddress: mockShippingAddress,
        orderAmount: 99.99,
      });

      const { result } = renderHook(() => useCheckoutSubscriberActions(), {
        wrapper: createWrapper(store),
      });

      const paymentIntent = { id: "pi_test123456" };
      const lineItems = [{ product_id: "prod_123", variant_id: 1, quantity: 1 }];

      await act(async () => {
        await result.current.handlePaymentSuccess(paymentIntent, lineItems);
      });

      const state = store.getState();
      expect(state.paymentStatus).toBe("success");
      expect(state.isProcessingPayment).toBe(false);
      expect(state.paymentSuccessDetails).toMatchObject({
        id: "pi_test123456",
        status: "paid",
        orderNumber: "#SD-123456",
        estimatedDelivery: "7–10 business days",
      });
    });

    it("should generate correct order number from payment intent id", async () => {
      const store = createMockStore({
        ...defaultState,
        shippingAddress: mockShippingAddress,
      });

      const { result } = renderHook(() => useCheckoutSubscriberActions(), {
        wrapper: createWrapper(store),
      });

      const paymentIntent = { id: "pi_abcdef123xyz" };
      const lineItems = [{ product_id: "prod_123", variant_id: 1, quantity: 1 }];

      await act(async () => {
        await result.current.handlePaymentSuccess(paymentIntent, lineItems);
      });

      const state = store.getState();
      // The order number is generated from the last 6 characters of the payment intent id
      // "pi_abcdef123xyz".slice(-6) = "123xyz" -> uppercase = "123XYZ"
      expect(state.paymentSuccessDetails?.orderNumber).toBe("#SD-123XYZ");
    });

    it("should include error details on failure", async () => {
      const store = createMockStore({
        ...defaultState,
        shippingAddress: null,
        orderAmount: 50.0,
      });

      const { result } = renderHook(() => useCheckoutSubscriberActions(), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.handlePaymentSuccess({ id: "pi_123" }, [
          { product_id: "prod", variant_id: 1, quantity: 1 },
        ]);
      });

      const state = store.getState();
      expect(state.paymentErrorDetails).toMatchObject({
        amountDue: "$50.00",
        status: "Failed",
        reasonTitle: "Reason",
        availableMethods: ["paypal", "applepay", "stripe"],
      });
    });
  });

  describe("handlePaymentError", () => {
    it("should set error state with provided message", () => {
      const store = createMockStore({
        ...defaultState,
        orderAmount: 75.5,
      });

      const { result } = renderHook(() => useCheckoutSubscriberActions(), {
        wrapper: createWrapper(store),
      });

      act(() => {
        result.current.handlePaymentError("Card was declined");
      });

      const state = store.getState();
      expect(state.paymentStatus).toBe("error");
      expect(state.message).toBe("Card was declined");
      expect(state.paymentErrorDetails?.reasonMessage).toBe("Card was declined");
      expect(state.paymentErrorDetails?.amountDue).toBe("$75.50");
    });

    it("should use fallback message when error message is empty", () => {
      const store = createMockStore(defaultState);

      const { result } = renderHook(() => useCheckoutSubscriberActions(), {
        wrapper: createWrapper(store),
      });

      act(() => {
        result.current.handlePaymentError("");
      });

      const state = store.getState();
      expect(state.paymentErrorDetails?.reasonMessage).toContain(
        "The issuing bank declined the transaction"
      );
    });
  });

  describe("handleShippingSubmit", () => {
    it("should update shipping address in state", () => {
      const store = createMockStore(defaultState);

      const { result } = renderHook(() => useCheckoutSubscriberActions(), {
        wrapper: createWrapper(store),
      });

      act(() => {
        result.current.handleShippingSubmit(mockShippingAddress);
      });

      expect(store.getState().shippingAddress).toEqual(mockShippingAddress);
    });
  });

  describe("handleCompleteOrder", () => {
    it("should not trigger payment when shipping address is missing", () => {
      const store = createMockStore({
        ...defaultState,
        shippingAddress: null,
      });

      const { result } = renderHook(() => useCheckoutSubscriberActions(), {
        wrapper: createWrapper(store),
      });

      act(() => {
        result.current.handleCompleteOrder();
      });

      expect(store.getState().triggerPayment).toBe(false);
      expect(store.getState().isProcessingPayment).toBe(false);
    });

    it("should trigger payment when shipping address is present", () => {
      const store = createMockStore({
        ...defaultState,
        shippingAddress: mockShippingAddress,
      });

      const { result } = renderHook(() => useCheckoutSubscriberActions(), {
        wrapper: createWrapper(store),
      });

      act(() => {
        result.current.handleCompleteOrder();
      });

      expect(store.getState().triggerPayment).toBe(true);
      expect(store.getState().isProcessingPayment).toBe(true);
    });
  });

  describe("handleTryAgain", () => {
    it("should reset payment state to idle", () => {
      const store = createMockStore({
        ...defaultState,
        paymentStatus: "error",
        message: "Some error",
        isProcessingPayment: true,
        paymentErrorDetails: {
          paymentId: "failed_123",
          orderNumber: "#SD-123",
          amountDue: "$100",
          attemptedOn: "Jan 1, 2024",
          status: "Failed",
          reasonTitle: "Reason",
          reasonMessage: "Error",
          availableMethods: ["stripe"],
        },
      });

      const { result } = renderHook(() => useCheckoutSubscriberActions(), {
        wrapper: createWrapper(store),
      });

      act(() => {
        result.current.handleTryAgain();
      });

      const state = store.getState();
      expect(state.paymentStatus).toBe("idle");
      expect(state.message).toBe("");
      expect(state.isProcessingPayment).toBe(false);
      expect(state.paymentErrorDetails).toBeNull();
    });
  });

  describe("handleCreateAnother", () => {
    it("should reset checkout state for new order", () => {
      const store = createMockStore({
        ...defaultState,
        paymentStatus: "success",
        shippingAddress: mockShippingAddress,
        message: "Success!",
        paymentSuccessDetails: {
          id: "pi_123",
          provider: "stripe",
          status: "paid",
          orderNumber: "#123",
          totalPaid: "$100",
          estimatedDelivery: "7 days",
          confirmationEmail: "test@test.com",
        },
      });

      const { result } = renderHook(() => useCheckoutSubscriberActions(), {
        wrapper: createWrapper(store),
      });

      act(() => {
        result.current.handleCreateAnother();
      });

      const state = store.getState();
      expect(state.paymentStatus).toBe("idle");
      expect(state.shippingAddress).toBeNull();
      expect(state.message).toBe("");
      expect(state.paymentSuccessDetails).toBeNull();
    });
  });

  describe("setTestMode", () => {
    it("should update test mode state", () => {
      const store = createMockStore({ ...defaultState, testMode: false });

      const { result } = renderHook(() => useCheckoutSubscriberActions(), {
        wrapper: createWrapper(store),
      });

      act(() => {
        result.current.setTestMode(true);
      });

      expect(store.getState().testMode).toBe(true);

      act(() => {
        result.current.setTestMode(false);
      });

      expect(store.getState().testMode).toBe(false);
    });
  });

  describe("setPaymentMethod", () => {
    it("should update selected payment method", () => {
      const store = createMockStore({
        ...defaultState,
        selectedPaymentMethod: "stripe",
      });

      const { result } = renderHook(() => useCheckoutSubscriberActions(), {
        wrapper: createWrapper(store),
      });

      act(() => {
        result.current.setPaymentMethod("paypal");
      });

      expect(store.getState().selectedPaymentMethod).toBe("paypal");
    });
  });
});
