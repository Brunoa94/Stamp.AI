"use client";

import { UploadCloud, Sparkles, Eye, Shirt, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/features/ui/button";
import { CreateProductSelectors } from "../context/selectors";
import { useCreateProductSubscriberActions } from "../context/actions";
import { MOBILE_STEPS } from "../constants/mobileSteps";
import { mapToSidebarStep } from "../mappers/mapToSidebarStep";

export function MobileStepNav() {
  const currentStep = CreateProductSelectors.currentStep();
  const completedSteps = CreateProductSelectors.completedSteps();
  const activeId = mapToSidebarStep(currentStep);
  const { handleSetStep } = useCreateProductSubscriberActions();

  const mappedCompletedSteps = completedSteps.map(mapToSidebarStep);
  const activeIndex = MOBILE_STEPS.findIndex((step) => step.id === activeId);

  const handleStepClick = (stepId: (typeof MOBILE_STEPS)[number]["id"]) => {
    const stepIndex = MOBILE_STEPS.findIndex((step) => step.id === stepId);
    const isAllowed =
      stepIndex <= activeIndex || mappedCompletedSteps.includes(stepId);

    if (!isAllowed) {
      return;
    }

    handleSetStep(stepId);
  };

  return (
    <nav
      className="md:hidden shrink-0 bg-white/70 backdrop-blur-md border-b border-slate-100"
      aria-label="Wizard steps"
    >
      <div className="grid grid-cols-5 w-full px-2 py-4">
        {MOBILE_STEPS.map(({ id, label, Icon }) => {
          const isActive = id === activeId;
          const isCompleted = mappedCompletedSteps.includes(id);
          const stepIndex = MOBILE_STEPS.findIndex((step) => step.id === id);
          const isClickable = stepIndex <= activeIndex || isCompleted;

          return (
            <Button
              key={id}
              type="button"
              variant="ghost"
              onClick={() => handleStepClick(id)}
              disabled={!isClickable}
              aria-current={isActive ? "step" : undefined}
              aria-label={label}
              className="w-full h-auto flex flex-col items-center gap-1.5 relative px-0 py-1 rounded-none hover:bg-transparent disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {/* Step icon bubble */}
              <div
                className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300",
                  isActive
                    ? "bg-purple-600 text-white ring-4 ring-purple-100/60 shadow-lg shadow-purple-200/50"
                    : isCompleted
                      ? "bg-purple-100 text-purple-600 border border-purple-200"
                      : "bg-white/80 text-slate-400 border border-slate-100",
                )}
              >
                <Icon className="w-7 h-7" />
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-sm font-heading uppercase tracking-wide whitespace-nowrap",
                  isActive ? "text-purple-600" : "text-slate-400",
                )}
              >
                {label}
              </span>

              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-linear-to-r from-purple-600 to-cyan-500 rounded-full" />
              )}
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
