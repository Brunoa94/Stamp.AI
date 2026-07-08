import { LayoutGrid, List, RotateCcw } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/ui/select";
import type {
  OrdersStatusFilterType,
  OrdersTimeFilterType,
} from "../../../lib/types/filters";
import type { OrdersViewModeType } from "../../../lib/types/viewMode";

interface PropsI {
  viewMode: OrdersViewModeType;
  onViewModeChange: (mode: OrdersViewModeType) => void;
  statusFilter: OrdersStatusFilterType;
  onStatusFilterChange: (status: OrdersStatusFilterType) => void;
  timeFilter: OrdersTimeFilterType;
  onTimeFilterChange: (time: OrdersTimeFilterType) => void;
  onClearFilters: () => void;
}

export function OrdersFilterControls({
  viewMode,
  onViewModeChange,
  statusFilter,
  onStatusFilterChange,
  timeFilter,
  onTimeFilterChange,
  onClearFilters,
}: PropsI) {
  return (
    <div className="flex flex-col gap-4">
      <Span
        variant="default"
        className="font-bold uppercase text-[10px] tracking-[0.4em] text-(--color-stamp-taupe)"
      >
        Archive Filtering
      </Span>

      <div className="flex flex-wrap items-center gap-4">
        <OrdersStatusSelect
          value={statusFilter}
          onChange={onStatusFilterChange}
        />

        <OrdersTimeSelect value={timeFilter} onChange={onTimeFilterChange} />

        <Button
          onClick={onClearFilters}
          variant="ghost"
          className="h-12 flex items-center gap-2 px-4 font-bold uppercase text-[11px] tracking-widest text-(--color-stamp-taupe) hover:bg-transparent hover:text-(--color-stamp-gold)"
        >
          <RotateCcw className="h-4 w-4" />
          Clear Archive
        </Button>

        <OrdersViewModeToggle viewMode={viewMode} onChange={onViewModeChange} />
      </div>
    </div>
  );
}

interface OrdersStatusSelectPropsI {
  value: OrdersStatusFilterType;
  onChange: (value: OrdersStatusFilterType) => void;
}

function OrdersStatusSelect({ value, onChange }: OrdersStatusSelectPropsI) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as OrdersStatusFilterType)}
    >
      <SelectTrigger
        aria-label="Filter by order status"
        className="h-12 w-auto min-w-52 border border-(--color-stamp-divider) bg-white px-4 font-bold uppercase text-[11px] tracking-widest text-(--color-stamp-chocolate) shadow-none hover:border-(--color-stamp-chocolate)"
      >
        <SelectValue placeholder="Status: All Statuses" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Status: All Statuses</SelectItem>
        <SelectItem value="delivered">Delivered</SelectItem>
        <SelectItem value="shipped">Shipped</SelectItem>
        <SelectItem value="processing">Processing</SelectItem>
        <SelectItem value="cancelled">Cancelled</SelectItem>
      </SelectContent>
    </Select>
  );
}

interface OrdersTimeSelectPropsI {
  value: OrdersTimeFilterType;
  onChange: (value: OrdersTimeFilterType) => void;
}

function OrdersTimeSelect({ value, onChange }: OrdersTimeSelectPropsI) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as OrdersTimeFilterType)}
    >
      <SelectTrigger
        aria-label="Filter by date range"
        className="h-12 w-auto min-w-44 border border-(--color-stamp-divider) bg-white px-4 font-bold uppercase text-[11px] tracking-widest text-(--color-stamp-chocolate) shadow-none hover:border-(--color-stamp-chocolate)"
      >
        <SelectValue placeholder="Last 30 Days" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="30">Last 30 Days</SelectItem>
        <SelectItem value="90">Last 90 Days</SelectItem>
        <SelectItem value="2023">Year 2023</SelectItem>
        <SelectItem value="all">All Time</SelectItem>
      </SelectContent>
    </Select>
  );
}

interface OrdersViewModeTogglePropsI {
  viewMode: OrdersViewModeType;
  onChange: (mode: OrdersViewModeType) => void;
}

function OrdersViewModeToggle({
  viewMode,
  onChange,
}: OrdersViewModeTogglePropsI) {
  return (
    <div className="flex items-center gap-2 border-l border-(--color-stamp-divider) pl-4">
      <Button
        onClick={() => onChange("list")}
        variant="ghost"
        size="icon"
        aria-label="Switch to list view"
        className={`h-10 w-10 transition-all hover:scale-110 ${viewMode === "list" ? "text-(--color-stamp-chocolate)" : "text-(--color-stamp-taupe)"}`}
      >
        <List className="h-5 w-5" />
      </Button>
      <Button
        onClick={() => onChange("grid")}
        variant="ghost"
        size="icon"
        aria-label="Switch to grid view"
        className={`h-10 w-10 transition-all hover:scale-110 ${viewMode === "grid" ? "text-(--color-stamp-chocolate)" : "text-(--color-stamp-taupe)"}`}
      >
        <LayoutGrid className="h-5 w-5" />
      </Button>
    </div>
  );
}
