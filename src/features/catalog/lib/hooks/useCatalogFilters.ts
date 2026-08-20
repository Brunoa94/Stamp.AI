"use client";

import { useState } from "react";
import type {
  CatalogCategoryFilterType,
  CatalogCategorySectionType,
  CatalogSortOptionType,
} from "../types/catalogPageTypes";
import { DEFAULT_CATALOG_SORT } from "../constants/catalogSortOptions";
import {
  countCatalogProducts,
  filterCatalogSections,
} from "../helpers/filterCatalogSections";

/**
 * useCatalogFilters
 *
 * Client state for the catalog toolbar: active category, search query
 * and sort order, plus the derived filtered sections and result count.
 * The product list is small (one cached page), so filtering runs on
 * every render without memoization.
 */

export function useCatalogFilters(sections: CatalogCategorySectionType[]) {
  const [category, setCategory] = useState<CatalogCategoryFilterType>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<CatalogSortOptionType>(DEFAULT_CATALOG_SORT);

  const filteredSections = filterCatalogSections(sections, {
    category,
    query,
    sort,
  });

  const clearFilters = () => {
    setCategory("all");
    setQuery("");
  };

  return {
    category,
    query,
    sort,
    setCategory,
    setQuery,
    setSort,
    filteredSections,
    resultCount: countCatalogProducts(filteredSections),
    clearFilters,
  };
}
