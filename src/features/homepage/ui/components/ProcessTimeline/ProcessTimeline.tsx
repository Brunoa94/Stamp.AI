"use client";

/**
 * ProcessTimeline
 *
 * Scroll-driven timeline that sticks to top and cycles through steps
 * as the user scrolls. Compact design with full-width layout.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Span } from "@/features/ui/span";
import { HOME_PROCESS_STEPS } from "../../../lib/constants/homepageContent";
import { ProcessTimelineStep } from "./ProcessTimelineStep";

// Height per step in vh units (controls scroll speed)
const STEP_HEIGHT_VH = 60;

export function ProcessTimeline() {
  const t = useTranslations("home.process");
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const totalSteps = HOME_PROCESS_STEPS.length;

  // Calculate which step is active based on scroll progress
  const activeStepIndex = Math.min(
    Math.floor(scrollProgress * totalSteps),
    totalSteps - 1,
  );

  // Progress within the current step (0 to 1)
  const stepProgress = (scrollProgress * totalSteps) % 1;

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const stickyHeight = viewportHeight * 0.6; // Height of sticky content
    const scrollableDistance = rect.height - stickyHeight;
    const scrolledIntoSection = -rect.top;

    const progress = Math.max(
      0,
      Math.min(1, scrolledIntoSection / scrollableDistance),
    );

    setScrollProgress(progress);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Total height: enough to scroll through all steps
  const totalHeight = `${totalSteps * STEP_HEIGHT_VH}vh`;

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: totalHeight }}
    >
      {/* Sticky container */}
      <div className="sticky top-0 lg:top-24 px-6 py-12 lg:pt-0 lg:px-12 xl:px-24">
        <div className="mx-auto max-w-screen-2xl">
          {/* Steps viewport */}
          <div className="relative h-56 sm:h-64 md:h-72">
            {HOME_PROCESS_STEPS.map((step, index) => {
              const isPast = index < activeStepIndex;
              const isActive = index === activeStepIndex;

              let individualProgress = 0;
              if (isPast) {
                individualProgress = 1;
              } else if (isActive) {
                individualProgress = stepProgress;
              } else if (index === activeStepIndex + 1) {
                individualProgress = Math.max(0, stepProgress - 0.5) * 2;
              }

              return (
                <ProcessTimelineStep
                  key={step.id}
                  number={step.number}
                  title={t(`steps.${step.id}.title`)}
                  description={t(`steps.${step.id}.description`)}
                  isActive={isActive}
                  isPast={isPast}
                  progress={individualProgress}
                />
              );
            })}
          </div>

          {/* Progress bar and counter */}
          <div className="mt-8 flex items-center gap-6">
            {/* Step dots */}
            <div className="flex gap-3">
              {HOME_PROCESS_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-2 w-2 rounded-full transition-all duration-300",
                    index === activeStepIndex
                      ? "bg-(--color-stamp-gold) scale-125"
                      : index < activeStepIndex
                        ? "bg-(--color-stamp-gold)/60"
                        : "bg-(--color-stamp-chocolate)/20",
                  )}
                />
              ))}
            </div>

            {/* Progress bar */}
            <div className="flex-1 h-px bg-(--color-stamp-chocolate)/10">
              <div
                className="h-full bg-(--color-stamp-gold) transition-all duration-150"
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>

            {/* Step counter */}
            <Span
              variant="micro"
              className="text-(--color-stamp-chocolate)/40 tabular-nums"
            >
              {String(activeStepIndex + 1).padStart(2, "0")} /{" "}
              {String(totalSteps).padStart(2, "0")}
            </Span>
          </div>

          {/* Footer text */}
          <div className="mt-4">
            <Span
              variant="serif"
              className="text-sm text-(--color-stamp-taupe)/60"
            >
              {t("footer")}
            </Span>
          </div>
        </div>
      </div>
    </div>
  );
}
