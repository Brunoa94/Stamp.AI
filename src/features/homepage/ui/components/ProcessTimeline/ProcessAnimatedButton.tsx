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

  const buttonContent = (
    <>
      {/* Background fill that builds up */}
      <div
        className="absolute inset-0 bg-(--color-stamp-gold) origin-left"
        style={{
          transform: `scaleX(${overallProgress})`,
          transition: "transform 0.15s ease-out",
        }}
      />

      {/* Button content */}
      <span
        className={cn(
          "relative z-10 font-heading text-lg md:text-xl font-bold uppercase tracking-[0.125em]",
          "transition-colors duration-300",
          overallProgress > 0.5
            ? "text-(--color-stamp-chocolate)"
            : "text-(--color-stamp-white)",
        )}
      >
        Start creating, stamp it!
      </span>
      <ArrowRight
        className={cn(
          "relative z-10 h-5 w-5 md:h-6 md:w-6 transition-all duration-300",
          overallProgress > 0.5
            ? "text-(--color-stamp-chocolate)"
            : "text-(--color-stamp-white)",
          isComplete && "group-hover:translate-x-2",
        )}
      />
    </>
  );

  const baseClasses = cn(
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden",
    "h-auto px-16 py-7 md:px-24 md:py-9",
    "bg-(--color-stamp-chocolate) shadow-md",
    "transition-all duration-300",
    isComplete
      ? "cursor-pointer hover:shadow-lg active:scale-[0.98]"
      : "cursor-not-allowed opacity-70",
    className,
  );

  if (isComplete) {
    return (
      <Link href="/stamp" className={baseClasses}>
        {buttonContent}
      </Link>
    );
  }

  return (
    <div className={baseClasses} aria-disabled="true">
      {buttonContent}
    </div>
  );
}
