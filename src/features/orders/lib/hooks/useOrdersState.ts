import { useEffect, useMemo, useState } from "react";
import type { OrderWithItemsT } from "@/types/order";
import {
  ORDERS_DEFAULT_TIME_FILTER,
  ORDERS_TIME_FILTER_LABELS,
} from "../constants/filters";
import { getStatusFilterLabel } from "../helpers/statusPresentation";
import { useFilterLoading } from "./useFilterLoading";
import { useOrdersFiltering } from "./useOrdersFiltering";
import { useOrdersPagination } from "./useOrdersPagination";
import type {
  OrdersFilterPillType,
  OrdersStatusFilterType,
  OrdersTimeFilterType,
} from "../types/filters";
import type { OrdersViewModeType } from "../types/viewMode";

export function useOrdersState(orders: OrderWithItemsT[]) {
  const [viewMode, setViewMode] = useState<OrdersViewModeType>("list");
  const [statusFilter, setStatusFilter] = useState<OrdersStatusFilterType>(
    "all",
  );
  const [timeFilter, setTimeFilter] =
    useState<OrdersTimeFilterType>(ORDERS_DEFAULT_TIME_FILTER);
  const [page, setPage] = useState(1);
  const isFilterLoading = useFilterLoading([statusFilter, timeFilter]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, timeFilter, viewMode]);

  const filteredOrders = useOrdersFiltering(orders, statusFilter, timeFilter);
  const pagination = useOrdersPagination(filteredOrders, page);

  const clearFilters = () => {
    setStatusFilter("all");
    setTimeFilter(ORDERS_DEFAULT_TIME_FILTER);
  };

  const activePills = useMemo<OrdersFilterPillType[]>(() => {
    const items: OrdersFilterPillType[] = [];

    if (statusFilter !== "all") {
      items.push({
        key: "status",
        label: `Status: ${getStatusFilterLabel(statusFilter)}`,
        onClear: () => setStatusFilter("all"),
      });
    }

    if (timeFilter !== ORDERS_DEFAULT_TIME_FILTER) {
      items.push({
        key: "time",
        label: ORDERS_TIME_FILTER_LABELS[timeFilter],
        onClear: () => setTimeFilter(ORDERS_DEFAULT_TIME_FILTER),
      });
    }

    return items;
  }, [statusFilter, timeFilter]);

  const showEmptyState = !isFilterLoading && filteredOrders.length === 0;

  return {
    viewMode,
    setViewMode,
    statusFilter,
    setStatusFilter,
    timeFilter,
    setTimeFilter,
    clearFilters,
    activePills,
    isFilterLoading,
    filteredOrders,
    showEmptyState,
    pagination,
    setPage,
  };
}
