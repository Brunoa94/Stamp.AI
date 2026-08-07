"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, Coins } from "lucide-react";
import { Button } from "@/features/ui/button";
import { CoinsOverlayShell } from "./CoinsOverlayShell";

/**
 * NoCoinsOverlay
 *
 * Shown when the user has exhausted their daily coins, with an optional
 * skip action (reuse previous creations or skip generation).
 */

interface PropsI {
  onSkip?: () => void;
  hasCachedImages?: boolean;
}

export function NoCoinsOverlay({ onSkip, hasCachedImages }: PropsI) {
  const t = useTranslations("stamp.errors.coins");

  return (
    <CoinsOverlayShell
      testId="coins-overlay-no-coins"
      icon={<Coins className="h-8 w-8 text-(--color-stamp-gold)" />}
      iconClassName="bg-(--color-stamp-gold)/20"
      title={t("noCoins")}
      description={t("noCoinsDescription")}
    >
      {onSkip && (
        <Button variant="primary-compact" onClick={onSkip} className="gap-2">
          {hasCachedImages ? t("usePreviousCreations") : t("skipGeneration")}
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </CoinsOverlayShell>
  );
}
