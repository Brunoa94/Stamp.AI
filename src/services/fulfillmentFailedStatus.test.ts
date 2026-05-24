import { describe, it, expect, vi, beforeEach } from "vitest";
import { OrderService } from "./orderService";

// Mock dependencies
vi.mock("./refundService");
vi.mock("./errorClient");

import { RefundService } from "./refundService";

/**
 * ========================================================================
 * Fulfillment Failed Status Tests
 * ========================================================================
 * Tests for the new "unsuccessful_confirmation" status added 2026-04-13
 *
 * This status is used when:
 * - Order successfully created in DB
 * - Payment successfully received
 * - Printify order creation FAILS
 * - OrderService.handlePrintifyFailure is called
 * - Order is marked as "unsuccessful_confirmation"
 * - Immediate refund is processed
 */

describe("OrderService.handlePrintifyFailure", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Status Assignment", () => {
    it("should set status to unsuccessful_confirmation when Printify API times out", async () => {
      const orderId = "order_timeout_123";

      const updateStatusSpy = vi.spyOn(OrderService, "updateOrderStatus").mockResolvedValue({} as any);
      vi.mocked(RefundService.processRefund).mockResolvedValue(undefined);

      await OrderService.handlePrintifyFailure({
        orderId,
        paymentProvider: "stripe",
        amount: 50.00,
        stripePaymentIntentId: "pi_timeout_123",
        printifyError: new Error("Request timeout"),
      });

      expect(updateStatusSpy).toHaveBeenCalledWith(orderId, "unsuccessful_confirmation");
    });

    it("should set status to unsuccessful_confirmation when Printify returns 500 error", async () => {
      const orderId = "order_500_123";

      const updateStatusSpy = vi.spyOn(OrderService, "updateOrderStatus").mockResolvedValue({} as any);
      vi.mocked(RefundService.processRefund).mockResolvedValue(undefined);

      await OrderService.handlePrintifyFailure({
        orderId,
        paymentProvider: "paypal",
        amount: 75.00,
        paypalCaptureId: "capture_500_123",
        printifyError: new Error("Internal Server Error"),
      });

      expect(updateStatusSpy).toHaveBeenCalledWith(orderId, "unsuccessful_confirmation");
    });

    it("should set status to unsuccessful_confirmation when Printify rate limit exceeded", async () => {
      const orderId = "order_ratelimit_123";

      const updateStatusSpy = vi.spyOn(OrderService, "updateOrderStatus").mockResolvedValue({} as any);
      vi.mocked(RefundService.processRefund).mockResolvedValue(undefined);

      await OrderService.handlePrintifyFailure({
        orderId,
        paymentProvider: "mollie",
        amount: 100.00,
        molliePaymentId: "tr_ratelimit_123",
        printifyError: new Error("Rate limit exceeded"),
      });

      expect(updateStatusSpy).toHaveBeenCalledWith(orderId, "unsuccessful_confirmation");
    });
  });

  describe("Refund Processing", () => {
    it("should process refund with correct order ID when fulfillment fails", async () => {
      const orderId = "order_refund_test_123";

      vi.spyOn(OrderService, "updateOrderStatus").mockResolvedValue({} as any);
      vi.mocked(RefundService.processRefund).mockResolvedValue(undefined);

      await OrderService.handlePrintifyFailure({
        orderId,
        paymentProvider: "stripe",
        amount: 125.00,
        stripePaymentIntentId: "pi_refund_123",
        printifyError: new Error("Printify unavailable"),
      });

      expect(RefundService.processRefund).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId,
          paymentProvider: "stripe",
          amount: 125.00,
          reason: "Printify order creation failed",
          stripePaymentIntentId: "pi_refund_123",
        })
      );
    });

    it("should process refund for PayPal with capture ID", async () => {
      const orderId = "order_paypal_123";

      vi.spyOn(OrderService, "updateOrderStatus").mockResolvedValue({} as any);
      vi.mocked(RefundService.processRefund).mockResolvedValue(undefined);

      await OrderService.handlePrintifyFailure({
        orderId,
        paymentProvider: "paypal",
        amount: 80.00,
        paypalCaptureId: "capture_abc_123",
        printifyError: new Error("Printify error"),
      });

      expect(RefundService.processRefund).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId,
          paymentProvider: "paypal",
          amount: 80.00,
          paypalCaptureId: "capture_abc_123",
        })
      );
    });

    it("should process refund for Mollie with payment ID", async () => {
      const orderId = "order_mollie_123";

      vi.spyOn(OrderService, "updateOrderStatus").mockResolvedValue({} as any);
      vi.mocked(RefundService.processRefund).mockResolvedValue(undefined);

      await OrderService.handlePrintifyFailure({
        orderId,
        paymentProvider: "mollie",
        amount: 90.00,
        molliePaymentId: "tr_mollie_123",
        printifyError: new Error("Printify error"),
      });

      expect(RefundService.processRefund).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId,
          paymentProvider: "mollie",
          amount: 90.00,
          molliePaymentId: "tr_mollie_123",
        })
      );
    });
  });

  describe("Edge Cases", () => {
    it("should still attempt refund even if status update fails", async () => {
      const orderId = "order_status_fail_123";
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      // Status update fails
      vi.spyOn(OrderService, "updateOrderStatus").mockRejectedValue(
        new Error("Database connection lost")
      );
      vi.mocked(RefundService.processRefund).mockResolvedValue(undefined);

      await OrderService.handlePrintifyFailure({
        orderId,
        paymentProvider: "stripe",
        amount: 70.00,
        stripePaymentIntentId: "pi_status_fail_123",
        printifyError: new Error("Printify error"),
      });

      // Even though status update failed, refund should still be attempted
      expect(RefundService.processRefund).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId,
          amount: 70.00,
        })
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to update order status"),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it("should log error if refund fails but not throw", async () => {
      const orderId = "order_refund_fail_123";
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      vi.spyOn(OrderService, "updateOrderStatus").mockResolvedValue({} as any);
      // Refund fails
      vi.mocked(RefundService.processRefund).mockRejectedValue(
        new Error("Payment provider API error")
      );

      await OrderService.handlePrintifyFailure({
        orderId,
        paymentProvider: "stripe",
        amount: 85.00,
        stripePaymentIntentId: "pi_refund_fail_123",
        printifyError: new Error("Printify error"),
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Refund initiation failed"),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Payment Provider Variations", () => {
    it("should handle Stripe payment failures correctly", async () => {
      const orderId = "order_stripe_123";

      vi.spyOn(OrderService, "updateOrderStatus").mockResolvedValue({} as any);
      vi.mocked(RefundService.processRefund).mockResolvedValue(undefined);

      await OrderService.handlePrintifyFailure({
        orderId,
        paymentProvider: "stripe",
        amount: 95.00,
        stripePaymentIntentId: "pi_stripe_123",
        printifyError: new Error("Printify maintenance"),
      });

      expect(RefundService.processRefund).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentProvider: "stripe",
          stripePaymentIntentId: "pi_stripe_123",
        })
      );
    });

    it("should handle PayPal payment failures correctly", async () => {
      const orderId = "order_paypal_456";

      vi.spyOn(OrderService, "updateOrderStatus").mockResolvedValue({} as any);
      vi.mocked(RefundService.processRefund).mockResolvedValue(undefined);

      await OrderService.handlePrintifyFailure({
        orderId,
        paymentProvider: "paypal",
        amount: 110.00,
        paypalCaptureId: "capture_paypal_456",
        printifyError: new Error("Printify timeout"),
      });

      expect(RefundService.processRefund).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentProvider: "paypal",
          paypalCaptureId: "capture_paypal_456",
        })
      );
    });

    it("should handle Mollie payment failures correctly", async () => {
      const orderId = "order_mollie_789";

      vi.spyOn(OrderService, "updateOrderStatus").mockResolvedValue({} as any);
      vi.mocked(RefundService.processRefund).mockResolvedValue(undefined);

      await OrderService.handlePrintifyFailure({
        orderId,
        paymentProvider: "mollie",
        amount: 65.00,
        molliePaymentId: "tr_mollie_789",
        printifyError: new Error("Printify API down"),
      });

      expect(RefundService.processRefund).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentProvider: "mollie",
          molliePaymentId: "tr_mollie_789",
        })
      );
    });
  });

  describe("Logging", () => {
    it("should log Printify error", async () => {
      const orderId = "order_log_123";
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      vi.spyOn(OrderService, "updateOrderStatus").mockResolvedValue({} as any);
      vi.mocked(RefundService.processRefund).mockResolvedValue(undefined);

      const printifyError = new Error("Printify specific error message");

      await OrderService.handlePrintifyFailure({
        orderId,
        paymentProvider: "stripe",
        amount: 50.00,
        stripePaymentIntentId: "pi_log_123",
        printifyError,
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Printify order creation failed"),
        printifyError
      );

      consoleErrorSpy.mockRestore();
    });

    it("should log success messages", async () => {
      const orderId = "order_success_log_123";
      const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      vi.spyOn(OrderService, "updateOrderStatus").mockResolvedValue({} as any);
      vi.mocked(RefundService.processRefund).mockResolvedValue(undefined);

      await OrderService.handlePrintifyFailure({
        orderId,
        paymentProvider: "stripe",
        amount: 40.00,
        stripePaymentIntentId: "pi_success_123",
        printifyError: new Error("Printify error"),
      });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("marked as unsuccessful_confirmation")
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Refund initiated")
      );

      consoleLogSpy.mockRestore();
    });
  });
});
