"use client";

import { Loader2, Cpu } from "lucide-react";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { useStampGeneration } from "../../../lib/hooks/useStampSelectors";

/**
 * GenerationSection
 *
 * Step 3: AI generation in progress
 * Protocol 03 / Generation
 *
 * Note: Progress and navigation are managed by useStampImageGeneration hook
 */

export function GenerationSection() {
  const { generationProgress } = useStampGeneration();

  return (
    <section
      id="step-3"
      className="h-full overflow-y-auto flex flex-col items-center justify-center p-8 md:p-16 lg:p-24 bg-(--color-stamp-chocolate) text-white text-center border-b border-(--color-stamp-divider)"
    >
      {/* Animated Loader */}
      <div className="relative mb-12">
        <Loader2 className="text-8xl text-(--color-stamp-gold) animate-spin opacity-30 w-32 h-32" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Cpu className="text-4xl text-white w-12 h-12 animate-pulse" />
        </div>
      </div>

      {/* Status Text */}
      <Heading
        as="h3"
        variant="card"
        className="text-white mb-6 tracking-[0.5em]"
      >
        Generating Your Design...
      </Heading>

      {/* Progress Bar */}
      <div className="w-full max-w-md">
        <div className="h-px bg-white/10 w-full relative overflow-hidden mb-4">
          <div
            className="absolute inset-y-0 left-0 bg-(--color-stamp-gold) transition-[width] duration-100 ease-linear"
            style={{ width: `${generationProgress}%` }}
          />
        </div>
        <Span variant="micro" className="text-white/40 tracking-[0.4em]">
          {generationProgress}%
        </Span>
      </div>
    </section>
  );
}
