import { OrderStatusFilterT, OrderTimeframeFilterT } from "@/types/order";

export const STATUS_FILTERS: { label: string; value: OrderStatusFilterT }[] = [
  { label: "All", value: "all" },
  { label: "Waiting Payment", value: "waiting_payment" },
  { label: "Paid", value: "paid" },
  { label: "Confirmed", value: "confirmed" },
  { label: "In Production", value: "in_production" },
  { label: "Shipped", value: "shipped" },
  { label: "In Transit", value: "in_transit" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Refunded", value: "refunded" },
];

export const TIMEFRAME_OPTIONS: { label: string; value: OrderTimeframeFilterT }[] = [
  { label: "Last 30 Days", value: "last-30" },
  { label: "Last 90 Days", value: "last-90" },
  { label: "2023 Orders", value: "2023" },
  { label: "All Time", value: "all-time" },
];
