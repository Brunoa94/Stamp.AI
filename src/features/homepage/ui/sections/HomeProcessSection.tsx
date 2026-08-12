/**
 * HomeProcessSection
 *
 * "The Process" — scroll-driven timeline that sticks to top
 * and cycles through steps as the user scrolls.
 */

"use client";

import { useTranslations } from "next-intl";
import { HomeSectionHeader } from "../components/HomeSectionHeader";
import { ProcessTimeline } from "../components/ProcessTimeline/ProcessTimeline";
import { SectionReveal } from "../components/SectionReveal";

export function HomeProcessSection() {
  const t = useTranslations("home.process");

  return (
    <section id="process" className="bg-(--color-stamp-cream)">
      <div className="px-6 pt-16 pb-8 lg:px-12 xl:px-24">
        <SectionReveal className="mx-auto max-w-screen-2xl" parallax fadeOnScroll>
          <HomeSectionHeader
            title={t("title")}
            accent={t("accent")}
            label={t("label")}
          />
        </SectionReveal>
      </div>

      <ProcessTimeline />
    </section>
  );
}
