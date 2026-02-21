"use client";

import { useEffect } from "react";
import { FilterSelect } from "@/features/ui/filter-select";
import { FilterHeader } from "@/features/ui/filters/FilterHeader";
import { SortOption } from "../types";
import { TshirtType } from "@/queries/productQueries";

import { useTshirtFilters } from "../hooks/useTshirtFilters";
import {
  FILTER_LABELS,
  FILTER_PLACEHOLDERS,
  mapToFilterOptions,
  SORT_OPTIONS,
} from "./utils/filterConfig";
import ClearFiltersButton from "./ClearFiltersButton";

export interface FilterValues {
  material: string;
  fit: string;
  sortBy: SortOption;
}

interface Props {
  tshirtProducts: TshirtType[];
  onFilteredChange: (filteredTshirts: TshirtType[]) => void;
  onClearFiltersReady?: (clearFn: () => void) => void;
}

export default function TshirtSelectionFilters({
  tshirtProducts,
  onFilteredChange,
  onClearFiltersReady,
}: Props) {
  const {
    filterMaterial,
    setFilterMaterial,
    filterFit,
    setFilterFit,
    sortBy,
    setSortBy,
    availableMaterials,
    availableFits,
    showClearButton,
    totalTypes,
    filteredCount,
    handleClearFilters,
  } = useTshirtFilters({ tshirtProducts, onFilteredChange });

  // Expose clear filters method to parent via callback
  useEffect(() => {
    onClearFiltersReady?.(handleClearFilters);
  }, [handleClearFilters, onClearFiltersReady]);

  return (
    <div className="bg-linear-to-br from-purple-100/70 via-purple-200/60 to-pink-100/70 dark:from-gray-800/80 dark:via-purple-800/30 dark:to-pink-800/30 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-700/50 rounded-2xl p-6 mb-6">
      <FilterHeader filteredCount={filteredCount} totalCount={totalTypes} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FilterSelect
          label={FILTER_LABELS.material}
          value={filterMaterial}
          onChange={setFilterMaterial}
          options={mapToFilterOptions(availableMaterials)}
          placeholder={FILTER_PLACEHOLDERS.material}
        />

        <FilterSelect
          label={FILTER_LABELS.fit}
          value={filterFit}
          onChange={setFilterFit}
          options={mapToFilterOptions(availableFits)}
          placeholder={FILTER_PLACEHOLDERS.fit}
        />

        <FilterSelect
          label={FILTER_LABELS.sortBy}
          value={sortBy}
          onChange={setSortBy}
          options={SORT_OPTIONS}
          placeholder={FILTER_PLACEHOLDERS.sortBy}
        />
      </div>

      <ClearFiltersButton
        onClear={handleClearFilters}
        showButton={showClearButton}
      />
    </div>
  );
}
