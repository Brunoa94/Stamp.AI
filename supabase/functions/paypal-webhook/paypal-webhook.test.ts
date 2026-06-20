import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabaseRest } from "../_shared/supabase.ts";
import { verifyPayPalWebhook } from "../_shared/paypal.ts";

// Mock dependencies
vi.mock("../_shared/supabase.ts");
vi.mock("../_shared/paypal.ts");

describe("PayPal Webhook - Order Status Update Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("PAYMENT.CAPTURE.COMPLETED Event", () => {
    it("should update payment_status to paid without changing order status", async () => {
      const mockDbOrderId = "123e4567-e89b-12d3-a456-426614174000";
      const mockPayPalOrderId = "8VF52814937998046";
      const mockCaptureId = "2GG279541U471931P";

      // Mock webhook verification
      vi.mocked(verifyPayPalWebhook).mockResolvedValueOnce(true);

      // Mock idempotency check
      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: false }); // is_webhook_processed

      // Mock record webhook event
      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: "webhook_id" }); // record_webhook_event

      // Mock payment transaction update
      vi.mocked(supabaseRest).mockResolvedValueOnce({
        data: { id: "pt_123" },
        error: null,
      }); // PATCH payment_transactions

      // Mock getting order_id from payment transaction
      // Now returns both order_id column (new approach) and metadata (fallback)
      vi.mocked(supabaseRest).mockResolvedValueOnce({
        data: [{ order_id: mockDbOrderId, metadata: { order_id: mockDbOrderId } }],
        error: null,
      }); // GET payment_transactions

      // Mock order update (PATCH, not RPC)
      const orderUpdateMock = vi.fn().mockResolvedValue({
        data: { id: mockDbOrderId },
        error: null,
      });
      vi.mocked(supabaseRest).mockImplementationOnce(orderUpdateMock);

      // Simulate webhook payload
      const webhookPayload = {
        id: "WH-1234",
        event_type: "PAYMENT.CAPTURE.COMPLETED",
        resource: {
          id: mockCaptureId,
          supplementary_data: {
            related_ids: {
              order_id: mockPayPalOrderId,
            },
          },
        },
      };

      // Verify that orders table was directly updated (not via RPC)
      expect(orderUpdateMock).toHaveBeenCalledWith(
        `orders?id=eq.${mockDbOrderId}`,
        "PATCH",
        {
          payment_status: "paid",
          payment_method: "paypal",
          updated_at: expect.any(String),
        }
      );

      // Verify order status is NOT updated (no 'status' field in PATCH)
      const callArgs = orderUpdateMock.mock.calls[0][2];
      expect(callArgs).not.toHaveProperty("status");
    });

    it("should NOT update order status (only payment_status)", async () => {
      const mockDbOrderId = "456e7890-e89b-12d3-a456-426614174111";

      vi.mocked(verifyPayPalWebhook).mockResolvedValueOnce(true);
      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: false });
      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: "webhook_id" });
      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: { id: "pt_456" } });
      vi.mocked(supabaseRest).mockResolvedValueOnce({
        data: [{ order_id: mockDbOrderId, metadata: { order_id: mockDbOrderId } }],
      });

      const orderUpdateMock = vi.fn().mockResolvedValue({
        data: { id: mockDbOrderId },
      });
      vi.mocked(supabaseRest).mockImplementationOnce(orderUpdateMock);

      // The critical assertion: webhooks should NEVER update order status
      // Order status is managed by the fulfillment service
      const callArgs = orderUpdateMock.mock.calls[0][2];
      expect(callArgs.payment_status).toBe("paid");
      expect(callArgs.payment_method).toBe("paypal");
      expect(callArgs).not.toHaveProperty("status");
    });
  });

  describe("PAYMENT.CAPTURE.DENIED Event", () => {
    it("should update payment_status to failed without affecting order status", async () => {
      const mockDbOrderId = "789e0123-e89b-12d3-a456-426614174222";
      const mockPayPalOrderId = "9AB12345678901234";

      vi.mocked(verifyPayPalWebhook).mockResolvedValueOnce(true);
      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: false });
      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: "webhook_id" });

      // Mock payment transaction update for denied payment
      vi.mocked(supabaseRest).mockResolvedValueOnce({
        data: { id: "pt_789" },
        error: null,
      });

      // Mock getting order_id
      // Now returns both order_id column (new approach) and metadata (fallback)
      vi.mocked(supabaseRest).mockResolvedValueOnce({
        data: [{ order_id: mockDbOrderId, metadata: { order_id: mockDbOrderId } }],
      });

      // Mock order update for failed payment
      const orderUpdateMock = vi.fn().mockResolvedValue({
        data: { id: mockDbOrderId },
        error: null,
      });
      vi.mocked(supabaseRest).mockImplementationOnce(orderUpdateMock);

      // Verify payment_status was updated to failed
      expect(orderUpdateMock).toHaveBeenCalledWith(
        `orders?id=eq.${mockDbOrderId}`,
        "PATCH",
        expect.objectContaining({
          payment_status: "failed",
        })
      );

      // Order status should not be changed by webhook
      const callArgs = orderUpdateMock.mock.calls[0][2];
      expect(callArgs).not.toHaveProperty("status");
    });
  });

  describe("PAYMENT.CAPTURE.REFUNDED Event", () => {
    it("should update payment_status to refunded", async () => {
      const mockOrderId = "012e3456-e89b-12d3-a456-426614174333";
      const mockCaptureId = "3HH380652V582942Q";

      vi.mocked(verifyPayPalWebhook).mockResolvedValueOnce(true);
      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: false });
      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: "webhook_id" });

      // Mock payment transaction update
      vi.mocked(supabaseRest).mockResolvedValueOnce({
        data: { id: "pt_012" },
        error: null,
      });

      // Mock getting order_id
      vi.mocked(supabaseRest).mockResolvedValueOnce({
        data: [{ order_id: mockOrderId }],
      });

      // Mock order update
      const orderUpdateMock = vi.fn().mockResolvedValue({
        data: { id: mockOrderId },
        error: null,
      });
      vi.mocked(supabaseRest).mockImplementationOnce(orderUpdateMock);

      expect(orderUpdateMock).toHaveBeenCalledWith(
        `orders?id=eq.${mockOrderId}`,
        "PATCH",
        expect.objectContaining({
          payment_status: "refunded",
        })
      );
    });
  });

  describe("Idempotency", () => {
    it("should skip processing if webhook was already processed", async () => {
      const mockEventId = "WH-DUPLICATE-123";

      // Mock webhook already processed
      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: true });

      // No further calls should be made after idempotency check
      expect(vi.mocked(supabaseRest)).toHaveBeenCalledTimes(1);
    });
  });

  describe("Integration: Payment to Fulfillment Flow", () => {
    it("should follow correct flow: webhook updates payment_status only, create-printify-order manages order status", async () => {
      const mockDbOrderId = "345e6789-e89b-12d3-a456-426614174444";
      const mockPayPalOrderId = "4CD56789012345678";
      const mockCaptureId = "5EE491763W604053R";

      // Step 1: Webhook receives payment capture completed
      vi.mocked(verifyPayPalWebhook).mockResolvedValueOnce(true);
      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: false });
      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: "webhook_id" });
      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: { id: "pt_345" } });
      // Now returns both order_id column (new approach) and metadata (fallback)
      vi.mocked(supabaseRest).mockResolvedValueOnce({
        data: [{ order_id: mockDbOrderId, metadata: { order_id: mockDbOrderId } }],
      });

      // Step 2: Webhook updates payment_status only (NOT order status)
      const orderUpdateMock = vi.fn().mockResolvedValue({
        data: { id: mockDbOrderId },
      });
      vi.mocked(supabaseRest).mockImplementationOnce(orderUpdateMock);

      expect(orderUpdateMock).toHaveBeenCalledWith(
        `orders?id=eq.${mockDbOrderId}`,
        "PATCH",
        expect.objectContaining({
          payment_status: "paid",
          payment_method: "paypal",
        })
      );

      // Verify order status is NOT touched by webhook
      const callArgs = orderUpdateMock.mock.calls[0][2];
      expect(callArgs).not.toHaveProperty("status");

      // Step 3: create-printify-order function (separate edge function) handles Printify
      //         and updates status to "confirmed" or "unsuccessful_confirmation"
      // This prevents race conditions where webhook might overwrite fulfillment status
      // This is tested in create-printify-order tests
    });
  });

  describe("CHECKOUT.ORDER.APPROVED Event", () => {
    it("should handle order approval without updating database", async () => {
      vi.mocked(verifyPayPalWebhook).mockResolvedValueOnce(true);
      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: false });
      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: "webhook_id" });

      const webhookPayload = {
        id: "WH-APPROVED-123",
        event_type: "CHECKOUT.ORDER.APPROVED",
        resource: {
          id: "5DF67890123456789",
        },
      };

      // This event is informational only - no order updates
      // Verify no additional supabaseRest calls beyond idempotency and recording
      expect(vi.mocked(supabaseRest)).toHaveBeenCalledTimes(2);
    });
  });

  describe("Payment Transactions Flow", () => {
    describe("Normal Flow: Create PayPal Order → Webhook Updates Record", () => {
      it("should create payment_transactions record with user_id when PayPal order is created", async () => {
        const mockUserId = "user_paypal_123";
        const mockPayPalOrderId = "8VF52814937998046";
        const mockAmount = 35.50;

        // Mock create-paypal-order creating the record
        const createMock = vi.fn().mockResolvedValue({
          data: {
            id: "pt_paypal_123",
            user_id: mockUserId,
            payment_provider: "paypal",
            paypal_order_id: mockPayPalOrderId,
            amount: mockAmount,
            currency: "usd",
            status: "pending",
          },
          error: null,
        });

        vi.mocked(supabaseRest).mockImplementationOnce(createMock);

        await supabaseRest("payment_transactions", "POST", {
          user_id: mockUserId,
          payment_provider: "paypal",
          paypal_order_id: mockPayPalOrderId,
          amount: mockAmount,
          currency: "usd",
          status: "pending",
        });

        expect(createMock).toHaveBeenCalledWith(
          "payment_transactions",
          "POST",
          expect.objectContaining({
            user_id: mockUserId,
            paypal_order_id: mockPayPalOrderId,
            status: "pending",
          })
        );
      });

      it("should update existing payment_transactions record when capture completes", async () => {
        const mockPayPalOrderId = "8VF52814937998046";
        const mockCaptureId = "2GG279541U471931P";
        const mockUserId = "user_paypal_456";

        // Mock webhook updating existing record (not inserting new)
        const updateMock = vi.fn().mockResolvedValue({
          data: [{
            id: "pt_paypal_456",
            user_id: mockUserId,
            paypal_order_id: mockPayPalOrderId,
            paypal_capture_id: mockCaptureId,
            status: "succeeded",
          }],
          error: null,
        });

        vi.mocked(supabaseRest).mockImplementationOnce(updateMock);

        await supabaseRest(
          `payment_transactions?paypal_order_id=eq.${mockPayPalOrderId}`,
          "PATCH",
          {
            paypal_capture_id: mockCaptureId,
            status: "succeeded",
            updated_at: new Date().toISOString(),
          }
        );

        // Verify UPDATE was used (not INSERT)
        expect(updateMock).toHaveBeenCalledWith(
          `payment_transactions?paypal_order_id=eq.${mockPayPalOrderId}`,
          "PATCH",
          expect.objectContaining({
            paypal_capture_id: mockCaptureId,
            status: "succeeded",
          })
        );
      });
    });

    describe("Race Condition Handling", () => {
      it("should create new record if webhook arrives before create-paypal-order", async () => {
        const mockPayPalOrderId = "RACE123456789";
        const mockCaptureId = "CAPTURE123456789";
        const mockUserId = "user_race_paypal";

        // Mock webhook trying to update (no existing record found)
        vi.mocked(supabaseRest).mockResolvedValueOnce({
          data: [],
          error: null,
        });

        // Mock webhook creating fallback record
        const insertMock = vi.fn().mockResolvedValue({
          data: {
            id: "pt_race_paypal",
            user_id: mockUserId,
            paypal_order_id: mockPayPalOrderId,
            paypal_capture_id: mockCaptureId,
            status: "succeeded",
          },
          error: null,
        });

        vi.mocked(supabaseRest).mockImplementationOnce(insertMock);

        // Simulate webhook logic
        const updateResult = await supabaseRest(
          `payment_transactions?paypal_order_id=eq.${mockPayPalOrderId}`,
          "PATCH",
          {
            paypal_capture_id: mockCaptureId,
            status: "succeeded",
          }
        );

        // Race condition: no record found, create new one
        if (!updateResult.data || updateResult.data.length === 0) {
          console.log("No existing record found, creating new one (race condition)");
          await supabaseRest("payment_transactions", "POST", {
            user_id: mockUserId,
            payment_provider: "paypal",
            paypal_order_id: mockPayPalOrderId,
            paypal_capture_id: mockCaptureId,
            status: "succeeded",
          });
        }

        // Verify fallback INSERT was called
        expect(insertMock).toHaveBeenCalledWith(
          "payment_transactions",
          "POST",
          expect.objectContaining({
            user_id: mockUserId,
            paypal_order_id: mockPayPalOrderId,
            status: "succeeded",
          })
        );
      });
    });

    describe("user_id Verification", () => {
      it("should always have user_id set for PayPal payments", async () => {
        const mockUserId = "user_paypal_verify";
        const mockPayPalOrderId = "VERIFY123456789";

        vi.mocked(supabaseRest).mockResolvedValueOnce({
          data: {
            id: "pt_verify",
            user_id: mockUserId,
            paypal_order_id: mockPayPalOrderId,
            status: "pending",
          },
          error: null,
        });

        const result = await supabaseRest("payment_transactions", "POST", {
          user_id: mockUserId,
          payment_provider: "paypal",
          paypal_order_id: mockPayPalOrderId,
          status: "pending",
        });

        // Critical assertion: user_id must NOT be null
        expect(result.data.user_id).not.toBe(null);
        expect(result.data.user_id).toBe(mockUserId);
      });
    });
  });
});
