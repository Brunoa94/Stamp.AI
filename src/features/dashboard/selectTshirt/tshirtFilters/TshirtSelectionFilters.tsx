"use client";

import {
  useState,
  useEffect,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from "react";
import { FilterSelect } from "@/features/ui/filter-select";
import FilterHeader from "./FilterHeader";
import ClearFiltersButton from "./ClearFiltersButton";
import { SortOption } from "../types";
import { TshirtType } from "@/services/tshirtProductService";
import {
  SORT_OPTIONS,
  mapToFilterOptions,
  FILTER_LABELS,
  FILTER_PLACEHOLDERS,
} from "./utils/filterConfig";
import { filterAndSortTshirts } from "./utils/filterUtils";

export interface FilterValues {
  material: string;
  fit: string;
  sortBy: SortOption;
}

export interface FilterHandle {
  clearFilters: () => void;
}

interface Props {
  tshirtProducts: TshirtType[];
  onFilteredChange: (filteredTshirts: TshirtType[]) => void;
}

const TshirtSelectionFilters = forwardRef<FilterHandle, Props>(
  ({ tshirtProducts, onFilteredChange }, ref) => {
    const [filterMaterial, setFilterMaterial] = useState<string>("all");
    const [filterFit, setFilterFit] = useState<string>("all");
    const [sortBy, setSortBy] = useState<SortOption>("price");

    const handleClearFilters = () => {
      setFilterMaterial("all");
      setFilterFit("all");
    };

    // Expose clear filters method via ref
    useImperativeHandle(ref, () => ({
      clearFilters: handleClearFilters,
    }));

    // Calculate available materials and fits from products
    const availableMaterials = useMemo(() => {
      const materials = tshirtProducts.map((t) => t.material);
      return [...new Set(materials)];
    }, [tshirtProducts]);

    const availableFits = useMemo(() => {
      const fits = tshirtProducts.map((t) => t.fit);
      return [...new Set(fits)];
    }, [tshirtProducts]);

    // Filter and sort logic
    const filteredTshirts = useMemo(() => {
      return filterAndSortTshirts({
        products: tshirtProducts,
        material: filterMaterial,
        fit: filterFit,
        sortBy,
      });
    }, [tshirtProducts, filterMaterial, filterFit, sortBy]);

    // Notify parent of filtered results
    useEffect(() => {
      onFilteredChange(filteredTshirts);
    }, [filteredTshirts, onFilteredChange]);

    const showClearButton = filterMaterial !== "all" || filterFit !== "all";
    const totalTypes = tshirtProducts.length;
    const filteredCount = filteredTshirts.length;

    return (
      <div className="bg-linear-to-br from-purple-50/50 via-purple-100/40 to-pink-50/50 dark:from-gray-800/80 dark:via-purple-800/30 dark:to-pink-800/30 backdrop-blur-sm border border-purple-100 dark:border-purple-800/30 rounded-2xl p-6 mb-6">
        <FilterHeader filteredCount={filteredCount} totalTypes={totalTypes} />

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
);

TshirtSelectionFilters.displayName = "TshirtSelectionFilters";

export default TshirtSelectionFilters;
