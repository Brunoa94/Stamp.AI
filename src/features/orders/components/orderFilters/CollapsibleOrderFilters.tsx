import { FilterSelect } from "@/features/ui/filter-select";
import { cn } from "@/lib/utils";
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

interface CollapsibleOrderFiltersProps {
  isOpen: boolean;
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: string | null) => void;
}

export function CollapsibleOrderFilters({
  isOpen,
  filters,
  onFilterChange,
}: CollapsibleOrderFiltersProps) {
  return (
    <div
      className={cn(
        "grid transition-all duration-300 ease-in-out overflow-hidden",
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
      )}
    >
      <div className="min-h-0">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              onChange={(value) =>
                onFilterChange("paymentStatus", value || null)
              }
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
        </div>
      </div>
    </div>
  );
}
