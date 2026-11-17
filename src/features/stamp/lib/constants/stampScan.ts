import { buildStampScanColumns } from "../helpers/stampScan";
import type { StampScanSlideT } from "../types/stampScan";

const SCAN = "/stamp-entry";

/**
 * Shop products on the entry scan: the blank catalog shot and the same shot
 * printed (1024px squares of public/home/*-a|b), so each tile prints in place.
 */
const STAMP_SCAN_SLIDES: readonly StampScanSlideT[] = [
  { id: "hoodie", blankSrc: `${SCAN}/hoodie-blank.webp`, printedSrc: `${SCAN}/hoodie-printed.webp` },
  { id: "canvas", blankSrc: `${SCAN}/canvas-blank.webp`, printedSrc: `${SCAN}/canvas-printed.webp` },
  { id: "tee", blankSrc: `${SCAN}/tee-blank.webp`, printedSrc: `${SCAN}/tee-printed.webp` },
  { id: "mugs", blankSrc: `${SCAN}/mugs-blank.webp`, printedSrc: `${SCAN}/mugs-printed.webp` },
  { id: "kids-tee", blankSrc: `${SCAN}/kids-tee-blank.webp`, printedSrc: `${SCAN}/kids-tee-printed.webp` },
  { id: "tote", blankSrc: `${SCAN}/tote-blank.webp`, printedSrc: `${SCAN}/tote-printed.webp` },
];

/** Three drifting columns; each holds all six products, which outspan the panel */
export const STAMP_SCAN_COLUMNS = buildStampScanColumns(STAMP_SCAN_SLIDES, 3);
