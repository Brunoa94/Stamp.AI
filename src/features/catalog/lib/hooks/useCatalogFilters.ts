"use client";

import { startTransition, useDeferredValue, useState } from "react";
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
 *
 * Group changes and clearing run in a Transition, and results read a
 * deferred copy of the query, so the showcase ↔ results swap animates
 * through <ViewTransition> while the search input stays urgent.
 */

export function useCatalogFilters(sections: CatalogGroupSectionType[]) {
  const [group, setGroupState] = useState<CatalogGroupFilterType>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<CatalogSortOptionType>(DEFAULT_CATALOG_SORT);
  const deferredQuery = useDeferredValue(query);

  const filteredSections = filterCatalogSections(sections, {
    group,
    query: deferredQuery,
    sort,
  });

  const setGroup = (nextGroup: CatalogGroupFilterType) => {
    startTransition(() => setGroupState(nextGroup));
  };

  const clearFilters = () => {
    startTransition(() => {
      setGroupState("all");
      setQuery("");
    });
  };

  return {
    group,
    query,
    sort,
    setGroup,
    setQuery,
    setSort,
    filteredSections,
    isBrowsingAll: group === "all" && deferredQuery.trim() === "",
    resultCount: countCatalogProducts(filteredSections),
    clearFilters,
  };
}
