"use client";

/**
 * ProcessStickyCarousel
 *
 * "The Process" as a horizontal carousel: the section pins to the viewport
 * while the page scrolls through it, and that scroll slides a track of step
 * cards sideways, ending on the visitor's own step, stamping their idea.
 * A progress bar under the track shows the current step.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { List } from "@/features/ui/list";
import {
  HOME_PROCESS_STAMP_STEP_NUMBER,
  HOME_PROCESS_STEPS,
} from "@/features/homepage/lib/constants/homepageContent";
import {
  getProcessCarouselFrame,
  getProcessSlideEmphasis,
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

export function ProcessStickyCarousel() {
  const t = useTranslations("home.process");
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState<ProcessCarouselFrameT>(INITIAL_FRAME);

  useEffect(() => {
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
        setFrame(
          getProcessCarouselFrame({
            scrolled: -rect.top,
            scrollable: rect.height - window.innerHeight,
            slideCount: SLIDE_COUNT,
            trackWidth: track.offsetWidth,
            viewportWidth: viewport.clientWidth,
          }),
        );
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
  }, []);

  // The track moves with the page scroll, so a keyboard user reaching the
  // CTA is scrolled to the end of the section, where the last slide shows.
  const showLastSlide = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { bottom } = container.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + bottom - window.innerHeight });
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: `${100 + (SLIDE_COUNT - 1) * SLIDE_SCROLL_VH}vh` }}
    >
      {/* Top padding clears the fixed header (h-16, lg:h-24) */}
      <div className="sticky top-0 flex h-screen flex-col justify-center gap-6 overflow-hidden pt-16 pb-6 lg:gap-10 lg:pt-24 lg:pb-10">
        <div className="px-6 lg:px-12 xl:px-24">
          <div className="mx-auto max-w-screen-2xl">
            <HomeSectionHeader title={t("title")} accent={t("accent")} label={t("label")} />
          </div>
        </div>

        <div ref={viewportRef} className="w-full">
          <div
            ref={trackRef}
            className="w-max px-6 will-change-transform lg:px-12 xl:px-24"
            style={{ transform: `translate3d(${frame.translateX}px, 0, 0)` }}
          >
            <List as="ol" aria-label={t("carouselAria")} className="flex items-stretch gap-4 lg:gap-8">
              {HOME_PROCESS_STEPS.map((step, index) => (
                <ProcessSlideCard
                  key={step.id}
                  step={step}
                  title={t(`steps.${step.id}.title`)}
                  description={t(`steps.${step.id}.description`)}
                  emphasis={getProcessSlideEmphasis(index, frame.progress, SLIDE_COUNT)}
                />
              ))}
              <ProcessStampSlide
                number={HOME_PROCESS_STAMP_STEP_NUMBER}
                emphasis={getProcessSlideEmphasis(SLIDE_COUNT - 1, frame.progress, SLIDE_COUNT)}
                onCtaFocus={showLastSlide}
              />
            </List>
          </div>
        </div>

        <div className="px-6 lg:px-12 xl:px-24">
          <div className="mx-auto max-w-screen-2xl">
            <ProcessProgress
              progress={frame.progress}
              activeIndex={frame.activeIndex}
              total={SLIDE_COUNT}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
