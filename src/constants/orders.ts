import { OrderStatusFilterT, OrderTimeframeFilterT } from "@/types/order";

export const STATUS_FILTERS: { label: string; value: OrderStatusFilterT }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Waiting Confirmation", value: "waiting_confirmation" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Unsuccessful Confirmation", value: "unsuccessful_confirmation" },
];

export const TIMEFRAME_OPTIONS: { label: string; value: OrderTimeframeFilterT }[] = [
  { label: "Last 30 Days", value: "last-30" },
  { label: "Last 90 Days", value: "last-90" },
  { label: "2023 Orders", value: "2023" },
  { label: "All Time", value: "all-time" },
];
