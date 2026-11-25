"use client";

/**
 * ProcessStickyCarousel
 *
 * Brevo-style scroll-driven sticky carousel that cycles through process steps.
 * The matching flow-demo screen on the left slides up/down, text on the right crossfades.
 */

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { HOME_PROCESS_STEPS } from "../../../lib/constants/homepageContent";
import { HomeSectionHeader } from "../../components/HomeSectionHeader";
import { ProcessDesktopPreview } from "./ProcessDesktopPreview";
import { ProcessMobileCard } from "./ProcessMobileCard";
import { ProcessDesktopText } from "./ProcessDesktopText";
import {
  computeDesktopImageAnimation,
  computeMobileCardAnimation,
  computeDesktopTextAnimation,
} from "../../../lib/helpers/processAnimationHelpers";

// Height per step in vh units (controls scroll speed per step)
const STEP_HEIGHT_VH = 100;

export function ProcessStickyCarousel() {
  const t = useTranslations("home.process");
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);

  const totalSteps = HOME_PROCESS_STEPS.length;

  useEffect(() => {
    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const scrollableDistance = rect.height - viewportHeight;
        const scrolledIntoSection = -rect.top;

        const overallProgress = Math.max(
          0,
          Math.min(1, scrolledIntoSection / scrollableDistance),
        );

        const stepFloat = overallProgress * totalSteps;
        const currentStep = Math.min(Math.floor(stepFloat), totalSteps - 1);
        const progressWithinStep = stepFloat - currentStep;

        setActiveStepIndex(currentStep);
        setStepProgress(progressWithinStep);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [totalSteps]);

  const totalHeight = `${totalSteps * STEP_HEIGHT_VH}vh`;

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: totalHeight }}
    >
      {/* Sticky container */}
      <div className="sticky top-0 h-screen flex flex-col">
        {/* Section header - stays at top */}
        <div className="px-4 pt-28 pb-4 sm:px-6 lg:px-12 lg:pb-6">
          <div className="mx-auto max-w-screen-2xl">
            <HomeSectionHeader
              title={t("title")}
              accent={t("accent")}
              label={t("label")}
            />
          </div>
        </div>

        {/* Content - centred in the space under the section header; clipped on desktop so
            the screen sliding out doesn't pass over the header */}
        <div className="flex min-h-0 flex-1 items-center lg:overflow-hidden">
          <div className="mx-auto flex w-full max-w-screen-2xl flex-col items-center justify-center gap-10 px-4 sm:px-6 lg:flex-row lg:gap-16 lg:px-12 xl:gap-24">
            {/* Left side - Desktop flow-demo screen with slide animation */}
            <div className="hidden lg:flex items-center relative w-125 xl:w-150 h-125 xl:h-150 flex-[0.5]">
              {HOME_PROCESS_STEPS.map((step, index) => {
                const animation = computeDesktopImageAnimation(
                  index,
                  activeStepIndex,
                  stepProgress,
                );
                return (
                  <ProcessDesktopPreview
                    key={step.id}
                    step={step}
                    label={t(`steps.${step.id}.description`)}
                    translateY={animation.translateY}
                    opacity={animation.opacity}
                    zIndex={animation.zIndex}
                  />
                );
              })}
            </div>

            {/* Right side - Text content with crossfade */}
            <div className="w-full flex-[0.5] max-w-2xl">
              {/* Mobile: Combined flow-demo screen and text with slide animations */}
              <div className="lg:hidden relative h-124 sm:h-136 overflow-visible">
                {HOME_PROCESS_STEPS.map((step, index) => {
                  const animation = computeMobileCardAnimation(
                    index,
                    activeStepIndex,
                    stepProgress,
                  );
                  if (!animation.isVisible) return null;

                  return (
                    <ProcessMobileCard
                      key={step.id}
                      step={step}
                      title={t(`steps.${step.id}.title`)}
                      description={t(`steps.${step.id}.description`)}
                      translateY={animation.translateY}
                      opacity={animation.opacity}
                      scale={animation.scale}
                      isActive={animation.isActive}
                    />
                  );
                })}
              </div>

              {/* Desktop: Text content - slide up/down with fade */}
              <div className="hidden lg:block relative h-112 overflow-visible">
                {HOME_PROCESS_STEPS.map((step, index) => {
                  const animation = computeDesktopTextAnimation(
                    index,
                    activeStepIndex,
                    stepProgress,
                  );
                  if (!animation.isVisible) return null;

                  return (
                    <ProcessDesktopText
                      key={step.id}
                      step={step}
                      title={t(`steps.${step.id}.title`)}
                      description={t(`steps.${step.id}.description`)}
                      translateY={animation.translateY}
                      opacity={animation.opacity}
                      isActive={animation.isActive}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
