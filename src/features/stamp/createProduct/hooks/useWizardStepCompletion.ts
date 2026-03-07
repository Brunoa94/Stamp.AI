import { useEffect, useRef } from "react";
import { CreatedProductT } from "@/types/customProduct";
import type { WizardStepT } from "@/types/wizard";

/**
 * Workflow step order with main steps and their internal variations
 * Each group represents steps at the same completion level
 */
const STEP_ORDER_GROUPS: string[][] = [
  ["upload", "form"],
  ["synthesis", "generating"],
  ["review", "results"],
  ["fabric", "customizing", "creating"],
  ["sizing", "created"],
];

/**
 * Build step completion map from step order groups
 * Each step is complete when any step from subsequent groups is reached
 */
const buildStepCompletionMap = (): Record<string, string[]> => {
  const map: Record<string, string[]> = {};

  STEP_ORDER_GROUPS.forEach((currentGroup, groupIndex) => {
    // Get all steps from subsequent groups
    const subsequentSteps = STEP_ORDER_GROUPS.slice(groupIndex + 1)
      .flat();

    // Each step in the current group is complete when any subsequent step is reached
    currentGroup.forEach((step) => {
      map[step] = subsequentSteps;
    });
  });

  return map;
};

const STEP_COMPLETION_MAP = buildStepCompletionMap();

/**
 * Hook to notify parent when steps are completed
 * Optimized to use step completion map instead of repetitive conditionals
 */
export function useWizardStepCompletion(
  currentStep: string,
  createdProduct: CreatedProductT | null,
  onStepComplete?: (stepId: WizardStepT) => void
) {
  const completedStepsRef = useRef<Set<WizardStepT>>(new Set());

  useEffect(() => {
    if (!onStepComplete) return;

    const stepsToComplete: WizardStepT[] = [];

    // Check each step to see if it should be marked complete
    (Object.keys(STEP_COMPLETION_MAP) as WizardStepT[]).forEach((step) => {
      // Skip if already completed
      if (completedStepsRef.current.has(step)) return;

      // Check if current step indicates this step is complete
      const completionSteps = STEP_COMPLETION_MAP[step];
      const isComplete = completionSteps.includes(currentStep);

      // Special case: sizing step can also be completed by having a created product
      const isSizingCompleteByProduct = step === "sizing" && createdProduct !== null;

      if (isComplete || isSizingCompleteByProduct) {
        stepsToComplete.push(step);
      }
    });

    // Only call onStepComplete for steps not already completed
    stepsToComplete.forEach((step) => {
      completedStepsRef.current.add(step);
      onStepComplete(step);
    });
  }, [currentStep, createdProduct, onStepComplete]);
}
