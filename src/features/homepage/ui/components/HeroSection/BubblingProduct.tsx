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
  sm: "w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28",
  md: "w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40",
  lg: "w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52",
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
  const baseHeight =
    product.size === "lg" ? 50 : product.size === "md" ? 40 : 30;
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

  return (
    <div
      className={cn(
        "absolute pointer-events-none transition-all duration-100 ease-out",
        SIZE_CLASSES[product.size]
      )}
      style={{
        left: `${product.startX + xDrift}%`,
        bottom: `${(1 - yOffset / 100) * (baseHeight + 10)}%`,
        transform: `translateX(-50%) scale(${scale}) rotate(${rotation}deg)`,
        opacity,
      }}
    >
      <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg bg-(--color-stamp-off-white)/90 backdrop-blur-sm">
        <Image
          src={product.src}
          alt={product.alt}
          fill
          sizes="(max-width: 640px) 80px, (max-width: 768px) 120px, 200px"
          className="object-cover"
          priority={index < 5}
        />
      </div>
    </div>
  );
}
