"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/queries/authQueries";
import { CoinsService } from "@/services/coinsService";

// ─── Query keys ────────────────────────────────────────────────────────────────
export const coinsKeys = {
  all: ["coins"] as const,
  byUser: (userId: string) => [...coinsKeys.all, userId] as const,
};

export function useCoins() {
  const { data: user } = useUser();
  const userId = user?.id;
  const queryClient = useQueryClient();

  // ── React Query fetch ────────────────────────────────────────────────────────
  const { data: coins, isLoading, isError } = useQuery({
    queryKey: coinsKeys.byUser(userId ?? ""),
    queryFn: () => CoinsService.getCoins(userId!),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds — RPC keeps the source of truth
    retry: 1,
  });

  // ── Realtime subscription ────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId || !queryClient) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`coins:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: coinsKeys.byUser(userId),
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return {
    coins: coins ?? null,
    isLoading,
    isError,
  };
}
