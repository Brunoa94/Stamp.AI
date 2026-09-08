"use client";

import { useTranslations } from "next-intl";
import { Coins } from "lucide-react";
import { useUserCoins } from "@/queries/coinsQueries";
import { cn } from "@/lib/utils";
import { Span } from "@/features/ui/span";

interface CoinsDisplayProps {
  className?: string;
}

/**
 * CoinsDisplay
 *
 * Shows the user's current coin balance (e.g., "3 Coins available").
 * Displays a skeleton loader while fetching.
 * Positioned near the Generate button in SynthesisSection.
 */
export function CoinsDisplay({ className }: CoinsDisplayProps) {
  const t = useTranslations("stamp.errors.coins");
  const { data, isLoading } = useUserCoins();

  const coins = data?.coins ?? 0;

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-(--color-stamp-taupe)",
          className
        )}
        data-testid="coins-display-skeleton"
      >
        <Coins className="h-4 w-4" />
        <div className="h-4 w-20 animate-pulse rounded bg-(--color-stamp-divider)" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-(--color-stamp-chocolate)",
        className
      )}
      data-testid="coins-display"
      aria-label={t("displayAria", { coins })}
    >
      <Coins
        className={cn(
          "h-4 w-4 transition-colors",
          coins === 0 ? "text-(--color-stamp-taupe)" : "text-(--color-stamp-gold)"
        )}
      />
      <Span variant="label" className="text-(--color-stamp-taupe)">
        {t("display", { coins })}
      </Span>
    </div>
  );
}
