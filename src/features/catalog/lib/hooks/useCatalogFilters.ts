"use client";

import { useState } from "react";
import type {
  CatalogGroupFilterType,
  CatalogGroupSectionType,
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
 * Client state for the catalog toolbar: active group, search query
 * and sort order, plus the derived filtered group sections and result
 * count. The product list is small (one cached page), so filtering
 * runs on every render without memoization.
 */

export function useCatalogFilters(sections: CatalogGroupSectionType[]) {
  const [group, setGroup] = useState<CatalogGroupFilterType>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<CatalogSortOptionType>(DEFAULT_CATALOG_SORT);

  const filteredSections = filterCatalogSections(sections, {
    group,
    query,
    sort,
  });

  const clearFilters = () => {
    setGroup("all");
    setQuery("");
  };

  return {
    group,
    query,
    sort,
    setGroup,
    setQuery,
    setSort,
    filteredSections,
    resultCount: countCatalogProducts(filteredSections),
    clearFilters,
  };
}
