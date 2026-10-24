"use client";

import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import {
  HERO_ROTATING_WORD_IDS,
  HERO_ROTATING_WORD_INTERVAL_MS,
} from "@/features/homepage/lib/constants/heroShowcase";
import { heroRotatingWordVariants } from "@/features/homepage/lib/variants/heroRotatingWordVariants";
import { getRotatingWordState } from "@/features/homepage/lib/helpers/heroShowcase";
import { useCycleIndex } from "@/features/homepage/lib/hooks/useCycleIndex";
import { PencilUnderline } from "./PencilUnderline";

/**
 * HeroRotatingWord
 *
 * The handwritten last word of the hero headline. It cycles through products
 * ("thing", "tees", "totes"…), each sliding up into place with a fresh pencil
 * underline. All words share one grid cell so the line never reflows.
 * Screen readers hear only the first word.
 */
export function HeroRotatingWord() {
  const t = useTranslations("home.hero.rotatingWords");
  const isReducedMotion = useReducedMotion();
  const total = HERO_ROTATING_WORD_IDS.length;
  const activeIndex = useCycleIndex(total, HERO_ROTATING_WORD_INTERVAL_MS, isReducedMotion);

  return (
    <Span variant="script" className="relative inline-grid justify-items-center normal-case text-(--color-stamp-gold-light) xl:justify-items-start">
      <Span unstyled className="sr-only">
        {`${t(HERO_ROTATING_WORD_IDS[0])}.`}
      </Span>
      {HERO_ROTATING_WORD_IDS.map((id, index) => (
        <Span
          key={id}
          unstyled
          aria-hidden="true"
          className={heroRotatingWordVariants({
            state: getRotatingWordState(index, activeIndex, total),
          })}
        >
          {`${t(id)}.`}
        </Span>
      ))}
      <PencilUnderline key={activeIndex} delay={200} className="-bottom-2 text-(--color-stamp-gold-light)" />
    </Span>
  );
}
