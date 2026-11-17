import type { StampWallColumnT, StampWallTileT } from "@/features/homepage/lib/types/stampWall";

/** Seconds for the first column's loop; each next column is a little slower */
const BASE_DURATION_S = 70;
const DURATION_STEP_S = 9;

/**
 * Deals the stamps round-robin into columns (so a product line spreads across
 * the wall instead of stacking in one column), alternating the drift direction
 * and giving each column its own pace.
 */
export function buildStampWallColumns(
  tiles: readonly StampWallTileT[],
  columnCount: number,
): StampWallColumnT[] {
  return Array.from({ length: columnCount }, (_, columnIndex) => ({
    id: `column-${columnIndex}`,
    tiles: tiles.filter((_, tileIndex) => tileIndex % columnCount === columnIndex),
    durationS: BASE_DURATION_S + columnIndex * DURATION_STEP_S,
    isReversed: columnIndex % 2 === 1,
  }));
}
