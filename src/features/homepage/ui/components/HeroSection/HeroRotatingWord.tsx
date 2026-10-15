"use client";

import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import {
  HERO_ROTATING_WORD_IDS,
  HERO_ROTATING_WORD_INTERVAL_MS,
} from "@/features/homepage/lib/constants/heroShowcase";
import { getRotatingWordState } from "@/features/homepage/lib/helpers/heroShowcase";
import { useCycleIndex } from "@/features/homepage/lib/hooks/useCycleIndex";
import type { HeroRotatingWordStateType } from "@/features/homepage/lib/types/heroShowcase";
import { PencilUnderline } from "./PencilUnderline";

const stateClasses: Record<HeroRotatingWordStateType, string> = {
  active: "translate-y-0 opacity-100 blur-none",
  leaving: "-translate-y-1/2 opacity-0 blur-sm",
  waiting: "translate-y-1/2 opacity-0 blur-sm",
};

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
    <Span variant="script" className="relative inline-grid normal-case text-(--color-stamp-taupe)">
      <Span unstyled className="sr-only">
        {`${t(HERO_ROTATING_WORD_IDS[0])}.`}
      </Span>
      {HERO_ROTATING_WORD_IDS.map((id, index) => (
        <Span
          key={id}
          unstyled
          aria-hidden="true"
          className={cn(
            "col-start-1 row-start-1 whitespace-nowrap transition-all duration-500 ease-snap",
            stateClasses[getRotatingWordState(index, activeIndex, total)],
          )}
        >
          {`${t(id)}.`}
        </Span>
      ))}
      <PencilUnderline key={activeIndex} delay={200} className="-bottom-2 text-(--color-stamp-gold)" />
    </Span>
  );
}
