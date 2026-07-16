import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { OrderWithItemsT } from "@/types/order";
import { ORDERS_DEFAULT_TIME_FILTER } from "../constants/filters";
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

const ORDERS_TIME_FILTER_LABEL_KEYS: Record<OrdersTimeFilterType, string> = {
  "30": "last30",
  "90": "last90",
  "2023": "year2023",
  all: "allTime",
};

export function useOrdersState(orders: OrderWithItemsT[]) {
  const tPills = useTranslations("orders.filterPills");
  const tTime = useTranslations("orders.filterControls.time");
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
        label: tPills("statusPill", {
          status: getStatusFilterLabel(statusFilter),
        }),
        onClear: () => setStatusFilter("all"),
      });
    }

    if (timeFilter !== ORDERS_DEFAULT_TIME_FILTER) {
      items.push({
        key: "time",
        label: tTime(ORDERS_TIME_FILTER_LABEL_KEYS[timeFilter]),
        onClear: () => setTimeFilter(ORDERS_DEFAULT_TIME_FILTER),
      });
    }

    return items;
  }, [statusFilter, timeFilter, tPills, tTime]);

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
