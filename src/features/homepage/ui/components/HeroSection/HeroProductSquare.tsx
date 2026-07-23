/**
 * HeroProductSquare
 *
 * Individual product square with image carousel effect.
 * Each square cycles through its own set of images with staggered timing.
 */

"use client";

import Image from "next/image";
import { useImageCarousel } from "@/hooks/useImageCarousel";
import { cn } from "@/lib/utils";

interface HeroProductSquareProps {
  images: string[];
  /** Delay before starting the carousel (ms) - creates staggered effect */
  startDelay?: number;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Optional additional className */
  className?: string;
}

export function HeroProductSquare({
  images,
  startDelay = 0,
  size = "md",
  className,
}: HeroProductSquareProps) {
  const { currentImage, isTransitioning } = useImageCarousel({
    images,
    interval: 3000 + startDelay, // Stagger the intervals slightly
    transitionDuration: 600,
  });

  const sizeClasses = {
    sm: "h-40 w-40 lg:h-56 lg:w-56",
    md: "h-52 w-52 lg:h-72 lg:w-72",
    lg: "h-64 w-64 lg:h-96 lg:w-96",
  };

  return (
    <div className={cn("group relative", className)}>
      {/* Gold border offset */}
      <div
        aria-hidden
        className={cn(
          "absolute -bottom-2 -right-2 h-full w-full border border-(--color-stamp-gold)/40 transition-all duration-500 ease-out group-hover:-bottom-3 group-hover:-right-3",
          isTransitioning ? "scale-95 opacity-30" : "scale-100 opacity-100"
        )}
      />
      {/* Main image container */}
      <div
        className={cn(
          "relative overflow-hidden border border-(--color-stamp-divider) bg-(--color-stamp-cream) transition-all duration-500 ease-out group-hover:scale-[1.03]",
          sizeClasses[size],
          isTransitioning ? "scale-95" : "scale-100"
        )}
      >
        <Image
          src={currentImage}
          alt="Product showcase"
          fill
          sizes="(max-width: 1024px) 160px, 256px"
          className={cn(
            "object-cover transition-all duration-600 ease-out",
            isTransitioning ? "scale-110 opacity-0" : "scale-100 opacity-100"
          )}
        />
      </div>
    </div>
  );
}
