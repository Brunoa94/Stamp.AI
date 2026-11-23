"use client";

/**
 * ProcessStickyCarousel
 *
 * "The Process" as a horizontal carousel: the section pins to the viewport
 * while the page scrolls through it, and that scroll slides a track of step
 * cards sideways, ending on the visitor's own step, stamping their idea.
 * A progress bar under the track shows the current step. With reduced
 * motion nothing is pinned or moved: the cards sit in a plain horizontal
 * list the visitor swipes or scrolls themselves.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { List } from "@/features/ui/list";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import {
  HOME_PROCESS_STAMP_STEP_NUMBER,
  HOME_PROCESS_STEPS,
} from "@/features/homepage/lib/constants/homepageContent";
import {
  getProcessCarouselFrame,
  getProcessSlideEmphasis,
  isSameProcessCarouselFrame,
  type ProcessCarouselFrameT,
} from "@/features/homepage/lib/helpers/processCarousel";
import { HomeSectionHeader } from "../../components/HomeSectionHeader";
import { ProcessSlideCard } from "./ProcessSlideCard";
import { ProcessStampSlide } from "./ProcessStampSlide";
import { ProcessProgress } from "./ProcessProgress";

// Page scroll (vh) that moves the track by one slide
const SLIDE_SCROLL_VH = 60;
// The process steps plus the closing stamp slide
const SLIDE_COUNT = HOME_PROCESS_STEPS.length + 1;

const INITIAL_FRAME: ProcessCarouselFrameT = { progress: 0, activeIndex: 0, translateX: 0 };
const AT_REST = { opacity: 1, scale: 1 };

export function ProcessStickyCarousel() {
  const t = useTranslations("home.process");
  const isReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState<ProcessCarouselFrameT>(INITIAL_FRAME);

  useEffect(() => {
    if (isReducedMotion) return;
    let rafId: number | null = null;

    const measure = () => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;
        const container = containerRef.current;
        const viewport = viewportRef.current;
        const track = trackRef.current;
        if (!container || !viewport || !track) return;

        const rect = container.getBoundingClientRect();
        const next = getProcessCarouselFrame({
          scrolled: -rect.top,
          scrollable: rect.height - window.innerHeight,
          slideCount: SLIDE_COUNT,
          trackWidth: track.offsetWidth,
          viewportWidth: viewport.clientWidth,
        });
        // Away from the section the frame stays clamped, so this skips every re-render there
        setFrame((previous) => (isSameProcessCarouselFrame(previous, next) ? previous : next));
      });
    };

    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    measure();

    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isReducedMotion]);

  // The track moves with the page scroll, so a keyboard user reaching the
  // CTA is scrolled to the end of the section, where the last slide shows.
  const showLastSlide = useCallback(() => {
    const container = containerRef.current;
    if (!container || isReducedMotion) return;

    const { bottom } = container.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + bottom - window.innerHeight });
  }, [isReducedMotion]);

  return (
    <div
      ref={containerRef}
      className="relative"
      style={isReducedMotion ? undefined : { height: `${100 + (SLIDE_COUNT - 1) * SLIDE_SCROLL_VH}vh` }}
    >
      {/* Top padding clears the fixed header (h-16, lg:h-24); justify-center-safe keeps the heading below it when the content is taller than a short screen */}
      <div
        className={cn(
          "flex flex-col gap-6 pt-16 pb-6 lg:gap-10 lg:pt-24 lg:pb-10 short:gap-3 short:pb-3",
          !isReducedMotion && "sticky top-0 h-screen justify-center-safe overflow-hidden",
        )}
      >
        <div className="px-6 lg:px-12 xl:px-24">
          <div className="mx-auto max-w-screen-2xl">
            <HomeSectionHeader title={t("title")} accent={t("accent")} label={t("label")} />
          </div>
        </div>

        <div
          ref={viewportRef}
          className={cn("w-full", isReducedMotion && "snap-x snap-mandatory scroll-px-6 overflow-x-auto lg:scroll-px-12 xl:scroll-px-24")}
        >
          <div
            ref={trackRef}
            className={cn("w-max px-6 lg:px-12 xl:px-24", !isReducedMotion && "will-change-transform")}
            style={isReducedMotion ? undefined : { transform: `translate3d(${frame.translateX}px, 0, 0)` }}
          >
            <List as="ol" aria-label={t("carouselAria")} className="flex items-stretch gap-4 lg:gap-8">
              {HOME_PROCESS_STEPS.map((step, index) => (
                <ProcessSlideCard
                  key={step.id}
                  step={step}
                  title={t(`steps.${step.id}.title`)}
                  description={t(`steps.${step.id}.description`)}
                  emphasis={isReducedMotion ? AT_REST : getProcessSlideEmphasis(index, frame.progress, SLIDE_COUNT)}
                />
              ))}
              <ProcessStampSlide
                number={HOME_PROCESS_STAMP_STEP_NUMBER}
                emphasis={isReducedMotion ? AT_REST : getProcessSlideEmphasis(SLIDE_COUNT - 1, frame.progress, SLIDE_COUNT)}
                onCtaFocus={showLastSlide}
              />
            </List>
          </div>
        </div>

        {!isReducedMotion && (
          <div className="px-6 lg:px-12 xl:px-24">
            <div className="mx-auto max-w-screen-2xl">
              <ProcessProgress
                progress={frame.progress}
                activeIndex={frame.activeIndex}
                total={SLIDE_COUNT}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
