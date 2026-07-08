import { useMemo } from "react";
import type { OrderWithItemsT } from "@/types/order";
import { ORDERS_ITEMS_PER_PAGE } from "../constants/pagination";
import type { OrdersPaginationType } from "../types/pagination";

export function useOrdersPagination(
  filteredOrders: OrderWithItemsT[],
  page: number,
): OrdersPaginationType {
  return useMemo<OrdersPaginationType>(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredOrders.length / ORDERS_ITEMS_PER_PAGE),
    );
    const boundedPage = Math.min(page, totalPages);
    const startIndex = (boundedPage - 1) * ORDERS_ITEMS_PER_PAGE;
    const paginatedOrders = filteredOrders.slice(
      startIndex,
      startIndex + ORDERS_ITEMS_PER_PAGE,
    );

    return {
      page: boundedPage,
      totalPages,
      startIndex,
      paginatedOrders,
    };
  }, [filteredOrders, page]);
}
