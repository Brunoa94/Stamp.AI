"use client";

import Image from "next/image";
import { Camera, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { IMAGE_PAIRS } from "@/features/homepage/lib/constants/transformShowcase";

interface PropsI {
  /** Left shows photos, right shows printed products */
  position: "left" | "right";
  /** Controlled index from parent for synchronized animations */
  currentIndex: number;
  /** Whether currently transitioning between images */
  isTransitioning?: boolean;
  className?: string;
}

export function HeroTransformShowcase({
  position,
  currentIndex,
  isTransitioning = false,
  className,
}: PropsI) {
  // Icon and badge config based on position
  const TopIcon = position === "left" ? Camera : Sparkles;
  const topBadgeText =
    position === "left" ? "Uploaded photo" : "Product created";

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

      {/* All images stacked with crossfade */}
      {IMAGE_PAIRS.map((pair, index) => {
        const image = position === "left" ? pair.photo : pair.printed;
        const isActive = index === currentIndex;

        return (
          <div
            key={index}
            className={cn(
              "absolute inset-x-2 top-8 bottom-2 rounded-2xl overflow-hidden shadow-lg",
              "transition-opacity duration-700 ease-in-out",
              isActive ? "opacity-100" : "opacity-0",
            )}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, (max-width: 1024px) 256px, (max-width: 1280px) 320px, 384px"
              className="object-cover"
              priority={index === 0}
            />
          </div>
        );
      })}

      {/* Top left badge with icon */}
      <div
        className={cn(
          "absolute -top-2 -left-2 sm:-top-3 sm:-left-3",
          "flex items-center gap-1.5 sm:gap-2",
          "px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2",
          "rounded-full shadow-lg",
          "bg-white border border-(--color-stamp-cream)",
          "transition-all duration-700 ease-in-out",
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
