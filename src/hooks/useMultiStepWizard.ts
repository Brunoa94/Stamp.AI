import { useState, useCallback } from "react";

/**
 * Step state type for visual representation
 */
export type StepStateT = "complete" | "active" | "incomplete";

/**
 * Return type for useMultiStepWizard hook
 */
interface UseMultiStepWizardReturn {
  /** Current active step (0-indexed) */
  activeStep: number;
  /** Set of completed step indices */
  completedSteps: Set<number>;
  /** Currently expanded completed step for review (-1 = none) */
  openCompletedStep: number;
  /** Progress step for UI (1-based, capped at totalSteps) */
  progressStep: number;
  /** Mark a step as complete and advance to next */
  completeStep: (step: number) => void;
  /** Get visual state of a step */
  getStepState: (step: number) => StepStateT;
  /** Check if a step's content panel is open */
  isStepOpen: (step: number) => boolean;
  /** Toggle a completed step's expansion for review */
  handleStepToggle: (step: number) => void;
  /** Manually set active step (for navigation) */
  setActiveStep: (step: number) => void;
  /** Reset wizard to initial state */
  resetWizard: () => void;
}

interface UseMultiStepWizardOptions {
  /** Total number of steps in the wizard */
  totalSteps: number;
  /** Initial active step (default: 0) */
  initialStep?: number;
  /** Initial set of completed steps (default: empty) */
  initialCompletedSteps?: Set<number>;
}

/**
 * Hook for managing multi-step wizard/form state and interactions
 *
 * @param options - Configuration for the wizard
 * @returns State and handlers for the multi-step wizard
 *
 * @example
 * ```tsx
 * const {
 *   activeStep,
 *   progressStep,
 *   completeStep,
 *   getStepState,
 *   isStepOpen,
 *   handleStepToggle
 * } = useMultiStepWizard({ totalSteps: 4 });
 *
 * // In your component
 * <StepHeader
 *   state={getStepState(0)}
 *   onClick={() => handleStepToggle(0)}
 * />
 * {isStepOpen(0) && <StepContent />}
 *
 * <Button onClick={() => completeStep(0)}>
 *   Continue
 * </Button>
 * ```
 */
export function useMultiStepWizard({
  totalSteps,
  initialStep = 0,
  initialCompletedSteps = new Set<number>(),
}: UseMultiStepWizardOptions): UseMultiStepWizardReturn {
  // Which step the user is currently on (0-indexed)
  const [activeStep, setActiveStep] = useState(initialStep);
  // Which completed step is manually expanded (for review), -1 = none
  const [openCompletedStep, setOpenCompletedStep] = useState(-1);
  // Set of completed step indices
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(
    initialCompletedSteps
  );

  /**
   * Advance to the next step and mark current as complete
   */
  const completeStep = useCallback((step: number) => {
    setCompletedSteps((prev) => new Set([...prev, step]));
    setOpenCompletedStep(-1);
    setActiveStep(step + 1);
  }, []);

  /**
   * Derive each step's visual state
   */
  const getStepState = useCallback(
    (step: number): StepStateT => {
      if (completedSteps.has(step)) return "complete";
      if (step === activeStep) return "active";
      return "incomplete";
    },
    [completedSteps, activeStep]
  );

  /**
   * Whether a step's content panel is currently open
   */
  const isStepOpen = useCallback(
    (step: number): boolean => {
      const state = getStepState(step);
      if (state === "active") return true;
      if (state === "complete") return openCompletedStep === step;
      return false;
    },
    [getStepState, openCompletedStep]
  );

  /**
   * Click handler for the step header button
   * Active step stays open; incomplete steps can't be opened
   * Toggle completed steps for review
   */
  const handleStepToggle = useCallback(
    (step: number) => {
      const state = getStepState(step);
      // Active step stays open; incomplete steps can't be opened
      if (state === "active" || state === "incomplete") return;
      // Toggle completed steps for review
      setOpenCompletedStep((prev) => (prev === step ? -1 : step));
    },
    [getStepState]
  );

  /**
   * Reset wizard to initial state
   */
  const resetWizard = useCallback(() => {
    setActiveStep(initialStep);
    setOpenCompletedStep(-1);
    setCompletedSteps(new Set<number>());
  }, [initialStep]);

  // Current step for progress bar (1-based, capped at totalSteps)
  const progressStep = Math.min(activeStep + 1, totalSteps);

  return {
    activeStep,
    completedSteps,
    openCompletedStep,
    progressStep,
    completeStep,
    getStepState,
    isStepOpen,
    handleStepToggle,
    setActiveStep,
    resetWizard,
  };
}
