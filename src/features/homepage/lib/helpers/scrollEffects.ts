/**
 * Scroll Effects Helpers
 *
 * Pure functions for calculating parallax and fade effects
 * based on scroll progress within the viewport.
 */

const PARALLAX_MOVEMENT_PX = 60;
const FADE_IN_END = 0.15;
const FADE_OUT_START = 0.85;

/**
 * Calculate parallax transform based on scroll progress.
 * Returns a CSS translateY value that moves the element as it scrolls.
 *
 * @param progress - Scroll progress from 0 (top of viewport) to 1 (bottom)
 * @param factor - Movement intensity multiplier (default: 0.3)
 */
export function getParallaxTransform(progress: number, factor: number): string {
  const translateY = (progress - 0.5) * PARALLAX_MOVEMENT_PX * factor;
  return `translateY(${translateY}px)`;
}

/**
 * Calculate opacity based on scroll progress with fade edges.
 * Fades in at the top of viewport and fades out at the bottom.
 *
 * @param progress - Scroll progress from 0 (top of viewport) to 1 (bottom)
 */
export function getFadeOpacity(progress: number): number {
  if (progress < FADE_IN_END) {
    return progress / FADE_IN_END;
  }
  if (progress > FADE_OUT_START) {
    return (1 - progress) / (1 - FADE_OUT_START);
  }
  return 1;
}
