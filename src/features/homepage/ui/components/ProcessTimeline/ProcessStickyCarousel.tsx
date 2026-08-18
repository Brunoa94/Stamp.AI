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
import Image from "next/image";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { HOME_PROCESS_STEPS } from "../../../lib/constants/homepageContent";
import { PROCESS_STEP_IMAGES } from "../../../lib/constants/processStepImages";
import { HomeSectionHeader } from "../HomeSectionHeader";

/**
 * ProcessStepper - Simple sticky bottom stepper with dots
 */
function ProcessStepper({
  activeStepIndex,
  totalSteps,
}: {
  activeStepIndex: number;
  totalSteps: number;
}) {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-(--color-stamp-cream)/95 backdrop-blur-md rounded-full shadow-lg border border-(--color-stamp-chocolate)/10">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isActive = index === activeStepIndex;
          const isCompleted = index < activeStepIndex;

          return (
            <div
              key={index}
              className={`
                w-2.5 h-2.5 rounded-full transition-all duration-200
                ${isActive
                  ? "bg-(--color-stamp-gold) scale-125"
                  : isCompleted
                    ? "bg-(--color-stamp-gold)/60"
                    : "bg-(--color-stamp-chocolate)/20"
                }
              `}
            />
          );
        })}
      </div>
    </div>
  );
}

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
        {/* Sticky stepper at bottom */}
        <ProcessStepper
          activeStepIndex={activeStepIndex}
          totalSteps={totalSteps}
        />

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
            {/* Left side - Image with slide animation */}
            <div className="hidden lg:flex items-center relative w-72 xl:w-80 h-96 xl:h-105 mt-10">
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
                    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl ring-2 ring-(--color-stamp-gold)/20">
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
                      <div className="absolute bottom-4 left-4 w-10 h-10 flex items-center justify-center bg-(--color-stamp-gold) rounded-full shadow-lg">
                        <span className="text-sm font-semibold text-(--color-stamp-cream)">
                          {step.number}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right side - Text content with crossfade */}
            <div className="w-full flex-1 max-w-2xl">
              {/* Mobile: Combined image and text with slide animations - shows prev/next */}
              <div className="lg:hidden relative h-120 sm:h-130 overflow-visible">
                {HOME_PROCESS_STEPS.map((step, index) => {
                  const isActive = index === activeStepIndex;
                  const imageData = PROCESS_STEP_IMAGES[step.id];

                  // Mobile slide animation similar to desktop
                  // Center offset positions active step in the middle
                  const stepHeight = 380; // Height of each step card (smaller for tighter spacing)
                  const centerOffset = 30; // Push content down to center in viewport
                  const baseOffset = (index - activeStepIndex) * stepHeight;
                  const scrollOffset = -stepProgress * stepHeight;
                  const translateY = centerOffset + baseOffset + scrollOffset;

                  // Opacity: active is full, prev/next are dimmed
                  let opacity = 0;
                  if (isActive) {
                    opacity = 1;
                  } else if (index === activeStepIndex + 1) {
                    // Next step fades in as we scroll
                    opacity = 0.3 + stepProgress * 0.7;
                  } else if (index === activeStepIndex - 1) {
                    // Previous step fades out
                    opacity = 0.3;
                  }

                  // Scale: active is full size, others are slightly smaller
                  const scale = isActive ? 1 : 0.92;

                  // Only render nearby steps (prev, current, next)
                  if (Math.abs(index - activeStepIndex) > 1) {
                    return null;
                  }

                  return (
                    <div
                      key={step.id}
                      className="absolute inset-x-0 flex flex-col items-center"
                      style={{
                        transform: `translateY(${translateY}px) scale(${scale})`,
                        opacity,
                        pointerEvents: isActive ? "auto" : "none",
                        transition: "transform 0.15s ease-out, opacity 0.15s ease-out",
                      }}
                    >
                      {/* Mobile image with fade - bigger images */}
                      <div className="mb-3 relative aspect-video w-full max-w-sm sm:max-w-md rounded-2xl overflow-hidden shadow-lg">
                        {imageData && (
                          <Image
                            src={imageData.src}
                            alt={imageData.alt}
                            fill
                            sizes="(max-width: 640px) 384px, 448px"
                            className="object-cover"
                            priority={index === 0}
                          />
                        )}
                        <div className="absolute bottom-3 left-3 w-8 h-8 flex items-center justify-center bg-(--color-stamp-gold) rounded-full shadow-md">
                          <span className="text-xs font-semibold text-(--color-stamp-cream)">
                            {step.number}
                          </span>
                        </div>
                      </div>

                      {/* Mobile text content - tighter spacing */}
                      <div className="text-center px-4">
                        <span className="inline-block px-3 py-1 mb-2 text-xs font-bold uppercase tracking-widest bg-(--color-stamp-gold) text-(--color-stamp-cream) rounded-full shadow-sm">
                          Step {step.number}
                        </span>

                        <Heading
                          as="h3"
                          variant="section"
                          className="mb-2 text-(--color-stamp-chocolate)"
                        >
                          {t(`steps.${step.id}.title`)}
                        </Heading>

                        <Paragraph
                          variant="loose"
                          className="text-(--color-stamp-chocolate)/70 text-sm sm:text-base leading-relaxed"
                        >
                          {t(`steps.${step.id}.description`)}
                        </Paragraph>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop: Text content - slide up/down with fade */}
              <div className="hidden lg:block relative h-112 overflow-visible">
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
                      <span className="inline-block px-3 py-1 mb-4 text-xs font-bold uppercase tracking-widest bg-(--color-stamp-gold) text-(--color-stamp-cream) rounded-full shadow-sm">
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
                        className="text-(--color-stamp-chocolate)/70 text-sm sm:text-base lg:text-lg leading-relaxed"
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
