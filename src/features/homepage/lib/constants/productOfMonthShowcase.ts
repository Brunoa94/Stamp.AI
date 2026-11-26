import type { ProductOfMonthShotT } from "@/features/homepage/lib/types/productOfMonth";
import { staticAssetUrl } from "@/shared/helpers/staticAssetUrl";

const PRODUCTS = staticAssetUrl("/products-images");

/** How long each photo stays in the product of the month crossfade */
export const PRODUCT_OF_MONTH_SHOT_INTERVAL_MS = 3000;

const TOTE_SHOTS: readonly ProductOfMonthShotT[] = [
  { src: `${PRODUCTS}/tote/tote-a-printed.webp`, altKey: "logo" },
  { src: `${PRODUCTS}/tote/tote-b-printed.webp`, altKey: "family" },
  { src: `${PRODUCTS}/tote/tote-c-printed.webp`, altKey: "brand" },
  { src: `${PRODUCTS}/inspiration/tote-botanical.webp`, altKey: "botanical" },
];

/**
 * Customized photos per Printify blueprint. A product of the month with no
 * entry shows its blank photo only.
 */
export const CUSTOMIZED_SHOTS_BY_BLUEPRINT: Readonly<Record<number, readonly ProductOfMonthShotT[]>> = {
  553: TOTE_SHOTS, // Cotton Tote Bag
  1389: TOTE_SHOTS, // AOP Tote Bag
};
