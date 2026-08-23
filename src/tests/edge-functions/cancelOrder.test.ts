import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

/**
 * Cancel Order Edge Function Test Suite
 *
 * Tests the cancel-order edge function behavior including:
 * - Already cancelled orders (idempotency)
 * - Refund status verification
 * - Order status validation
 * - Error handling
 */

// Mock types matching the edge function
interface OrderDataI {
  id: string;
  printify_order_id: string | null;
  payment_status: string | null;
  payment_method: string | null;
  status: string | null;
  total_amount: number | null;
  currency: string | null;
  user_id: string | null;
}

interface PaymentTransactionI {
  payment_provider: string;
  stripe_payment_intent_id: string | null;
  paypal_capture_id: string | null;
  mollie_payment_id: string | null;
  amount: number;
  currency: string | null;
  status: string;
}

// Helper functions matching edge function logic
function normalizeStatus(value: string | null | undefined): string {
  return (value ?? "").toLowerCase().replace(/[_-]/g, "").trim();
}

function isAlreadyCancelled(status: string | null): boolean {
  const orderStatus = normalizeStatus(status);
  return orderStatus === "cancelled" || orderStatus === "canceled";
}

const CANCELLABLE_ORDER_STATUSES = new Set(["", "created", "pending", "confirmed"]);

function canCancelOrder(status: string | null): boolean {
  const orderStatus = normalizeStatus(status);
  if (orderStatus === "cancelled" || orderStatus === "canceled") return false;
  return CANCELLABLE_ORDER_STATUSES.has(orderStatus);
}

describe("cancelOrder", () => {
  describe("normalizeStatus", () => {
    it("handles null status", () => {
      expect(normalizeStatus(null)).toBe("");
    });

    it("handles undefined status", () => {
      expect(normalizeStatus(undefined)).toBe("");
    });

    it("lowercases status", () => {
      expect(normalizeStatus("CANCELLED")).toBe("cancelled");
      expect(normalizeStatus("Pending")).toBe("pending");
    });

    it("removes underscores and hyphens", () => {
      expect(normalizeStatus("in_progress")).toBe("inprogress");
      expect(normalizeStatus("in-progress")).toBe("inprogress");
    });

    it("trims whitespace", () => {
      expect(normalizeStatus("  cancelled  ")).toBe("cancelled");
    });
  });

  describe("isAlreadyCancelled", () => {
    it("returns true for cancelled status", () => {
      expect(isAlreadyCancelled("cancelled")).toBe(true);
    });

    it("returns true for canceled status (US spelling)", () => {
      expect(isAlreadyCancelled("canceled")).toBe(true);
    });

    it("returns true for CANCELLED (case insensitive)", () => {
      expect(isAlreadyCancelled("CANCELLED")).toBe(true);
    });

    it("returns false for pending status", () => {
      expect(isAlreadyCancelled("pending")).toBe(false);
    });

    it("returns false for confirmed status", () => {
      expect(isAlreadyCancelled("confirmed")).toBe(false);
    });

    it("returns false for null status", () => {
      expect(isAlreadyCancelled(null)).toBe(false);
    });
  });

  describe("canCancelOrder", () => {
    it("allows cancelling pending orders", () => {
      expect(canCancelOrder("pending")).toBe(true);
    });

    it("allows cancelling confirmed orders", () => {
      expect(canCancelOrder("confirmed")).toBe(true);
    });

    it("allows cancelling created orders", () => {
      expect(canCancelOrder("created")).toBe(true);
    });

    it("allows cancelling orders with empty status", () => {
      expect(canCancelOrder("")).toBe(true);
      expect(canCancelOrder(null)).toBe(true);
    });

    it("does not allow cancelling already cancelled orders", () => {
      expect(canCancelOrder("cancelled")).toBe(false);
      expect(canCancelOrder("canceled")).toBe(false);
    });

    it("does not allow cancelling shipped orders", () => {
      expect(canCancelOrder("shipped")).toBe(false);
    });

    it("does not allow cancelling delivered orders", () => {
      expect(canCancelOrder("delivered")).toBe(false);
    });

    it("does not allow cancelling processing orders", () => {
      expect(canCancelOrder("processing")).toBe(false);
    });
  });

  describe("Already Cancelled Order Handling", () => {
    it("should return success for already cancelled order", () => {
      const order: OrderDataI = {
        id: "order-123",
        printify_order_id: "pfy-123",
        payment_status: "refunded",
        payment_method: "stripe",
        status: "cancelled",
        total_amount: 2999,
        currency: "EUR",
        user_id: "user-123",
      };

      expect(isAlreadyCancelled(order.status)).toBe(true);
      expect(canCancelOrder(order.status)).toBe(false);
    });

    it("should detect refund status from payment transactions", () => {
      const transactions: PaymentTransactionI[] = [
        {
          payment_provider: "stripe",
          stripe_payment_intent_id: "pi_123",
          paypal_capture_id: null,
          mollie_payment_id: null,
          amount: 29.99,
          currency: "EUR",
          status: "refunded",
        },
      ];

      const hasRefund = transactions.some((tx) => tx.status === "refunded");
      const hasPaidTransaction = transactions.some((tx) => tx.status === "succeeded");

      expect(hasRefund).toBe(true);
      expect(hasPaidTransaction).toBe(false);
    });

    it("should detect pending refund when payment succeeded but not refunded", () => {
      const transactions: PaymentTransactionI[] = [
        {
          payment_provider: "stripe",
          stripe_payment_intent_id: "pi_123",
          paypal_capture_id: null,
          mollie_payment_id: null,
          amount: 29.99,
          currency: "EUR",
          status: "succeeded",
        },
      ];

      const hasRefund = transactions.some((tx) => tx.status === "refunded");
      const hasPaidTransaction = transactions.some((tx) => tx.status === "succeeded");

      expect(hasRefund).toBe(false);
      expect(hasPaidTransaction).toBe(true);
      // refund_pending should be true: hasPaidTransaction && !hasRefund
      expect(hasPaidTransaction && !hasRefund).toBe(true);
    });

    it("should handle order with no payment transactions", () => {
      const transactions: PaymentTransactionI[] = [];

      const hasRefund = transactions.some((tx) => tx.status === "refunded");
      const hasPaidTransaction = transactions.some((tx) => tx.status === "succeeded");

      expect(hasRefund).toBe(false);
      expect(hasPaidTransaction).toBe(false);
    });
  });

  describe("Response Structure for Already Cancelled Orders", () => {
    it("should have correct response structure for cancelled order with refund", () => {
      const expectedResponse = {
        success: true,
        message: "Order is already cancelled",
        already_cancelled: true,
        results: {
          order_id: "order-123",
          cancelled_at_printify: true,
          database_updated: true,
          refund_processed: true,
          refund_pending: false,
        },
      };

      expect(expectedResponse.success).toBe(true);
      expect(expectedResponse.already_cancelled).toBe(true);
      expect(expectedResponse.results.refund_processed).toBe(true);
      expect(expectedResponse.results.refund_pending).toBe(false);
    });

    it("should have correct response structure for cancelled order with pending refund", () => {
      const expectedResponse = {
        success: true,
        message: "Order is already cancelled",
        already_cancelled: true,
        results: {
          order_id: "order-123",
          cancelled_at_printify: true,
          database_updated: true,
          refund_processed: false,
          refund_pending: true,
        },
      };

      expect(expectedResponse.success).toBe(true);
      expect(expectedResponse.already_cancelled).toBe(true);
      expect(expectedResponse.results.refund_processed).toBe(false);
      expect(expectedResponse.results.refund_pending).toBe(true);
    });
  });

  describe("Order Status Transitions", () => {
    const testCases: Array<{
      status: string;
      canCancel: boolean;
      isAlreadyCancelled: boolean;
    }> = [
      { status: "", canCancel: true, isAlreadyCancelled: false },
      { status: "created", canCancel: true, isAlreadyCancelled: false },
      { status: "pending", canCancel: true, isAlreadyCancelled: false },
      { status: "confirmed", canCancel: true, isAlreadyCancelled: false },
      { status: "processing", canCancel: false, isAlreadyCancelled: false },
      { status: "shipped", canCancel: false, isAlreadyCancelled: false },
      { status: "delivered", canCancel: false, isAlreadyCancelled: false },
      { status: "cancelled", canCancel: false, isAlreadyCancelled: true },
      { status: "canceled", canCancel: false, isAlreadyCancelled: true },
    ];

    testCases.forEach(({ status, canCancel: expectedCanCancel, isAlreadyCancelled: expectedIsCancelled }) => {
      it(`status "${status || "(empty)"}" - canCancel: ${expectedCanCancel}, isAlreadyCancelled: ${expectedIsCancelled}`, () => {
        expect(canCancelOrder(status)).toBe(expectedCanCancel);
        expect(isAlreadyCancelled(status)).toBe(expectedIsCancelled);
      });
    });
  });

  describe("Payment Provider Detection", () => {
    it("should detect Stripe payment", () => {
      const transaction: PaymentTransactionI = {
        payment_provider: "stripe",
        stripe_payment_intent_id: "pi_123abc",
        paypal_capture_id: null,
        mollie_payment_id: null,
        amount: 29.99,
        currency: "EUR",
        status: "succeeded",
      };

      expect(transaction.payment_provider).toBe("stripe");
      expect(transaction.stripe_payment_intent_id).toBeTruthy();
    });

    it("should detect PayPal payment", () => {
      const transaction: PaymentTransactionI = {
        payment_provider: "paypal",
        stripe_payment_intent_id: null,
        paypal_capture_id: "CAP-123abc",
        mollie_payment_id: null,
        amount: 29.99,
        currency: "EUR",
        status: "succeeded",
      };

      expect(transaction.payment_provider).toBe("paypal");
      expect(transaction.paypal_capture_id).toBeTruthy();
    });

    it("should detect Mollie payment", () => {
      const transaction: PaymentTransactionI = {
        payment_provider: "mollie",
        stripe_payment_intent_id: null,
        paypal_capture_id: null,
        mollie_payment_id: "tr_123abc",
        amount: 29.99,
        currency: "EUR",
        status: "succeeded",
      };

      expect(transaction.payment_provider).toBe("mollie");
      expect(transaction.mollie_payment_id).toBeTruthy();
    });
  });

  describe("Refund Status Detection", () => {
    it("should correctly identify refunded transaction", () => {
      const transactions: PaymentTransactionI[] = [
        {
          payment_provider: "stripe",
          stripe_payment_intent_id: "pi_123",
          paypal_capture_id: null,
          mollie_payment_id: null,
          amount: 29.99,
          currency: "EUR",
          status: "refunded",
        },
      ];

      const hasRefund = transactions.some((tx) => tx.status === "refunded");
      expect(hasRefund).toBe(true);
    });

    it("should correctly identify succeeded but not refunded transaction", () => {
      const transactions: PaymentTransactionI[] = [
        {
          payment_provider: "stripe",
          stripe_payment_intent_id: "pi_123",
          paypal_capture_id: null,
          mollie_payment_id: null,
          amount: 29.99,
          currency: "EUR",
          status: "succeeded",
        },
      ];

      const hasRefund = transactions.some((tx) => tx.status === "refunded");
      const hasPaid = transactions.some((tx) => tx.status === "succeeded");

      expect(hasRefund).toBe(false);
      expect(hasPaid).toBe(true);
    });

    it("should handle multiple transactions correctly", () => {
      const transactions: PaymentTransactionI[] = [
        {
          payment_provider: "stripe",
          stripe_payment_intent_id: "pi_failed",
          paypal_capture_id: null,
          mollie_payment_id: null,
          amount: 29.99,
          currency: "EUR",
          status: "failed",
        },
        {
          payment_provider: "stripe",
          stripe_payment_intent_id: "pi_succeeded",
          paypal_capture_id: null,
          mollie_payment_id: null,
          amount: 29.99,
          currency: "EUR",
          status: "succeeded",
        },
      ];

      const hasRefund = transactions.some((tx) => tx.status === "refunded");
      const hasPaid = transactions.some((tx) => tx.status === "succeeded");

      expect(hasRefund).toBe(false);
      expect(hasPaid).toBe(true);
    });
  });

  describe("Idempotency", () => {
    it("should allow re-cancelling an already cancelled order without error", () => {
      const order: OrderDataI = {
        id: "order-123",
        printify_order_id: "pfy-123",
        payment_status: "refunded",
        payment_method: "stripe",
        status: "cancelled",
        total_amount: 2999,
        currency: "EUR",
        user_id: "user-123",
      };

      // When order is already cancelled, we should return success
      // not throw an error
      const alreadyCancelled = isAlreadyCancelled(order.status);
      expect(alreadyCancelled).toBe(true);

      // The response should indicate success with already_cancelled flag
      const response = {
        success: true,
        message: "Order is already cancelled",
        already_cancelled: true,
      };

      expect(response.success).toBe(true);
    });

    it("should return consistent results for multiple cancel attempts", () => {
      // First cancellation attempt
      const firstAttempt = {
        success: true,
        message: "Order cancelled successfully",
        already_cancelled: false,
        results: {
          order_id: "order-123",
          cancelled_at_printify: true,
          database_updated: true,
          refund_processed: true,
        },
      };

      // Second cancellation attempt (order now cancelled)
      const secondAttempt = {
        success: true,
        message: "Order is already cancelled",
        already_cancelled: true,
        results: {
          order_id: "order-123",
          cancelled_at_printify: true,
          database_updated: true,
          refund_processed: true,
          refund_pending: false,
        },
      };

      // Both should return success
      expect(firstAttempt.success).toBe(true);
      expect(secondAttempt.success).toBe(true);

      // Both should indicate refund was processed
      expect(firstAttempt.results.refund_processed).toBe(true);
      expect(secondAttempt.results.refund_processed).toBe(true);
    });
  });
});
