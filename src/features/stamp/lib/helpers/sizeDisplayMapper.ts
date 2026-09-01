/**
 * Size Display Mapper
 *
 * Converts API size values to user-friendly display formats.
 * This is UI-only - API payloads retain original values.
 *
 * Conversions:
 * - Poster/canvas sizes: inches → cm (e.g., "8×10" → "20×25 cm")
 * - Mug sizes: oz → cl (e.g., "11oz" → "33 cl")
 * - Tote bag sizes: inches → cm (e.g., "15×15" → "38×38 cm")
 * - Apparel sizes: unchanged (XS, S, M, L, etc.)
 */

// Inch to cm conversion factor
const INCH_TO_CM = 2.54;

// Oz to cl conversion factor (1 oz ≈ 2.957 cl)
const OZ_TO_CL = 2.957;

/**
 * Size conversion mapping for known sizes
 * Maps API value → display value
 */
const SIZE_DISPLAY_MAP: Record<string, string> = {
  // Mug sizes (oz → cl)
  "11oz": "33 cl",
  "15oz": "44 cl",

  // Poster/canvas sizes (inches → cm, rounded to nearest integer)
  "8×10": "20×25 cm",
  "10×8": "25×20 cm",
  "12×16": "30×41 cm",
  "12×18": "30×46 cm",
  "16×12": "41×30 cm",
  "16×20": "41×51 cm",
  "18×24": "46×61 cm",
  "20×16": "51×41 cm",
  "24×18": "61×46 cm",
  "24×36": "61×91 cm",
  "36×24": "91×61 cm",

  // Alternative format with x instead of ×
  "8x10": "20×25 cm",
  "10x8": "25×20 cm",
  "12x16": "30×41 cm",
  "12x18": "30×46 cm",
  "16x12": "41×30 cm",
  "16x20": "41×51 cm",
  "18x24": "46×61 cm",
  "20x16": "51×41 cm",
  "24x18": "61×46 cm",
  "24x36": "61×91 cm",
  "36x24": "91×61 cm",

  // Square sizes (tote bags, pillows)
  "13×13": "33×33 cm",
  "14×14": "36×36 cm",
  "15×15": "38×38 cm",
  "16×16": "41×41 cm",
  "18×18": "46×46 cm",
  "20×20": "51×51 cm",

  // Square sizes alternative format
  "13x13": "33×33 cm",
  "14x14": "36×36 cm",
  "15x15": "38×38 cm",
  "16x16": "41×41 cm",
  "18x18": "46×46 cm",
  "20x20": "51×51 cm",

  // One size stays as is but translatable
  "One Size": "One Size",
};

/**
 * Parse dimension string into width and height
 * Supports multiple formats:
 * - Simple: "8×10", "8x10"
 * - With inches symbol: "10\" x 20\"", "10" x 8"", "13" × 13'"
 * - With orientation: "10\" x 20\" (VERTICAL)", "10" x 8" (HORIZONTAL)"
 */
function parseDimensions(size: string): { width: number; height: number; orientation?: string } | null {
  // First, try to extract orientation if present
  const orientationMatch = size.match(/\((VERTICAL|HORIZONTAL)\)/i);
  const orientation = orientationMatch ? orientationMatch[1].toLowerCase() : undefined;

  // Clean the string: remove orientation, all quote variants (inch/foot symbols)
  // Handles: " ' ″ ′ " " ' ' and escaped quotes
  const cleanSize = size
    .replace(/\s*\((VERTICAL|HORIZONTAL)\)/gi, "")
    .replace(/["″"'''′]/g, "")
    .trim();

  // Try to match dimensions: "10 x 20", "8×10", "10x8"
  const match = cleanSize.match(/^(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)$/i);
  if (!match) return null;

  return {
    width: parseFloat(match[1]),
    height: parseFloat(match[2]),
    orientation,
  };
}

/**
 * Parse oz value (e.g., "11oz") into number
 */
function parseOz(size: string): number | null {
  const match = size.match(/^(\d+(?:\.\d+)?)\s*oz$/i);
  if (!match) return null;
  return parseFloat(match[1]);
}

/**
 * Convert inches to cm (rounded)
 */
function inchesToCm(inches: number): number {
  return Math.round(inches * INCH_TO_CM);
}

/**
 * Convert oz to cl (rounded)
 */
function ozToCl(oz: number): number {
  return Math.round(oz * OZ_TO_CL);
}

/**
 * Format size for display
 *
 * Converts API size values to metric units for UI display.
 * Returns original value if no conversion is applicable.
 *
 * @param size - The API size value (e.g., "11oz", "8×10", "M", "10\" x 20\" (VERTICAL)")
 * @returns Display-formatted size string
 *
 * @example
 * formatSizeForDisplay("11oz")                    // → "33 cl"
 * formatSizeForDisplay("8×10")                    // → "20×25 cm"
 * formatSizeForDisplay("M")                       // → "M"
 * formatSizeForDisplay("10\" x 20\" (VERTICAL)")  // → "25×51 cm (Vertical)"
 */
export function formatSizeForDisplay(size: string): string {
  // Check static mapping first
  if (SIZE_DISPLAY_MAP[size]) {
    return SIZE_DISPLAY_MAP[size];
  }

  // Try to parse and convert oz
  const oz = parseOz(size);
  if (oz !== null) {
    return `${ozToCl(oz)} cl`;
  }

  // Try to parse and convert dimensions (inches)
  const dims = parseDimensions(size);
  if (dims !== null) {
    const cmWidth = inchesToCm(dims.width);
    const cmHeight = inchesToCm(dims.height);
    let result = `${cmWidth}×${cmHeight} cm`;

    // Append orientation if present (capitalize first letter)
    if (dims.orientation) {
      const orientationLabel = dims.orientation.charAt(0).toUpperCase() + dims.orientation.slice(1);
      result += ` (${orientationLabel})`;
    }

    return result;
  }

  // Return original for apparel sizes and unknown formats
  return size;
}

/**
 * Check if a size is a dimensional size (inches format)
 */
export function isDimensionalSize(size: string): boolean {
  return parseDimensions(size) !== null;
}

/**
 * Check if a size is a volume size (oz format)
 */
export function isVolumeSize(size: string): boolean {
  return parseOz(size) !== null;
}

/**
 * Check if a size is an apparel size
 */
export function isApparelSize(size: string): boolean {
  const apparelSizes = [
    "XXS", "XS", "S", "M", "L", "XL", "XXL",
    "2XL", "3XL", "4XL", "5XL",
  ];
  return apparelSizes.includes(size);
}

/**
 * Format variant name for display
 *
 * Variant names from Printify API are in format "Color / Size" or just "Size".
 * This function formats the size portion while keeping the color unchanged.
 *
 * @param variantName - The variant name (e.g., "White / 11oz", "Black / M")
 * @returns Display-formatted variant name
 *
 * @example
 * formatVariantForDisplay("White / 11oz")  // → "White / 33 cl"
 * formatVariantForDisplay("Black / M")     // → "Black / M"
 * formatVariantForDisplay("16×20")         // → "41×51 cm"
 */
export function formatVariantForDisplay(variantName: string): string {
  // Check if variant contains a separator
  if (variantName.includes(" / ")) {
    const parts = variantName.split(" / ");
    const formattedParts = parts.map((part, index) => {
      // Last part is typically the size
      if (index === parts.length - 1) {
        return formatSizeForDisplay(part.trim());
      }
      return part.trim();
    });
    return formattedParts.join(" / ");
  }

  // No separator - might be just a size
  return formatSizeForDisplay(variantName);
}
