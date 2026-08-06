"use client";

import { memo } from "react";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
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

function GenerationSectionComponent() {
  const t = useTranslations("stamp.generation");
  const { generationProgress } = useStampGeneration();

  return (
    <section
      id="step-3"
      className="h-full overflow-y-auto flex flex-col items-center justify-center p-8 md:p-16 lg:p-24 bg-(--color-stamp-chocolate) text-center border-b border-(--color-stamp-divider)"
    >
      {/* Animated Loader */}
      <div className="relative mb-12">
        <div className="absolute inset-0 w-32 h-32 border-4 border-white/10 border-t-(--color-stamp-gold) rounded-full animate-spin" />
        <div className="w-32 h-32 flex items-center justify-center">
          <Sparkles className="text-4xl text-(--color-stamp-gold) animate-pulse w-12 h-12" />
        </div>
      </div>

      {/* Status Text */}
      <Heading
        as="h3"
        variant="card"
        className="text-white mb-4 tracking-[0.5em]"
      >
        {t("status")}
      </Heading>

      <Span variant="micro" className="text-white/40 mb-12">
        {t("estimate")}
      </Span>

      {/* Progress Bar */}
      <div className="w-full max-w-sm">
        <div className="h-1 bg-white/10 w-full rounded-full overflow-hidden">
          <div
            className="h-full bg-(--color-stamp-gold) transition-[width] duration-100 ease-linear"
            style={{ width: `${generationProgress}%` }}
          />
        </div>
      </div>
    </section>
  );
}

export const GenerationSection = memo(GenerationSectionComponent);
