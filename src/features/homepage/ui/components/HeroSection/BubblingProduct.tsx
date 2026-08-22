"use client";

/**
 * BubblingProduct
 *
 * Individual product image that animates based on scroll progress.
 * Part of the HeroBubblingProducts composition.
 *
 * Performance optimizations:
 * - Uses CSS custom properties (--bubble-progress) set by parent
 * - All transforms computed in CSS for GPU acceleration
 * - No React re-renders during animation
 * - will-change hints for compositor layer promotion
 */

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { type HeroBubblingProductType } from "../../../lib/constants/homepageContent";

const SIZE_CLASSES = {
  sm: "w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40",
  md: "w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52",
  lg: "w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64",
};

interface PropsI {
  product: HeroBubblingProductType;
  index: number;
}

export function BubblingProduct({ product, index }: PropsI) {
  // Memoize static calculations that don't depend on progress
  const staticStyles = useMemo(() => {
    // Side products (left/right edges) are positioned lower
    const isSideProduct = product.startX <= 15 || product.startX >= 75;
    const sideOffset = isSideProduct ? 15 : 0;
    const baseHeight =
      (product.size === "lg" ? 50 : product.size === "md" ? 40 : 30) - sideOffset;

    // Delay factor for staggered appearance
    const delayFactor = product.delay / 500;
    const appearThreshold = delayFactor * 0.05;

    // Pre-calculate rotation amount (alternating direction based on index)
    const rotationAmount = (index % 2 === 0 ? 1 : -1) * (3 + (index % 3));

    return {
      baseHeight,
      appearThreshold,
      startX: product.startX,
      rotation: rotationAmount,
    };
  }, [product.startX, product.size, product.delay, index]);

  // CSS custom properties for animation calculations
  // These are calculated in CSS using calc() for GPU acceleration
  const cssVars = {
    "--base-height": `${staticStyles.baseHeight}`,
    "--appear-threshold": `${staticStyles.appearThreshold}`,
    "--start-x": `${staticStyles.startX}`,
    "--rotation": `${staticStyles.rotation}`,
  } as React.CSSProperties;

  return (
    <div
      className={cn(
        "bubbling-product absolute pointer-events-none",
        SIZE_CLASSES[product.size]
      )}
      style={cssVars}
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
