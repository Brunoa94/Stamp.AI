"use client";

/**
 * BubblingProduct
 *
 * Individual product image that animates based on scroll progress.
 * Part of the HeroBubblingProducts composition.
 */

import Image from "next/image";
import { cn } from "@/lib/utils";
import { type HeroBubblingProductType } from "../../../lib/constants/homepageContent";

const SIZE_CLASSES = {
  sm: "w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40",
  md: "w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52",
  lg: "w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64",
};

interface PropsI {
  product: HeroBubblingProductType;
  progress: number;
  index: number;
}

export function BubblingProduct({ product, progress, index }: PropsI) {
  // Products appear immediately with tiny staggered delays for visual interest
  const delayFactor = product.delay / 500;
  const appearThreshold = delayFactor * 0.05;
  const localProgress = Math.max(
    0,
    (progress - appearThreshold) / (1 - appearThreshold)
  );

  // Calculate Y position: starts just below visible, rises as progress increases
  // Side products (left/right edges) are positioned lower
  const isSideProduct = product.startX <= 15 || product.startX >= 75;
  const sideOffset = isSideProduct ? 15 : 0;
  const baseHeight =
    (product.size === "lg" ? 50 : product.size === "md" ? 40 : 30) - sideOffset;
  const startOffset = 5;
  const yOffset = (1 - Math.min(1, localProgress)) * (100 - startOffset);

  // Subtle horizontal drift as they rise
  const xDrift = Math.sin(index * 1.2 + localProgress * Math.PI) * 4;

  // Opacity: start partially visible, fade in fully
  const opacity = 0.3 + Math.min(1, localProgress * 1.5) * 0.7;

  // Scale animation - start slightly smaller
  const scale = 0.85 + Math.min(1, localProgress) * 0.15;

  // Rotation for organic movement
  const rotation = Math.sin(index * 2.5 + localProgress * Math.PI * 0.5) * 3;

  // Round values to avoid hydration mismatches between server/client
  const roundedLeft = Math.round((product.startX + xDrift) * 100) / 100;
  const roundedBottom = Math.round((1 - yOffset / 100) * (baseHeight + 10) * 100) / 100;
  const roundedScale = Math.round(scale * 10000) / 10000;
  const roundedRotation = Math.round(rotation * 100) / 100;
  const roundedOpacity = Math.round(opacity * 100) / 100;

  return (
    <div
      className={cn(
        "absolute pointer-events-none transition-all duration-100 ease-out",
        SIZE_CLASSES[product.size]
      )}
      style={{
        left: `${roundedLeft}%`,
        bottom: `${roundedBottom}%`,
        transform: `translateX(-50%) scale(${roundedScale}) rotate(${roundedRotation}deg)`,
        opacity: roundedOpacity,
      }}
    >
      <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg bg-(--color-stamp-off-white)/90 backdrop-blur-sm">
        <Image
          src={product.src}
          alt={product.alt}
          fill
          sizes="(max-width: 640px) 112px, (max-width: 768px) 176px, 256px"
          className="object-cover"
          priority={index < 5}
        />
      </div>
    </div>
  );
}
