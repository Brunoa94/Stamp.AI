"use client";

import { useRef, useState, useCallback } from "react";
import TshirtSelectionFilters, {
  FilterHandle,
} from "./tshirtFilters/TshirtSelectionFilters";
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
  const filterRef = useRef<FilterHandle>(null);

  const handleFilteredChange = useCallback((filtered: TshirtType[]) => {
    setFilteredTshirts(filtered);
  }, []);

  const handleClearFilters = () => {
    filterRef.current?.clearFilters();
  };

  if (isLoading) return <TshirtSelectionSkeleton />;

  if (error) return <TshirtSelectionError error={error} />;

  return (
    <div className="space-y-6">
      <TshirtSelectionHeader />

      <TshirtSelectionFilters
        ref={filterRef}
        tshirtProducts={tshirtProducts}
        onFilteredChange={handleFilteredChange}
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
