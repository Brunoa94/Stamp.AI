import type { OrdersTimeFilterType } from "../types/filters";

export const ORDERS_FILTER_LOADING_MS = 800;

export const ORDERS_DEFAULT_TIME_FILTER: OrdersTimeFilterType = "all";

export const ORDERS_TIME_FILTER_LABELS: Record<OrdersTimeFilterType, string> = {
  "30": "Last 30 Days",
  "90": "Last 90 Days",
  "2023": "Year 2023",
  all: "All Time",
};
