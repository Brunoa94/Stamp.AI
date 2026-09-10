"use client";

/**
 * HeroScrollCue
 *
 * Scroll indicator shown at bottom of hero section.
 */

import { useTranslations } from "next-intl";
import { ArrowDown } from "lucide-react";
import { Span } from "@/features/ui/span";

export function HeroScrollCue() {
  const t = useTranslations("home.hero");

  return (
    <div className="flex flex-col items-center gap-2 bg-(--color-stamp-off-white)/90 backdrop-blur-sm px-4 py-2 rounded-full">
      <Span variant="micro" className="text-(--color-stamp-taupe)">
        {t("scrollCue")}
      </Span>
      <ArrowDown
        aria-hidden
        className="h-4 w-4 animate-bounce text-(--color-stamp-gold)"
      />
    </div>
  );
}
