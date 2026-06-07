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
import { OrdersFiltersBarProps } from "../OrdersFiltersBar/types";

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
            <SelectTrigger className={`${ordersTheme.mobileFilters.select} border-slate-400`}>
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
          Status
        </Label>
        <div className={ordersTheme.mobileFilters.selectWrapper}>
          <Select
            value={selectedStatus}
            onValueChange={(value) =>
              onStatusChange(value as OrderStatusFilterT)
            }
          >
            <SelectTrigger className={`${ordersTheme.mobileFilters.select} border-slate-400`}>
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
    </div>
  );
}
