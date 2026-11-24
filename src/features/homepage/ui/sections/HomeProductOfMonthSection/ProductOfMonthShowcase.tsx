"use client";

/**
 * ProductOfMonthShowcase
 *
 * The photo half of the product of the month spotlight. Opens on the blank
 * product, then crossfades through the same product printed with customer
 * designs, each photo slowly zooming in while it shows. Progress dots track
 * the photo on screen. Holds the first photo under reduced motion, and shows
 * a single still when the product has no customized photos.
 */

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Medal } from "lucide-react";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import { useCycleIndex } from "@/features/homepage/lib/hooks/useCycleIndex";
import { PRODUCT_OF_MONTH_SHOT_INTERVAL_MS } from "@/features/homepage/lib/constants/productOfMonthShowcase";
import type { ProductOfMonthShotT } from "@/features/homepage/lib/types/productOfMonth";

interface PropsI {
  blankSrc: string | null;
  name: string;
  shots: readonly ProductOfMonthShotT[];
}

export function ProductOfMonthShowcase({ blankSrc, name, shots }: PropsI) {
  const t = useTranslations("home.productOfMonth");
  const isReducedMotion = useReducedMotion();

  const frames = [
    ...(blankSrc ? [{ src: blankSrc, alt: name }] : []),
    ...shots.map((shot) => ({ src: shot.src, alt: t(`customized.${shot.altKey}`, { name }) })),
  ];
  const activeIndex = useCycleIndex(
    frames.length,
    PRODUCT_OF_MONTH_SHOT_INTERVAL_MS,
    isReducedMotion || frames.length < 2,
  );

  return (
    <div className="relative aspect-4/5 overflow-hidden bg-(--color-stamp-sage) md:aspect-auto md:min-h-144">
      {frames.length === 0 ? (
        <div className="flex h-full w-full items-center justify-center">
          <Span variant="micro" className="text-(--color-stamp-taupe)">
            {t("noImage")}
          </Span>
        </div>
      ) : (
        frames.map((frame, index) => (
          <div
            key={frame.src}
            aria-hidden={index !== activeIndex}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none",
              index === activeIndex ? "opacity-100" : "opacity-0",
            )}
          >
            <Image
              src={frame.src}
              alt={frame.alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 760px"
              className={cn(
                "object-cover transition-transform duration-3000 ease-out motion-reduce:scale-100 motion-reduce:transition-none",
                index === activeIndex ? "scale-105" : "scale-100",
              )}
            />
          </div>
        ))
      )}

      <Span
        variant="default"
        className="absolute top-5 left-5 flex items-center gap-2 rounded-md bg-(--color-stamp-gold) px-3 py-1.5 text-(--color-stamp-chocolate)"
      >
        <Medal className="size-4" aria-hidden />
        {t("badge")}
      </Span>

      {frames.length > 1 && (
        <div aria-hidden className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
          {frames.map((frame, index) => (
            <div
              key={frame.src}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                index === activeIndex ? "w-8 bg-(--color-stamp-gold)" : "w-1.5 bg-(--color-stamp-white)/80",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
