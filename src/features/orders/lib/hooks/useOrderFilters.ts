import { useCallback, useMemo, useReducer } from "react";
import { OrderStatusFilterT, OrderWithItemsT } from "@/types/order";
import {
  OrderFiltersStateType,
  OrderTimeframeType,
} from "../../types/order-filters";
import { orderFiltersReducer } from "../../helpers/orderFiltersReducer";
import { mapTimeframeToThreshold } from "../../helpers/mapTimeframeToThreshold";

const INITIAL_STATE: OrderFiltersStateType = {
  isModalOpen: false,
  selectedOrder: null,
  selectedStatus: "all",
  selectedTimeframe: "last-30",
};

export function useOrderFilters(orders: OrderWithItemsT[] | undefined) {
  const [state, dispatch] = useReducer(orderFiltersReducer, INITIAL_STATE);

  const filteredOrders = useMemo(() => {
    if (!orders?.length) {
      return [];
    }

    const timeframeThreshold = mapTimeframeToThreshold(state.selectedTimeframe);

    return orders.filter((order) => {
      const statusMatches =
        state.selectedStatus === "all"
          ? true
          : order.status?.toLowerCase() === state.selectedStatus;

      if (!statusMatches) {
        return false;
      }

      if (!timeframeThreshold) {
        return true;
      }

      if (!order.created_at) {
        return false;
      }

      const orderDate = new Date(order.created_at);
      if (Number.isNaN(orderDate.getTime())) {
        return false;
      }

      if (state.selectedTimeframe === "2023") {
        return orderDate.getUTCFullYear() === 2023;
      }

      return orderDate >= timeframeThreshold;
    });
  }, [orders, state.selectedStatus, state.selectedTimeframe]);

  const openOrderModal = useCallback((order: OrderWithItemsT) => {
    dispatch({ type: "OPEN_ORDER_MODAL", payload: order });
  }, []);

  const closeOrderModal = useCallback(() => {
    dispatch({ type: "CLOSE_ORDER_MODAL" });
  }, []);

  const setStatusFilter = useCallback((status: OrderStatusFilterT) => {
    dispatch({ type: "SET_STATUS", payload: status });
  }, []);

  const setTimeframeFilter = useCallback((timeframe: OrderTimeframeType) => {
    dispatch({ type: "SET_TIMEFRAME", payload: timeframe });
  }, []);

  return {
    filteredOrders,
    state,
    openOrderModal,
    closeOrderModal,
    setStatusFilter,
    setTimeframeFilter,
  };
}
