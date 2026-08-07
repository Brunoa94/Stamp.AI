import { createClient } from "@/lib/supabase/client";
import { ErrorClient } from "./errorClient";

export interface UserCoins {
  coins: number;
  coinsResetAt: string;
}

export class CoinsService {
  private static getSupabase() {
    return createClient();
  }

  /**
   * Get user's current coins and reset date
   */
  static async getUserCoins(userId: string): Promise<UserCoins> {
    try {
      const supabase = this.getSupabase();

      const { data, error } = await supabase
        .from("profiles")
        .select("coins, coins_reset_at")
        .eq("id", userId)
        .single();

      if (error) {
        throw ErrorClient.handleError({
          error,
          service: "Coins",
          action: "Get User Coins",
        });
      }

      if (!data) {
        throw ErrorClient.handleError({
          error: new Error(`Profile not found for user: ${userId}`),
          service: "Coins",
          action: "Get User Coins",
        });
      }

      return {
        coins: data.coins,
        coinsResetAt: data.coins_reset_at,
      };
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "Coins",
        action: "Get User Coins",
      });
    }
  }

  /**
   * Deduct one coin from user's balance
   * Uses atomic RPC function for concurrency safety
   * Auto-resets coins daily if needed
   *
   * @returns true if coin was deducted, false if user has no coins
   */
  static async deductCoin(userId: string): Promise<boolean> {
    try {
      const supabase = this.getSupabase();

      const { data, error } = await supabase.rpc("deduct_coin", {
        user_id: userId,
      });

      if (error) {
        throw ErrorClient.handleError({
          error,
          service: "Coins",
          action: "Deduct Coin",
        });
      }

      // RPC returns boolean: true if deducted, false if no coins
      return data === true;
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "Coins",
        action: "Deduct Coin",
      });
    }
  }
}
