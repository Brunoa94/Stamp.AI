"use client";

/**
 * ProcessAnimatedButton
 *
 * Animated CTA button that builds block by block as the user scrolls through
 * the 8 process steps. Each block corresponds to one step. The button
 * becomes enabled and clickable only when fully built.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/features/ui/button";
import { cn } from "@/lib/utils";

const TOTAL_BLOCKS = 8;

interface PropsI {
  /** Current active step index (0-7) */
  activeStepIndex: number;
  /** Progress within the current step (0-1) */
  stepProgress: number;
  className?: string;
}

export function ProcessAnimatedButton({
  activeStepIndex,
  stepProgress,
  className,
}: PropsI) {
  // Calculate overall progress (0-1) across all steps
  const overallProgress = (activeStepIndex + stepProgress) / TOTAL_BLOCKS;
  const isComplete = activeStepIndex >= TOTAL_BLOCKS - 1 && stepProgress > 0.8;

  const progressFill = (
    <div
      className="absolute inset-0 bg-(--color-stamp-gold) origin-left pointer-events-none"
      style={{
        transform: `scaleX(${overallProgress})`,
        transition: "transform 0.15s ease-out",
      }}
    />
  );

  const textColorClass =
    overallProgress > 0.5
      ? "text-(--color-stamp-chocolate)"
      : "text-(--color-stamp-white)";

  if (isComplete) {
    return (
      <Button
        asChild
        variant="cta"
        className={cn("group relative overflow-hidden", className)}
      >
        <Link href="/stamp">
          {progressFill}
          <span className={cn("relative z-10", textColorClass)}>
            Start creating, stamp it!
          </span>
          <ArrowRight
            className={cn(
              "relative z-10 h-5 w-5 md:h-6 md:w-6 transition-transform duration-300 group-hover:translate-x-2",
              textColorClass,
            )}
          />
        </Link>
      </Button>
    );
  }

  return (
    <Button
      variant="cta"
      disabled
      className={cn("relative overflow-hidden", className)}
      aria-disabled="true"
    >
      {progressFill}
      <span className={cn("relative z-10", textColorClass)}>
        Start creating, stamp it!
      </span>
      <ArrowRight
        className={cn(
          "relative z-10 h-5 w-5 md:h-6 md:w-6",
          textColorClass,
        )}
      />
    </Button>
  );
}
