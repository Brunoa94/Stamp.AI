"use client";

import { ReactNode } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { checkoutTheme } from "@/theme";
import { Button } from "@/features/ui/button";
import type { StepStateT } from "@/hooks/useMultiStepWizard";

type StepState = StepStateT;

interface CheckoutAccordionStepProps {
  stepNumber: string;
  title: string;
  state: StepState;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function CheckoutAccordionStep({
  stepNumber,
  title,
  state,
  isOpen,
  onToggle,
  children,
}: CheckoutAccordionStepProps) {
  const m = checkoutTheme.mobile;

  return (
    <div
      className={cn(
        m.stepCard.base,
        state === "active" && m.stepCard.active,
        state === "complete" && m.stepCard.complete,
        state === "incomplete" && m.stepCard.incomplete,
      )}
    >
      {/* Step header – clickable */}
      <Button
        type="button"
        variant="ghost"
        onClick={onToggle}
        className={m.stepHeader.wrapper}
      >
        {/* Circle */}
        {state === "complete" ? (
          <div className={m.stepHeader.circleComplete}>
            <Check className="w-4 h-4 text-emerald-500" strokeWidth={2.5} />
          </div>
        ) : (
          <div
            className={
              state === "active"
                ? m.stepHeader.circleActive
                : m.stepHeader.circleIncomplete
            }
          >
            {stepNumber}
          </div>
        )}

        {/* Title + status */}
        <div className={m.stepHeader.info}>
          <span className={m.stepHeader.title}>{title}</span>
          <span
            className={
              state === "active"
                ? m.stepHeader.statusActive
                : state === "complete"
                  ? m.stepHeader.statusComplete
                  : m.stepHeader.statusIncomplete
            }
          >
            {state === "active"
              ? "In Progress"
              : state === "complete"
                ? "Completed"
                : "Incomplete"}
          </span>
        </div>

        {/* Chevron */}
        <ChevronDown
          className={cn(m.stepHeader.chevron, isOpen && "rotate-180")}
        />
      </Button>

      {/* Content */}
      <div className={cn(m.stepContent, !isOpen && "hidden")}>{children}</div>
    </div>
  );
}
