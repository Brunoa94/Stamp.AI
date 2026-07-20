"use client";

import { useEffect, useState } from "react";

interface UseImageCarouselOptions {
  /** Array of image URLs to cycle through */
  images: string[];
  /** Interval between transitions (ms). Default: 2500 */
  interval?: number;
  /** Duration of transition animation (ms). Default: 500 */
  transitionDuration?: number;
}

interface UseImageCarouselResult {
  /** Current image URL */
  currentImage: string;
  /** Current image index */
  currentIndex: number;
  /** Whether currently transitioning between images */
  isTransitioning: boolean;
}

/**
 * Custom hook for cycling through images with transition state
 *
 * @param options - Configuration for carousel behavior
 * @returns Object containing current image and transition state
 */
export function useImageCarousel(
  options: UseImageCarouselOptions
): UseImageCarouselResult {
  const { images, interval = 2500, transitionDuration = 500 } = options;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((idx) => (idx + 1) % images.length);
        setIsTransitioning(false);
      }, transitionDuration);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval, transitionDuration]);

  return {
    currentImage: images[currentIndex] || "",
    currentIndex,
    isTransitioning,
  };
}
