"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CoinsService, UserCoins } from "@/services/coinsService";
import { useUser } from "@/queries/authQueries";
import { useErrorHandler } from "@/hooks/useErrorHandler";

// Query keys
const coinsKeys = {
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

// ============================================
// MUTATIONS (Write Operations)
// ============================================

/**
 * Deduct one coin from user's balance
 * Invalidates coins query on success
 * Returns boolean indicating if deduction was successful
 */
export function useDeductCoin() {
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const userId = user?.id;
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: async (): Promise<boolean> => {
      if (!userId) {
        throw new Error("User not authenticated");
      }
      return CoinsService.deductCoin(userId);
    },
    onSuccess: () => {
      // Invalidate coins query to refetch updated balance
      if (userId) {
        queryClient.invalidateQueries({ queryKey: coinsKeys.user(userId) });
      }
    },
    onError: (error: Error) => {
      handleError(error);
    },
  });
}
