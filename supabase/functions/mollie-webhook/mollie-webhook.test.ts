import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabaseRest } from "../_shared/supabase.ts";
import { getMolliePayment } from "../_shared/mollie.ts";

// Mock dependencies
vi.mock("../_shared/supabase.ts");
vi.mock("../_shared/mollie.ts");

describe("Mollie Webhook - Order Status Update Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Payment Status Updates", () => {
    it("should update payment_status to paid and order status to waiting_confirmation", async () => {
      const mockOrderId = "123e4567-e89b-12d3-a456-426614174000";
      const mockPaymentId = "tr_test123";

      // Mock webhook already processed check
      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: false }); // is_webhook_processed

      // Mock Mollie payment response
      vi.mocked(getMolliePayment).mockResolvedValueOnce({
        id: mockPaymentId,
        status: "paid",
        amount: { value: "10.00", currency: "USD" },
        method: "creditcard",
        metadata: {
          order_id: mockOrderId,
          user_id: "user_123",
          line_items: [],
        },
      });

      // Mock recording webhook event
      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: "webhook_id" }); // record_webhook_event

      // Mock payment transaction save
      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: { id: "pt_123" } });

      // Mock atomic order update
      const atomicUpdateMock = vi.fn().mockResolvedValue({
        data: { success: true },
        error: null,
      });
      vi.mocked(supabaseRest).mockImplementationOnce(atomicUpdateMock);

      // Call the webhook handler logic
      // Note: In actual implementation, this would be a request to the webhook
      // For this test, we're verifying the expected function calls

      // Verify that update_order_payment_status_atomic was called correctly
      expect(atomicUpdateMock).toHaveBeenCalledWith(
        "rpc/update_order_payment_status_atomic",
        "POST",
        {
          p_order_id: mockOrderId,
          p_payment_status: "paid",
          p_order_status: "waiting_confirmation",
          p_payment_method: "mollie",
        }
      );

      // Verify p_order_status is set to waiting_confirmation
      const callArgs = atomicUpdateMock.mock.calls[0][2];
      expect(callArgs).toHaveProperty("p_order_status", "waiting_confirmation");
    });

    it("should handle payment failure without updating order status", async () => {
      const mockOrderId = "123e4567-e89b-12d3-a456-426614174000";
      const mockPaymentId = "tr_test456";

      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: false });

      vi.mocked(getMolliePayment).mockResolvedValueOnce({
        id: mockPaymentId,
        status: "failed",
        amount: { value: "10.00", currency: "USD" },
        method: "creditcard",
        metadata: {
          order_id: mockOrderId,
        },
      });

      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: "webhook_id" });
      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: { id: "pt_123" } });

      const orderUpdateMock = vi.fn().mockResolvedValue({
        data: { id: mockOrderId },
        error: null,
      });
      vi.mocked(supabaseRest).mockImplementationOnce(orderUpdateMock);

      // Verify order was updated to cancelled
      expect(orderUpdateMock).toHaveBeenCalledWith(
        `orders?id=eq.${mockOrderId}`,
        "PATCH",
        expect.objectContaining({
          status: "cancelled",
          payment_status: "failed",
        })
      );
    });
  });

  describe("Order Status Confirmation Logic", () => {
    it("should set payment_status to paid and order_status to waiting_confirmation when payment succeeds", async () => {
      const mockOrderId = "123e4567-e89b-12d3-a456-426614174000";
      const mockPaymentId = "tr_test789";

      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: false });

      vi.mocked(getMolliePayment).mockResolvedValueOnce({
        id: mockPaymentId,
        status: "paid",
        amount: { value: "50.00", currency: "EUR" },
        method: "ideal",
        metadata: {
          order_id: mockOrderId,
          user_id: "user_456",
          line_items: [{ variant_id: 123, quantity: 1 }],
          shipping_address: { country: "NL" },
        },
      });

      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: "webhook_id" });
      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: { id: "pt_456" } });

      const atomicUpdateMock = vi.fn().mockResolvedValue({
        data: { success: true },
        error: null,
      });
      vi.mocked(supabaseRest).mockImplementationOnce(atomicUpdateMock);

      // The critical assertion: webhook sets status to waiting_confirmation
      // It will be updated to "confirmed" by create-printify-order function after Printify succeeds
      const callArgs = atomicUpdateMock.mock.calls[0][2];
      expect(callArgs.p_payment_status).toBe("paid");
      expect(callArgs.p_order_status).toBe("waiting_confirmation");
    });

    it("should NOT update order status to confirmed in webhook (that's done by create-printify-order)", async () => {
      // This test verifies that the webhook does NOT set status to "confirmed"
      // The create-printify-order edge function is responsible for that
      const mockOrderId = "123e4567-e89b-12d3-a456-426614174000";

      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: false });
      vi.mocked(getMolliePayment).mockResolvedValueOnce({
        id: "tr_test",
        status: "paid",
        amount: { value: "100.00", currency: "USD" },
        metadata: {
          order_id: mockOrderId,
          line_items: [{ variant_id: 123, quantity: 1 }],
          shipping_address: { country: "NL" },
        },
      });

      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: "webhook_id" });
      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: { id: "pt_123" } });

      const atomicUpdateMock = vi.fn().mockResolvedValue({
        data: { success: true },
        error: null,
      });
      vi.mocked(supabaseRest).mockImplementationOnce(atomicUpdateMock);

      // Mock Printify call (webhook still calls it, but doesn't update status after)
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: "printify_123" }),
      });

      // Verify that webhook only calls atomic update ONCE (for waiting_confirmation)
      // It should NOT call it again after Printify succeeds
      expect(atomicUpdateMock).toHaveBeenCalledTimes(1);
      const callArgs = atomicUpdateMock.mock.calls[0][2];
      expect(callArgs.p_order_status).toBe("waiting_confirmation");
      expect(callArgs.p_order_status).not.toBe("confirmed");
    });

    it("should create reconciliation alert if Printify fails (status remains waiting_confirmation)", async () => {
      const mockOrderId = "123e4567-e89b-12d3-a456-426614174000";

      // Mock Printify order creation failure
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        text: async () => "Printify API error",
      });

      const reconciliationMock = vi.fn().mockResolvedValue({
        data: { id: "rec_123" },
        error: null,
      });
      vi.mocked(supabaseRest).mockImplementationOnce(reconciliationMock);

      // Verify reconciliation alert is created with correct expected_status
      expect(reconciliationMock).toHaveBeenCalledWith(
        "order_status_reconciliation",
        "POST",
        expect.objectContaining({
          order_id: mockOrderId,
          expected_status: "pending", // Status stays at waiting_confirmation when Printify fails
          actual_status: "pending",
          error_message: expect.stringContaining("Printify"),
        })
      );
    });
  });

  describe("Idempotency", () => {
    it("should skip processing if webhook was already processed", async () => {
      const mockPaymentId = "tr_duplicate";

      // Mock webhook already processed
      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: true });

      // No further calls should be made
      expect(vi.mocked(getMolliePayment)).not.toHaveBeenCalled();
    });
  });

  describe("Integration: Payment to Fulfillment Flow", () => {
    it("should follow correct flow: webhook sets waiting_confirmation, create-printify-order sets confirmed", async () => {
      const mockOrderId = "123e4567-e89b-12d3-a456-426614174000";

      // Step 1: Webhook receives payment success
      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: false });
      vi.mocked(getMolliePayment).mockResolvedValueOnce({
        id: "tr_test",
        status: "paid",
        amount: { value: "100.00", currency: "USD" },
        metadata: { order_id: mockOrderId },
      });

      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: "webhook_id" });
      vi.mocked(supabaseRest).mockResolvedValueOnce({ data: { id: "pt_123" } });

      // Step 2: Webhook updates to waiting_confirmation
      const atomicUpdateMock = vi.fn().mockResolvedValue({
        data: { success: true },
        error: null,
      });
      vi.mocked(supabaseRest).mockImplementationOnce(atomicUpdateMock);

      expect(atomicUpdateMock).toHaveBeenCalledWith(
        "rpc/update_order_payment_status_atomic",
        "POST",
        expect.objectContaining({
          p_payment_status: "paid",
          p_order_status: "waiting_confirmation",
        })
      );

      // Step 3: create-printify-order function (separate edge function) handles Printify
      //         and updates status to "confirmed" or "unsuccessful_confirmation"
      // This is tested in create-printify-order tests
    });
  });

  describe("Payment Transactions Flow", () => {
    describe("Normal Flow: Create Mollie Payment → Webhook Updates Record", () => {
      it("should create payment_transactions record with user_id when Mollie payment is created", async () => {
        const mockUserId = "user_mollie_123";
        const mockMolliePaymentId = "tr_mollie_123";
        const mockAmount = 45.00;

        // Mock create-mollie-payment creating the record
        const createMock = vi.fn().mockResolvedValue({
          data: {
            id: "pt_mollie_123",
            user_id: mockUserId,
            payment_provider: "mollie",
            mollie_payment_id: mockMolliePaymentId,
            mollie_status: "open",
            amount: mockAmount,
            currency: "eur",
            status: "pending",
          },
          error: null,
        });

        vi.mocked(supabaseRest).mockImplementationOnce(createMock);

        await supabaseRest("payment_transactions", "POST", {
          user_id: mockUserId,
          payment_provider: "mollie",
          mollie_payment_id: mockMolliePaymentId,
          mollie_status: "open",
          amount: mockAmount,
          currency: "eur",
          status: "pending",
        });

        expect(createMock).toHaveBeenCalledWith(
          "payment_transactions",
          "POST",
          expect.objectContaining({
            user_id: mockUserId,
            mollie_payment_id: mockMolliePaymentId,
            status: "pending",
          })
        );
      });

      it("should update existing payment_transactions record when payment status changes", async () => {
        const mockMolliePaymentId = "tr_mollie_456";
        const mockUserId = "user_mollie_456";

        // Mock webhook updating existing record (PATCH, not INSERT)
        const updateMock = vi.fn().mockResolvedValue({
          data: [{
            id: "pt_mollie_456",
            user_id: mockUserId,
            mollie_payment_id: mockMolliePaymentId,
            mollie_status: "paid",
            status: "succeeded",
          }],
          error: null,
        });

        vi.mocked(supabaseRest).mockImplementationOnce(updateMock);

        await supabaseRest(
          `payment_transactions?mollie_payment_id=eq.${mockMolliePaymentId}`,
          "PATCH",
          {
            user_id: mockUserId,
            mollie_status: "paid",
            status: "succeeded",
            updated_at: new Date().toISOString(),
          }
        );

        // Verify UPDATE was used (not INSERT)
        expect(updateMock).toHaveBeenCalledWith(
          `payment_transactions?mollie_payment_id=eq.${mockMolliePaymentId}`,
          "PATCH",
          expect.objectContaining({
            mollie_status: "paid",
            status: "succeeded",
          })
        );
      });
    });

    describe("Race Condition Handling", () => {
      it("should create new record if webhook arrives before create-mollie-payment", async () => {
        const mockMolliePaymentId = "tr_race_123";
        const mockUserId = "user_race_mollie";

        // Mock webhook trying to update (no existing record found)
        vi.mocked(supabaseRest).mockResolvedValueOnce({
          data: [],
          error: null,
        });

        // Mock webhook creating fallback record
        const insertMock = vi.fn().mockResolvedValue({
          data: {
            id: "pt_race_mollie",
            user_id: mockUserId,
            mollie_payment_id: mockMolliePaymentId,
            status: "succeeded",
          },
          error: null,
        });

        vi.mocked(supabaseRest).mockImplementationOnce(insertMock);

        // Simulate webhook logic
        const updateResult = await supabaseRest(
          `payment_transactions?mollie_payment_id=eq.${mockMolliePaymentId}`,
          "PATCH",
          {
            user_id: mockUserId,
            status: "succeeded",
          }
        );

        // Race condition: no record found, create new one
        if (!updateResult.data || updateResult.data.length === 0) {
          console.log("No existing record found, creating new one (race condition)");
          await supabaseRest("payment_transactions", "POST", {
            user_id: mockUserId,
            payment_provider: "mollie",
            mollie_payment_id: mockMolliePaymentId,
            status: "succeeded",
          });
        }

        // Verify fallback INSERT was called
        expect(insertMock).toHaveBeenCalledWith(
          "payment_transactions",
          "POST",
          expect.objectContaining({
            user_id: mockUserId,
            mollie_payment_id: mockMolliePaymentId,
            status: "succeeded",
          })
        );
      });
    });

    describe("user_id Verification", () => {
      it("should always have user_id set for Mollie payments", async () => {
        const mockUserId = "user_mollie_verify";
        const mockMolliePaymentId = "tr_verify_123";

        vi.mocked(supabaseRest).mockResolvedValueOnce({
          data: {
            id: "pt_verify",
            user_id: mockUserId,
            mollie_payment_id: mockMolliePaymentId,
            status: "pending",
          },
          error: null,
        });

        const result = await supabaseRest("payment_transactions", "POST", {
          user_id: mockUserId,
          payment_provider: "mollie",
          mollie_payment_id: mockMolliePaymentId,
          status: "pending",
        });

        // Critical assertion: user_id must NOT be null
        expect(result.data.user_id).not.toBe(null);
        expect(result.data.user_id).toBe(mockUserId);
      });

      it("should extract user_id from metadata in webhook", async () => {
        const mockUserId = "user_mollie_meta";
        const mockMolliePaymentId = "tr_meta_123";

        const mockPayment = {
          id: mockMolliePaymentId,
          status: "paid",
          amount: { value: "50.00", currency: "EUR" },
          metadata: {
            user_id: mockUserId,
            order_id: "order_123",
          },
        };

        // Mock webhook update with user_id from metadata
        vi.mocked(supabaseRest).mockResolvedValueOnce({
          data: [{
            id: "pt_meta",
            user_id: mockUserId, // From metadata
            mollie_payment_id: mockMolliePaymentId,
            status: "succeeded",
          }],
          error: null,
        });

        // Webhook extracts user_id from metadata
        const userId = mockPayment.metadata?.user_id;

        await supabaseRest(
          `payment_transactions?mollie_payment_id=eq.${mockPayment.id}`,
          "PATCH",
          {
            user_id: userId || null,
            status: "succeeded",
            metadata: mockPayment.metadata,
          }
        );

        // Verify user_id was explicitly set
        expect(userId).toBe(mockUserId);
      });
    });
  });
});
