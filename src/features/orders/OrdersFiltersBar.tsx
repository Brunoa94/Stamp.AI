"use client";

import { ordersTheme } from "@/theme/components";
import { Button } from "@/features/ui/button";
import { OrderStatusFilterT, OrderTimeframeFilterT } from "@/types/order";
import { STATUS_FILTERS, TIMEFRAME_OPTIONS } from "@/constants/orders";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/ui/select";

interface OrdersFiltersBarProps {
  selectedStatus: OrderStatusFilterT;
  onStatusChange: (status: OrderStatusFilterT) => void;
  selectedTimeframe: OrderTimeframeFilterT;
  onTimeframeChange: (timeframe: OrderTimeframeFilterT) => void;
}

export function OrdersFiltersBar({
  selectedStatus,
  onStatusChange,
  selectedTimeframe,
  onTimeframeChange,
}: OrdersFiltersBarProps) {
  return (
    <div className={ordersTheme.filters.container}>
      <div className="flex items-center gap-4">
        <label className={ordersTheme.filters.timeframeLabel}>Timeframe:</label>
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
        <span className={ordersTheme.filters.statusLabel}>Status:</span>
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
