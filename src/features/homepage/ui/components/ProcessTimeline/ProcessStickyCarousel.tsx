"use client";

/**
 * ProcessStickyCarousel
 *
 * Brevo-style scroll-driven sticky carousel that cycles through process steps.
 * Image on the left slides up/down, text on the right crossfades.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { HOME_PROCESS_STEPS } from "../../../lib/constants/homepageContent";
import { PROCESS_STEP_IMAGES } from "../../../lib/constants/processStepImages";
import { HomeSectionHeader } from "../HomeSectionHeader";

// Height per step in vh units (controls scroll speed per step)
const STEP_HEIGHT_VH = 100;

export function ProcessStickyCarousel() {
  const t = useTranslations("home.process");
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);

  const totalSteps = HOME_PROCESS_STEPS.length;

  const handleScroll = useCallback(() => {
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
  }, [totalSteps]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const totalHeight = `${totalSteps * STEP_HEIGHT_VH}vh`;

  const currentStep = HOME_PROCESS_STEPS[activeStepIndex];
  const currentImageData = PROCESS_STEP_IMAGES[currentStep?.id];

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: totalHeight }}
    >
      {/* Sticky container */}
      <div className="sticky top-0 h-screen flex flex-col">
        {/* Section header - stays at top */}
        <div className="pt-24 pb-8 px-6 lg:px-12 xl:px-24">
          <div className="mx-auto max-w-screen-2xl">
            <HomeSectionHeader
              title={t("title")}
              accent={t("accent")}
              label={t("label")}
            />
          </div>
        </div>

        {/* Content - centered in remaining space */}
        <div className="flex-1 flex items-center">
          <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-30 max-w-8xl mx-auto px-6 md:px-12 lg:px-16">
            {/* Left side - Image with slide animation */}
            <div className="hidden lg:flex items-center relative w-72 xl:w-80 h-96 xl:h-105">
              {HOME_PROCESS_STEPS.map((step, index) => {
                const isActive = index === activeStepIndex;
                const isPast = index < activeStepIndex;
                const isFuture = index > activeStepIndex;
                const imageData = PROCESS_STEP_IMAGES[step.id];

                let translateY = 0;
                let opacity = 1;
                let zIndex = 1;

                if (isPast) {
                  translateY = -80;
                  opacity = 0;
                  zIndex = 0;
                } else if (isFuture) {
                  const distanceFromActive = index - activeStepIndex;
                  if (distanceFromActive === 1) {
                    // Next image slides up from below
                    translateY = 80 * (1 - stepProgress);
                    opacity = stepProgress;
                    zIndex = 1;
                  } else {
                    translateY = 80;
                    opacity = 0;
                    zIndex = 0;
                  }
                } else if (isActive) {
                  // Current image slides up and fades out
                  translateY = -80 * stepProgress;
                  opacity = 1 - stepProgress;
                  zIndex = 2;
                }

                return (
                  <div
                    key={step.id}
                    className="absolute inset-0"
                    style={{
                      transform: `translateY(${translateY}px)`,
                      opacity,
                      zIndex,
                    }}
                  >
                    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl">
                      {imageData && (
                        <Image
                          src={imageData.src}
                          alt={imageData.alt}
                          fill
                          sizes="400px"
                          className="object-cover"
                          priority={index === 0}
                        />
                      )}
                      <div className="absolute bottom-4 left-4 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
                        <span className="text-sm font-semibold text-(--color-stamp-chocolate)">
                          {step.number}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right side - Text content with crossfade */}
            <div className="flex-1 max-w-2xl">
              {/* Mobile image */}
              <div className="lg:hidden mb-8 relative aspect-4/3 w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-lg">
                {currentImageData && (
                  <Image
                    src={currentImageData.src}
                    alt={currentImageData.alt}
                    fill
                    sizes="(max-width: 640px) 90vw, 384px"
                    className="object-cover"
                    priority
                  />
                )}
                <div className="absolute bottom-3 left-3 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-md">
                  <span className="text-xs font-semibold text-(--color-stamp-chocolate)">
                    {currentStep?.number}
                  </span>
                </div>
              </div>

              {/* Text content - slide up/down with fade */}
              <div className="relative h-96 lg:h-112 overflow-visible">
                {HOME_PROCESS_STEPS.map((step, index) => {
                  const isActive = index === activeStepIndex;

                  // Position: center the active step, others offset by 280px each
                  // Adding centerOffset to position active step in the middle of container
                  const centerOffset = 150; // roughly half of container height minus half of step height
                  const baseOffset = (index - activeStepIndex) * 280;
                  const scrollOffset = -stepProgress * 280;
                  const translateY = centerOffset + baseOffset + scrollOffset;

                  // Opacity based on distance from center
                  let opacity = 0;
                  if (isActive) {
                    opacity = 1;
                  } else if (index === activeStepIndex + 1) {
                    // Next step fades in
                    opacity = 0.4 + stepProgress * 0.6;
                  } else if (index === activeStepIndex - 1) {
                    // Previous step (already faded)
                    opacity = 0.3;
                  }

                  // Only render nearby steps
                  if (Math.abs(index - activeStepIndex) > 1) {
                    return null;
                  }

                  return (
                    <div
                      key={step.id}
                      className="absolute inset-x-0"
                      style={{
                        transform: `translateY(${translateY}px)`,
                        opacity,
                        pointerEvents: isActive ? "auto" : "none",
                      }}
                    >
                      <span className="inline-block px-3 py-1 mb-4 text-xs font-bold uppercase tracking-widest bg-(--color-stamp-gold)/10 text-(--color-stamp-gold) rounded-full">
                        Step {step.number}
                      </span>

                      <Heading
                        as="h3"
                        variant="section"
                        className="mb-4 text-(--color-stamp-chocolate)"
                      >
                        {t(`steps.${step.id}.title`)}
                      </Heading>

                      <Paragraph
                        variant="loose"
                        className="text-(--color-stamp-taupe) text-base lg:text-lg leading-relaxed"
                      >
                        {t(`steps.${step.id}.description`)}
                      </Paragraph>
                    </div>
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
