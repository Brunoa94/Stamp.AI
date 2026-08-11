/**
 * HeroShowcase
 *
 * Animated hero visual: a heavyweight garment with the same AI artwork
 * cycling through different art styles, rendered as a live print on the
 * chest. A floating chip names the style currently shown.
 * Cycling is disabled when the user prefers reduced motion.
 */

"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useImageCarousel } from "@/hooks/useImageCarousel";
import { Span } from "@/features/ui/span";
import {
  HERO_SHOWCASE_ART_ASPECT,
  HERO_SHOWCASE_GARMENT,
  HERO_SHOWCASE_INTERVAL_MS,
  HERO_SHOWCASE_STYLES,
} from "../../../lib/constants/homepageContent";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false
  );
}

export function HeroShowcase() {
  const t = useTranslations("home.hero.showcase");
  const prefersReducedMotion = usePrefersReducedMotion();

  const styles = prefersReducedMotion
    ? HERO_SHOWCASE_STYLES.slice(0, 1)
    : HERO_SHOWCASE_STYLES;

  const { currentIndex } = useImageCarousel({
    images: styles.map((style) => style.src),
    interval: HERO_SHOWCASE_INTERVAL_MS,
  });

  const currentStyle = styles[currentIndex] ?? HERO_SHOWCASE_STYLES[0];

  return (
    <div className="relative aspect-square w-full overflow-hidden border border-(--color-stamp-divider) bg-(--color-stamp-white) shadow-(--shadow-stamp-card)">
      <Image
        src={HERO_SHOWCASE_GARMENT}
        alt={t("garmentAlt")}
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 45vw"
        className="object-cover"
      />

      {/* Print zone on the garment chest; multiply blend makes the artwork
          read as ink on the fabric. Positioned relative to the photo, so it
          scales with the container. */}
      <div
        aria-hidden
        className="absolute left-[37%] top-[36%] w-[26%]"
        style={{ aspectRatio: HERO_SHOWCASE_ART_ASPECT }}
      >
        {HERO_SHOWCASE_STYLES.map((style, index) => (
          <Image
            key={style.id}
            src={style.src}
            alt=""
            fill
            sizes="15vw"
            className={cn(
              "object-cover mix-blend-multiply transition-opacity duration-700 motion-reduce:transition-none",
              style.id === currentStyle.id ? "opacity-100" : "opacity-0",
              index > 0 && prefersReducedMotion && "hidden"
            )}
          />
        ))}
      </div>

      {/* Style chip - names the style currently printed */}
      <div className="absolute bottom-5 left-5 flex items-center gap-2.5 border border-(--color-stamp-divider) bg-(--color-stamp-off-white)/90 px-4 py-2.5 backdrop-blur-sm">
        <Sparkles aria-hidden className="h-4 w-4 text-(--color-stamp-gold)" />
        <Span
          variant="micro"
          className="uppercase tracking-widest text-(--color-stamp-taupe)"
        >
          {t("chipLabel")}
        </Span>
        <Span variant="sm" className="text-(--color-stamp-chocolate)">
          {t(`styles.${currentStyle.id}`)}
        </Span>
      </div>
    </div>
  );
}
