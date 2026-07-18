/**
 * HeroScrollCue
 *
 * Scroll indicator at the bottom of the hero section.
 */

import { useTranslations } from "next-intl";
import { ArrowDown } from "lucide-react";
import { Span } from "@/features/ui/span";
import { SectionReveal } from "../SectionReveal";

const SCROLL_CUE_DELAY_MS = 120;

export function HeroScrollCue() {
  const t = useTranslations("home.hero");

  return (
    <SectionReveal className="relative z-10 mt-8" delayMs={SCROLL_CUE_DELAY_MS}>
      <div className="flex flex-col items-center gap-3">
        <Span variant="micro" className="text-(--color-stamp-taupe)">
          {t("scrollCue")}
        </Span>
        <ArrowDown
          aria-hidden
          className="h-4 w-4 animate-bounce text-(--color-stamp-gold)"
        />
      </div>
    </SectionReveal>
  );
}
