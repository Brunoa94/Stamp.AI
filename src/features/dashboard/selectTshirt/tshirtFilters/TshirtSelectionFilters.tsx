"use client";

import { useState, useEffect, useMemo, useImperativeHandle, forwardRef } from "react";
import MaterialFilter from "./MaterialFilter";
import FitFilter from "./FitFilter";
import SortFilter from "./SortFilter";
import FilterHeader from "./FilterHeader";
import ClearFiltersButton from "./ClearFiltersButton";
import { SortOption } from "../types";
import { TshirtType } from "@/services/tshirtProductService";

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
      let filtered = tshirtProducts;

      if (filterMaterial !== "all") {
        filtered = filtered.filter((t) =>
          t.material.toLowerCase().includes(filterMaterial.toLowerCase())
        );
      }

      if (filterFit !== "all") {
        filtered = filtered.filter(
          (t) => t.fit.toLowerCase() === filterFit.toLowerCase()
        );
      }

      // Sort
      const sorted = [...filtered].sort((a, b) => {
        if (sortBy === "price") {
          return a.price - b.price;
        }
        return a.name.localeCompare(b.name);
      });

      return sorted;
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
          <MaterialFilter
            value={filterMaterial}
            onChange={setFilterMaterial}
            availableMaterials={availableMaterials}
          />

          <FitFilter
            value={filterFit}
            onChange={setFilterFit}
            availableFits={availableFits}
          />

          <SortFilter value={sortBy} onChange={setSortBy} />
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
