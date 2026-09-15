"use client";

import { useQuery } from "@tanstack/react-query";
import { CoinsService, UserCoins } from "@/services/coinsService";
import { useUser } from "@/queries/authQueries";

// Query keys
export const coinsKeys = {
  all: ["coins"] as const,
  user: (userId: string) => [...coinsKeys.all, userId] as const,
};

// ============================================
// QUERIES (Read Operations)
// ============================================

/**
 * Get current user's coins
 * Enabled only when user is authenticated
 * Refetches on window focus for real-time feel
 */
export function useUserCoins() {
  const { data: user } = useUser();
  const userId = user?.id;

  return useQuery<UserCoins>({
    queryKey: coinsKeys.user(userId ?? ""),
    queryFn: () => {
      if (!userId) {
        throw new Error("User not authenticated");
      }
      return CoinsService.getUserCoins(userId);
    },
    enabled: !!userId,
    staleTime: 10 * 1000, // 10 seconds - shorter to ensure fresher data
    refetchOnWindowFocus: true,
    refetchOnMount: "always", // Always refetch when component mounts
  });
}

// Coins are spent server-side only: /api/generate-image calls deduct_coin as
// the caller (and refund_coin on failure). Consumers invalidate coinsKeys.all
// after such a request; there is deliberately no client-side deduct mutation.
