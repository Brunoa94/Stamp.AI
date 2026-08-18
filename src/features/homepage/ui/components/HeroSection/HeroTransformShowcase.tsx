"use client";

/**
 * HeroTransformShowcase
 *
 * Animated showcase that cycles through photos or printed products.
 * Left side shows original photos, right side shows printed products.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import { Camera, Sparkles, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  IMAGE_PAIRS,
  DISPLAY_MS,
} from "@/features/homepage/lib/constants/transformShowcase";

interface PropsI {
  /** Left shows photos, right shows printed products */
  position: "left" | "right";
  startIndex?: number;
  className?: string;
}

export function HeroTransformShowcase({
  position,
  startIndex = 0,
  className,
}: PropsI) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Get image from pair based on position (left = photo, right = printed)
  const currentPair = IMAGE_PAIRS[currentIndex % IMAGE_PAIRS.length];
  const nextPair = IMAGE_PAIRS[(currentIndex + 1) % IMAGE_PAIRS.length];
  const currentImage = position === "left" ? currentPair.photo : currentPair.printed;
  const nextImage = position === "left" ? nextPair.photo : nextPair.printed;
  const label = position === "left" ? "Photo" : "Printed";
  const labelStyle = position === "left"
    ? "bg-white/90 text-(--color-stamp-chocolate)"
    : "bg-(--color-stamp-gold) text-white";

  useEffect(() => {
    const cycleTimeout = setTimeout(() => {
      setIsTransitioning(true);

      // After transition, update index
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % IMAGE_PAIRS.length);
        setIsTransitioning(false);
      }, 700);
    }, DISPLAY_MS);

    return () => {
      clearTimeout(cycleTimeout);
    };
  }, [currentIndex]);

  // Icon and badge config based on position
  const TopIcon = position === "left" ? Camera : Sparkles;
  const topBadgeText = position === "left" ? "Upload" : "Made to Order";
  const BottomIcon = position === "left" ? Sparkles : Truck;
  const bottomBadgeText = position === "left" ? "Your Design" : "Ready to Ship";

  return (
    <div
      className={cn(
        "relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80 2xl:w-96 2xl:h-96",
        className,
      )}
    >
      {/* Decorative ring */}
      <div
        className={cn(
          "absolute inset-0 rounded-full border-2 border-(--color-stamp-gold)/30",
          "animate-pulse",
        )}
      />

      {/* Current image layer - positioned lower */}
      <div
        className={cn(
          "absolute inset-x-2 top-8 bottom-2 rounded-2xl overflow-hidden shadow-lg",
          "transition-all duration-700 ease-in-out",
          isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100",
        )}
      >
        <Image
          src={currentImage.src}
          alt={currentImage.alt}
          fill
          sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, (max-width: 1024px) 256px, (max-width: 1280px) 320px, 384px"
          className="object-cover"
          priority
        />
      </div>

      {/* Next image layer (shown during transition) - positioned lower */}
      <div
        className={cn(
          "absolute inset-x-2 top-8 bottom-2 rounded-2xl overflow-hidden shadow-xl",
          "transition-all duration-700 ease-in-out",
          isTransitioning ? "opacity-100 scale-100" : "opacity-0 scale-105",
        )}
      >
        <Image
          src={nextImage.src}
          alt={nextImage.alt}
          fill
          sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, (max-width: 1024px) 256px, (max-width: 1280px) 320px, 384px"
          className="object-cover"
          priority
        />
      </div>

      {/* Top left badge with icon */}
      <div
        className={cn(
          "absolute -top-2 -left-2 sm:-top-3 sm:-left-3",
          "flex items-center gap-1.5 sm:gap-2",
          "px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2",
          "rounded-full shadow-lg",
          "bg-white border border-(--color-stamp-cream)",
          "transition-all duration-700 ease-in-out",
          isTransitioning ? "scale-90 opacity-70" : "scale-100 opacity-100",
        )}
        style={{
          animation: "float 3s ease-in-out infinite",
        }}
      >
        <TopIcon className="w-3 h-3 sm:w-4 sm:h-4 text-(--color-stamp-gold)" />
        <span className="text-[8px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wider text-(--color-stamp-chocolate) whitespace-nowrap">
          {topBadgeText}
        </span>
      </div>

      {/* Bottom right badge with icon */}
      <div
        className={cn(
          "absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3",
          "flex items-center gap-1.5 sm:gap-2",
          "px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2",
          "rounded-full shadow-lg",
          position === "left"
            ? "bg-(--color-stamp-chocolate) text-white"
            : "bg-(--color-stamp-gold) text-white",
        )}
        style={{
          animation: "bounce-subtle 2s ease-in-out infinite",
        }}
      >
        <BottomIcon className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="text-[8px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wider whitespace-nowrap">
          {bottomBadgeText}
        </span>
      </div>

      {/* Progress indicator */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1">
        {IMAGE_PAIRS.map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-colors duration-300",
              index === currentIndex % IMAGE_PAIRS.length
                ? "bg-(--color-stamp-gold)"
                : "bg-(--color-stamp-chocolate)/20",
            )}
          />
        ))}
      </div>
    </div>
  );
}
