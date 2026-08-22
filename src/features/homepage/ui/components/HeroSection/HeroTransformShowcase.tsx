"use client";

/**
 * HeroTransformShowcase
 *
 * Animated showcase that cycles through photos or printed products.
 * Left side shows original photos, right side shows printed products.
 */

import { useEffect, useState } from "react";
import Image from "next/image";

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
  const currentImage =
    position === "left" ? currentPair.photo : currentPair.printed;
  const nextImage = position === "left" ? nextPair.photo : nextPair.printed;
  const label = position === "left" ? "Photo" : "Printed";
  const labelStyle =
    position === "left"
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

      {/* Top left badge - image badge for left, icon+text for right */}
      {position === "left" ? (
        <div
          className={cn(
            "absolute -top-6 -left-6 sm:-top-8 sm:-left-8 md:-top-10 md:-left-10",
            "w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32",
            "transition-all duration-700 ease-in-out",
            isTransitioning ? "scale-90 opacity-70" : "scale-100 opacity-100",
          )}
          style={{
            animation: "float 3s ease-in-out infinite",
          }}
        >
          <Image
            src="/badges/upload-badge-2.png"
            alt="Upload"
            fill
            sizes="192px"
            className="object-contain drop-shadow-lg"
          />
        </div>
      ) : null}

      {/* Bottom right badge — only shown for the right (printed) showcase */}
      {position === "right" && (
        <div
          className={cn(
            "absolute -bottom-6 -right-6 sm:-bottom-8 sm:-right-8 md:-bottom-10 md:-right-10",
            "w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36",
            "transition-all duration-700 ease-in-out",
            isTransitioning ? "scale-90 opacity-70" : "scale-100 opacity-100",
          )}
          style={{
            animation: "bounce-subtle 2s ease-in-out infinite",
          }}
        >
          <Image
            src="/badges/ready-to-ship-badge-2.png"
            alt="Ready to Ship"
            fill
            sizes="144px"
            className="object-contain drop-shadow-lg"
          />
        </div>
      )}

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
