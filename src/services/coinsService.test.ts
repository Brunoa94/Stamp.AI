import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CoinsService } from "./coinsService";
import { createClient } from "@/lib/supabase/client";

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

/**
 * ========================================================================
 * CoinsService Unit Tests
 * ========================================================================
 * Tests cover the coins retrieval and deduction functionality,
 * including edge cases for database errors and concurrent operations.
 */

describe("CoinsService", () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      rpc: vi.fn(),
    };

    vi.mocked(createClient).mockReturnValue(mockSupabase as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * ========================================================================
   * getUserCoins Tests
   * ========================================================================
   */

  describe("getUserCoins", () => {
    it("should return coins and reset date for valid user", async () => {
      const mockProfile = {
        coins: 3,
        coins_reset_at: "2026-08-04",
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockProfile,
        error: null,
      });

      const result = await CoinsService.getUserCoins("user-123");

      expect(result).toEqual({
        coins: 3,
        coinsResetAt: "2026-08-04",
      });
      expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
      expect(mockSupabase.select).toHaveBeenCalledWith("coins, coins_reset_at");
      expect(mockSupabase.eq).toHaveBeenCalledWith("id", "user-123");
    });

    it("should throw error when profile not found", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await expect(CoinsService.getUserCoins("nonexistent-user")).rejects.toThrow(
        /Profile not found/
      );
    });

    it("should throw error when database query fails", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: {
          code: "PGRST116",
          message: "The result contains 0 rows",
        },
      });

      await expect(CoinsService.getUserCoins("user-123")).rejects.toThrow();
    });

    it("should handle database connection errors", async () => {
      mockSupabase.single.mockRejectedValueOnce(new Error("Connection timeout"));

      await expect(CoinsService.getUserCoins("user-123")).rejects.toThrow(
        /Connection timeout/
      );
    });
  });

  /**
   * ========================================================================
   * deductCoin Tests
   * ========================================================================
   */

  describe("deductCoin", () => {
    it("should return true when coin deducted successfully", async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: true,
        error: null,
      });

      const result = await CoinsService.deductCoin("user-123");

      expect(result).toBe(true);
      expect(mockSupabase.rpc).toHaveBeenCalledWith("deduct_coin", {
        user_id: "user-123",
      });
    });

    it("should return false when user has 0 coins", async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: false,
        error: null,
      });

      const result = await CoinsService.deductCoin("user-123");

      expect(result).toBe(false);
    });

    it("should handle RPC call failures", async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: null,
        error: {
          code: "42883",
          message: 'function deduct_coin(uuid) does not exist',
        },
      });

      await expect(CoinsService.deductCoin("user-123")).rejects.toThrow();
    });

    it("should handle invalid user ID", async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: null,
        error: {
          code: "22P02",
          message: 'invalid input syntax for type uuid',
        },
      });

      await expect(CoinsService.deductCoin("invalid-uuid")).rejects.toThrow();
    });

    it("should handle network errors during RPC call", async () => {
      mockSupabase.rpc.mockRejectedValueOnce(new Error("Network error"));

      await expect(CoinsService.deductCoin("user-123")).rejects.toThrow(
        /Network error/
      );
    });

    /**
     * EDGE CASE: Concurrent deduction attempts
     * The deduct_coin RPC uses row-level locking (FOR UPDATE) to handle this,
     * but we should verify the service properly returns the RPC result
     */
    it("should properly propagate concurrent deduction results", async () => {
      // First call succeeds
      mockSupabase.rpc.mockResolvedValueOnce({
        data: true,
        error: null,
      });

      const result1 = await CoinsService.deductCoin("user-123");
      expect(result1).toBe(true);

      // Reset mock for second call
      mockSupabase.rpc.mockResolvedValueOnce({
        data: false, // Second concurrent call finds 0 coins
        error: null,
      });

      const result2 = await CoinsService.deductCoin("user-123");
      expect(result2).toBe(false);
    });

    /**
     * EDGE CASE: Daily reset scenario
     * When coins_reset_at < CURRENT_DATE, RPC resets coins to 5 and deducts
     */
    it("should return true when coins are auto-reset during deduction", async () => {
      // RPC handles the reset internally and returns true
      mockSupabase.rpc.mockResolvedValueOnce({
        data: true,
        error: null,
      });

      const result = await CoinsService.deductCoin("user-with-old-reset-date");

      expect(result).toBe(true);
    });
  });
});
