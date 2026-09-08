"use client";

import { useMediaQuery } from "./useMediaQuery";

/**
 * useReducedMotion
 *
 * Returns true if the user has requested reduced motion in their OS/browser
 * settings. Components should disable or minimize animations when this is true.
 *
 * Important: Components that animate via inline styles (not CSS classes with
 * @media rules) MUST use this hook to respect the user's preference.
 *
 * @returns true if prefers-reduced-motion is set to "reduce"
 */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)", false);
}
