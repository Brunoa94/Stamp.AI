import { StepCircle } from "./StepCircle";
import { StepLabel } from "./StepLabel";

interface Step {
  number: number;
  label: string;
  description: string;
}

interface ProgressStepProps {
  step: Step;
  isComplete: boolean;
  isActive: boolean;
  isProcessing: boolean;
  showConnector: boolean;
}

/**
 * ProgressStep - Complete step component
 * Combines circle, label, and connector line
 */
export function ProgressStep({
  step,
  isComplete,
  isActive,
  isProcessing,
  showConnector,
}: ProgressStepProps) {
  return (
    <div className="flex flex-col items-center relative px-2 md:px-4 z-10 flex-1">
      <StepCircle
        stepNumber={step.number}
        isComplete={isComplete}
        isActive={isActive}
        isProcessing={isProcessing}
      />

      <StepLabel
        label={step.label}
        description={step.description}
        isActive={isActive}
        isComplete={isComplete}
      />

      {/* Connector line for mobile */}
      {showConnector && (
        <div className="absolute top-7 md:top-8 left-full w-full h-0.5 bg-gray-200 -z-20 md:hidden" />
      )}
    </div>
  );
}
