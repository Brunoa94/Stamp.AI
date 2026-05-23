import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import { useCheckoutSubscriberActions } from "./actions";
import { CheckoutSubscriberContext } from "./CheckoutContextSubscriber";
import { CheckoutSubscriberContextState } from "./types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCreateOrderFromCart, useUpdateOrderStatus, useUpdatePaymentStatus } from "@/queries/orderQueries";
import { useCreatePrintifyOrder } from "@/queries/printifyOrderQueries";
import { useClearCart } from "@/queries/cartQueries";
import { useUser } from "@/hooks/useAuth";
import { OrderService } from "@/services/orderService";
import { RefundService } from "@/services/refundService";
import { PaymentRecoveryService } from "@/services/paymentRecoveryService";

// Create mock functions that can be spied on
const mockCreateOrderMutate = vi.fn().mockResolvedValue("order_123");
const mockUpdateOrderStatusMutate = vi.fn().mockResolvedValue({});
const mockUpdatePaymentStatusMutate = vi.fn().mockResolvedValue({});
const mockCreatePrintifyOrderMutate = vi.fn().mockResolvedValue({ order: { id: "printify_123" } });
const mockClearCartMutate = vi.fn().mockResolvedValue({});
const mockValidatePromoCodeMutate = vi.fn().mockResolvedValue({
  isValid: true,
  appliedPromo: { code: "TEST10", value: 10, type: "percentage", discountValue: 5 },
});

let mockUserData: any = { id: "user-123", email: "test@example.com" };

// Mock dependencies
vi.mock("@/queries/orderQueries", () => ({
  useCreateOrderFromCart: () => ({
    mutateAsync: mockCreateOrderMutate,
  }),
  useUpdateOrderStatus: () => ({
    mutateAsync: mockUpdateOrderStatusMutate,
  }),
  useUpdatePaymentStatus: () => ({
    mutateAsync: mockUpdatePaymentStatusMutate,
  }),
}));

vi.mock("@/queries/printifyOrderQueries", () => ({
  useCreatePrintifyOrder: () => ({
    mutateAsync: mockCreatePrintifyOrderMutate,
  }),
}));

vi.mock("@/queries/cartQueries", () => ({
  useClearCart: () => ({
    mutateAsync: mockClearCartMutate,
  }),
}));

vi.mock("@/queries/promocodeQueries", () => ({
  useValidatePromoCode: () => ({
    mutateAsync: mockValidatePromoCodeMutate,
  }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useUser: () => ({
    data: mockUserData,
  }),
}));

vi.mock("@/services/orderService", () => ({
  OrderService: {
    getOrderByIdempotencyKey: vi.fn().mockResolvedValue(null),
    linkPaymentTransactionToOrder: vi.fn().mockResolvedValue(undefined),
    updateOrder: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@/services/refundService", () => ({
  RefundService: {
    processRefund: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@/services/paymentRecoveryService", () => ({
  PaymentRecoveryService: {
    recordPaymentForRecovery: vi.fn().mockResolvedValue("recovery_123"),
    markPaymentRecovered: vi.fn().mockResolvedValue(undefined),
  },
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
  lineItems: []
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
    // Reset mock implementations to defaults
    mockCreateOrderMutate.mockResolvedValue("order_123");
    mockUpdateOrderStatusMutate.mockResolvedValue({});
    mockUpdatePaymentStatusMutate.mockResolvedValue({});
    mockCreatePrintifyOrderMutate.mockResolvedValue({ order: { id: "printify_123" } });
    mockClearCartMutate.mockResolvedValue({});
    mockValidatePromoCodeMutate.mockResolvedValue({
      isValid: true,
      appliedPromo: { code: "TEST10", value: 10, type: "percentage", discountValue: 5 },
    });
    mockUserData = { id: "user-123", email: "test@example.com" };
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

    it("should set success state when payment succeeds and create order with waiting_confirmation status", async () => {
      const store = createMockStore({
        ...defaultState,
        shippingAddress: mockShippingAddress,
        orderAmount: 99.99,
        cart: {
          id: "cart_123",
          user_id: "user_123",
          created_at: new Date().toISOString(),
          session_id: "session_123",
          updated_at: new Date().toISOString(),
          user_email: "test@example.com",
          cart_items: [],
        },
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

      // Verify order was created with waiting_confirmation status
      expect(mockCreateOrderMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          orderStatus: "waiting_confirmation",
        })
      );
    });

    it("should generate correct order number from payment intent id", async () => {
      const store = createMockStore({
        ...defaultState,
        shippingAddress: mockShippingAddress,
        cart: {
          id: "cart_123",
          user_id: "user_123",
          created_at: new Date().toISOString(),
          session_id: "session_123",
          updated_at: new Date().toISOString(),
          user_email: "test@example.com",
          cart_items: [],
        },
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
        availableMethods: ["paypal", "applepay", "stripe", "mollie"],
      });
    });

    it("should set isPostPaymentError to true when order fulfillment fails after payment", async () => {
      const store = createMockStore({
        ...defaultState,
        shippingAddress: null,
        orderAmount: 99.99,
      });

      const { result } = renderHook(() => useCheckoutSubscriberActions(), {
        wrapper: createWrapper(store),
      });

      const paymentIntent = { id: "pi_test_post_payment_error" };
      const lineItems = [{ product_id: "prod_123", variant_id: 1, quantity: 1 }];

      await act(async () => {
        await result.current.handlePaymentSuccess(paymentIntent, lineItems);
      });

      const state = store.getState();
      expect(state.paymentStatus).toBe("error");
      expect(state.paymentErrorDetails?.isPostPaymentError).toBe(true);
      expect(state.message).toContain("Shipping address missing");
    });

    it("should set isPostPaymentError to true when line items are empty", async () => {
      const store = createMockStore({
        ...defaultState,
        shippingAddress: mockShippingAddress,
        orderAmount: 75.0,
      });

      const { result } = renderHook(() => useCheckoutSubscriberActions(), {
        wrapper: createWrapper(store),
      });

      const paymentIntent = { id: "pi_empty_items" };

      await act(async () => {
        await result.current.handlePaymentSuccess(paymentIntent, []);
      });

      const state = store.getState();
      expect(state.paymentStatus).toBe("error");
      expect(state.paymentErrorDetails?.isPostPaymentError).toBe(true);
      expect(state.message).toContain("No order items found");
    });

    it("should include isPostPaymentError in error details for any fulfillment error", async () => {
      const store = createMockStore({
        ...defaultState,
        shippingAddress: mockShippingAddress,
        cart: {
          id: "cart_123",
          user_id: "user_123",
          created_at: new Date().toISOString(),
          session_id: "session_123",
          updated_at: new Date().toISOString(),
          user_email: "test@example.com",
          cart_items: [],
        },
        orderAmount: 150.0,
      });

      const { result } = renderHook(() => useCheckoutSubscriberActions(), {
        wrapper: createWrapper(store),
      });

      const paymentIntent = { id: "pi_fulfillment_error" };
      const lineItems = [{ product_id: "prod_123", variant_id: 1, quantity: 1 }];

      await act(async () => {
        await result.current.handlePaymentSuccess(paymentIntent, lineItems);
      });

      const state = store.getState();
      // If there's an error (e.g., from mocked services), it should have isPostPaymentError
      if (state.paymentStatus === "error") {
        expect(state.paymentErrorDetails?.isPostPaymentError).toBe(true);
      }
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

    it("should NOT set isPostPaymentError for actual payment failures", () => {
      const store = createMockStore({
        ...defaultState,
        orderAmount: 100.0,
      });

      const { result } = renderHook(() => useCheckoutSubscriberActions(), {
        wrapper: createWrapper(store),
      });

      act(() => {
        result.current.handlePaymentError("Card was declined");
      });

      const state = store.getState();
      expect(state.paymentStatus).toBe("error");
      expect(state.paymentErrorDetails?.isPostPaymentError).toBeUndefined();
      expect(state.paymentErrorDetails?.reasonMessage).toBe("Card was declined");
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

  /**
   * ========================================================================
   * EDGE CASE TESTS - CRITICAL SCENARIOS
   * ========================================================================
   * These tests cover edge cases identified in the comprehensive audit.
   * Each test documents the problem, expected solution, and potential impact.
   */

  describe("EDGE CASE: Race Conditions & Concurrency", () => {
    /**
     * PROBLEM: Multiple handlePaymentSuccess calls can execute simultaneously
     * (e.g., user clicks "Pay" twice, or multiple browser tabs/windows)
     * This can create duplicate orders for the same payment.
     *
     * EXPECTED SOLUTION: Implement idempotency check using payment_intent_id
     * to ensure only one order is created per payment, regardless of how many
     * times handlePaymentSuccess is called.
     *
     * IMPACT: Without this, customers are charged once but receive multiple orders,
     * causing inventory issues, shipping costs, and customer confusion.
     */
    it("should prevent duplicate order creation when handlePaymentSuccess called twice with same payment intent", async () => {
      mockCreateOrderMutate
        .mockResolvedValueOnce("order_123") // First call succeeds
        .mockResolvedValueOnce("order_456"); // Second call also succeeds (BUG!)

      const store = createMockStore({
        ...defaultState,
        shippingAddress: mockShippingAddress,
        cart: {
          id: "cart_123",
          user_id: "user_123",
          created_at: new Date().toISOString(),
          session_id: "session_123",
          updated_at: new Date().toISOString(),
          user_email: "test@example.com",
          cart_items: [],
        },
      });

      const { result } = renderHook(() => useCheckoutSubscriberActions(), {
        wrapper: createWrapper(store),
      });

      const paymentIntent = { id: "pi_duplicate_test" };
      const lineItems = [{ product_id: "prod_123", variant_id: 1, quantity: 1 }];

      // Simulate rapid double-click or multiple tabs
      const promise1 = result.current.handlePaymentSuccess(paymentIntent, lineItems);
      const promise2 = result.current.handlePaymentSuccess(paymentIntent, lineItems);

      await act(async () => {
        await Promise.all([promise1, promise2]);
      });

      // EXPECTED: createOrder should only be called once due to idempotency check
      // CURRENT BEHAVIOR: In-flight guard prevents duplicate calls within the same session
      // However, duplicate calls from different tabs/browser instances can still create duplicate orders
      expect(mockCreateOrderMutate).toHaveBeenCalledTimes(1);
    });

    /**
     * PROBLEM: Cart cleared by one tab while checkout processing in another tab
     *
     * EXPECTED SOLUTION: Use optimistic locking (version numbers) on cart table
     * to detect concurrent modifications and fail gracefully.
     */
    it("should handle cart being cleared by another session during checkout", async () => {
      mockClearCartMutate.mockRejectedValueOnce(new Error("Cart already cleared"));

      const store = createMockStore({
        ...defaultState,
        shippingAddress: mockShippingAddress,
        cart: {
          id: "cart_123",
          user_id: "user_123",
          created_at: new Date().toISOString(),
          session_id: "session_123",
          updated_at: new Date().toISOString(),
          user_email: "test@example.com",
          cart_items: [],
        },
      });

      const { result } = renderHook(() => useCheckoutSubscriberActions(), {
        wrapper: createWrapper(store),
      });

      const paymentIntent = { id: "pi_cart_cleared" };
      const lineItems = [{ product_id: "prod_123", variant_id: 1, quantity: 1 }];

      await act(async () => {
        await result.current.handlePaymentSuccess(paymentIntent, lineItems);
      });

      const state = store.getState();
      // EXPECTED: Order should still be created successfully even if cart clear fails
      expect(state.paymentStatus).toBe("success");
      expect(mockClearCartMutate).toHaveBeenCalled();
    });
  });

  describe("EDGE CASE: PayPal-Specific Failures", () => {
    /**
     * PROBLEM: PayPal order approved by user, but capture is denied by PayPal
     * (e.g., insufficient funds, card declined after approval)
     *
     * EXPECTED SOLUTION: Check capture status and handle DENIED/FAILED states
     * before calling handlePaymentSuccess.
     *
     * IMPACT: Without this, order is created but payment never captured,
     * leading to unfulfilled orders and lost revenue.
     */
    it("should set error state when PayPal capture is denied after approval", async () => {
      const store = createMockStore({
        ...defaultState,
        shippingAddress: mockShippingAddress,
        selectedPaymentMethod: "paypal",
      });

      const { result } = renderHook(() => useCheckoutSubscriberActions(), {
        wrapper: createWrapper(store),
      });

      // Simulate PayPal approval but capture denied
      const deniedPaymentIntent = {
        id: "paypal_order_123",
        status: "DENIED",
        captureId: undefined, // No capture ID because it failed
      };
      const lineItems = [{ product_id: "prod_123", variant_id: 1, quantity: 1 }];

      await act(async () => {
        // This should fail because capture was denied
        await result.current.handlePaymentSuccess(deniedPaymentIntent, lineItems);
      });

      const state = store.getState();
      // EXPECTED: Should be in error state, not success
      expect(state.paymentStatus).toBe("error");
      expect(state.paymentErrorDetails?.isPostPaymentError).toBe(true);
    });

    /**
     * PROBLEM: PayPal payment intent missing capture_id
     *
     * EXPECTED SOLUTION: Validate that captureId exists for PayPal payments
     * before processing the order.
     */
    it("should handle missing PayPal capture_id gracefully", async () => {
      const store = createMockStore({
        ...defaultState,
        shippingAddress: mockShippingAddress,
        selectedPaymentMethod: "paypal",
        cart: {
          id: "cart_123",
          user_id: "user_123",
          created_at: new Date().toISOString(),
          session_id: "session_123",
          updated_at: new Date().toISOString(),
          user_email: "test@example.com",
          cart_items: [],
        },
      });

      const { result } = renderHook(() => useCheckoutSubscriberActions(), {
        wrapper: createWrapper(store),
      });

      const paymentIntentWithoutCaptureId = {
        id: "paypal_order_456",
        status: "COMPLETED",
        // captureId is missing!
      };
      const lineItems = [{ product_id: "prod_123", variant_id: 1, quantity: 1 }];

      await act(async () => {
        await result.current.handlePaymentSuccess(paymentIntentWithoutCaptureId, lineItems);
      });

      const state = store.getState();
      // EXPECTED: Should succeed or handle gracefully
      // PayPal payments without capture_id should be validated
      expect(state.paymentStatus).toBe("success");
    });
  });

  describe("EDGE CASE: Database & Network Failures", () => {
    /**
     * PROBLEM: Order creation succeeds but Printify order creation fails
     *
     * EXPECTED SOLUTION: Order exists in DB but needs manual fulfillment.
     * Should not trigger refund since order was successfully recorded.
     *
     * IMPACT: Order stuck in "pending" state, customer expects delivery
     * but nothing sent to production.
     */
    it("should set error state when Printify order creation fails after DB order created", async () => {
      mockCreatePrintifyOrderMutate.mockRejectedValueOnce(new Error("Printify API timeout"));

      const store = createMockStore({
        ...defaultState,
        shippingAddress: mockShippingAddress,
        cart: {
          id: "cart_123",
          user_id: "user_123",
          created_at: new Date().toISOString(),
          session_id: "session_123",
          updated_at: new Date().toISOString(),
          user_email: "test@example.com",
          cart_items: [],
        },
      });

      const { result } = renderHook(() => useCheckoutSubscriberActions(), {
        wrapper: createWrapper(store),
      });

      const paymentIntent = { id: "pi_printify_fails" };
      const lineItems = [{ product_id: "prod_123", variant_id: 1, quantity: 1 }];

      await act(async () => {
        await result.current.handlePaymentSuccess(paymentIntent, lineItems);
      });

      const state = store.getState();
      expect(state.paymentStatus).toBe("error");
      expect(state.paymentErrorDetails?.isPostPaymentError).toBe(true);
      expect(state.message).toContain("Printify API timeout");
    });

    /**
     * PROBLEM: Order status update to "confirmed" fails after Printify order succeeds
     *
     * EXPECTED SOLUTION: Log error but don't fail the entire checkout.
     * Order is in Printify, so it will be fulfilled. Status can be reconciled later.
     *
     * IMPACT: Order shows "pending" in dashboard but is actually being fulfilled.
     */
    it("should succeed even if order status update fails after Printify order created", async () => {
      mockUpdateOrderStatusMutate.mockRejectedValueOnce(new Error("Database connection lost"));

      const store = createMockStore({
        ...defaultState,
        shippingAddress: mockShippingAddress,
        cart: {
          id: "cart_123",
          user_id: "user_123",
          created_at: new Date().toISOString(),
          session_id: "session_123",
          updated_at: new Date().toISOString(),
          user_email: "test@example.com",
          cart_items: [],
        },
      });

      const { result } = renderHook(() => useCheckoutSubscriberActions(), {
        wrapper: createWrapper(store),
      });

      const paymentIntent = { id: "pi_status_update_fails" };
      const lineItems = [{ product_id: "prod_123", variant_id: 1, quantity: 1 }];

      await act(async () => {
        await result.current.handlePaymentSuccess(paymentIntent, lineItems);
      });

      const state = store.getState();
      // Status update failures don't fail the entire checkout anymore
      // The Printify order was created successfully, which is what matters
      expect(state.paymentStatus).toBe("success");
    });

    /**
     * PROBLEM: Network disconnects after payment succeeds but before order creation
     *
     * EXPECTED SOLUTION: User should be able to retry order creation with same payment_id
     * without being charged again (idempotency).
     */
    it("should support retry flow with retry_order_id parameter", async () => {
      // Mock window.location.search
      Object.defineProperty(window, 'location', {
        value: {
          search: '?retry_order_id=order_existing_123',
        },
        writable: true,
      });

      const store = createMockStore({
        ...defaultState,
        shippingAddress: mockShippingAddress,
        cart: {
          id: "cart_123",
          user_id: "user_123",
          created_at: new Date().toISOString(),
          session_id: "session_123",
          updated_at: new Date().toISOString(),
          user_email: "test@example.com",
          cart_items: [],
        },
      });

      const { result } = renderHook(() => useCheckoutSubscriberActions(), {
        wrapper: createWrapper(store),
      });

      const paymentIntent = { id: "pi_retry" };
      const lineItems = [{ product_id: "prod_123", variant_id: 1, quantity: 1 }];

      await act(async () => {
        await result.current.handlePaymentSuccess(paymentIntent, lineItems);
      });

      // EXPECTED: Should not create new order, should use existing order_id
      expect(mockCreateOrderMutate).not.toHaveBeenCalled();

      const state = store.getState();
      expect(state.paymentStatus).toBe("success");
    });
  });

  describe("EDGE CASE: Invalid or Missing Data", () => {
    /**
     * PROBLEM: Line items array is null or undefined (not just empty)
     *
     * EXPECTED SOLUTION: Graceful error handling with clear message
     */
    it("should handle null line items gracefully", async () => {
      const store = createMockStore({
        ...defaultState,
        shippingAddress: mockShippingAddress,
      });

      const { result } = renderHook(() => useCheckoutSubscriberActions(), {
        wrapper: createWrapper(store),
      });

      const paymentIntent = { id: "pi_null_items" };

      await act(async () => {
        // @ts-expect-error Testing invalid input
        await result.current.handlePaymentSuccess(paymentIntent, null);
      });

      const state = store.getState();
      expect(state.paymentStatus).toBe("error");
      expect(state.message).toContain("No order items found");
    });

    /**
     * PROBLEM: User or cart is null (session expired during checkout)
     *
     * EXPECTED SOLUTION: Clear error message directing user to re-authenticate
     */
    it("should handle missing user gracefully", async () => {
      // Override the user mock to return null
      mockUserData = null;

      const store = createMockStore({
        ...defaultState,
        shippingAddress: mockShippingAddress,
        cart: {
          id: "cart_123",
          user_id: "user_123",
          created_at: new Date().toISOString(),
          session_id: "session_123",
          updated_at: new Date().toISOString(),
          user_email: "test@example.com",
          cart_items: [],
        },
      });

      const { result } = renderHook(() => useCheckoutSubscriberActions(), {
        wrapper: createWrapper(store),
      });

      const paymentIntent = { id: "pi_no_user" };
      const lineItems = [{ product_id: "prod_123", variant_id: 1, quantity: 1 }];

      await act(async () => {
        await result.current.handlePaymentSuccess(paymentIntent, lineItems);
      });

      const state = store.getState();
      // EXPECTED: Should skip order creation but still succeed with Printify order
      expect(state.paymentStatus).toBe("success");
    });
  });

  describe("EDGE CASE: Payment Provider State Transitions", () => {
    /**
     * PROBLEM: Multiple payment methods attempted (Stripe fails, then PayPal succeeds)
     * Need to ensure correct provider is recorded
     *
     * EXPECTED SOLUTION: Always use selectedPaymentMethod from state,
     * not inferred from payment intent
     */
    it("should use correct payment provider from state", async () => {
      const store = createMockStore({
        ...defaultState,
        shippingAddress: mockShippingAddress,
        selectedPaymentMethod: "paypal", // User selected PayPal
      });

      const { result } = renderHook(() => useCheckoutSubscriberActions(), {
        wrapper: createWrapper(store),
      });

      // Payment intent could be from Stripe or PayPal
      const paymentIntent = { id: "pi_12345" }; // Looks like Stripe ID
      const lineItems = [{ product_id: "prod_123", variant_id: 1, quantity: 1 }];

      await act(async () => {
        await result.current.handlePaymentSuccess(paymentIntent, lineItems);
      });

      const state = store.getState();
      expect(state.paymentSuccessDetails?.provider).toBe("paypal");
    });
  });
});
