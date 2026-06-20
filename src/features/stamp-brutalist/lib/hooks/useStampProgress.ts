"use client";

import { useStampFlowStore } from "../context/StampFormContext";

const TOTAL_STEPS = 8;

export function useStampProgress() {
  // Derive progress directly from currentStep with Zustand selector
  // This will only re-render when currentStep changes
  const progress = useStampFlowStore((state) => {
    const { currentStep } = state;
    if (!currentStep) return 0;
    // 0% → 100% (8 steps: step 1 = 0%, step 8 = 100%)
    return ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
  });

  return progress;
}
