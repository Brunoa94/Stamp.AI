/**
 * Animation utilities
 *
 * Individual exports for tree-shaking optimization.
 * Only export animations that are actually used in the codebase.
 */

/**
 * Fade in animation class
 * Used by: ProtectedRoute.tsx
 */
export const fadeInAnimation = "animate-[fadeIn_0.6s_ease-out]";

// Legacy export for backwards compatibility
export const animations = {
  fadeIn: fadeInAnimation,
} as const;
