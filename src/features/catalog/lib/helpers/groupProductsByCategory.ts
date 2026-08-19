/**
 * Group catalog display products into ordered category sections.
 * Categories with no products are omitted; section order follows
 * CATALOG_CATEGORY_ORDER.
 */

import { CATALOG_CATEGORY_ORDER } from "../constants/categoryOrder";
import type {
  CatalogCategorySectionType,
  CatalogDisplayProductType,
} from "../types/catalogPageTypes";

export function groupProductsByCategory(
  products: CatalogDisplayProductType[]
): CatalogCategorySectionType[] {
  return CATALOG_CATEGORY_ORDER.map((category) => ({
    category,
    products: products.filter((product) => product.category === category),
  })).filter((section) => section.products.length > 0);
}
