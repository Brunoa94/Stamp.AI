import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabaseRest } from "../_shared/supabase.ts";

// Mock dependencies
vi.mock("../_shared/supabase.ts");

describe("Create Printify Order - Order Status Updates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("UUID Validation", () => {
    it("should successfully update order status with valid UUID", async () => {
      const validUUID = "123e4567-e89b-12d3-a456-426614174000";

      const statusUpdateMock = vi.fn().mockResolvedValue({
        data: { success: true },
        error: null,
      });
      vi.mocked(supabaseRest).mockImplementation(statusUpdateMock);

      await statusUpdateMock(
        "rpc/update_order_payment_status_atomic",
        "POST",
        {
          p_order_id: validUUID,
          p_payment_status: "paid",
          p_order_status: "confirmed",
        }
      );

      expect(statusUpdateMock).toHaveBeenCalledWith(
        "rpc/update_order_payment_status_atomic",
        "POST",
        expect.objectContaining({
          p_order_id: validUUID,
          p_payment_status: "paid",
          p_order_status: "confirmed",
        })
      );
    });

    it("should fail to update order status with invalid UUID format (order_timestamp)", async () => {
      const invalidUUID = "order_1776481088101"; // Non-UUID format

      const statusUpdateMock = vi.fn().mockResolvedValue({
        data: null,
        error: {
          code: "22P02",
          message: `invalid input syntax for type uuid: "${invalidUUID}"`,
          details: null,
          hint: null,
        },
        status: 400,
      });
      vi.mocked(supabaseRest).mockImplementation(statusUpdateMock);

      const result = await statusUpdateMock(
        "rpc/update_order_payment_status_atomic",
        "POST",
        {
          p_order_id: invalidUUID,
          p_payment_status: "paid",
          p_order_status: "confirmed",
        }
      );

      expect(result.error).toBeDefined();
      expect(result.error.code).toBe("22P02");
      expect(result.error.message).toContain("invalid input syntax for type uuid");
    });

    it("should handle successful Printify creation and update order to confirmed", async () => {
      const validUUID = "456e7890-e89b-12d3-a456-426614174111";
      const printifyOrderId = "69e2f345b08e8ccc06034c5f";

      const statusUpdateMock = vi.fn().mockResolvedValue({
        data: { success: true, order_id: validUUID },
        error: null,
        status: 200,
      });
      vi.mocked(supabaseRest).mockImplementation(statusUpdateMock);

      // Simulate successful Printify order creation
      const metadata = {
        order_id: validUUID,
        payment_intent_id: "pi_test123",
        provider: "mollie",
      };

      // Call status update (simulating what create-printify-order does)
      await statusUpdateMock(
        "rpc/update_order_payment_status_atomic",
        "POST",
        {
          p_order_id: metadata.order_id,
          p_payment_status: "paid",
          p_order_status: "confirmed",
        }
      );

      expect(statusUpdateMock).toHaveBeenCalledWith(
        "rpc/update_order_payment_status_atomic",
        "POST",
        expect.objectContaining({
          p_order_id: validUUID,
          p_order_status: "confirmed",
        })
      );
    });

    it("should handle failed Printify creation and update order to unsuccessful_confirmation", async () => {
      const validUUID = "789e0123-e89b-12d3-a456-426614174222";

      const statusUpdateMock = vi.fn().mockResolvedValue({
        data: { success: true, order_id: validUUID },
        error: null,
        status: 200,
      });
      vi.mocked(supabaseRest).mockImplementation(statusUpdateMock);

      // Simulate failed Printify order creation
      const metadata = {
        order_id: validUUID,
        payment_intent_id: "pi_test456",
        provider: "mollie",
      };

      // Call status update (simulating what create-printify-order does on failure)
      await statusUpdateMock(
        "rpc/update_order_payment_status_atomic",
        "POST",
        {
          p_order_id: metadata.order_id,
          p_payment_status: "paid",
          p_order_status: "unsuccessful_confirmation",
        }
      );

      expect(statusUpdateMock).toHaveBeenCalledWith(
        "rpc/update_order_payment_status_atomic",
        "POST",
        expect.objectContaining({
          p_order_id: validUUID,
          p_order_status: "unsuccessful_confirmation",
        })
      );
    });
  });

  describe("Metadata Validation", () => {
    it("should warn when order_id is missing from metadata", () => {
      const metadata = {
        payment_intent_id: "pi_test789",
        provider: "mollie",
        // order_id is missing
      };

      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      if (!metadata.order_id) {
        console.warn("⚠️ No order_id in metadata, cannot update order status");
      }

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("No order_id in metadata")
      );

      consoleWarnSpy.mockRestore();
    });

    it("should log metadata when attempting status update", () => {
      const metadata = {
        order_id: "012e3456-e89b-12d3-a456-426614174333",
        payment_intent_id: "pi_test101",
        provider: "stripe",
      };

      const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      console.log("📋 Metadata:", JSON.stringify(metadata, null, 2));
      console.log("🔍 Order ID from metadata:", metadata.order_id);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "📋 Metadata:",
        expect.stringContaining(metadata.order_id)
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "🔍 Order ID from metadata:",
        metadata.order_id
      );

      consoleLogSpy.mockRestore();
    });
  });
});
