import { useCallback, useMemo, useReducer } from "react";
import {
  OrderWithItemsT,
  OrderStatusFilterT,
  OrderTimeframeFilterT,
} from "@/types/order";

interface OrderFiltersStateI {
  isModalOpen: boolean;
  selectedOrder: OrderWithItemsT | null;
  selectedStatus: OrderStatusFilterT;
  selectedTimeframe: OrderTimeframeFilterT;
}

type OrderFiltersActionT =
  | { type: "OPEN_ORDER_MODAL"; payload: OrderWithItemsT }
  | { type: "CLOSE_ORDER_MODAL" }
  | { type: "SET_STATUS"; payload: OrderStatusFilterT }
  | { type: "SET_TIMEFRAME"; payload: OrderTimeframeFilterT };

const INITIAL_STATE: OrderFiltersStateI = {
  isModalOpen: false,
  selectedOrder: null,
  selectedStatus: "all",
  selectedTimeframe: "last-30",
};

function orderFiltersReducer(
  state: OrderFiltersStateI,
  action: OrderFiltersActionT,
): OrderFiltersStateI {
  switch (action.type) {
    case "OPEN_ORDER_MODAL":
      return {
        ...state,
        isModalOpen: true,
        selectedOrder: action.payload,
      };
    case "CLOSE_ORDER_MODAL":
      return {
        ...state,
        isModalOpen: false,
        selectedOrder: null,
      };
    case "SET_STATUS":
      return {
        ...state,
        selectedStatus: action.payload,
      };
    case "SET_TIMEFRAME":
      return {
        ...state,
        selectedTimeframe: action.payload,
      };
    default:
      return state;
  }
}

function mapTimeframeToThreshold(
  timeframe: OrderTimeframeFilterT,
): Date | null {
  const now = new Date();

  switch (timeframe) {
    case "last-30": {
      const threshold = new Date(now);
      threshold.setDate(now.getDate() - 30);
      return threshold;
    }
    case "last-90": {
      const threshold = new Date(now);
      threshold.setDate(now.getDate() - 90);
      return threshold;
    }
    case "2023":
      return new Date("2023-01-01T00:00:00.000Z");
    case "all-time":
    default:
      return null;
  }
}

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

  const setTimeframeFilter = useCallback((timeframe: OrderTimeframeFilterT) => {
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
