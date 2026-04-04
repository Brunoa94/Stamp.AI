import { createClient } from "@/lib/supabase/client";
import { ErrorClient } from "./errorClient";

export class CoinsService {
  private static getSupabase() {
    return createClient();
  }

  /**
   * Get coin balance for a given user profile.
   */
  static async getCoins(userId: string): Promise<number> {
    try {
      const { data, error } = await this.getSupabase()
        .from("profiles")
        .select("coins")
        .eq("id", userId)
        .single();

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      return data.coins as number;
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "Coins",
        action: "Get Coins",
      });
    }
  }
}