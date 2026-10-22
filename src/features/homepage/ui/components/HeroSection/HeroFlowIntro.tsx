"use client";

import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { FLOW_STEPS } from "@/features/homepage/lib/constants/flowPreview";
import { PencilUnderline } from "./PencilUnderline";

/**
 * HeroFlowIntro
 *
 * Headline above the creation-flow demo on the hero's off-white side:
 * "You're 8 steps away from creating your dream product." The step count
 * comes from the demo's own steps so the two never disagree.
 */
export function HeroFlowIntro() {
  const t = useTranslations("home.hero");

  return (
    <Heading
      as="h2"
      variant="preview"
      className="max-w-160 text-(--color-stamp-chocolate) sm:text-5xl xl:text-4xl 2xl:text-5xl"
    >
      {t.rich("flowIntro", {
        count: FLOW_STEPS.length,
        accent: (chunks) => (
          <Span variant="script" className="relative inline-block text-(--color-stamp-gold-text)">
            {chunks}
            <PencilUnderline delay={900} className="-bottom-2 text-(--color-stamp-gold)" />
          </Span>
        ),
      })}
    </Heading>
  );
}
