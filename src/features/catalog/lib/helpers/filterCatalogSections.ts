/**
 * Catalog Section Filtering
 *
 * Pure helpers applying the toolbar's filter state (category, search
 * query, sort order) to the catalog's category sections. Sections that
 * end up without products are dropped so the grid never renders an
 * empty category heading.
 */

import type {
  CatalogCategorySectionType,
  CatalogDisplayProductType,
  CatalogFilterStateType,
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
  sections: CatalogCategorySectionType[],
  filters: CatalogFilterStateType
): CatalogCategorySectionType[] {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return sections
    .filter(
      (section) =>
        filters.category === "all" || section.category === filters.category
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
  sections: CatalogCategorySectionType[]
): number {
  return sections.reduce(
    (total, section) => total + section.products.length,
    0
  );
}
