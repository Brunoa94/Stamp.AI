/**
 * The dashed "your design" box the homepage product cards show over each
 * photo on hover. Approximate, tuned for the centred catalog mockups in a
 * 4:5 frame; the real placement check happens in the stamp flow.
 */

import type { PrintAreaRectT, PrintCategoryT } from "../types/productPrintArea";

export const HOME_PRINT_AREAS: Record<PrintCategoryT, PrintAreaRectT> = {
  apparel: { left: 33, top: 30, width: 34, height: 32 },
  tote: { left: 28, top: 38, width: 44, height: 38 },
  mug: { left: 18, top: 32, width: 46, height: 40 },
  canvas: { left: 12, top: 20, width: 50, height: 58 },
  poster: { left: 14, top: 16, width: 72, height: 68 },
  pillow: { left: 20, top: 24, width: 60, height: 52 },
  socks: { left: 34, top: 18, width: 32, height: 44 },
  notebook: { left: 24, top: 20, width: 52, height: 60 },
};
