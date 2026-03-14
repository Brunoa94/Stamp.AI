import type { StepStateT } from "@/hooks/useMultiStepWizard";

// Re-export StepStateT from the hook for local usage
export type StepState = StepStateT;

export interface AccordionStepDef {
  index: number;
  stepNumber: string; // "01", "02", …
  title: string;
}
