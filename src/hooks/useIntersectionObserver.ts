"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

interface UseIntersectionObserverOptions {
  /** Intersection threshold (0-1). Default: 0.1 */
  threshold?: number;
  /** Root margin for earlier/later triggering. Default: "0px" */
  rootMargin?: string;
  /** Only trigger once, then disconnect. Default: true */
  triggerOnce?: boolean;
}

/**
 * Custom hook to detect when an element enters the viewport
 * @param options - Configuration options for the IntersectionObserver
 * @returns Object containing the ref to attach and visibility state
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
): {
  ref: RefObject<T | null>;
  isVisible: boolean;
} {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = true } = options;

  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}
