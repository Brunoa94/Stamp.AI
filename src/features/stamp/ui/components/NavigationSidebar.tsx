"use client";

import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { STAMP_STEPS } from "../../lib/constants/stampSteps";
import { useStampNavigation } from "../../lib/hooks/useStampNavigation";
import { useStampStepAccessibility } from "../../lib/hooks/useStampSelectors";

/**
 * NavigationSidebar
 *
 * Fixed sidebar navigation for the Stamp flow.
 * Displays progress through the 8-stage synthesis protocol.
 */

export function NavigationSidebar() {
  const { currentStep, goToStep } = useStampNavigation();
  const { isStepAccessible } = useStampStepAccessibility();

  return (
    <aside className="hidden lg:flex flex-col py-32 px-10 w-68 h-full fixed right-0 top-24 bg-(--color-stamp-off-white) border-l border-(--color-stamp-divider) z-40">
      {/* Header */}
      <div className="mb-16">
        <Span variant="micro" className="text-(--color-stamp-taupe) mb-2">
          Protocol Tracker
        </Span>
        <Heading
          as="h4"
          variant="question"
          className="text-(--color-stamp-chocolate)"
        >
          8-Stage Synthesis
        </Heading>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-6 flex-1" aria-label="Step navigation">
        {STAMP_STEPS.map((step, index) => {
          const stepNumber = index;
          const isActive =
            stepNumber === currentStep ||
            (stepNumber === 0 && currentStep === 0);
          const isAccessible = isStepAccessible(stepNumber);

          return (
            <Button
              key={step.id}
              variant="ghost"
              onClick={() => isAccessible && goToStep(stepNumber)}
              disabled={!isAccessible}
              className={`flex items-center justify-start gap-4 group transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] w-full text-left h-auto p-0 rounded-none hover:bg-transparent ${
                isActive
                  ? "opacity-100 -translate-x-2"
                  : isAccessible
                    ? "opacity-30 hover:opacity-60"
                    : "opacity-15 cursor-not-allowed"
              }`}
              aria-current={isActive ? "step" : undefined}
              aria-label={`Navigate to ${step.title}${!isAccessible ? " (locked)" : ""}`}
            >
              {/* Dot Indicator */}
              <div
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-(--color-stamp-gold) shadow-[0_0_15px_var(--color-stamp-gold)]"
                    : "bg-(--color-stamp-divider)"
                }`}
              />

              {/* Step Label */}
              <Span variant="micro" className="text-(--color-stamp-chocolate)">
                {step.number === "00"
                  ? "Entry"
                  : `${step.number} ${step.title}`}
              </Span>
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}
