/**
 * Print Area Configuration
 *
 * Defines the print area rectangles for each product category,
 * used in the placement preview component.
 */

import type { CategoryType } from "./silhouetteConfig";

export interface AreaRect {
  left: string;
  top: string;
  width: string;
  height: string;
}

/**
 * Scale multipliers to adjust mockup preview to better match actual print output.
 * The AOP Tote Bag has a very tall print area (2175x4350) that wraps front+back,
 * but our preview only shows the front portion. This multiplier compensates for
 * the difference between preview aspect ratio and actual print area ratio.
 */
export const SCALE_MULTIPLIERS: Partial<Record<CategoryType, number>> = {
  tote: 1.25, // Tote preview appears smaller than actual print, scale up by 25%
};

/**
 * Approximate print-area rectangle per position, as percentages of the
 * silhouette container. Tuned for the simple apparel/tote silhouettes.
 */
const APPAREL_AREAS: Record<string, AreaRect> = {
  front: { left: "27%", top: "24%", width: "46%", height: "52%" },
  back: { left: "27%", top: "24%", width: "46%", height: "52%" },
  neck: { left: "40%", top: "10%", width: "20%", height: "10%" },
  left_sleeve: { left: "4%", top: "22%", width: "15%", height: "13%" },
  right_sleeve: { left: "81%", top: "22%", width: "15%", height: "13%" },
};

const TOTE_AREAS: Record<string, AreaRect> = {
  front: { left: "22%", top: "32%", width: "56%", height: "52%" },
  back: { left: "22%", top: "32%", width: "56%", height: "52%" },
};

const MUG_AREAS: Record<string, AreaRect> = {
  front: { left: "22%", top: "28%", width: "50%", height: "55%" },
};

const CANVAS_AREAS: Record<string, AreaRect> = {
  front: { left: "14%", top: "18%", width: "72%", height: "68%" },
};

const SOCKS_AREAS: Record<string, AreaRect> = {
  front: { left: "15%", top: "20%", width: "70%", height: "50%" },
};

const DEFAULT_AREA: AreaRect = { left: "27%", top: "24%", width: "46%", height: "52%" };

const PRINT_AREAS: Record<CategoryType, Record<string, AreaRect>> = {
  apparel: APPAREL_AREAS,
  tote: TOTE_AREAS,
  mug: MUG_AREAS,
  canvas: CANVAS_AREAS,
  poster: CANVAS_AREAS,
  pillow: APPAREL_AREAS,
  socks: SOCKS_AREAS,
};

/**
 * Get the print area rectangle for a given category and position
 */
export function getAreaRect(category: CategoryType, position: string): AreaRect {
  const areas = PRINT_AREAS[category] ?? APPAREL_AREAS;
  return areas[position] ?? areas.front ?? DEFAULT_AREA;
}
