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
 *
 * Priority logic for button display:
 * 1. hasUploadedImage (highest) - "Proceed without editing my photo"
 * 2. hasCachedImages - "Proceed with previous generated photos"
 * 3. Neither - no button shown
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

  // Determine button text based on priority:
  // 1. Uploaded image takes highest priority
  // 2. Cached images as fallback
  // 3. No button if neither available
  const getButtonText = (): string | null => {
    if (hasUploadedImage) {
      return t("proceedWithUploadedImage");
    }
    if (hasCachedImages) {
      return t("proceedWithCachedImages");
    }
    return null;
  };

  const buttonText = getButtonText();
  const showButton = onSkip && buttonText;

  return (
    <CoinsOverlayShell
      testId="coins-overlay-no-coins"
      icon={<Coins className="h-8 w-8 text-(--color-stamp-gold)" />}
      iconClassName="bg-(--color-stamp-gold)/20"
      title={t("noCoins")}
      description={t("noCoinsDescription")}
    >
      {showButton && (
        <Button variant="primary-compact" onClick={onSkip} className="gap-2">
          {buttonText}
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </CoinsOverlayShell>
  );
}
