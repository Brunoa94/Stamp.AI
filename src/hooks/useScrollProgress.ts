"use client";

import { useEffect, useState, type RefObject } from "react";

interface ScrollProgressResult {
  /** Progress value from 0 (entering viewport) to 1 (leaving viewport) */
  progress: number;
  /** Current scroll Y position */
  scrollY: number;
}

/**
 * Custom hook to track scroll progress of an element through the viewport
 * @param ref - Reference to the element to track
 * @param enabled - Whether to enable scroll tracking (default: true)
 * @returns Object containing progress (0-1) and scrollY position
 */
export function useScrollProgress<T extends HTMLElement = HTMLDivElement>(
  ref: RefObject<T | null>,
  enabled: boolean = true
): ScrollProgressResult {
  const [scrollY, setScrollY] = useState(0);
  const [elementTop, setElementTop] = useState(0);
  const [elementHeight, setElementHeight] = useState(0);

  // Update element position on mount and resize
  useEffect(() => {
    if (!enabled) return;

    const updatePosition = () => {
      const element = ref.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setElementTop(rect.top + scrollTop);
      setElementHeight(element.offsetHeight);
      setScrollY(scrollTop);
    };

    updatePosition();

    window.addEventListener("resize", updatePosition, { passive: true });
    return () => window.removeEventListener("resize", updatePosition);
  }, [ref, enabled]);

  // Track scroll position
  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      setScrollY(window.scrollY || document.documentElement.scrollTop);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [enabled]);

  // Calculate progress (0 = entering from bottom, 1 = leaving from top)
  const windowHeight = typeof window !== "undefined" ? window.innerHeight : 800;
  const totalTravel = windowHeight + elementHeight;
  const traveled = scrollY + windowHeight - elementTop;
  const progress = Math.max(0, Math.min(1, traveled / totalTravel));

  return { progress, scrollY };
}
