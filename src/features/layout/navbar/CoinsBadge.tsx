"use client";

import { Coins } from "lucide-react";
import { Shimmer } from "@/features/ui/shimmer";
import { useCoins } from "@/queries/coinsQueries";
import { cn } from "@/lib/utils";

interface CoinsBadgeProps {
  className?: string;
}

/**
 * Displays the current user's coin balance in the navbar.
 * Shows a shimmer skeleton while loading.
 */
export function CoinsBadge({ className }: CoinsBadgeProps) {
  const { coins, isLoading } = useCoins();

  if (isLoading) {
    return <Shimmer className={cn("w-14 h-6 rounded-full", className)} />;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-1 py-1 text-sm font-medium",
        "text-yellow-500 dark:text-yellow-400",
        className,
      )}
      title={`${coins ?? 0} coins remaining`}
    >
      <Coins className="w-5 h-5 shrink-0" />
      <span>{coins ?? 0}</span>
    </div>
  );
}
