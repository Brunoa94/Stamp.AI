/**
 * Brutalist Design System
 *
 * Export all brutalist theme utilities
 */

export { brutalistColors } from "./colors";
export type { BrutalistColor } from "./colors";

export { brutalistTypography } from "./typography";
export { brutalistEffects } from "./effects";
export { brutalistComponents } from "./components";

// Re-export everything as a single theme object
export const brutalistTheme = {
  colors: require("./colors").brutalistColors,
  typography: require("./typography").brutalistTypography,
  effects: require("./effects").brutalistEffects,
  components: require("./components").brutalistComponents,
} as const;
