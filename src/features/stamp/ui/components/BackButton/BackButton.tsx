"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { STAMP_STEPS } from "../../../lib/constants/stampSteps";
import { useStampNavigation } from "../../../lib/hooks/useStampNavigation";

/**
 * BackButton
 *
 * Fixed top-left back button for navigating to previous steps.
 * Shows contextual label based on the target step.
 * Skips loading states (steps 3 and 7) when going back.
 * Only visible when not on the first step.
 */

export function BackButton() {
  const t = useTranslations("stamp");
  const { currentStep, prevStepSkipLoading } = useStampNavigation();

  if (currentStep === 0) {
    return null;
  }

  // Target step, skipping loading states (3 and 7). Trivial derivations —
  // no memo needed since the component re-renders on currentStep anyway.
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
    <Button
      variant="secondary-compact"
      onClick={prevStepSkipLoading}
      className="fixed top-28 left-6 z-50 gap-3"
      aria-label={t("nav.backTo", { step: targetStepLabel })}
      data-testid="back-button"
    >
      <ArrowLeft className="w-4 h-4" />
      {targetStepLabel}
    </Button>
  );
}
