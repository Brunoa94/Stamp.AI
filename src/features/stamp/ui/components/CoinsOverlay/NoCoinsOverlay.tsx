"use client";

import { useTranslations } from "next-intl";
import { Coins } from "lucide-react";
import { CoinsOverlayShell } from "./CoinsOverlayShell";
import { OverlaySkipButton } from "./OverlaySkipButton";

/**
 * NoCoinsOverlay
 *
 * Shown when the user has exhausted their daily coins, with an optional
 * skip action (reuse previous creations or skip generation).
 */

interface PropsI {
  onSkip?: () => void;
  hasCachedImages?: boolean;
  hasUploadedImage?: boolean;
}

export function NoCoinsOverlay({
  onSkip,
  hasCachedImages,
  hasUploadedImage,
}: PropsI) {
  const t = useTranslations("stamp.errors.coins");

  return (
    <CoinsOverlayShell
      testId="coins-overlay-no-coins"
      icon={<Coins className="h-8 w-8 text-(--color-stamp-gold-text)" />}
      iconClassName="bg-(--color-stamp-gold)/20"
      title={t("noCoins")}
      description={t("noCoinsDescription")}
    >
      <OverlaySkipButton
        onSkip={onSkip}
        hasCachedImages={hasCachedImages}
        hasUploadedImage={hasUploadedImage}
      />
    </CoinsOverlayShell>
  );
}
