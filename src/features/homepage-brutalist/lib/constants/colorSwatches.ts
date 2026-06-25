/**
 * Color Name to Hex Mapping
 *
 * Maps common t-shirt color names to hex values for display swatches
 */

const COLOR_HEX_MAP: Record<string, string> = {
  // Basic colors
  Black: "#000000",
  White: "#FFFFFF",
  Navy: "#000080",
  Red: "#DC143C",
  Royal: "#4169E1",
  Beige: "#F5F5DC",

  // Grays
  "Sport Grey": "#8B8B8B",
  Charcoal: "#36454F",
  Smoke: "#738276",

  // Earth tones
  "Dark Chocolate": "#4A2511",
  Maroon: "#800000",
  "Military Green": "#4B5320",

  // Bright colors
  Daisy: "#FFD700",
  "Tennessee Orange": "#FF8200",

  // Blues
  "Antique Sapphire": "#2B547E",

  // Reds
  "Antique Cherry Red": "#9B111E",
  Blackberry: "#4B0082",

  // Default fallback
  DEFAULT: "#CCCCCC",
} as const;

const DEFAULT_COLOR = COLOR_HEX_MAP.DEFAULT;
const DARK_BORDER = "#000000";
const LIGHT_BORDER = "#FFFFFF";
const LUMINANCE_THRESHOLD = 0.5;

// Luminance weights for sRGB color space
const LUMINANCE_WEIGHTS = {
  r: 0.299,
  g: 0.587,
  b: 0.114,
} as const;

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

/**
 * Calculate relative luminance of an RGB color
 * Uses sRGB color space weights
 */
function calculateLuminance(rgb: { r: number; g: number; b: number }): number {
  return (
    (LUMINANCE_WEIGHTS.r * rgb.r +
      LUMINANCE_WEIGHTS.g * rgb.g +
      LUMINANCE_WEIGHTS.b * rgb.b) /
    255
  );
}

/**
 * Get hex color for a color name
 */
export function getColorHex(colorName: string | null): string {
  if (!colorName) return DEFAULT_COLOR;
  return COLOR_HEX_MAP[colorName] || DEFAULT_COLOR;
}

/**
 * Get contrast border color (white for dark colors, black for light colors)
 */
export function getBorderColor(hex: string): string {
  const rgb = hexToRgb(hex);
  const luminance = calculateLuminance(rgb);
  return luminance > LUMINANCE_THRESHOLD ? DARK_BORDER : LIGHT_BORDER;
}
