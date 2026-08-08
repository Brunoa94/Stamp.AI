"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { STAMP_STEPS } from "../../../lib/constants/stampSteps";
import { useStampNavigation } from "../../../lib/hooks/useStampNavigation";
import { useMobileStepAction } from "../../../lib/hooks/useMobileStepAction";

/**
 * MobileStepFooter
 *
 * Sticky footer for mobile that contains:
 * 1. Primary action button (varies per step)
 * 2. Back button below it
 *
 * Only visible on mobile (<md). On desktop, buttons remain in their sections.
 */

export function MobileStepFooter() {
  const t = useTranslations("stamp");
  const isMdUp = useMediaQuery("(min-width: 768px)", true);
  const { currentStep, prevStepSkipLoading } = useStampNavigation();
  const { action, label, disabled, loading } = useMobileStepAction();

  // Hide on desktop or hero step
  if (isMdUp || currentStep === 0) {
    return null;
  }

  // Calculate target step for back button (skip loading states 3 and 7)
  let targetStep = currentStep - 1;
  if (targetStep === 7 || targetStep === 3) {
    targetStep = targetStep - 1;
  }
  targetStep = Math.max(0, targetStep);

  const targetStepConfig = STAMP_STEPS[targetStep];
  const targetStepLabel = targetStepConfig
    ? t(`steps.${targetStepConfig.id}.label`)
    : t("nav.back");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-(--color-stamp-divider) p-4 pb-6 space-y-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      {/* Primary Action Button */}
      {action && label && (
        <Button
          onClick={action}
          disabled={disabled}
          className="w-full bg-(--color-stamp-chocolate) text-white hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) transition-all duration-300 px-8 py-5 text-xs font-bold tracking-[0.2em] uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t("common.loading") : label}
        </Button>
      )}

      {/* Back Button */}
      {currentStep > 0 && (
        <Button
          variant="ghost"
          onClick={prevStepSkipLoading}
          className="w-full text-(--color-stamp-taupe) hover:text-(--color-stamp-chocolate) py-3 text-xs tracking-wider"
          aria-label={t("nav.backTo", { step: targetStepLabel })}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {targetStepLabel}
        </Button>
      )}
    </div>
  );
}
