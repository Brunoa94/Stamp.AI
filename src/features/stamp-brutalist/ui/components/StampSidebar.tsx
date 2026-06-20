"use client";

import { useFormContext } from "react-hook-form";
import type { StampFormData } from "../../lib/schemas/stampFormSchema";
import { useStampProgress } from "../../lib/hooks/useStampProgress";
import { useStampNavigation } from "../../lib/hooks/useStampNavigation";
import { StepCircle } from "./StepCircle";
import { STAMP_STEPS } from "../../lib/constants/stampSteps";

export function StampSidebar() {
  const { watch } = useFormContext<StampFormData>();
  const currentStep = watch('currentStep');
  const progress = useStampProgress();
  const { goToStep } = useStampNavigation();

  return (
    <aside className="fixed top-0 left-0 w-80 h-screen bg-concrete border-r border-ink/5 z-40 hidden lg:block px-12 py-16">
      <div className="relative h-full">
        {/* Progress Line */}
        <div className="sidebar-progress-line">
          <div
            className="sidebar-progress-fill"
            style={{ height: `${progress}%` }}
          />
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-10 h-full overflow-y-auto hide-scrollbar">
          {STAMP_STEPS.map((step, index) => (
            <StepCircle
              key={step.id}
              number={step.number}
              title={step.title}
              label={step.label}
              isActive={currentStep === index + 1}
              isCompleted={currentStep > index + 1}
              onClick={() => goToStep(index + 1)}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
