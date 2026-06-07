/**
 * Brutalist Color Palette
 *
 * High-contrast colors for the brutalist/industrial design system
 */

export const brutalistColors = {
  // Base colors
  concrete: "#f2f2f2",  // Light background
  ink: "#0a0a0a",       // Dark text and sections

  // Brand accent colors
  brandRed: "#dc2626",
  brandPurple: "#9333ea",
  brandCyan: "#06b6d4",
  brandOrange: "#fb923c",
} as const;

export type BrutalistColor = keyof typeof brutalistColors;
