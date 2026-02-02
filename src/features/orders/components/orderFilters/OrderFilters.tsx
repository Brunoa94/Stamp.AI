"use client";

import { FilterHeader } from "@/features/ui/filters/FilterHeader";
import { FilterSelect } from "@/features/ui/filter-select";
import { Button } from "@/features/ui/button";
import {
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  SORT_BY_OPTIONS,
} from "./orderFilterOptions";

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
  return (
    <div className="bg-linear-to-br from-purple-100/70 via-purple-200/60 to-pink-100/70 dark:from-gray-800/80 dark:via-purple-800/30 dark:to-pink-800/30 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-700/50 rounded-2xl p-6 mb-6">
      <FilterHeader title="Filter & Sort" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <FilterSelect
          label="Order Status"
          value={filters.status || ""}
          onChange={(value) => onFilterChange("status", value || null)}
          options={ORDER_STATUS_OPTIONS}
          placeholder="All Orders"
        />

        {/* Payment Status Filter */}
        <FilterSelect
          label="Payment Status"
          value={filters.paymentStatus || ""}
          onChange={(value) => onFilterChange("paymentStatus", value || null)}
          options={PAYMENT_STATUS_OPTIONS}
          placeholder="All Payments"
        />

        {/* Sort By */}
        <FilterSelect
          label="Sort By"
          value={filters.sortBy}
          onChange={(value) => onFilterChange("sortBy", value)}
          options={SORT_BY_OPTIONS}
          placeholder="Select sorting"
        />
      </div>

      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-700">
          <Button
            onClick={onClearFilters}
            variant="ghost"
            size="sm"
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
