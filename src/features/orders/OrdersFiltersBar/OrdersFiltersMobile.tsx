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

export function OrdersFiltersMobile({
  selectedStatus,
  onStatusChange,
  selectedTimeframe,
  onTimeframeChange,
}: OrdersFiltersBarProps) {
  return (
    <div className={ordersTheme.mobileFilters.container}>
      <div>
        <Label className={ordersTheme.mobileFilters.sectionLabel}>
          Timeframe
        </Label>
        <div className={ordersTheme.mobileFilters.selectWrapper}>
          <Select
            value={selectedTimeframe}
            onValueChange={(value) =>
              onTimeframeChange(value as OrderTimeframeFilterT)
            }
          >
            <SelectTrigger className={ordersTheme.mobileFilters.select}>
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
      </div>

      <div>
        <Label className={ordersTheme.mobileFilters.sectionLabel}>
          Filter Status
        </Label>
        <div className={ordersTheme.mobileFilters.chipsRow}>
          {STATUS_FILTERS.map((filter) => (
            <Button
              key={filter.value}
              onClick={() => onStatusChange(filter.value)}
              variant="outline"
              size="sm"
              className={
                selectedStatus === filter.value
                  ? ordersTheme.mobileFilters.chipActive
                  : ordersTheme.mobileFilters.chipBase
              }
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
