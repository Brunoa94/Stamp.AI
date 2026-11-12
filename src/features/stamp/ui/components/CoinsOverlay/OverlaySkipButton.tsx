"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Button } from "@/features/ui/button";

/**
 * OverlaySkipButton
 *
 * Lets a user who cannot generate continue without AI, from inside a coins
 * overlay.
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

export function OverlaySkipButton({
  onSkip,
  hasCachedImages,
  hasUploadedImage,
}: PropsI) {
  const t = useTranslations("stamp.errors.coins");

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
  if (!onSkip || !buttonText) return null;

  return (
    <Button variant="primary-compact" onClick={onSkip} className="gap-2">
      {buttonText}
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
}
