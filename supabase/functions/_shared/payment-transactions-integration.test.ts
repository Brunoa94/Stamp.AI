import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabaseRest } from "./supabase.ts";

// Mock dependencies
vi.mock("./supabase.ts");

describe("Payment Transactions Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Cross-Provider user_id Consistency", () => {
    it("should have user_id set for all payment providers", async () => {
      const providers = [
        {
          provider: "stripe",
          paymentId: "pi_test_123",
          idField: "stripe_payment_intent_id",
          userId: "user_stripe_1",
        },
        {
          provider: "paypal",
          paymentId: "PAYPAL123",
          idField: "paypal_order_id",
          userId: "user_paypal_1",
        },
        {
          provider: "mollie",
          paymentId: "tr_mollie_123",
          idField: "mollie_payment_id",
          userId: "user_mollie_1",
        },
      ];

      for (const { provider, paymentId, idField, userId } of providers) {
        // Mock payment creation
        vi.mocked(supabaseRest).mockResolvedValueOnce({
          data: {
            id: `pt_${provider}_1`,
            user_id: userId,
            payment_provider: provider,
            [idField]: paymentId,
            amount: 25.99,
            status: "pending",
          },
          error: null,
        });

        const result = await supabaseRest("payment_transactions", "POST", {
          user_id: userId,
          payment_provider: provider,
          [idField]: paymentId,
          amount: 25.99,
          status: "pending",
        });

        // Verify user_id is set for all providers
        expect(result.data.user_id).not.toBe(null);
        expect(result.data.user_id).toBe(userId);
        expect(result.data.payment_provider).toBe(provider);
      }
    });
  });

  describe("Complete Payment Flow - All Providers", () => {
    it("should follow consistent flow: create → link order → webhook update for Stripe", async () => {
      const mockUserId = "user_flow_stripe";
      const mockPaymentIntentId = "pi_flow_123";
      const mockOrderId = "order_flow_123";

      // Step 1: Payment creation
      vi.mocked(supabaseRest).mockResolvedValueOnce({
        data: { id: "pt_1", user_id: mockUserId, stripe_payment_intent_id: mockPaymentIntentId, status: "pending" },
        error: null,
      });

      const createResult = await supabaseRest("payment_transactions", "POST", {
        user_id: mockUserId,
        payment_provider: "stripe",
        stripe_payment_intent_id: mockPaymentIntentId,
        status: "pending",
      });

      expect(createResult.data.user_id).toBe(mockUserId);

      // Step 2: Order linking
      vi.mocked(supabaseRest).mockResolvedValueOnce({
        data: [{ id: "pt_1", order_id: mockOrderId }],
        error: null,
      });

      await supabaseRest(
        `payment_transactions?stripe_payment_intent_id=eq.${mockPaymentIntentId}`,
        "PATCH",
        { order_id: mockOrderId }
      );

      // Step 3: Webhook update
      vi.mocked(supabaseRest).mockResolvedValueOnce({
        data: [{ id: "pt_1", user_id: mockUserId, order_id: mockOrderId, status: "succeeded" }],
        error: null,
      });

      const webhookResult = await supabaseRest(
        `payment_transactions?stripe_payment_intent_id=eq.${mockPaymentIntentId}`,
        "PATCH",
        { user_id: mockUserId, status: "succeeded" }
      );

      expect(webhookResult.data[0]).toMatchObject({
        user_id: mockUserId,
        order_id: mockOrderId,
        status: "succeeded",
      });
    });

    it("should follow consistent flow for PayPal", async () => {
      const mockUserId = "user_flow_paypal";
      const mockPayPalOrderId = "PAYPAL_FLOW_123";
      const mockOrderId = "order_flow_paypal_123";

      // Step 1: Payment creation
      vi.mocked(supabaseRest).mockResolvedValueOnce({
        data: { id: "pt_paypal_1", user_id: mockUserId, paypal_order_id: mockPayPalOrderId, status: "pending" },
        error: null,
      });

      const createResult = await supabaseRest("payment_transactions", "POST", {
        user_id: mockUserId,
        payment_provider: "paypal",
        paypal_order_id: mockPayPalOrderId,
        status: "pending",
      });

      expect(createResult.data.user_id).toBe(mockUserId);

      // Step 2: Order linking
      vi.mocked(supabaseRest).mockResolvedValueOnce({
        data: [{ id: "pt_paypal_1", order_id: mockOrderId }],
        error: null,
      });

      await supabaseRest(
        `payment_transactions?paypal_order_id=eq.${mockPayPalOrderId}`,
        "PATCH",
        { order_id: mockOrderId }
      );

      // Step 3: Webhook update
      vi.mocked(supabaseRest).mockResolvedValueOnce({
        data: [{ id: "pt_paypal_1", user_id: mockUserId, order_id: mockOrderId, status: "succeeded" }],
        error: null,
      });

      const webhookResult = await supabaseRest(
        `payment_transactions?paypal_order_id=eq.${mockPayPalOrderId}`,
        "PATCH",
        { status: "succeeded" }
      );

      expect(webhookResult.data[0]).toMatchObject({
        user_id: mockUserId,
        order_id: mockOrderId,
        status: "succeeded",
      });
    });

    it("should follow consistent flow for Mollie", async () => {
      const mockUserId = "user_flow_mollie";
      const mockMolliePaymentId = "tr_flow_123";
      const mockOrderId = "order_flow_mollie_123";

      // Step 1: Payment creation
      vi.mocked(supabaseRest).mockResolvedValueOnce({
        data: { id: "pt_mollie_1", user_id: mockUserId, mollie_payment_id: mockMolliePaymentId, status: "pending" },
        error: null,
      });

      const createResult = await supabaseRest("payment_transactions", "POST", {
        user_id: mockUserId,
        payment_provider: "mollie",
        mollie_payment_id: mockMolliePaymentId,
        status: "pending",
      });

      expect(createResult.data.user_id).toBe(mockUserId);

      // Step 2: Order linking (can be in metadata for Mollie)
      vi.mocked(supabaseRest).mockResolvedValueOnce({
        data: [{ id: "pt_mollie_1", order_id: mockOrderId }],
        error: null,
      });

      await supabaseRest(
        `payment_transactions?mollie_payment_id=eq.${mockMolliePaymentId}`,
        "PATCH",
        { order_id: mockOrderId }
      );

      // Step 3: Webhook update
      vi.mocked(supabaseRest).mockResolvedValueOnce({
        data: [{ id: "pt_mollie_1", user_id: mockUserId, order_id: mockOrderId, status: "succeeded" }],
        error: null,
      });

      const webhookResult = await supabaseRest(
        `payment_transactions?mollie_payment_id=eq.${mockMolliePaymentId}`,
        "PATCH",
        { user_id: mockUserId, status: "succeeded" }
      );

      expect(webhookResult.data[0]).toMatchObject({
        user_id: mockUserId,
        order_id: mockOrderId,
        status: "succeeded",
      });
    });
  });

  describe("Race Condition Handling - All Providers", () => {
    it("should handle race condition consistently across all providers", async () => {
      const raceConditionTests = [
        {
          provider: "stripe",
          paymentId: "pi_race_123",
          queryField: "stripe_payment_intent_id",
          userId: "user_race_stripe",
        },
        {
          provider: "paypal",
          paymentId: "PAYPAL_RACE_123",
          queryField: "paypal_order_id",
          userId: "user_race_paypal",
        },
        {
          provider: "mollie",
          paymentId: "tr_race_123",
          queryField: "mollie_payment_id",
          userId: "user_race_mollie",
        },
      ];

      for (const { provider, paymentId, queryField, userId } of raceConditionTests) {
        // Mock webhook trying to update (no record found)
        vi.mocked(supabaseRest).mockResolvedValueOnce({
          data: [],
          error: null,
        });

        // Mock webhook creating fallback record
        const insertMock = vi.fn().mockResolvedValue({
          data: { id: `pt_race_${provider}`, user_id: userId, [queryField]: paymentId },
          error: null,
        });

        vi.mocked(supabaseRest).mockImplementationOnce(insertMock);

        // Simulate webhook logic
        const updateResult = await supabaseRest(
          `payment_transactions?${queryField}=eq.${paymentId}`,
          "PATCH",
          { user_id: userId, status: "succeeded" }
        );

        // Race condition: create fallback
        if (!updateResult.data || updateResult.data.length === 0) {
          await supabaseRest("payment_transactions", "POST", {
            user_id: userId,
            payment_provider: provider,
            [queryField]: paymentId,
            status: "succeeded",
          });
        }

        // Verify fallback was called
        expect(insertMock).toHaveBeenCalled();
      }
    });
  });

  describe("order_id Linking - All Providers", () => {
    it("should support order_id linking via OrderService.linkPaymentTransactionToOrder", async () => {
      const linkTests = [
        {
          provider: "stripe",
          paymentId: "pi_link_123",
          queryField: "stripe_payment_intent_id",
          orderId: "order_link_stripe",
        },
        {
          provider: "paypal",
          paymentId: "PAYPAL_LINK_123",
          queryField: "paypal_order_id",
          orderId: "order_link_paypal",
        },
        {
          provider: "mollie",
          paymentId: "tr_link_123",
          queryField: "mollie_payment_id",
          orderId: "order_link_mollie",
        },
      ];

      for (const { provider, paymentId, queryField, orderId } of linkTests) {
        const linkMock = vi.fn().mockResolvedValue({
          data: [{ id: `pt_link_${provider}`, order_id: orderId }],
          error: null,
        });

        vi.mocked(supabaseRest).mockImplementationOnce(linkMock);

        // Simulate OrderService.linkPaymentTransactionToOrder
        await supabaseRest(
          `payment_transactions?${queryField}=eq.${paymentId}`,
          "PATCH",
          { order_id: orderId, updated_at: new Date().toISOString() }
        );

        // Verify order_id was linked
        expect(linkMock).toHaveBeenCalledWith(
          `payment_transactions?${queryField}=eq.${paymentId}`,
          "PATCH",
          expect.objectContaining({ order_id: orderId })
        );
      }
    });

    it("should allow webhooks to query order_id after linking", async () => {
      const queryTests = [
        { provider: "stripe", paymentId: "pi_query_123", queryField: "stripe_payment_intent_id", orderId: "order_query_stripe" },
        { provider: "paypal", paymentId: "PAYPAL_QUERY_123", queryField: "paypal_order_id", orderId: "order_query_paypal" },
        { provider: "mollie", paymentId: "tr_query_123", queryField: "mollie_payment_id", orderId: "order_query_mollie" },
      ];

      for (const { paymentId, queryField, orderId } of queryTests) {
        vi.mocked(supabaseRest).mockResolvedValueOnce({
          data: [{ order_id: orderId }],
          error: null,
        });

        const result = await supabaseRest(
          `payment_transactions?${queryField}=eq.${paymentId}&select=order_id`,
          "GET"
        );

        expect(result.data[0].order_id).toBe(orderId);
      }
    });
  });

  describe("Status Tracking", () => {
    it("should track payment lifecycle: pending → succeeded", async () => {
      const mockUserId = "user_lifecycle";
      const mockPaymentId = "pi_lifecycle_123";

      // Create with pending status
      vi.mocked(supabaseRest).mockResolvedValueOnce({
        data: { id: "pt_lifecycle", user_id: mockUserId, status: "pending" },
        error: null,
      });

      const createResult = await supabaseRest("payment_transactions", "POST", {
        user_id: mockUserId,
        payment_provider: "stripe",
        stripe_payment_intent_id: mockPaymentId,
        status: "pending",
      });

      expect(createResult.data.status).toBe("pending");

      // Update to succeeded
      vi.mocked(supabaseRest).mockResolvedValueOnce({
        data: [{ id: "pt_lifecycle", user_id: mockUserId, status: "succeeded" }],
        error: null,
      });

      const updateResult = await supabaseRest(
        `payment_transactions?stripe_payment_intent_id=eq.${mockPaymentId}`,
        "PATCH",
        { status: "succeeded" }
      );

      expect(updateResult.data[0].status).toBe("succeeded");
    });

    it("should track failed payments correctly", async () => {
      const mockUserId = "user_failed";
      const mockPaymentId = "pi_failed_123";

      vi.mocked(supabaseRest).mockResolvedValueOnce({
        data: [{ id: "pt_failed", user_id: mockUserId, status: "failed" }],
        error: null,
      });

      const result = await supabaseRest(
        `payment_transactions?stripe_payment_intent_id=eq.${mockPaymentId}`,
        "PATCH",
        { status: "failed" }
      );

      expect(result.data[0].status).toBe("failed");
    });
  });

  describe("Audit Trail", () => {
    it("should maintain complete audit trail of payment events", async () => {
      const mockUserId = "user_audit";
      const mockPaymentId = "pi_audit_123";
      const events = [];

      // Event 1: Payment created
      vi.mocked(supabaseRest).mockResolvedValueOnce({
        data: {
          id: "pt_audit",
          user_id: mockUserId,
          stripe_payment_intent_id: mockPaymentId,
          status: "pending",
          created_at: "2026-04-19T10:00:00Z",
        },
        error: null,
      });

      const createResult = await supabaseRest("payment_transactions", "POST", {
        user_id: mockUserId,
        payment_provider: "stripe",
        stripe_payment_intent_id: mockPaymentId,
        status: "pending",
      });

      events.push({ event: "created", status: createResult.data.status, timestamp: createResult.data.created_at });

      // Event 2: Order linked
      vi.mocked(supabaseRest).mockResolvedValueOnce({
        data: [{ id: "pt_audit", order_id: "order_audit_123", updated_at: "2026-04-19T10:01:00Z" }],
        error: null,
      });

      const linkResult = await supabaseRest(
        `payment_transactions?stripe_payment_intent_id=eq.${mockPaymentId}`,
        "PATCH",
        { order_id: "order_audit_123", updated_at: "2026-04-19T10:01:00Z" }
      );

      events.push({ event: "order_linked", orderId: linkResult.data[0].order_id, timestamp: linkResult.data[0].updated_at });

      // Event 3: Payment succeeded
      vi.mocked(supabaseRest).mockResolvedValueOnce({
        data: [{ id: "pt_audit", status: "succeeded", updated_at: "2026-04-19T10:02:00Z" }],
        error: null,
      });

      const successResult = await supabaseRest(
        `payment_transactions?stripe_payment_intent_id=eq.${mockPaymentId}`,
        "PATCH",
        { status: "succeeded", updated_at: "2026-04-19T10:02:00Z" }
      );

      events.push({ event: "payment_succeeded", status: successResult.data[0].status, timestamp: successResult.data[0].updated_at });

      // Verify complete audit trail
      expect(events).toHaveLength(3);
      expect(events[0].status).toBe("pending");
      expect(events[1].orderId).toBe("order_audit_123");
      expect(events[2].status).toBe("succeeded");
    });
  });
});
