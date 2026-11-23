"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
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
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-(--color-stamp-white) border-t border-(--color-stamp-divider) p-4 pb-6 space-y-2">
      {/* Primary Action Button */}
      {action && label && (
        <Button
          variant="primary"
          onClick={action}
          disabled={disabled}
          className="w-full"
        >
          {loading ? t("common.loading") : label}
        </Button>
      )}

      {/* Back Button */}
      {currentStep > 0 && (
        <Button
          variant="ghost-stamp"
          onClick={prevStepSkipLoading}
          className="w-full py-3"
          aria-label={t("nav.backTo", { step: targetStepLabel })}
        >
          <ArrowLeft className="w-4 h-4" />
          {targetStepLabel}
        </Button>
      )}
    </div>
  );
}
