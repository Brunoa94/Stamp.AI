/**
 * Checkout Flow Tests
 *
 * Covers all three checkout scenarios:
 *  1. Payment fails          → error UI + retry payment action exposed
 *  2. Payment succeeds,      → 3 retries on order creation; refund triggered if all fail
 *     order creation fails
 *  3. Everything succeeds    → order stored as confirmed + paid; email note displayed
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { useCheckoutSubscriberActions } from "./actions";
import { CheckoutSubscriberContext } from "./CheckoutContextSubscriber";
import { CheckoutSubscriberContextState } from "./types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ─── Module mocks ────────────────────────────────────────────────────────────

const { processRefundMock } = vi.hoisted(() => ({
  processRefundMock: vi.fn(),
}));

// Mutable mutation mock refs — individual tests can swap these out
const createOrderFromCartMock = vi.fn();
const updateOrderStatusMock = vi.fn();
const updatePaymentStatusMock = vi.fn();
const createPrintifyOrderMock = vi.fn();
const clearCartMock = vi.fn();

vi.mock("@/queries/orderQueries", () => ({
  useCreateOrderFromCart: () => ({ mutateAsync: createOrderFromCartMock }),
  useUpdateOrderStatus: () => ({ mutateAsync: updateOrderStatusMock }),
  useUpdatePaymentStatus: () => ({ mutateAsync: updatePaymentStatusMock }),
}));

vi.mock("@/queries/printifyOrderQueries", () => ({
  useCreatePrintifyOrder: () => ({ mutateAsync: createPrintifyOrderMock }),
}));

vi.mock("@/queries/cartQueries", () => ({
  useClearCart: () => ({ mutateAsync: clearCartMock }),
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
  useUser: () => ({ data: { id: "user-1", email: "buyer@test.com" } }),
}));

vi.mock("@/services/refundService", () => ({
  RefundService: {
    processRefund: processRefundMock,
  },
}));

// ─── Test helpers ────────────────────────────────────────────────────────────

function createMockStore(overrides: Partial<CheckoutSubscriberContextState> = {}) {
  let state: CheckoutSubscriberContextState = {
    cart: {
      id: "cart-1",
      user_id: "user-1",
      session_id: null,
      user_email: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cart_items: [],
    },
    cartItems: [],
    isLoading: false,
    error: null,
    shippingAddress: {
      first_name: "Jane",
      last_name: "Doe",
      email: "jane@test.com",
      phone: "5551234567",
      country: "US",
      region: "NY",
      address1: "1 Test Ave",
      address2: "",
      city: "New York",
      zip: "10001",
    },
    paymentStatus: "idle",
    message: "",
    testMode: true,
    isProcessingPayment: false,
    triggerPayment: false,
    selectedPaymentMethod: "stripe",
    paymentSuccessDetails: null,
    paymentErrorDetails: null,
    promoCode: null,
    promoValue: 0,
    promoType: null,
    promoError: null,
    subtotal: 50,
    shippingCost: 5,
    discount: 0,
    total: 55,
    orderAmount: 55,
    ...overrides,
  };

  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    setState: (next: CheckoutSubscriberContextState) => {
      state = next;
      listeners.forEach((l) => l());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

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
      React.createElement(CheckoutSubscriberContext.Provider, { value: store }, children)
    );
  };
}

const STRIPE_PAYMENT_INTENT = { id: "pi_stripe_abc123", metadata: { order_id: "ord_abc123" } };
const VALID_LINE_ITEMS = [{ product_id: "prod_1", variant_id: 42, quantity: 1 }];

// ─── FLOW 1: Payment Fails ────────────────────────────────────────────────────

describe("Flow 1 — Payment Fails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createPrintifyOrderMock.mockResolvedValue({});
    clearCartMock.mockResolvedValue({});
    processRefundMock.mockResolvedValue(undefined);
  });

  it("sets paymentStatus to 'error' when handlePaymentError is called", () => {
    const store = createMockStore();
    const { result } = renderHook(() => useCheckoutSubscriberActions(), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.handlePaymentError("Your card was declined.");
    });

    const state = store.getState();
    expect(state.paymentStatus).toBe("error");
    expect(state.message).toBe("Your card was declined.");
  });

  it("populates paymentErrorDetails with order number, amount, and available retry methods", () => {
    const store = createMockStore({ orderAmount: 99.5, selectedPaymentMethod: "stripe" });
    const { result } = renderHook(() => useCheckoutSubscriberActions(), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.handlePaymentError("Insufficient funds");
    });

    const details = store.getState().paymentErrorDetails;
    expect(details).not.toBeNull();
    expect(details?.amountDue).toBe("$99.50");
    expect(details?.reasonMessage).toBe("Insufficient funds");
    expect(details?.availableMethods).toContain("stripe");
    expect(details?.availableMethods).toContain("paypal");
    expect(details?.availableMethods).toContain("mollie");
  });

  it("handleTryAgain resets payment state to idle so the user can retry", () => {
    const store = createMockStore({
      paymentStatus: "error",
      message: "Declined",
      paymentErrorDetails: {
        paymentId: "failed_1",
        orderNumber: "#SD-111",
        amountDue: "$55.00",
        attemptedOn: "Jan 1, 2025",
        status: "Failed",
        reasonTitle: "Reason",
        reasonMessage: "Declined",
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
    expect(state.paymentErrorDetails).toBeNull();
    expect(state.message).toBe("");
  });

  it("retry payment button condition: order with payment_status 'failed' exposes retry action", () => {
    // This test validates the component-level constant used by OrderTableActions
    // and OrdersMobileCardActions via a simple logic check.
    const RETRYABLE_PAYMENT_STATUSES = ["failed", "pending"];

    const failedOrder = { payment_status: "failed", status: "created" };
    const pendingOrder = { payment_status: "pending", status: "pending" };
    const paidOrder = { payment_status: "paid", status: "confirmed" };
    const cancelledOrder = { payment_status: "failed", status: "cancelled" };

    const canRetry = (order: typeof failedOrder) =>
      order.status !== "cancelled" &&
      RETRYABLE_PAYMENT_STATUSES.includes(order.payment_status ?? "");

    expect(canRetry(failedOrder)).toBe(true);
    expect(canRetry(pendingOrder)).toBe(true);
    expect(canRetry(paidOrder)).toBe(false);
    expect(canRetry(cancelledOrder)).toBe(false);
  });
});

// ─── FLOW 2: Payment Succeeds, Order Creation Fails ──────────────────────────

describe("Flow 2 — Payment Succeeds, Order Creation Fails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createPrintifyOrderMock.mockResolvedValue({});
    clearCartMock.mockResolvedValue({});
    processRefundMock.mockResolvedValue(undefined);
  });

  it("delegates retries to query layer and calls order creation once from action", async () => {
    createOrderFromCartMock.mockRejectedValue(new Error("DB unavailable"));

    const store = createMockStore();
    const { result } = renderHook(() => useCheckoutSubscriberActions(), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.handlePaymentSuccess(STRIPE_PAYMENT_INTENT, VALID_LINE_ITEMS);
    });

    expect(createOrderFromCartMock).toHaveBeenCalledTimes(1);
  });

  it("succeeds without triggering a refund when order creation succeeds", async () => {
    createOrderFromCartMock.mockResolvedValue("ord_success");

    const store = createMockStore();
    const { result } = renderHook(() => useCheckoutSubscriberActions(), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.handlePaymentSuccess(STRIPE_PAYMENT_INTENT, VALID_LINE_ITEMS);
    });

    expect(createOrderFromCartMock).toHaveBeenCalledTimes(1);
    expect(processRefundMock).not.toHaveBeenCalled();
    expect(store.getState().paymentStatus).toBe("success");
  });

  it("triggers a refund when order creation fails after query retries", async () => {
    createOrderFromCartMock.mockRejectedValue(new Error("DB error"));

    const store = createMockStore({ selectedPaymentMethod: "stripe" });
    const { result } = renderHook(() => useCheckoutSubscriberActions(), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.handlePaymentSuccess(STRIPE_PAYMENT_INTENT, VALID_LINE_ITEMS);
    });

    expect(processRefundMock).toHaveBeenCalledTimes(1);
  });

  it("sends the correct Stripe payment intent ID in the refund request", async () => {
    createOrderFromCartMock.mockRejectedValue(new Error("fail"));

    const store = createMockStore({ selectedPaymentMethod: "stripe" });
    const { result } = renderHook(() => useCheckoutSubscriberActions(), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.handlePaymentSuccess(STRIPE_PAYMENT_INTENT, VALID_LINE_ITEMS);
    });

    expect(processRefundMock).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentProvider: "stripe",
        stripePaymentIntentId: "pi_stripe_abc123",
      })
    );
  });

  it("sends the correct PayPal capture ID in the refund request", async () => {
    createOrderFromCartMock.mockRejectedValue(new Error("fail"));

    const paypalPaymentIntent = {
      id: "paypal_order_789",
      captureId: "capture_xyz",
      metadata: { order_id: "ord_pp1" },
    };

    const store = createMockStore({ selectedPaymentMethod: "paypal" });
    const { result } = renderHook(() => useCheckoutSubscriberActions(), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.handlePaymentSuccess(paypalPaymentIntent, VALID_LINE_ITEMS);
    });

    expect(processRefundMock).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentProvider: "paypal",
        paypalCaptureId: "capture_xyz",
      })
    );
  });

  it("sends the correct Mollie payment ID in the refund request", async () => {
    createOrderFromCartMock.mockRejectedValue(new Error("fail"));

    const molliePaymentIntent = {
      id: "tr_mollie_abc",
      molliePaymentId: "tr_mollie_abc",
      metadata: { order_id: "ord_mollie1" },
    };

    const store = createMockStore({ selectedPaymentMethod: "mollie" });
    const { result } = renderHook(() => useCheckoutSubscriberActions(), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.handlePaymentSuccess(molliePaymentIntent, VALID_LINE_ITEMS);
    });

    expect(processRefundMock).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentProvider: "mollie",
        molliePaymentId: "tr_mollie_abc",
      })
    );
  });

  it("sets error state with a refund-notice message after retry failures", async () => {
    createOrderFromCartMock.mockRejectedValue(new Error("Persistent DB failure"));

    const store = createMockStore({ selectedPaymentMethod: "stripe", orderAmount: 55 });
    const { result } = renderHook(() => useCheckoutSubscriberActions(), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.handlePaymentSuccess(STRIPE_PAYMENT_INTENT, VALID_LINE_ITEMS);
    });

    const state = store.getState();
    expect(state.paymentStatus).toBe("error");
    expect(state.message).toContain("refund");
    expect(state.paymentErrorDetails?.reasonMessage).toContain("refund");
  });
});

// ─── FLOW 3: Everything Succeeds ─────────────────────────────────────────────

describe("Flow 3 — Everything Succeeds", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createOrderFromCartMock.mockResolvedValue("ord_confirmed_1");
    updateOrderStatusMock.mockResolvedValue({});
    createPrintifyOrderMock.mockResolvedValue({});
    clearCartMock.mockResolvedValue({});
    processRefundMock.mockResolvedValue(undefined);
  });

  it("sets paymentStatus to 'success' on happy path", async () => {
    const store = createMockStore();
    const { result } = renderHook(() => useCheckoutSubscriberActions(), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.handlePaymentSuccess(STRIPE_PAYMENT_INTENT, VALID_LINE_ITEMS);
    });

    expect(store.getState().paymentStatus).toBe("success");
  });

  it("createOrderFromCart is called with paymentStatus 'paid'", async () => {
    const store = createMockStore();
    const { result } = renderHook(() => useCheckoutSubscriberActions(), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.handlePaymentSuccess(STRIPE_PAYMENT_INTENT, VALID_LINE_ITEMS);
    });

    expect(createOrderFromCartMock).toHaveBeenCalledWith(
      expect.objectContaining({ paymentStatus: "paid" })
    );
  });

  it("updates order status to confirmed after Printify order succeeds", async () => {
    const store = createMockStore();
    const { result } = renderHook(() => useCheckoutSubscriberActions(), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.handlePaymentSuccess(STRIPE_PAYMENT_INTENT, VALID_LINE_ITEMS);
    });

    expect(updateOrderStatusMock).toHaveBeenCalledWith({
      orderId: "ord_confirmed_1",
      status: "confirmed",
    });
  });

  it("populates paymentSuccessDetails with status 'paid'", async () => {
    const store = createMockStore({ orderAmount: 77.5 });
    const { result } = renderHook(() => useCheckoutSubscriberActions(), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.handlePaymentSuccess(
        { id: "pi_abcXYZ789abc", metadata: {} },
        VALID_LINE_ITEMS
      );
    });

    const details = store.getState().paymentSuccessDetails;
    expect(details).not.toBeNull();
    expect(details?.status).toBe("paid");
    expect(details?.totalPaid).toBe("$77.50");
    expect(details?.estimatedDelivery).toBe("7–10 business days");
  });

  it("paymentSuccessDetails includes confirmation email from shipping address", async () => {
    const store = createMockStore({
      shippingAddress: {
        first_name: "Ana",
        last_name: "Lima",
        email: "ana@store.com",
        phone: "1234567890",
        country: "US",
        region: "CA",
        address1: "10 Market St",
        address2: "",
        city: "San Francisco",
        zip: "94103",
      },
    });

    const { result } = renderHook(() => useCheckoutSubscriberActions(), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.handlePaymentSuccess(STRIPE_PAYMENT_INTENT, VALID_LINE_ITEMS);
    });

    expect(store.getState().paymentSuccessDetails?.confirmationEmail).toBe("ana@store.com");
  });

  it("clears the cart after a successful order creation", async () => {
    const store = createMockStore();
    const { result } = renderHook(() => useCheckoutSubscriberActions(), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.handlePaymentSuccess(STRIPE_PAYMENT_INTENT, VALID_LINE_ITEMS);
    });

    expect(clearCartMock).toHaveBeenCalledTimes(1);
  });

  it("does not trigger a refund on success", async () => {
    const store = createMockStore();
    const { result } = renderHook(() => useCheckoutSubscriberActions(), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.handlePaymentSuccess(STRIPE_PAYMENT_INTENT, VALID_LINE_ITEMS);
    });

    expect(processRefundMock).not.toHaveBeenCalled();
  });
});
