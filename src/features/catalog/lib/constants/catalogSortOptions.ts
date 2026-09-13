/**
 * Catalog Sort Options
 *
 * Sort orders offered by the catalog toolbar. "featured" preserves the
 * server-provided order (the cached product ranking); the other options
 * reorder products inside each category section.
 */

import type { CatalogSortOptionType } from "../types/catalogPageTypes";

export const CATALOG_SORT_OPTIONS: CatalogSortOptionType[] = [
  "featured",
  "price-asc",
  "price-desc",
  "name-asc",
];

export const DEFAULT_CATALOG_SORT: CatalogSortOptionType = "featured";
