import { useState, useMemo, useEffect } from "react";
import { TshirtType } from "@/services/tshirtProductService";
import { SortOption } from "../types";
import { filterAndSortTshirts } from "../TshirtFilters/utils/filterUtils";

interface UseTshirtFiltersProps {
  tshirtProducts: TshirtType[];
  onFilteredChange: (filteredTshirts: TshirtType[]) => void;
}

export function useTshirtFilters({
  tshirtProducts,
  onFilteredChange,
}: UseTshirtFiltersProps) {
  const [filterMaterial, setFilterMaterial] = useState<string>("all");
  const [filterFit, setFilterFit] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("price");

  const handleClearFilters = () => {
    setFilterMaterial("all");
    setFilterFit("all");
  };

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

  return {
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
  };
}
