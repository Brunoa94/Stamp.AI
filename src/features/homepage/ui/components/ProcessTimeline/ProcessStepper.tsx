/**
 * ProcessStepper
 *
 * Simple sticky bottom stepper with dots indicating current progress.
 */

import { cn } from "@/lib/utils";

interface ProcessStepperPropsI {
  activeStepIndex: number;
  totalSteps: number;
}

export function ProcessStepper({
  activeStepIndex,
  totalSteps,
}: ProcessStepperPropsI) {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-(--color-stamp-cream)/95 backdrop-blur-md rounded-full shadow-lg border border-(--color-stamp-chocolate)/10">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all duration-200",
              index === activeStepIndex
                ? "bg-(--color-stamp-gold) scale-125"
                : index < activeStepIndex
                  ? "bg-(--color-stamp-gold)/60"
                  : "bg-(--color-stamp-chocolate)/20"
            )}
          />
        ))}
      </div>
    </div>
  );
}
