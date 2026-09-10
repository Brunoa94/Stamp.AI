"use client";

import { useCallback } from "react";
import { useStampFlowStore } from "../stores/stampFlowStore";
import { STAMP_TOTAL_STEPS } from "../constants/stampSteps";

/**
 * Get the maximum accessible step based on current store state.
 * This function reads directly from the store to avoid stale closures.
 */
function getMaxAccessibleStep(): number {
  const state = useStampFlowStore.getState();

  // Step 0-2: Always accessible (hero, upload, synthesis)
  // Step 3-4: Accessible once generation has results
  if (state.generatedResults.length === 0) return 2;

  // Step 5: Accessible once an image is selected
  if (!state.selectedImageUrl) return 4;

  // Step 6: Accessible once a product is selected
  if (!state.blueprintId || !state.printProviderId) return 5;

  // Step 7: Accessible once customization is done (color selected)
  if (!state.selectedColor) return 6;

  // Step 8: Accessible once product is created
  if (!state.createdProductId) return 7;

  // All steps accessible
  return 8;
}

/**
 * Check if a specific step is accessible for direct navigation (sidebar jumps).
 * Does NOT apply to nextStep/prevStep which are controlled by CTAs.
 */
function isStepAccessibleForJump(step: number): boolean {
  const currentStep = useStampFlowStore.getState().currentStep;

  // Can always go back to current or previous steps
  if (step <= currentStep) return true;

  // Can only jump forward up to max accessible step
  return step <= getMaxAccessibleStep();
}

/**
 * useStampNavigation
 *
 * Hook for navigating between Stamp flow steps.
 * Handles step validation for animation-driven transitions.
 *
 * Navigation rules:
 * - goToStep(): Validates accessibility - prevents jumping to incomplete steps
 * - nextStep(): Always allowed - controlled by CTA buttons in each section
 * - prevStep(): Always allowed - can go back anytime
 */

export function useStampNavigation() {
  // Subscribe to currentStep for re-renders when it changes
  const currentStep = useStampFlowStore((state) => state.currentStep);

  // goToStep validates accessibility for direct jumps (e.g., sidebar navigation)
  const goToStep = useCallback((step: number) => {
    if (step < 0 || step > STAMP_TOTAL_STEPS) return;

    // Validate step accessibility for direct jumps
    if (!isStepAccessibleForJump(step)) return;

    // Get the setter directly from the store
    const { setCurrentStep } = useStampFlowStore.getState();
    setCurrentStep(step);
  }, []); // No dependencies - always uses fresh store state

  // nextStep always proceeds - CTAs control when this is called
  const nextStep = useCallback(() => {
    const current = useStampFlowStore.getState().currentStep;
    if (current < STAMP_TOTAL_STEPS) {
      const { setCurrentStep } = useStampFlowStore.getState();
      setCurrentStep(current + 1);
    }
  }, []);

  // prevStep always goes back - no restrictions on going backward
  const prevStep = useCallback(() => {
    const current = useStampFlowStore.getState().currentStep;
    if (current > 0) {
      const { setCurrentStep } = useStampFlowStore.getState();
      setCurrentStep(current - 1);
    }
  }, []);

  // prevStepSkipLoading skips loading states (steps 3 and 7) when going back
  const prevStepSkipLoading = useCallback(() => {
    const current = useStampFlowStore.getState().currentStep;
    if (current > 0) {
      const { setCurrentStep } = useStampFlowStore.getState();
      // Loading states are step 3 (generation) and step 7 (production)
      let targetStep = current - 1;
      if (targetStep === 7 || targetStep === 3) {
        targetStep = targetStep - 1;
      }
      setCurrentStep(Math.max(0, targetStep));
    }
  }, []);

  return { currentStep, goToStep, nextStep, prevStep, prevStepSkipLoading };
}

/**
 * useStampNavigationActions
 *
 * Returns only the stable navigation action callbacks WITHOUT subscribing to
 * currentStep state. Use this in sections that need to navigate (nextStep,
 * goToStep) but don't need to re-render when the current step changes.
 */
export function useStampNavigationActions() {
  const goToStep = useCallback((step: number) => {
    if (step < 0 || step > STAMP_TOTAL_STEPS) return;
    if (!isStepAccessibleForJump(step)) return;
    useStampFlowStore.getState().setCurrentStep(step);
  }, []);

  const nextStep = useCallback(() => {
    const current = useStampFlowStore.getState().currentStep;
    if (current < STAMP_TOTAL_STEPS) {
      useStampFlowStore.getState().setCurrentStep(current + 1);
    }
  }, []);

  const prevStep = useCallback(() => {
    const current = useStampFlowStore.getState().currentStep;
    if (current > 0) {
      useStampFlowStore.getState().setCurrentStep(current - 1);
    }
  }, []);

  // prevStepSkipLoading skips loading states (steps 3 and 7) when going back
  const prevStepSkipLoading = useCallback(() => {
    const current = useStampFlowStore.getState().currentStep;
    if (current > 0) {
      // Loading states are step 3 (generation) and step 7 (production)
      let targetStep = current - 1;
      if (targetStep === 7 || targetStep === 3) {
        targetStep = targetStep - 1;
      }
      useStampFlowStore.getState().setCurrentStep(Math.max(0, targetStep));
    }
  }, []);

  return { goToStep, nextStep, prevStep, prevStepSkipLoading };
}
