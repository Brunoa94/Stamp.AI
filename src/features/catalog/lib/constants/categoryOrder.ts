/**
 * Catalog Category Order
 *
 * Display order for category sections on the /catalog page:
 * apparel first (matching the stamp flow's clothing group), then
 * accessories, with the "other" catch-all last.
 */

import type { ProductCategory } from "@/features/stamp/lib/helpers/productCategoryDetector";

export const CATALOG_CATEGORY_ORDER: ProductCategory[] = [
  "tshirt",
  "hoodie",
  "sweatshirt",
  "longsleeve",
  "tank",
  "totebag",
  "mug",
  "poster",
  "canvas",
  "phone-case",
  "hat",
  "socks",
  "pillow",
  "other",
];
