/**
 * HomeProcessSection
 *
 * "The Process" — six protocol steps as luxury cards with oversized
 * gold step numbers that reveal sequentially when entering viewport.
 */

"use client";

import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import {
  HOME_PROCESS_STEPS,
  PROCESS_STAGGER_DELAY_MS,
} from "../../lib/constants/homepageContent";
import { HomeSectionHeader } from "../components/HomeSectionHeader";
import { HomeProcessCard } from "../components/HomeProcessCard";
import { SectionReveal } from "../components/SectionReveal";
import { useStaggeredReveal } from "@/hooks/useStaggeredReveal";

export function HomeProcessSection() {
  const t = useTranslations("home.process");

  const { containerRef, isItemVisible } = useStaggeredReveal({
    itemCount: HOME_PROCESS_STEPS.length,
    staggerDelay: PROCESS_STAGGER_DELAY_MS,
    threshold: 0.2,
    rootMargin: "0px 0px -10% 0px",
  });

  return (
    <section
      id="process"
      className="bg-(--color-stamp-cream) px-6 py-24 lg:px-12 xl:px-24"
    >
      <SectionReveal className="mx-auto max-w-screen-2xl" parallax fadeOnScroll>
        <HomeSectionHeader
          title={t("title")}
          accent={t("accent")}
          label={t("label")}
        />

        {/* Cards container - ref for staggered reveal */}
        <div ref={containerRef}>
          {/* Mobile: Horizontal carousel */}
          <div className="-mx-6 overflow-x-auto px-6 scrollbar-hide sm:hidden">
            <div className="flex w-max gap-4 pb-4">
              {HOME_PROCESS_STEPS.map((step, index) => (
                <HomeProcessCard
                  key={step.id}
                  id={step.id}
                  number={step.number}
                  title={t(`steps.${step.id}.title`)}
                  description={t(`steps.${step.id}.description`)}
                  index={index}
                  isVisible={isItemVisible(index)}
                  variant="mobile"
                />
              ))}
            </div>
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden sm:grid grid-cols-2 gap-8 lg:grid-cols-3">
            {HOME_PROCESS_STEPS.map((step, index) => (
              <HomeProcessCard
                key={step.id}
                id={step.id}
                number={step.number}
                title={t(`steps.${step.id}.title`)}
                description={t(`steps.${step.id}.description`)}
                index={index}
                isVisible={isItemVisible(index)}
                variant="desktop"
              />
            ))}
          </div>
        </div>

        <div className="mt-16 flex justify-center">
          <Span variant="sm" className="text-(--color-stamp-taupe)/40">
            {t("footer")}
          </Span>
        </div>
      </SectionReveal>
    </section>
  );
}
