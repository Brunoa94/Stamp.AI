"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
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
    <div className={cn("relative", className)}>
      {/* 2x2 Grid layout */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
        {gridImages.map((image, index) => {
          const isActive = index === activeIndex % gridImages.length;

          return (
            <div
              key={image.src}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg",
                "transition-all duration-500 ease-out",
                "border-2",
                isActive
                  ? "border-(--color-stamp-gold) shadow-lg scale-[1.02] z-10"
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
      <div className="mt-4 flex gap-1.5 justify-center">
        {gridImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
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
