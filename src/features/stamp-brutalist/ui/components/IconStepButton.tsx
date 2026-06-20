"use client";

import { LucideIcon, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";

interface PropsI {
  stepNumber: number;
  icon: LucideIcon;
  tooltip: string;
  color: "purple" | "cyan" | "orange";
  isActive: boolean;
  isCompleted: boolean;
  onStepClick: (step: number) => void;
}

const colorClasses = {
  purple: "text-brandPurple",
  cyan: "text-brandCyan",
  orange: "text-brandOrange",
};

export function IconStepButton({
  stepNumber,
  icon: Icon,
  tooltip,
  color,
  isActive,
  onStepClick,
}: PropsI) {
  return (
    <Button
      onClick={() => onStepClick(stepNumber)}
      className={cn(
        "icon-step w-12 h-12 rounded-full bg-white border flex items-center justify-center group relative p-0",
        isActive
          ? "active border-brandCyan shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          : "border-ink/5",
      )}
      data-step={stepNumber}
      type="button"
    >
      <Icon
        className={cn(
          "text-xl transition-transform",
          colorClasses[color],
          isActive && "animate-pulse",
          !isActive && "group-hover:scale-110",
          Icon === Settings && "animate-spin-slow",
        )}
        size={20}
      />

      <Span
        unstyled
        className="absolute left-full ml-5 text-ink px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:ml-4 transition-all duration-300 pointer-events-none z-50"
      >
        {tooltip}
      </Span>
    </Button>
  );
}
