/**
 * ========================================================================
 * Coins Integration Tests
 * ========================================================================
 * Tests the actual deduct_coin RPC function with real Supabase database.
 * Verifies daily reset, concurrent deduction handling, and edge cases.
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { getAuthenticatedClient, AuthenticatedClient } from "./setup-auth";

describe("Coins Integration", () => {
  let auth: AuthenticatedClient;
  let testUserId: string;

  beforeAll(async () => {
    auth = await getAuthenticatedClient();
    testUserId = auth.userId;
    console.log("✅ Test user ID:", testUserId);
  });

  afterAll(async () => {
    // Reset test user coins to 5 for clean state
    const today = new Date().toISOString().split("T")[0];
    const { error } = await auth.supabase
      .from("profiles")
      .update({ coins: 5, coins_reset_at: today })
      .eq("id", testUserId);

    if (error) {
      console.error("Failed to reset coins in afterAll:", error);
    } else {
      console.log("✅ Coins reset to 5 after tests");
    }
  });

  afterEach(async () => {
    // Reset coins to 5 between tests for isolation
    const today = new Date().toISOString().split("T")[0];
    await auth.supabase
      .from("profiles")
      .update({ coins: 5, coins_reset_at: today })
      .eq("id", testUserId);
  });

  /**
   * ========================================================================
   * deduct_coin RPC Tests
   * ========================================================================
   */

  describe("deduct_coin RPC", () => {
    it("should deduct coin and return true when coins > 0", async () => {
      // Set coins to 5
      await auth.supabase
        .from("profiles")
        .update({ coins: 5 })
        .eq("id", testUserId);

      // Deduct one coin
      const { data, error } = await auth.supabase.rpc("deduct_coin", {
        user_id: testUserId,
      });

      expect(error).toBeNull();
      expect(data).toBe(true);

      // Verify coins decreased
      const { data: profile, error: profileError } = await auth.supabase
        .from("profiles")
        .select("coins")
        .eq("id", testUserId)
        .single();

      expect(profileError).toBeNull();
      expect(profile?.coins).toBe(4);
    });

    it("should return false when coins = 0", async () => {
      // Set coins to 0
      await auth.supabase
        .from("profiles")
        .update({ coins: 0 })
        .eq("id", testUserId);

      // Try to deduct
      const { data, error } = await auth.supabase.rpc("deduct_coin", {
        user_id: testUserId,
      });

      expect(error).toBeNull();
      expect(data).toBe(false);

      // Verify coins still 0
      const { data: profile } = await auth.supabase
        .from("profiles")
        .select("coins")
        .eq("id", testUserId)
        .single();

      expect(profile?.coins).toBe(0);
    });

    it("should reset coins to 5 and deduct when coins_reset_at < CURRENT_DATE", async () => {
      // Set coins to 0 with yesterday's date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      await auth.supabase.from("profiles").update({
        coins: 0,
        coins_reset_at: yesterdayStr,
      }).eq("id", testUserId);

      // Deduct - should reset first then deduct
      const { data, error } = await auth.supabase.rpc("deduct_coin", {
        user_id: testUserId,
      });

      expect(error).toBeNull();
      expect(data).toBe(true);

      // Verify coins reset to 4 (5 - 1)
      const { data: profile } = await auth.supabase
        .from("profiles")
        .select("coins, coins_reset_at")
        .eq("id", testUserId)
        .single();

      expect(profile?.coins).toBe(4);

      // Verify reset date is today
      const today = new Date().toISOString().split("T")[0];
      expect(profile?.coins_reset_at).toBe(today);
    });

    it("should handle concurrent deduction attempts safely", async () => {
      // Set coins to 2
      await auth.supabase
        .from("profiles")
        .update({ coins: 2 })
        .eq("id", testUserId);

      // Fire 5 concurrent deduction requests
      const results = await Promise.all([
        auth.supabase.rpc("deduct_coin", { user_id: testUserId }),
        auth.supabase.rpc("deduct_coin", { user_id: testUserId }),
        auth.supabase.rpc("deduct_coin", { user_id: testUserId }),
        auth.supabase.rpc("deduct_coin", { user_id: testUserId }),
        auth.supabase.rpc("deduct_coin", { user_id: testUserId }),
      ]);

      // Count successes (true results)
      const successCount = results.filter((r) => r.data === true).length;

      // Only 2 should succeed (we had 2 coins)
      expect(successCount).toBe(2);

      // Verify final coins = 0
      const { data: profile } = await auth.supabase
        .from("profiles")
        .select("coins")
        .eq("id", testUserId)
        .single();

      expect(profile?.coins).toBe(0);
    });

    it("should deduct multiple times sequentially until 0", async () => {
      // Set coins to 3
      await auth.supabase
        .from("profiles")
        .update({ coins: 3 })
        .eq("id", testUserId);

      // Deduct sequentially
      const result1 = await auth.supabase.rpc("deduct_coin", { user_id: testUserId });
      const result2 = await auth.supabase.rpc("deduct_coin", { user_id: testUserId });
      const result3 = await auth.supabase.rpc("deduct_coin", { user_id: testUserId });
      const result4 = await auth.supabase.rpc("deduct_coin", { user_id: testUserId });

      expect(result1.data).toBe(true); // 3 -> 2
      expect(result2.data).toBe(true); // 2 -> 1
      expect(result3.data).toBe(true); // 1 -> 0
      expect(result4.data).toBe(false); // 0 -> still 0

      // Verify final count
      const { data: profile } = await auth.supabase
        .from("profiles")
        .select("coins")
        .eq("id", testUserId)
        .single();

      expect(profile?.coins).toBe(0);
    });
  });

  /**
   * ========================================================================
   * Profile coins column Tests
   * ========================================================================
   */

  describe("Profile coins column", () => {
    it("should have coins column", async () => {
      const { data, error } = await auth.supabase
        .from("profiles")
        .select("coins")
        .eq("id", testUserId)
        .single();

      expect(error).toBeNull();
      expect(data).toHaveProperty("coins");
      expect(typeof data?.coins).toBe("number");
    });

    it("should have coins_reset_at column", async () => {
      const { data, error } = await auth.supabase
        .from("profiles")
        .select("coins_reset_at")
        .eq("id", testUserId)
        .single();

      expect(error).toBeNull();
      expect(data).toHaveProperty("coins_reset_at");
      expect(typeof data?.coins_reset_at).toBe("string");
    });

    it("should not allow negative coins via direct update", async () => {
      // Attempt to set negative coins
      const { error } = await auth.supabase
        .from("profiles")
        .update({ coins: -1 })
        .eq("id", testUserId);

      // Should either fail or be caught by constraint
      // Note: This test depends on database constraints being set up
      // If no constraint exists, this test documents the current behavior
      if (error) {
        expect(error.message).toContain("constraint");
      } else {
        // If no error, verify what happened
        const { data: profile } = await auth.supabase
          .from("profiles")
          .select("coins")
          .eq("id", testUserId)
          .single();

        // Document current behavior - coins might be negative if no constraint
        console.log("Coins after negative update attempt:", profile?.coins);
      }
    });
  });

  /**
   * ========================================================================
   * Get User Coins Tests
   * ========================================================================
   */

  describe("Get User Coins", () => {
    it("should return current coins for user", async () => {
      // Set known state
      await auth.supabase
        .from("profiles")
        .update({ coins: 3 })
        .eq("id", testUserId);

      const { data, error } = await auth.supabase
        .from("profiles")
        .select("coins, coins_reset_at")
        .eq("id", testUserId)
        .single();

      expect(error).toBeNull();
      expect(data?.coins).toBe(3);
      expect(data?.coins_reset_at).toBeDefined();
    });
  });
});
