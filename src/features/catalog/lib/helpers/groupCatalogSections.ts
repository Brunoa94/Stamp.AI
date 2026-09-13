/**
 * Catalog Group Sections
 *
 * Pure helper merging the server's per-category catalog sections into
 * the two browsing groups shown on the page: clothing first, then
 * accessories. Product order inside a group follows the original
 * section order (the server's featured ranking).
 */

import {
  getProductGroup,
  type ProductGroup,
} from "@/features/stamp/lib/helpers/productCategoryDetector";
import type {
  CatalogCategorySectionType,
  CatalogGroupSectionType,
} from "../types/catalogPageTypes";

const CATALOG_GROUP_ORDER: ProductGroup[] = ["clothing", "accessories"];

export function groupCatalogSections(
  sections: CatalogCategorySectionType[]
): CatalogGroupSectionType[] {
  return CATALOG_GROUP_ORDER.map((group) => ({
    group,
    products: sections
      .filter((section) => getProductGroup(section.category) === group)
      .flatMap((section) => section.products),
  })).filter((groupSection) => groupSection.products.length > 0);
}
