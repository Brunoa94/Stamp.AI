"use client";

/**
 * ProcessStickyCarousel
 *
 * Brevo-style scroll-driven sticky carousel that cycles through process steps.
 * Image on the left slides up/down, text on the right crossfades.
 * Includes a sticky stepper at the bottom showing current progress.
 */

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { HOME_PROCESS_STEPS } from "../../../lib/constants/homepageContent";
import { PROCESS_STEP_IMAGES } from "../../../lib/constants/processStepImages";
import { HomeSectionHeader } from "../HomeSectionHeader";
import { ProcessStepper } from "./ProcessStepper";
import { ProcessDesktopImage } from "./ProcessDesktopImage";
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
        {/* Sticky stepper at bottom - mobile only (desktop has the side rail) */}
        <div className="lg:hidden">
          <ProcessStepper
            activeStepIndex={activeStepIndex}
            totalSteps={totalSteps}
          />
        </div>

        {/* Section header - stays at top */}
        <div className="pt-20 lg:pt-24 pb-4 lg:pb-8 px-6 lg:px-12 xl:px-24">
          <div className="mx-auto max-w-screen-2xl">
            <HomeSectionHeader
              title={t("title")}
              accent={t("accent")}
              label={t("label")}
            />
          </div>
        </div>

        {/* Content - centered in remaining space */}
        <div className="flex-1 flex items-start mt-4 lg:mt-12">
          <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-30 max-w-8xl mx-auto px-6 md:px-12 lg:px-16">
            {/* Left side - Desktop image with slide animation */}
            <div className="hidden lg:flex items-center relative w-72 xl:w-80 h-96 xl:h-105 mt-10">
              {HOME_PROCESS_STEPS.map((step, index) => {
                const animation = computeDesktopImageAnimation(
                  index,
                  activeStepIndex,
                  stepProgress,
                );
                const imageData = PROCESS_STEP_IMAGES[step.id];

                return (
                  <ProcessDesktopImage
                    key={step.id}
                    step={step}
                    imageData={imageData}
                    translateY={animation.translateY}
                    opacity={animation.opacity}
                    zIndex={animation.zIndex}
                    isPriority={index === 0}
                  />
                );
              })}
            </div>

            {/* Right side - Text content with crossfade */}
            <div className="w-full flex-1 max-w-2xl">
              {/* Mobile: Combined image and text with slide animations */}
              <div className="lg:hidden relative h-120 sm:h-130 overflow-visible">
                {HOME_PROCESS_STEPS.map((step, index) => {
                  const animation = computeMobileCardAnimation(
                    index,
                    activeStepIndex,
                    stepProgress,
                  );
                  if (!animation.isVisible) return null;

                  const imageData = PROCESS_STEP_IMAGES[step.id];

                  return (
                    <ProcessMobileCard
                      key={step.id}
                      step={step}
                      imageData={imageData}
                      title={t(`steps.${step.id}.title`)}
                      description={t(`steps.${step.id}.description`)}
                      translateY={animation.translateY}
                      opacity={animation.opacity}
                      scale={animation.scale}
                      isActive={animation.isActive}
                      isPriority={index === 0}
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
