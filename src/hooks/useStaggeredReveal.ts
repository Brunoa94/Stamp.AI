"use client";

import { useEffect, useState, type RefObject } from "react";
import { useIntersectionObserver } from "./useIntersectionObserver";

interface UseStaggeredRevealOptions {
  /** Total number of items to reveal */
  itemCount: number;
  /** Delay between each item reveal (ms). Default: 120 */
  staggerDelay?: number;
  /** Intersection observer threshold. Default: 0.2 */
  threshold?: number;
  /** Root margin for intersection observer. Default: "0px 0px -10% 0px" */
  rootMargin?: string;
}

interface UseStaggeredRevealResult {
  /** Ref to attach to the container element */
  containerRef: RefObject<HTMLDivElement | null>;
  /** Check if a specific item index should be visible */
  isItemVisible: (index: number) => boolean;
  /** Whether the section has entered the viewport */
  hasTriggered: boolean;
}

/**
 * Custom hook for staggered reveal animations
 * Items are revealed sequentially with a configurable delay
 *
 * @param options - Configuration for staggered reveal
 * @returns Object containing containerRef and visibility check function
 */
export function useStaggeredReveal(
  options: UseStaggeredRevealOptions
): UseStaggeredRevealResult {
  const {
    itemCount,
    staggerDelay = 120,
    threshold = 0.2,
    rootMargin = "0px 0px -10% 0px",
  } = options;

  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  // Use intersection observer to detect when container enters viewport
  const { ref: containerRef, isVisible: hasTriggered } =
    useIntersectionObserver<HTMLDivElement>({
      threshold,
      rootMargin,
      triggerOnce: true,
    });

  // Sequentially reveal items when section becomes visible
  useEffect(() => {
    if (!hasTriggered) return;

    const timeouts: NodeJS.Timeout[] = [];

    for (let i = 0; i < itemCount; i++) {
      const timeout = setTimeout(() => {
        setVisibleItems((prev) => new Set([...prev, i]));
      }, i * staggerDelay);
      timeouts.push(timeout);
    }

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [hasTriggered, itemCount, staggerDelay]);

  const isItemVisible = (index: number): boolean => visibleItems.has(index);

  return {
    containerRef,
    isItemVisible,
    hasTriggered,
  };
}
