import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCheckoutSubscriberActions } from "./actions";
import { CheckoutSubscriberContext } from "./CheckoutContextSubscriber";
import { CheckoutSubscriberContextState } from "./types";

const mockCreateOrderMutate = vi.fn().mockResolvedValue("order_123");
const mockUpdateOrderStatusMutate = vi.fn().mockResolvedValue({});
const mockUpdatePaymentStatusMutate = vi.fn().mockResolvedValue({});
const mockCreatePrintifyOrderMutate = vi
  .fn()
  .mockResolvedValue({ order: { id: "printify_123" } });
const mockClearCartMutate = vi.fn().mockResolvedValue({});
const mockValidatePromoCodeMutate = vi.fn().mockResolvedValue({
  isValid: true,
  appliedPromo: {
    code: "TEST10",
    value: 10,
    type: "percentage",
    discountValue: 5,
  },
});

vi.mock("@/queries/orderQueries", () => ({
  useCreateOrderFromCart: () => ({ mutateAsync: mockCreateOrderMutate }),
  useUpdateOrderStatus: () => ({ mutateAsync: mockUpdateOrderStatusMutate }),
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
  useClearCart: () => ({ mutateAsync: mockClearCartMutate }),
}));

vi.mock("@/queries/promocodeQueries", () => ({
  useValidatePromoCode: () => ({ mutateAsync: mockValidatePromoCodeMutate }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useUser: () => ({ data: { id: "user-123", email: "test@example.com" } }),
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

const baseState: CheckoutSubscriberContextState = {
  cart: {
    id: "cart_123",
    user_id: "user_123",
    created_at: new Date().toISOString(),
    session_id: "session_123",
    updated_at: new Date().toISOString(),
    user_email: "test@example.com",
    cart_items: [],
  },
  cartItems: [],
  isLoading: false,
  error: null,
  shippingAddress: {
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
  },
  paymentStatus: "idle",
  message: "",
  testMode: false,
  isProcessingPayment: false,
  selectedPaymentMethod: "paypal",
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
  lineItems: [],
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
        children,
      ),
    );
  };
}

describe("PayPal Capture Status Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateOrderMutate.mockResolvedValue("order_123");
    mockCreatePrintifyOrderMutate.mockResolvedValue({
      order: { id: "printify_123" },
    });
  });

  it("sets error state when PayPal status is DENIED", async () => {
    const store = createMockStore({
      ...baseState,
      selectedPaymentMethod: "paypal",
    });
    const { result } = renderHook(() => useCheckoutSubscriberActions(), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.handlePaymentSuccess(
        { id: "PAYID-TEST123", status: "DENIED", captureId: "CAPTURE-123" },
        [{ product_id: "prod_123", variant_id: 1, quantity: 1 }],
      );
    });

    const state = store.getState();
    expect(state.paymentStatus).toBe("error");
    expect(state.message).toContain("denied");
    expect(mockCreateOrderMutate).not.toHaveBeenCalled();
  });

  it("sets error state when PayPal status is FAILED", async () => {
    const store = createMockStore({
      ...baseState,
      selectedPaymentMethod: "paypal",
    });
    const { result } = renderHook(() => useCheckoutSubscriberActions(), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.handlePaymentSuccess(
        { id: "PAYID-TEST123", status: "FAILED", captureId: "CAPTURE-123" },
        [{ product_id: "prod_123", variant_id: 1, quantity: 1 }],
      );
    });

    const state = store.getState();
    expect(state.paymentStatus).toBe("error");
    expect(state.message).toContain("failed");
    expect(mockCreateOrderMutate).not.toHaveBeenCalled();
  });

  it("sets error state when PayPal captureId is missing", async () => {
    const store = createMockStore({
      ...baseState,
      selectedPaymentMethod: "paypal",
    });
    const { result } = renderHook(() => useCheckoutSubscriberActions(), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.handlePaymentSuccess(
        { id: "PAYID-TEST123", status: "COMPLETED" },
        [{ product_id: "prod_123", variant_id: 1, quantity: 1 }],
      );
    });

    const state = store.getState();
    expect(state.paymentStatus).toBe("error");
    expect(state.message).toContain("capture ID");
    expect(mockCreateOrderMutate).not.toHaveBeenCalled();
  });

  it("uses paypal provider from state on successful PayPal flow", async () => {
    const store = createMockStore({
      ...baseState,
      selectedPaymentMethod: "paypal",
    });
    const { result } = renderHook(() => useCheckoutSubscriberActions(), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.handlePaymentSuccess(
        {
          id: "PAYID-TEST-SUCCESS",
          status: "COMPLETED",
          captureId: "CAPTURE-OK-123",
        },
        [{ product_id: "prod_123", variant_id: 1, quantity: 1 }],
      );
    });

    const state = store.getState();
    expect(state.paymentStatus).toBe("success");
    expect(state.paymentSuccessDetails?.provider).toBe("paypal");
  });
});
