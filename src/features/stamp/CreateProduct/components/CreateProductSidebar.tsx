"use client";

import { memo, useCallback } from "react";
import { WizardSidebar } from "@/features/ui/wizard-sidebar";
import { WIZARD_STEPS } from "../constants/wizardSteps";
import type { WizardStepT } from "@/types/wizard";
import { CreateProductSelectors } from "../context/selectors";
import { useCreateProductSubscriberActions } from "../context/actions";

/**
 * Maps internal workflow steps to sidebar display steps
 */
function mapStepToSidebarStep(step: WizardStepT): string {
  const stepMapping: Record<WizardStepT, string> = {
    upload: "upload",
    form: "upload",
    synthesis: "synthesis",
    generating: "synthesis",
    review: "review",
    results: "review",
    fabric: "fabric",
    customizing: "fabric",
    creating: "fabric",
    sizing: "sizing",
    created: "sizing",
  };
  return stepMapping[step] || step;
}

/**
 * Inner component wrapped in React.memo so it only re-renders when
 * currentStep or completedSteps actually change.
 * Both selectors subscribe to the NavigationStore — they are NOT triggered
 * by form keystrokes, which only update the FormStore.
 */
const CreateProductSidebarInner = memo(function CreateProductSidebarInner() {
  const currentStep = CreateProductSelectors.currentStep();
  const completedSteps = CreateProductSelectors.completedSteps();
  const { handleSetStep } = useCreateProductSubscriberActions();

  const sidebarStep = mapStepToSidebarStep(currentStep);
  const sidebarCompletedSteps = completedSteps.map(mapStepToSidebarStep);

  const handleStepClick = useCallback(
    (stepId: string) => {
      const stepIndex = WIZARD_STEPS.findIndex((s) => s.id === stepId);
      const currentIndex = WIZARD_STEPS.findIndex((s) => s.id === currentStep);

      if (
        stepIndex <= currentIndex ||
        completedSteps.includes(stepId as WizardStepT)
      ) {
        handleSetStep(
          stepId as "upload" | "synthesis" | "review" | "fabric" | "sizing",
        );
      }
    },
    [handleSetStep, currentStep, completedSteps],
  );

  return (
    <WizardSidebar
      steps={WIZARD_STEPS}
      currentStepId={sidebarStep}
      onStepClick={handleStepClick}
      completedSteps={sidebarCompletedSteps}
      helpTitle="Pro Tip"
      helpDescription="High-resolution PNGs with transparent backgrounds work best for our AI generator."
    />
  );
});

export function CreateProductSidebar() {
  return <CreateProductSidebarInner />;
}
