"use client";

import { useStampFlowStore } from "../../lib/context/StampFormContext";
import { useStampProgress } from "../../lib/hooks/useStampProgress";
import { IconStepButton } from "./IconStepButton";
import { STAMP_STEP_ICONS } from "../../lib/constants/stampSteps";
import { HelpCircle } from "lucide-react";

export function StampIconSidebar() {
  const currentStep = useStampFlowStore((s) => s.currentStep);
  const setCurrentStep = useStampFlowStore((s) => s.setCurrentStep);
  const progress = useStampProgress();

  const handleStepClick = (step: number) => {
    if (step < 1 || step > 8) return;
    setCurrentStep(step);

    setTimeout(() => {
      const section = document.getElementById(`step-${step}`);
      section?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const stepEntries = Object.entries(STAMP_STEP_ICONS);

  return (
    <aside className="sticky top-16 left-0 w-20 h-[calc(100vh-4rem)] bg-white/2 border-ink/5 z-30 hidden lg:flex flex-col items-center py-12 shrink-0">
      <div className="relative h-full flex flex-col items-center justify-between">
        <div className="icon-sidebar-progress-line">
          <div
            className="sidebar-progress-fill"
            style={{ height: `${progress}%` }}
          />
        </div>

        <div className="flex flex-col gap-10 items-center">
          {stepEntries.map(([stepNum, stepConfig]) => {
            const stepNumber = parseInt(stepNum);

            return (
              <IconStepButton
                key={stepNumber}
                stepNumber={stepNumber}
                icon={stepConfig.icon}
                tooltip={stepConfig.tooltip}
                color={stepConfig.color}
                isActive={currentStep === stepNumber}
                isCompleted={currentStep > stepNumber}
                onStepClick={handleStepClick}
              />
            );
          })}
        </div>

        <div className="mt-auto">
          <HelpCircle
            className="text-ink/10 hover:text-ink/50 transition-colors cursor-pointer"
            size={20}
          />
        </div>
      </div>
    </aside>
  );
}
