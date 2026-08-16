"use client";

/**
 * HeroBubblingProducts
 *
 * Product images that bubble up from the bottom driven by wheel events.
 * The section doesn't scroll - wheel input drives the animation progress.
 *
 * Performance optimizations:
 * - Uses requestAnimationFrame for smooth 60fps animation
 * - Accumulates wheel delta and applies changes in RAF callback
 * - Prevents excessive re-renders with ref-based progress tracking
 */

import { useEffect, useRef, useCallback, useMemo } from "react";
import { HERO_BUBBLING_PRODUCTS } from "../../../lib/constants/homepageContent";
import { BubblingProduct } from "./BubblingProduct";

interface PropsI {
  /** Callback when progress changes (0 to 1) */
  onProgressChange?: (progress: number) => void;
}

// Sensitivity for wheel-to-progress conversion (higher = slower animation)
const WHEEL_SENSITIVITY = 800;

export function HeroBubblingProducts({ onProgressChange }: PropsI) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Use refs for animation state to avoid re-renders during animation
  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);

  // Memoize products to avoid re-creating on every render
  const products = useMemo(() => HERO_BUBBLING_PRODUCTS, []);

  // Smooth animation loop using requestAnimationFrame
  const animate = useCallback(() => {
    const current = progressRef.current;
    const target = targetProgressRef.current;
    const diff = target - current;

    // Lerp factor for smooth easing (higher = snappier)
    const lerpFactor = 0.12;

    if (Math.abs(diff) > 0.001) {
      const newProgress = current + diff * lerpFactor;
      progressRef.current = newProgress;

      // Update CSS custom property on container for GPU-accelerated transforms
      if (containerRef.current) {
        containerRef.current.style.setProperty(
          "--bubble-progress",
          newProgress.toString()
        );
      }

      onProgressChange?.(newProgress);
      rafIdRef.current = requestAnimationFrame(animate);
    } else {
      // Snap to target when close enough
      progressRef.current = target;
      if (containerRef.current) {
        containerRef.current.style.setProperty(
          "--bubble-progress",
          target.toString()
        );
      }
      onProgressChange?.(target);
      isAnimatingRef.current = false;
      rafIdRef.current = null;
    }
  }, [onProgressChange]);

  // Start animation if not already running
  const startAnimation = useCallback(() => {
    if (!isAnimatingRef.current) {
      isAnimatingRef.current = true;
      rafIdRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      const currentTarget = targetProgressRef.current;

      // Only prevent default if we can still animate in the scroll direction
      const canScrollDown = e.deltaY > 0 && currentTarget < 1;
      const canScrollUp = e.deltaY < 0 && currentTarget > 0;

      if (canScrollDown || canScrollUp) {
        e.preventDefault();

        // Normalize wheel delta across browsers/devices
        const normalizedDelta = e.deltaY / WHEEL_SENSITIVITY;
        const newTarget = Math.max(0, Math.min(1, currentTarget + normalizedDelta));

        targetProgressRef.current = newTarget;
        startAnimation();
      }
    },
    [startAnimation]
  );

  // Touch support for mobile
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (touchStartY.current === null) return;

      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY.current - currentY;
      touchStartY.current = currentY;

      const currentTarget = targetProgressRef.current;
      const canScrollDown = deltaY > 0 && currentTarget < 1;
      const canScrollUp = deltaY < 0 && currentTarget > 0;

      if (canScrollDown || canScrollUp) {
        e.preventDefault();

        const normalizedDelta = deltaY / (WHEEL_SENSITIVITY * 0.5);
        const newTarget = Math.max(0, Math.min(1, currentTarget + normalizedDelta));

        targetProgressRef.current = newTarget;
        startAnimation();
      }
    },
    [startAnimation]
  );

  const handleTouchEnd = useCallback(() => {
    touchStartY.current = null;
  }, []);

  useEffect(() => {
    const container = containerRef.current?.parentElement;
    if (!container) return;

    // Set initial progress CSS variable
    if (containerRef.current) {
      containerRef.current.style.setProperty("--bubble-progress", "0");
    }

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);

      // Clean up any pending animation frame
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {/* Gradient overlay at bottom for smooth fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-(--color-stamp-off-white) to-transparent z-10" />

      {/* Bubbling products - uses CSS custom property for GPU-accelerated animation */}
      <div className="absolute inset-x-0 bottom-0 h-[70%]">
        {products.map((product, index) => (
          <BubblingProduct
            key={`${product.src}-${index}`}
            product={product}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
