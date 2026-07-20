"use client";

import { useEffect, useState, type RefObject } from "react";

interface HeroParallaxConfig {
  /** Parallax factor for text content */
  textFactor: number;
  /** Parallax factor for image content */
  imageFactor: number;
  /** Parallax factors for blob elements */
  blobFactors: readonly [number, number, number];
  /** Distance for fade effect (px) */
  fadeDistance: number;
  /** Minimum scale value */
  scaleMin: number;
  /** Distance for scale effect (px) */
  scaleDistance: number;
}

interface UseHeroParallaxResult {
  /** Transform values for text content */
  textTransform: { translateY: number; scale: number };
  /** Transform value for image content */
  imageTranslateY: number;
  /** Transform values for blob elements */
  blobTranslates: [number, number, number];
  /** Opacity value based on scroll */
  fadeOpacity: number;
}

/**
 * Custom hook for hero section parallax effects
 * Calculates transforms based on scroll position within a section
 *
 * @param ref - Reference to the section element
 * @param config - Parallax configuration values
 * @returns Object containing calculated transform values
 */
export function useHeroParallax(
  ref: RefObject<HTMLElement | null>,
  config: HeroParallaxConfig
): UseHeroParallaxResult {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const element = ref.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        setScrollY(Math.max(0, -rect.top));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [ref]);

  const textTransform = {
    translateY: -scrollY * config.textFactor,
    scale: Math.max(config.scaleMin, 1 - scrollY / config.scaleDistance),
  };

  const imageTranslateY = scrollY * config.imageFactor;

  const blobTranslates: [number, number, number] = [
    scrollY * config.blobFactors[0],
    -scrollY * config.blobFactors[1],
    -scrollY * config.blobFactors[2],
  ];

  const fadeOpacity = Math.max(0, 1 - scrollY / config.fadeDistance);

  return {
    textTransform,
    imageTranslateY,
    blobTranslates,
    fadeOpacity,
  };
}
