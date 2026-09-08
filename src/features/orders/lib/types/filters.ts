import type { OrderStatusFilterT } from "@/types/order";

export type OrdersStatusFilterType = OrderStatusFilterT;
export type OrdersTimeFilterType = "30" | "90" | "2023" | "all";

export type OrdersFilterPillType = {
  key: string;
  label: string;
  onClear: () => void;
};
