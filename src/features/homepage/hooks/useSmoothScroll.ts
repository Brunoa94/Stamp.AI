"use client";

import { useEffect, useRef } from "react";

interface UseSmoothScrollProps {
  smoothness?: number; // 0.05 - 0.2 (lower = smoother/slower)
  enabled?: boolean;
}

export function useSmoothScroll({
  smoothness = 0.08,
  enabled = true,
}: UseSmoothScrollProps = {}) {
  const scrollTargetRef = useRef(0);
  const currentScrollRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Initialize current scroll position
    currentScrollRef.current = window.scrollY;
    scrollTargetRef.current = window.scrollY;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Update target scroll position
      scrollTargetRef.current += e.deltaY;

      // Clamp to valid scroll range
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollTargetRef.current = Math.max(0, Math.min(scrollTargetRef.current, maxScroll));
    };

    const smoothScrollStep = () => {
      // Ease towards target
      const diff = scrollTargetRef.current - currentScrollRef.current;
      currentScrollRef.current += diff * smoothness;

      // Apply the scroll
      window.scrollTo(0, currentScrollRef.current);

      // Continue animation if there's still a difference
      if (Math.abs(diff) > 0.5) {
        rafIdRef.current = requestAnimationFrame(smoothScrollStep);
      } else {
        // Snap to final position when very close
        currentScrollRef.current = scrollTargetRef.current;
        window.scrollTo(0, currentScrollRef.current);
        rafIdRef.current = null;
      }
    };

    const startSmoothScroll = () => {
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(smoothScrollStep);
      }
    };

    // Listen to wheel events
    window.addEventListener("wheel", handleWheel, { passive: false });

    // Start the animation loop on any wheel event
    window.addEventListener("wheel", startSmoothScroll);

    // Cleanup
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("wheel", startSmoothScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [smoothness, enabled]);
}
