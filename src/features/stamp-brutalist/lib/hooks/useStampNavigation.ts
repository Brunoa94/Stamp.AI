"use client";

import { useCallback } from "react";
import { useStampFlowStore } from "../context/StampFormContext";

const TOTAL_STEPS = 8;

export function useStampNavigation() {
  // Subscribe to currentStep for re-renders when it changes
  const currentStep = useStampFlowStore((state) => state.currentStep);

  // Stable goToStep that reads setCurrentStep from store at execution time
  const goToStep = useCallback((step: number) => {
    if (step < 1 || step > TOTAL_STEPS) return;

    // Get the setter directly from the store
    const { setCurrentStep } = useStampFlowStore.getState();
    setCurrentStep(step);

    // Scroll to section
    setTimeout(() => {
      const section = document.getElementById(`step-${step}`);
      section?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []); // No dependencies - always uses fresh store state

  // Read current step from store at execution time to avoid stale closures
  const nextStep = useCallback(() => {
    const current = useStampFlowStore.getState().currentStep;
    if (current < TOTAL_STEPS) {
      goToStep(current + 1);
    }
  }, [goToStep]);

  const prevStep = useCallback(() => {
    const current = useStampFlowStore.getState().currentStep;
    if (current > 1) {
      goToStep(current - 1);
    }
  }, [goToStep]);

  return { currentStep, goToStep, nextStep, prevStep };
}
