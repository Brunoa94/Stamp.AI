"use client";

import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/features/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { componentThemes } from "@/theme";

interface Props {
  filters: {
    status: string | null;
    paymentStatus: string | null;
    sortBy: string;
  };
  onFilterChange: (key: string, value: string | null) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function OrderFilters({
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full space-y-4">
      {/* Toggle Button Row */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          className={cn(
            "flex items-center gap-2 border-gray-300 text-slate-700 hover:bg-gray-50",
            isOpen && "bg-gray-50 border-gray-400"
          )}
        >
          <Filter className="w-4 h-4" />
          <span>Filter Orders</span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 ml-1 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-1 text-slate-400" />
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            onClick={onClearFilters}
            variant="ghost"
            size="sm"
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Collapsible Filter Content */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out overflow-hidden",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="min-h-0">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Status Filter */}
              <div className="space-y-1.5">
                <label htmlFor="status-filter" className={componentThemes.text.label}>
                  Order Status
                </label>
                <select
                  id="status-filter"
                  value={filters.status || ""}
                  onChange={(e) => onFilterChange("status", e.target.value || null)}
                  className={componentThemes.input.base}
                >
                  <option value="">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Payment Status Filter */}
              <div className="space-y-1.5">
                <label htmlFor="payment-filter" className={componentThemes.text.label}>
                  Payment Status
                </label>
                <select
                  id="payment-filter"
                  value={filters.paymentStatus || ""}
                  onChange={(e) => onFilterChange("paymentStatus", e.target.value || null)}
                  className={componentThemes.input.base}
                >
                  <option value="">All Payments</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="space-y-1.5">
                <label htmlFor="sort-filter" className={componentThemes.text.label}>
                  Sort By
                </label>
                <select
                  id="sort-filter"
                  value={filters.sortBy}
                  onChange={(e) => onFilterChange("sortBy", e.target.value)}
                  className={componentThemes.input.base}
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="amount-desc">Highest Amount</option>
                  <option value="amount-asc">Lowest Amount</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
