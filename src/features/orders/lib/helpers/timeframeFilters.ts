import type { OrderTimeframeFilterT } from "@/types/order";
import type { OrdersTimeFilterType } from "../types/filters";


export function isWithinTimeframe(
  dateString: string | null,
  timeframe: OrdersTimeFilterType,
): boolean {
  if (!dateString || timeframe === "all") return true;

  const orderDate = new Date(dateString);
  if (Number.isNaN(orderDate.getTime())) return false;

  const now = new Date();

  if (timeframe === "2023") {
    return orderDate.getFullYear() === 2023;
  }

  const thresholdDays = timeframe === "30" ? 30 : 90;
  const thresholdDate = new Date(now);
  thresholdDate.setDate(thresholdDate.getDate() - thresholdDays);

  return orderDate >= thresholdDate;
}
