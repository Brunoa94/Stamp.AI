import { useMemo } from "react";
import { normalizeOrderStatus } from "../helpers/normalizeOrderStatus";
import type { OrderWithItemsT } from "@/types/order";
import { isWithinTimeframe } from "../helpers/timeframeFilters";
import { toDisplayStatus } from "../helpers/statusPresentation";
import type {
  OrdersStatusFilterType,
  OrdersTimeFilterType,
} from "../types/filters";

export function useOrdersFiltering(
  orders: OrderWithItemsT[],
  statusFilter: OrdersStatusFilterType,
  timeFilter: OrdersTimeFilterType,
) {
  return useMemo(() => {
    return orders
      .filter((order) => {
        const normalizedStatus = toDisplayStatus(order.status);
        if (
          statusFilter !== "all" &&
          normalizedStatus !== normalizeOrderStatus(statusFilter)
        ) {
          return false;
        }
        return isWithinTimeframe(order.created_at, timeFilter);
      })
      .sort((a, b) => {
        const aTime = new Date(a.created_at || 0).getTime();
        const bTime = new Date(b.created_at || 0).getTime();
        return bTime - aTime;
      });
  }, [orders, statusFilter, timeFilter]);
}
