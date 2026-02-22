"use client";

import { FilterHeader } from "@/features/ui/filters/FilterHeader";
import { FilterSelect } from "@/features/ui/filter-select";
import {
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  SORT_BY_OPTIONS,
} from "./orderFilterOptions";
import dynamic from "next/dynamic";

const ClearAllFilters = dynamic(() => import("./ClearAllFilters"), {
  ssr: true,
});

interface Filters {
  status: string | null;
  paymentStatus: string | null;
  sortBy: string;
}

interface Props {
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: string | null) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function OrderFilters({
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
}: Props) {
  const handleFilterChange = (key: keyof Filters, value: string) => {
    // Convert "all" to null to show all items
    onFilterChange(key, value === "all" ? null : value);
  };

  return (
    <div className="bg-linear-to-br from-gray-100/70 via-slate-200/60 to-gray-100/70 dark:from-gray-800/80 dark:via-slate-800/30 dark:to-gray-800/30 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700/50 rounded-2xl p-6 mb-6">
      <FilterHeader title="Filter & Sort" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <FilterSelect
          label="Order Status"
          value={filters.status || "all"}
          onChange={(value) => handleFilterChange("status", value)}
          options={ORDER_STATUS_OPTIONS}
          placeholder="All Orders"
        />

        {/* Payment Status Filter */}
        <FilterSelect
          label="Payment Status"
          value={filters.paymentStatus || "all"}
          onChange={(value) => handleFilterChange("paymentStatus", value)}
          options={PAYMENT_STATUS_OPTIONS}
          placeholder="All Payments"
        />

        {/* Sort By */}
        <FilterSelect
          label="Sort By"
          value={filters.sortBy}
          onChange={(value) => handleFilterChange("sortBy", value)}
          options={SORT_BY_OPTIONS}
          placeholder="Select sorting"
        />
      </div>

      {hasActiveFilters && <ClearAllFilters onClearFilters={onClearFilters} />}
    </div>
  );
}
