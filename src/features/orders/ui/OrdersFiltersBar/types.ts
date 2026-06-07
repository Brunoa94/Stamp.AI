import { OrderStatusFilterT, OrderTimeframeFilterT } from "@/types/order";

export interface OrdersFiltersBarProps {
  selectedStatus: OrderStatusFilterT;
  onStatusChange: (status: OrderStatusFilterT) => void;
  selectedTimeframe: OrderTimeframeFilterT;
  onTimeframeChange: (timeframe: OrderTimeframeFilterT) => void;
}
