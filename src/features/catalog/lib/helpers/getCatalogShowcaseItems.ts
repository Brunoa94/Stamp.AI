/**
 * Catalog Showcase Items
 *
 * Pure helper deriving the "explore our best" group cards from the
 * catalog's group sections, each represented by the first product
 * photo available in that group.
 */

import type {
  CatalogGroupSectionType,
  CatalogShowcaseItemType,
} from "../types/catalogPageTypes";

function findGroupImage(section: CatalogGroupSectionType): string | null {
  for (const product of section.products) {
    if (product.imageUrls[0]) {
      return product.imageUrls[0];
    }
  }

  return null;
}

export function getCatalogShowcaseItems(
  sections: CatalogGroupSectionType[]
): CatalogShowcaseItemType[] {
  return sections.map((section) => ({
    group: section.group,
    imageUrl: findGroupImage(section),
  }));
}
