"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to detect if the window has been scrolled beyond a threshold
 * @param threshold - The scroll position threshold in pixels (default: 50)
 * @returns isScrolled - Boolean indicating if window.scrollY > threshold
 */
export function useScrolled(threshold: number = 50): boolean {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return isScrolled;
}
