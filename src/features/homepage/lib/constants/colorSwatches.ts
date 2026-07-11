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

const COLOR_KEYWORD_HEX_MAP: Record<string, string> = {
  black: "#000000",
  white: "#FFFFFF",
  red: "#DC143C",
  blue: "#2563EB",
  navy: "#000080",
  green: "#16A34A",
  yellow: "#FACC15",
  orange: "#FF8200",
  purple: "#7C3AED",
  pink: "#EC4899",
  gray: "#6B7280",
  grey: "#6B7280",
  brown: "#78350F",
  beige: "#F5F5DC",
  maroon: "#800000",
  burgundy: "#7F1D1D",
  charcoal: "#36454F",
  heather: "#9CA3AF",
  olive: "#4B5320",
  mint: "#86EFAC",
  teal: "#0D9488",
  cyan: "#06B6D4",
  gold: "#D4AF37",
  cream: "#FFF8E1",
  ivory: "#FFFFF0",
};

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

  const normalized = colorName.trim();

  // If database already returns a hex value, trust it.
  if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(normalized)) {
    return normalized;
  }

  // Exact key match first.
  if (COLOR_HEX_MAP[normalized]) {
    return COLOR_HEX_MAP[normalized];
  }

  // Case-insensitive key match for DB values like "black" / "BLACK".
  const key = Object.keys(COLOR_HEX_MAP).find(
    (entry) => entry.toLowerCase() === normalized.toLowerCase(),
  );

  if (key) {
    return COLOR_HEX_MAP[key];
  }

  const normalizedLower = normalized.toLowerCase();

  // Fallback to fuzzy matching for provider names like
  // "Heather Navy", "Dark Grey", "Royal Blue", etc.
  const fuzzyKey = Object.keys(COLOR_KEYWORD_HEX_MAP).find((entry) =>
    normalizedLower.includes(entry),
  );

  if (fuzzyKey) {
    return COLOR_KEYWORD_HEX_MAP[fuzzyKey];
  }

  return DEFAULT_COLOR;
}

/**
 * Get contrast border color (white for dark colors, black for light colors)
 */
export function getBorderColor(hex: string): string {
  const rgb = hexToRgb(hex);
  const luminance = calculateLuminance(rgb);
  return luminance > LUMINANCE_THRESHOLD ? DARK_BORDER : LIGHT_BORDER;
}
