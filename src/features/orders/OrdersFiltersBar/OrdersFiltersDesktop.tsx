import { ordersTheme } from "@/theme/components";
import { Button } from "@/features/ui/button";
import { Label } from "@/features/ui/label";
import { STATUS_FILTERS, TIMEFRAME_OPTIONS } from "@/constants/orders";
import { OrderTimeframeFilterT } from "@/types/order";
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
          <SelectTrigger className="w-48">
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

      <div className="flex flex-wrap items-center gap-2">
        <Label className={ordersTheme.filters.statusLabel}>Status:</Label>
        {STATUS_FILTERS.map((filter) => (
          <Button
            key={filter.value}
            onClick={() => onStatusChange(filter.value)}
            variant="outline"
            size="sm"
            className={
              selectedStatus === filter.value
                ? ordersTheme.filters.chipActive
                : ordersTheme.filters.chipBase
            }
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
