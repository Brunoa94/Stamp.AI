import type { StampScanColumnT, StampScanSlideT } from "../types/stampScan";

/** Seconds for the first column to scroll one copy; each next column is slower */
const BASE_DURATION_S = 34;
const DURATION_STEP_S = 7;

/** How far along the product list each next column starts */
const COLUMN_OFFSET = 2;

/**
 * Columns of the entry scan: every column carries every product, starting
 * further along the list than the one before so neighbours don't show the
 * same product side by side, and each scrolls at its own pace so products
 * cross the print line one by one rather than in rows.
 */
export function buildStampScanColumns(
  slides: readonly StampScanSlideT[],
  columnCount: number,
): StampScanColumnT[] {
  return Array.from({ length: columnCount }, (_, columnIndex) => {
    const offset = (columnIndex * COLUMN_OFFSET) % slides.length;

    return {
      id: `column-${columnIndex}`,
      tiles: [...slides.slice(offset), ...slides.slice(0, offset)],
      durationS: BASE_DURATION_S + columnIndex * DURATION_STEP_S,
    };
  });
}
