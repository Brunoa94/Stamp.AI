"use client";

import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/features/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CollapsibleOrderFilters } from "./CollapsibleOrderFilters";

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
            isOpen && "bg-gray-50 border-gray-400",
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
      <CollapsibleOrderFilters
        isOpen={isOpen}
        filters={filters}
        onFilterChange={onFilterChange}
      />
    </div>
  );
}
