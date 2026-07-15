"use client";

import { Box } from "lucide-react";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { useStampFinalization } from "../../../lib/hooks/useStampSelectors";

/**
 * ProductionSection
 *
 * Step 7: Product mockup creation in progress
 * Protocol 07 / Production
 *
 * Note: Progress and navigation are managed by useStampProductCreation hook
 */

export function ProductionSection() {
  const { productionProgress } = useStampFinalization();

  return (
    <section
      id="step-7"
      className="h-full overflow-y-auto flex flex-col items-center justify-center p-8 md:p-16 lg:p-24 bg-white text-center border-b border-(--color-stamp-divider)"
    >
      {/* Animated Loader */}
      <div className="relative mb-12">
        <div className="absolute inset-0 w-32 h-32 border-4 border-(--color-stamp-divider) border-t-(--color-stamp-gold) rounded-full animate-spin" />
        <div className="w-32 h-32 flex items-center justify-center">
          <Box className="text-4xl text-(--color-stamp-chocolate) animate-pulse w-12 h-12" />
        </div>
      </div>

      {/* Status Text */}
      <Heading
        as="h3"
        variant="card"
        className="text-(--color-stamp-chocolate) mb-4 tracking-[0.5em]"
      >
        Creating Your Product Mockup...
      </Heading>

      <Span variant="micro" className="text-(--color-stamp-taupe) mb-12">
        Est. 15 seconds...
      </Span>

      {/* Progress Bar */}
      <div className="w-full max-w-sm">
        <div className="h-1 bg-(--color-stamp-divider) w-full rounded-full overflow-hidden">
          <div
            className="h-full bg-(--color-stamp-gold) transition-[width] duration-100 ease-linear"
            style={{ width: `${productionProgress}%` }}
          />
        </div>
      </div>
    </section>
  );
}
