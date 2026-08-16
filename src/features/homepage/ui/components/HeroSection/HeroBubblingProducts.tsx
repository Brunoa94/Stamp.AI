"use client";

/**
 * HeroBubblingProducts
 *
 * Product images that bubble up from the bottom driven by wheel events.
 * The section doesn't scroll - wheel input drives the animation progress.
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { HERO_BUBBLING_PRODUCTS } from "../../../lib/constants/homepageContent";
import { BubblingProduct } from "./BubblingProduct";

interface PropsI {
  /** Callback when progress changes (0 to 1) */
  onProgressChange?: (progress: number) => void;
}

export function HeroBubblingProducts({ onProgressChange }: PropsI) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const accumulatedDelta = useRef(0);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      const newDelta = accumulatedDelta.current + e.deltaY;
      const newProgress = Math.max(0, Math.min(1, newDelta / 150));

      if (
        (e.deltaY > 0 && progress < 1) ||
        (e.deltaY < 0 && progress > 0)
      ) {
        e.preventDefault();
        accumulatedDelta.current = newDelta;
        setProgress(newProgress);
        onProgressChange?.(newProgress);
      }
    },
    [progress, onProgressChange]
  );

  useEffect(() => {
    const container = containerRef.current?.parentElement;
    if (!container) return;

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {/* Gradient overlay at bottom for smooth fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-(--color-stamp-off-white) to-transparent z-10" />

      {/* Bubbling products */}
      <div className="absolute inset-x-0 bottom-0 h-[70%]">
        {HERO_BUBBLING_PRODUCTS.map((product, index) => (
          <BubblingProduct
            key={`${product.src}-${index}`}
            product={product}
            progress={progress}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
