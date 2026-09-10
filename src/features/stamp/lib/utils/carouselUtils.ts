/**
 * Carousel Utilities
 *
 * Helper functions for carousel preloading and navigation.
 */

/** Number of images to preload around the current index */
export const PRELOAD_BUFFER = 2;

/**
 * Get indices of images to preload around the current index.
 * Uses circular wrapping for seamless navigation.
 *
 * @param currentIndex - The currently displayed image index
 * @param totalImages - Total number of images in the carousel
 * @returns Set of indices to preload
 */
export function getPreloadIndices(
  currentIndex: number,
  totalImages: number
): Set<number> {
  const indices = new Set<number>();
  for (let i = -PRELOAD_BUFFER; i <= PRELOAD_BUFFER; i++) {
    let idx = currentIndex + i;
    // Wrap around for circular navigation
    if (idx < 0) idx = totalImages + idx;
    if (idx >= totalImages) idx = idx - totalImages;
    if (idx >= 0 && idx < totalImages) {
      indices.add(idx);
    }
  }
  return indices;
}
