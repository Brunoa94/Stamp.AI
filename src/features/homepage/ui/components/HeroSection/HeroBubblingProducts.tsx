"use client";

/**
 * HeroBubblingProducts
 *
 * Product images that bubble up from the bottom driven by wheel events.
 * The section doesn't scroll - wheel input drives the animation progress.
 *
 * Performance optimizations:
 * - Uses requestAnimationFrame for smooth 60fps animation
 * - Stable event handlers via refs to prevent memory leaks
 * - Prevents excessive re-renders with ref-based progress tracking
 */

import { useEffect, useRef, useMemo } from "react";
import { HERO_BUBBLING_PRODUCTS } from "../../../lib/constants/homepageContent";
import { BubblingProduct } from "./BubblingProduct";

// Sensitivity for wheel-to-progress conversion (higher = slower animation)
const WHEEL_SENSITIVITY = 800;

export function HeroBubblingProducts() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Use refs for animation state to avoid re-renders during animation
  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);
  const touchStartY = useRef<number | null>(null);

  // Memoize products to avoid re-creating on every render
  const products = useMemo(() => HERO_BUBBLING_PRODUCTS, []);

  useEffect(() => {
    const container = containerRef.current?.parentElement;
    if (!container) return;

    // Set initial progress CSS variable
    if (containerRef.current) {
      containerRef.current.style.setProperty("--bubble-progress", "0");
    }

    // Animation loop - defined inside useEffect for stable reference
    const animate = () => {
      const current = progressRef.current;
      const target = targetProgressRef.current;
      const diff = target - current;
      const lerpFactor = 0.12;

      if (Math.abs(diff) > 0.001) {
        const newProgress = current + diff * lerpFactor;
        progressRef.current = newProgress;

        if (containerRef.current) {
          containerRef.current.style.setProperty(
            "--bubble-progress",
            newProgress.toString()
          );
        }

        rafIdRef.current = requestAnimationFrame(animate);
      } else {
        progressRef.current = target;
        if (containerRef.current) {
          containerRef.current.style.setProperty(
            "--bubble-progress",
            target.toString()
          );
        }
        isAnimatingRef.current = false;
        rafIdRef.current = null;
      }
    };

    const startAnimation = () => {
      if (!isAnimatingRef.current) {
        isAnimatingRef.current = true;
        rafIdRef.current = requestAnimationFrame(animate);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      const currentTarget = targetProgressRef.current;
      const canScrollDown = e.deltaY > 0 && currentTarget < 1;
      const canScrollUp = e.deltaY < 0 && currentTarget > 0;

      if (canScrollDown || canScrollUp) {
        e.preventDefault();
        const normalizedDelta = e.deltaY / WHEEL_SENSITIVITY;
        const newTarget = Math.max(0, Math.min(1, currentTarget + normalizedDelta));
        targetProgressRef.current = newTarget;
        startAnimation();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
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
    };

    const handleTouchEnd = () => {
      touchStartY.current = null;
    };

    // Add event listeners
    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    // Cleanup function
    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, []); // Empty dependency array - runs once on mount

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
