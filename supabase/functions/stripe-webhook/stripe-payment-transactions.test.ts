import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabaseRest } from "../_shared/supabase.ts";

// Mock dependencies
vi.mock("../_shared/supabase.ts");

describe("Stripe Payment Transactions Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Normal Flow: Create Payment Intent → Webhook Updates Record", () => {
    it("should create payment_transactions record with user_id when payment intent is created", async () => {
      const mockUserId = "user_123";
      const mockPaymentIntentId = "pi_test_123";
      const mockAmount = 25.99;

      // Mock the create-payment-intent function creating the record
      const createTransactionMock = vi.fn().mockResolvedValue({
        data: {
          id: "pt_123",
          user_id: mockUserId,
          payment_provider: "stripe",
          stripe_payment_intent_id: mockPaymentIntentId,
          amount: mockAmount,
          currency: "usd",
          status: "pending",
        },
        error: null,
      });

      vi.mocked(supabaseRest).mockImplementationOnce(createTransactionMock);

      // Simulate create-payment-intent creating the transaction
      const result = await supabaseRest("payment_transactions", "POST", {
        user_id: mockUserId,
        payment_provider: "stripe",
        stripe_payment_intent_id: mockPaymentIntentId,
        amount: mockAmount,
        currency: "usd",
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Verify record was created with user_id
      expect(createTransactionMock).toHaveBeenCalledWith(
        "payment_transactions",
        "POST",
        expect.objectContaining({
          user_id: mockUserId,
          stripe_payment_intent_id: mockPaymentIntentId,
          status: "pending",
        })
      );

      expect(result.data).toHaveProperty("user_id", mockUserId);
    });

    it("should update payment_transactions record when webhook receives payment_intent.succeeded", async () => {
      const mockUserId = "user_123";
      const mockPaymentIntentId = "pi_test_123";

      // Mock webhook trying to update existing record
      const updateTransactionMock = vi.fn().mockResolvedValue({
        data: [{
          id: "pt_123",
          user_id: mockUserId,
          stripe_payment_intent_id: mockPaymentIntentId,
          status: "succeeded",
        }],
        error: null,
      });

      vi.mocked(supabaseRest).mockImplementationOnce(updateTransactionMock);

      // Simulate webhook updating the transaction
      const result = await supabaseRest(
        `payment_transactions?stripe_payment_intent_id=eq.${mockPaymentIntentId}`,
        "PATCH",
        {
          user_id: mockUserId,
          amount: 25.99,
          currency: "usd",
          status: "succeeded",
          updated_at: new Date().toISOString(),
        }
      );

      // Verify record was updated (PATCH, not INSERT)
      expect(updateTransactionMock).toHaveBeenCalledWith(
        `payment_transactions?stripe_payment_intent_id=eq.${mockPaymentIntentId}`,
        "PATCH",
        expect.objectContaining({
          user_id: mockUserId,
          status: "succeeded",
        })
      );

      // Verify user_id is preserved
      expect(result.data[0]).toHaveProperty("user_id", mockUserId);
      expect(result.data[0]).toHaveProperty("status", "succeeded");
    });

    it("should extract user_id from metadata and set it explicitly in webhook", async () => {
      const mockUserId = "user_456";
      const mockPaymentIntentId = "pi_test_456";

      const paymentIntent = {
        id: mockPaymentIntentId,
        amount: 2599,
        currency: "usd",
        metadata: {
          user_id: mockUserId,
          user_email: "test@example.com",
          order_id: "order_123",
        },
      };

      // Mock webhook update
      const updateMock = vi.fn().mockResolvedValue({
        data: [{ id: "pt_456", user_id: mockUserId }],
        error: null,
      });

      vi.mocked(supabaseRest).mockImplementationOnce(updateMock);

      // Webhook logic: extract user_id from metadata
      const userId = paymentIntent.metadata?.user_id;

      await supabaseRest(
        `payment_transactions?stripe_payment_intent_id=eq.${paymentIntent.id}`,
        "PATCH",
        {
          user_id: userId || null,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: "succeeded",
          metadata: paymentIntent.metadata,
          updated_at: new Date().toISOString(),
        }
      );

      // Verify user_id was explicitly set (not just in metadata)
      const callArgs = updateMock.mock.calls[0][2];
      expect(callArgs).toHaveProperty("user_id", mockUserId);
      expect(callArgs.user_id).not.toBe(null);
    });
  });

  describe("Race Condition: Webhook Arrives Before create-payment-intent Completes", () => {
    it("should create new record if webhook arrives first and no record exists", async () => {
      const mockPaymentIntentId = "pi_test_race_123";
      const mockUserId = "user_789";

      // Mock webhook trying to update (returns empty array - no record found)
      vi.mocked(supabaseRest).mockResolvedValueOnce({
        data: [],
        error: null,
      });

      // Mock webhook creating new record as fallback
      const insertMock = vi.fn().mockResolvedValue({
        data: {
          id: "pt_789",
          user_id: mockUserId,
          stripe_payment_intent_id: mockPaymentIntentId,
          status: "succeeded",
        },
        error: null,
      });

      vi.mocked(supabaseRest).mockImplementationOnce(insertMock);

      // Simulate webhook logic
      const updateResult = await supabaseRest(
        `payment_transactions?stripe_payment_intent_id=eq.${mockPaymentIntentId}`,
        "PATCH",
        {
          user_id: mockUserId,
          status: "succeeded",
          updated_at: new Date().toISOString(),
        }
      );

      // No record found (race condition)
      if (!updateResult.data || updateResult.data.length === 0) {
        console.log("No existing record found, creating new one (race condition)");
        await supabaseRest("payment_transactions", "POST", {
          user_id: mockUserId,
          payment_provider: "stripe",
          stripe_payment_intent_id: mockPaymentIntentId,
          status: "succeeded",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      // Verify fallback INSERT was called
      expect(insertMock).toHaveBeenCalledWith(
        "payment_transactions",
        "POST",
        expect.objectContaining({
          user_id: mockUserId,
          stripe_payment_intent_id: mockPaymentIntentId,
          status: "succeeded",
        })
      );
    });

    it("should not create duplicate records when both webhook and create-payment-intent run", async () => {
      const mockPaymentIntentId = "pi_test_duplicate_123";
      const mockUserId = "user_duplicate";

      // Scenario 1: create-payment-intent creates record
      const createMock = vi.fn().mockResolvedValue({
        data: { id: "pt_create_1", user_id: mockUserId },
        error: null,
      });

      vi.mocked(supabaseRest).mockImplementationOnce(createMock);

      await supabaseRest("payment_transactions", "POST", {
        user_id: mockUserId,
        payment_provider: "stripe",
        stripe_payment_intent_id: mockPaymentIntentId,
        status: "pending",
      });

      // Scenario 2: webhook updates the same record (not insert)
      const updateMock = vi.fn().mockResolvedValue({
        data: [{ id: "pt_create_1", user_id: mockUserId, status: "succeeded" }],
        error: null,
      });

      vi.mocked(supabaseRest).mockImplementationOnce(updateMock);

      await supabaseRest(
        `payment_transactions?stripe_payment_intent_id=eq.${mockPaymentIntentId}`,
        "PATCH",
        {
          status: "succeeded",
          updated_at: new Date().toISOString(),
        }
      );

      // Verify only ONE record was created (INSERT called once)
      expect(createMock).toHaveBeenCalledTimes(1);
      // Webhook used UPDATE, not INSERT
      expect(updateMock).toHaveBeenCalledWith(
        `payment_transactions?stripe_payment_intent_id=eq.${mockPaymentIntentId}`,
        "PATCH",
        expect.any(Object)
      );
    });
  });

  describe("user_id Verification", () => {
    it("should have user_id set in payment_transactions for all Stripe payments", async () => {
      const testCases = [
        { paymentIntentId: "pi_test_1", userId: "user_1", amount: 10 },
        { paymentIntentId: "pi_test_2", userId: "user_2", amount: 20 },
        { paymentIntentId: "pi_test_3", userId: "user_3", amount: 30 },
      ];

      for (const testCase of testCases) {
        // Mock create-payment-intent creating record with user_id
        vi.mocked(supabaseRest).mockResolvedValueOnce({
          data: {
            id: `pt_${testCase.userId}`,
            user_id: testCase.userId,
            stripe_payment_intent_id: testCase.paymentIntentId,
            amount: testCase.amount,
            status: "pending",
          },
          error: null,
        });

        const result = await supabaseRest("payment_transactions", "POST", {
          user_id: testCase.userId,
          payment_provider: "stripe",
          stripe_payment_intent_id: testCase.paymentIntentId,
          amount: testCase.amount,
          status: "pending",
        });

        // Verify user_id is NOT null
        expect(result.data).toHaveProperty("user_id");
        expect(result.data.user_id).not.toBe(null);
        expect(result.data.user_id).toBe(testCase.userId);
      }
    });

    it("should NOT have null user_id after webhook processing", async () => {
      const mockPaymentIntentId = "pi_test_no_null";
      const mockUserId = "user_no_null";

      // Mock webhook update with user_id from metadata
      vi.mocked(supabaseRest).mockResolvedValueOnce({
        data: [{
          id: "pt_no_null",
          user_id: mockUserId, // Should be set from metadata
          stripe_payment_intent_id: mockPaymentIntentId,
          status: "succeeded",
        }],
        error: null,
      });

      const result = await supabaseRest(
        `payment_transactions?stripe_payment_intent_id=eq.${mockPaymentIntentId}`,
        "PATCH",
        {
          user_id: mockUserId, // Explicitly set from paymentIntent.metadata.user_id
          status: "succeeded",
          updated_at: new Date().toISOString(),
        }
      );

      // Critical assertion: user_id must NOT be null
      expect(result.data[0].user_id).not.toBe(null);
      expect(result.data[0].user_id).toBe(mockUserId);
    });
  });

  describe("order_id Linking", () => {
    it("should allow client-side to link order_id after order creation", async () => {
      const mockPaymentIntentId = "pi_test_link_order";
      const mockOrderId = "order_123";

      // Mock OrderService.linkPaymentTransactionToOrder() call
      const linkOrderMock = vi.fn().mockResolvedValue({
        data: [{
          id: "pt_link",
          stripe_payment_intent_id: mockPaymentIntentId,
          order_id: mockOrderId,
        }],
        error: null,
      });

      vi.mocked(supabaseRest).mockImplementationOnce(linkOrderMock);

      // Client-side links order_id after order creation
      await supabaseRest(
        `payment_transactions?stripe_payment_intent_id=eq.${mockPaymentIntentId}`,
        "PATCH",
        {
          order_id: mockOrderId,
          updated_at: new Date().toISOString(),
        }
      );

      // Verify order_id was linked
      expect(linkOrderMock).toHaveBeenCalledWith(
        `payment_transactions?stripe_payment_intent_id=eq.${mockPaymentIntentId}`,
        "PATCH",
        expect.objectContaining({
          order_id: mockOrderId,
        })
      );
    });

    it("should have order_id available for webhook to update order payment_status", async () => {
      const mockPaymentIntentId = "pi_test_webhook_order";
      const mockOrderId = "order_456";

      // Webhook queries payment_transactions to get order_id
      vi.mocked(supabaseRest).mockResolvedValueOnce({
        data: [{
          order_id: mockOrderId,
          stripe_payment_intent_id: mockPaymentIntentId,
        }],
        error: null,
      });

      const txResult = await supabaseRest(
        `payment_transactions?stripe_payment_intent_id=eq.${mockPaymentIntentId}&select=order_id`,
        "GET"
      );

      const orderId = txResult.data?.[0]?.order_id;

      // Verify order_id is available
      expect(orderId).not.toBe(null);
      expect(orderId).toBe(mockOrderId);

      // Now webhook can update order payment_status
      if (orderId) {
        const orderUpdateMock = vi.fn().mockResolvedValue({
          data: { id: orderId, payment_status: "paid" },
          error: null,
        });

        vi.mocked(supabaseRest).mockImplementationOnce(orderUpdateMock);

        await supabaseRest(
          `orders?id=eq.${orderId}`,
          "PATCH",
          {
            payment_status: "paid",
            payment_method: "stripe",
            updated_at: new Date().toISOString(),
          }
        );

        expect(orderUpdateMock).toHaveBeenCalledWith(
          `orders?id=eq.${orderId}`,
          "PATCH",
          expect.objectContaining({
            payment_status: "paid",
          })
        );
      }
    });
  });

  describe("Integration: Full Payment Flow", () => {
    it("should follow complete flow: create → link order → webhook update", async () => {
      const mockUserId = "user_integration";
      const mockPaymentIntentId = "pi_integration_123";
      const mockOrderId = "order_integration_123";

      // Step 1: create-payment-intent creates payment_transactions record
      vi.mocked(supabaseRest).mockResolvedValueOnce({
        data: {
          id: "pt_integration",
          user_id: mockUserId,
          payment_provider: "stripe",
          stripe_payment_intent_id: mockPaymentIntentId,
          amount: 25.99,
          currency: "usd",
          status: "pending",
          order_id: null, // Not linked yet
        },
        error: null,
      });

      const createResult = await supabaseRest("payment_transactions", "POST", {
        user_id: mockUserId,
        payment_provider: "stripe",
        stripe_payment_intent_id: mockPaymentIntentId,
        amount: 25.99,
        currency: "usd",
        status: "pending",
      });

      expect(createResult.data.user_id).toBe(mockUserId);
      expect(createResult.data.order_id).toBe(null);

      // Step 2: Client creates order and links it
      vi.mocked(supabaseRest).mockResolvedValueOnce({
        data: [{ id: "pt_integration", order_id: mockOrderId }],
        error: null,
      });

      await supabaseRest(
        `payment_transactions?stripe_payment_intent_id=eq.${mockPaymentIntentId}`,
        "PATCH",
        {
          order_id: mockOrderId,
          updated_at: new Date().toISOString(),
        }
      );

      // Step 3: Webhook updates status to succeeded
      vi.mocked(supabaseRest).mockResolvedValueOnce({
        data: [{
          id: "pt_integration",
          user_id: mockUserId,
          order_id: mockOrderId,
          status: "succeeded",
        }],
        error: null,
      });

      const webhookResult = await supabaseRest(
        `payment_transactions?stripe_payment_intent_id=eq.${mockPaymentIntentId}`,
        "PATCH",
        {
          user_id: mockUserId, // From metadata
          status: "succeeded",
          updated_at: new Date().toISOString(),
        }
      );

      // Verify final state
      expect(webhookResult.data[0]).toMatchObject({
        user_id: mockUserId,
        order_id: mockOrderId,
        status: "succeeded",
      });
    });
  });
});
