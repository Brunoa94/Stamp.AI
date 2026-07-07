"use client";

import { useCallback } from "react";
import { useStampFlowStore } from "../stores/stampFlowStore";
import { STAMP_TOTAL_STEPS } from "../constants/stampSteps";

/**
 * useStampNavigation
 *
 * Hook for navigating between Stamp flow steps.
 * Handles step validation for animation-driven transitions.
 */

export function useStampNavigation() {
  // Subscribe to currentStep for re-renders when it changes
  const currentStep = useStampFlowStore((state) => state.currentStep);

  // Stable goToStep that reads setCurrentStep from store at execution time
  const goToStep = useCallback((step: number) => {
    if (step < 0 || step > STAMP_TOTAL_STEPS) return;

    // Get the setter directly from the store
    const { setCurrentStep } = useStampFlowStore.getState();
    setCurrentStep(step);
  }, []); // No dependencies - always uses fresh store state

  // Read current step from store at execution time to avoid stale closures
  const nextStep = useCallback(() => {
    const current = useStampFlowStore.getState().currentStep;
    if (current < STAMP_TOTAL_STEPS) {
      goToStep(current + 1);
    }
  }, [goToStep]);

  const prevStep = useCallback(() => {
    const current = useStampFlowStore.getState().currentStep;
    if (current > 0) {
      goToStep(current - 1);
    }
  }, [goToStep]);

  return { currentStep, goToStep, nextStep, prevStep };
}
