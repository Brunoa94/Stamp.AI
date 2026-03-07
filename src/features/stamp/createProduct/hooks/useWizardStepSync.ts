import { useEffect } from "react";
import { useCreateProductSubscriberActions } from "../context/actions";

/**
 * Hook to sync external step changes (from sidebar) to internal workflow state
 */
export function useWizardStepSync(
  externalStep: string | undefined,
  currentStep: string
) {
  const { handleSetStep } = useCreateProductSubscriberActions();

  useEffect(() => {
    if (!externalStep) return;

    // Map internal workflow steps to sidebar steps to compare
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

    const currentSidebarStep = sidebarStepMap[currentStep] || currentStep;

    // Only update if external step is different from current mapped sidebar step
    if (externalStep !== currentSidebarStep) {
      const validSidebarSteps = [
        "upload",
        "synthesis",
        "review",
        "fabric",
        "sizing",
      ];
      if (validSidebarSteps.includes(externalStep)) {
        handleSetStep(externalStep as any);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalStep]); // Only trigger on externalStep changes
}
