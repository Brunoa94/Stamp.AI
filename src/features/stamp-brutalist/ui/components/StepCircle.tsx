"use client";

import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface PropsI {
  number: string;
  title: string;
  label: string;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

export function StepCircle({
  number,
  title,
  label,
  isActive,
  isCompleted,
  onClick,
}: PropsI) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "h-auto rounded-none sidebar-step group flex items-start gap-6 text-left w-full p-0",
        isActive && "active",
        isCompleted && "completed",
      )}
      type="button"
    >
      <div className="step-circle w-10 h-10 rounded-full border-2 border-ink/10 flex items-center justify-center font-anton text-sm relative z-10 bg-concrete">
        {isCompleted ? (
          <Check className="w-5 h-5" />
        ) : (
          <span className="step-num">{number}</span>
        )}
      </div>
      <div className="flex-1">
        <Heading
          variant="card"
          className={cn(
            "transition-opacity duration-300",
            isActive ? "opacity-100" : "opacity-30",
          )}
        >
          {title}
        </Heading>
        <Paragraph variant="card" className="opacity-40">
          {label}
        </Paragraph>
      </div>
    </Button>
  );
}
