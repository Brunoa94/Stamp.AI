"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/features/ui/button";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import type { PromoImageType } from "../../../lib/constants/promoSections";
import { PROMO_CAROUSEL_DISPLAY_MS } from "../../../lib/constants/promoSections";

interface PropsI {
  images: PromoImageType[];
  className?: string;
  /** Override default display timing (ms) */
  displayMs?: number;
}

export function PromoCarousel({
  images,
  className,
  displayMs = PROMO_CAROUSEL_DISPLAY_MS,
}: PropsI) {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const intervalId = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, displayMs);

    return () => clearInterval(intervalId);
  }, [images.length, displayMs, prefersReducedMotion]);

  // Show images in a tight 2x2 grid with the active one highlighted
  const gridImages = images.slice(0, 4);

  return (
    <div
      className={cn(
        "relative rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) p-2 shadow-(--shadow-stamp-card)",
        className,
      )}
    >
      {/* 2x2 Grid layout */}
      <div className="grid grid-cols-2 gap-2">
        {gridImages.map((image, index) => {
          const isActive = index === activeIndex % gridImages.length;

          return (
            <div
              key={image.src}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg bg-(--color-stamp-sage)",
                "transition-all duration-500 ease-out",
                "border-2",
                isActive
                  ? "z-10 border-(--color-stamp-gold)"
                  : "border-transparent opacity-75 hover:opacity-100",
              )}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 200px"
                className="object-cover"
                priority={index === 0}
              />
              {/* Subtle overlay for non-active */}
              <div
                className={cn(
                  "absolute inset-0 bg-(--color-stamp-chocolate)/10 transition-opacity duration-500",
                  isActive ? "opacity-0" : "opacity-100",
                )}
              />
            </div>
          );
        })}
      </div>

      {/* Progress indicator bar */}
      <div className="mt-3 mb-1 flex justify-center gap-1.5">
        {gridImages.map((_, index) => (
          <Button
            key={index}
            type="button"
            variant="unstyled"
            onClick={() => setActiveIndex(index)}
            className={cn(
              "h-1 rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-(--color-stamp-chocolate) focus-visible:ring-offset-2",
              index === activeIndex % gridImages.length
                ? "w-6 bg-(--color-stamp-gold)"
                : "w-2 bg-(--color-stamp-chocolate)/20 hover:bg-(--color-stamp-chocolate)/40",
            )}
            aria-label={`View image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
