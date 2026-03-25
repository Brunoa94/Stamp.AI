import { useEffect } from "react";
import type { WizardStepT } from "@/types/wizard";

/**
 * Hook to notify parent component of internal step changes (update sidebar)
 */
export function useWizardStepNotification(
  currentStep: string,
  onStepChange?: (step: WizardStepT) => void,
  externalStep?: WizardStepT
) {
  useEffect(() => {
    if (!onStepChange) return;

    // Map internal workflow steps to sidebar steps
    const sidebarStepMap: Record<string, string> = {
      upload: "upload",
      form: "upload",
      synthesis: "synthesis",
      generating: "synthesis",
      review: "review",
      results: "review",
      customizing: "fabric",
      fabric: "fabric",
      creating: "fabric",
      sizing: "sizing",
      created: "sizing",
    };

    const sidebarStep = (sidebarStepMap[currentStep] || currentStep) as WizardStepT;

    // Only update if different from external step
    if (sidebarStep !== externalStep) {
      onStepChange(sidebarStep);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]); // Only trigger on currentStep changes
}
