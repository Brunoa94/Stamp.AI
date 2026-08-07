"use client";

import { useMemo } from "react";
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

  // Calculate target step (skipping loading states 3 and 7)
  const targetStep = useMemo(() => {
    let target = currentStep - 1;
    if (target === 7 || target === 3) {
      target = target - 1;
    }
    return Math.max(0, target);
  }, [currentStep]);

  // Get the label for the target step
  const targetStepLabel = useMemo(() => {
    const step = STAMP_STEPS[targetStep];
    if (!step) return t("nav.back");
    return t(`steps.${step.id}.label`);
  }, [targetStep, t]);

  if (currentStep === 0) {
    return null;
  }

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
