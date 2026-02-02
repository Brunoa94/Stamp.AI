"use client";

import { useState, useCallback, useRef } from "react";
import TshirtSelectionFilters from "./tshirtFilters/TshirtSelectionFilters";
import useTshirtSelection, { TshirtType } from "./useTshirtSelection";
import {
  TshirtSelectionHeader,
  TshirtGrid,
  NoResultsMessage,
} from "./components";
import TshirtSelectionSkeleton from "./TshirtSelectionSkeleton";
import TshirtSelectionError from "./TshirtSelectionError";

interface Props {
  onTshirtSelect: (tshirt: TshirtType) => void;
  selectedTshirt?: TshirtType;
}

export default function TshirtSelection({
  onTshirtSelect,
  selectedTshirt,
}: Props) {
  const {
    tshirtProducts,
    selectedTshirt: currentSelection,
    handleTshirtSelect,
    isLoading,
    error,
  } = useTshirtSelection({
    onTshirtSelect,
    initialSelection: selectedTshirt,
  });
  const [filteredTshirts, setFilteredTshirts] = useState<TshirtType[]>([]);
  const clearFiltersRef = useRef<(() => void) | null>(null);

  const handleFilteredChange = useCallback((filtered: TshirtType[]) => {
    setFilteredTshirts(filtered);
  }, []);

  const handleClearFiltersReady = useCallback((clearFn: () => void) => {
    clearFiltersRef.current = clearFn;
  }, []);

  const handleClearFilters = () => {
    clearFiltersRef.current?.();
  };

  if (isLoading) return <TshirtSelectionSkeleton />;

  if (error) return <TshirtSelectionError error={error} />;

  return (
    <div className="space-y-6">
      <TshirtSelectionHeader />

      <TshirtSelectionFilters
        tshirtProducts={tshirtProducts}
        onFilteredChange={handleFilteredChange}
        onClearFiltersReady={handleClearFiltersReady}
      />

      {filteredTshirts.length === 0 ? (
        <NoResultsMessage onClearFilters={handleClearFilters} />
      ) : (
        <TshirtGrid
          tshirts={filteredTshirts}
          selectedTshirt={currentSelection}
          onTshirtSelect={handleTshirtSelect}
        />
      )}
    </div>
  );
}
