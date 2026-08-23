/**
 * Catalog Section Filtering
 *
 * Pure helpers applying the toolbar's filter state (group, search
 * query, sort order) to the catalog's group sections. Sections that
 * end up without products are dropped so the grid never renders an
 * empty group heading.
 */

import type {
  CatalogDisplayProductType,
  CatalogFilterStateType,
  CatalogGroupSectionType,
  CatalogSortOptionType,
} from "../types/catalogPageTypes";

function matchesQuery(
  product: CatalogDisplayProductType,
  normalizedQuery: string
): boolean {
  if (!normalizedQuery) {
    return true;
  }

  const haystack =
    `${product.name} ${product.description ?? ""}`.toLowerCase();

  return haystack.includes(normalizedQuery);
}

function compareProducts(
  a: CatalogDisplayProductType,
  b: CatalogDisplayProductType,
  sort: CatalogSortOptionType
): number {
  switch (sort) {
    case "price-asc":
      return a.price - b.price;
    case "price-desc":
      return b.price - a.price;
    case "name-asc":
      return a.name.localeCompare(b.name);
    case "featured":
      return 0;
  }
}

export function filterCatalogSections(
  sections: CatalogGroupSectionType[],
  filters: CatalogFilterStateType
): CatalogGroupSectionType[] {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return sections
    .filter(
      (section) => filters.group === "all" || section.group === filters.group
    )
    .map((section) => ({
      ...section,
      products: [...section.products]
        .filter((product) => matchesQuery(product, normalizedQuery))
        .sort((a, b) => compareProducts(a, b, filters.sort)),
    }))
    .filter((section) => section.products.length > 0);
}

export function countCatalogProducts(
  sections: CatalogGroupSectionType[]
): number {
  return sections.reduce(
    (total, section) => total + section.products.length,
    0
  );
}
