import { ordersTheme } from "@/theme/components";
import { Label } from "@/features/ui/label";
import { STATUS_FILTERS, TIMEFRAME_OPTIONS } from "@/constants/orders";
import { OrderStatusFilterT, OrderTimeframeFilterT } from "@/types/order";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/ui/select";
import { OrdersFiltersBarProps } from "./types";

export function OrdersFiltersDesktop({
  selectedStatus,
  onStatusChange,
  selectedTimeframe,
  onTimeframeChange,
}: OrdersFiltersBarProps) {
  return (
    <div className={`${ordersTheme.filters.container} hidden md:flex`}>
      <div className="flex items-center gap-4">
        <Label className={ordersTheme.filters.timeframeLabel}>Timeframe:</Label>
        <Select
          value={selectedTimeframe}
          onValueChange={(value) =>
            onTimeframeChange(value as OrderTimeframeFilterT)
          }
        >
          <SelectTrigger className="w-48 border-slate-400">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIMEFRAME_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4">
        <Label className={ordersTheme.filters.statusLabel}>Status:</Label>
        <Select
          value={selectedStatus}
          onValueChange={(value) => onStatusChange(value as OrderStatusFilterT)}
        >
          <SelectTrigger className="w-56 border-slate-400">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
