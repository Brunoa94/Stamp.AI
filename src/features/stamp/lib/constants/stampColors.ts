import type { SizeType } from "../types/stampTypes";

/**
 * Stamp Size Configuration
 *
 * Size ordering and defaults for product customization.
 * Sizes are fetched dynamically from the variants API,
 * but we need ordering and fallback logic.
 */

/**
 * Standard size ordering for sorting API-returned sizes
 * Lower index = appears first in the size selector
 */
const SIZE_ORDER: Record<string, number> = {
  // Apparel sizes (standard order)
  XS: 1,
  S: 2,
  M: 3,
  L: 4,
  XL: 5,
  XXL: 6,
  "2XL": 7,
  "3XL": 8,
  "4XL": 9,
  "5XL": 10,
  // One-size products (tote bags, etc.)
  "One Size": 1,
  // Mug sizes
  "11oz": 1,
  "15oz": 2,
  // Poster/print sizes (by area, smallest to largest)
  "8×10": 1,
  "12×16": 2,
  "12×18": 3,
  "16×20": 4,
  "18×24": 5,
  "24×36": 6,
};

/**
 * Sort sizes according to SIZE_ORDER
 */
export function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const orderA = SIZE_ORDER[a] ?? 99;
    const orderB = SIZE_ORDER[b] ?? 99;
    return orderA - orderB;
  });
}

/**
 * Fallback sizes for apparel products when API fails
 */
export const STAMP_SIZES: SizeType[] = ["XS", "S", "M", "L", "XL", "XXL"];

/**
 * Default size for apparel products
 */
const DEFAULT_SIZE: SizeType = "M";

/**
 * Get the default/recommended size for a given list of available sizes
 * - For apparel: prefer M, then L, then first available
 * - For one-size products: return the single size
 * - For mugs: prefer 11oz
 * - For posters: prefer middle size
 */
export function getDefaultSizeForProduct(availableSizes: string[]): string {
  if (availableSizes.length === 0) {
    return DEFAULT_SIZE;
  }

  // One-size products
  if (availableSizes.length === 1) {
    return availableSizes[0];
  }

  // Check for "One Size" explicitly
  if (availableSizes.includes("One Size")) {
    return "One Size";
  }

  // Mug sizes - prefer 11oz
  if (availableSizes.includes("11oz")) {
    return "11oz";
  }

  // Apparel sizes - prefer M, then L, then S
  const preferredApparelSizes = ["M", "L", "S", "XL"];
  for (const preferred of preferredApparelSizes) {
    if (availableSizes.includes(preferred)) {
      return preferred;
    }
  }

  // Poster sizes - prefer a middle size
  const posterSizes = ["16×20", "18×24", "12×18", "12×16"];
  for (const poster of posterSizes) {
    if (availableSizes.includes(poster)) {
      return poster;
    }
  }

  // Fallback to first available
  return availableSizes[0];
}
