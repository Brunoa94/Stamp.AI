import { useMemo, useReducer } from "react";
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

export function useOrderFilters(orders: OrderWithItemsT[] | undefined) {
  const [state, dispatch] = useReducer(orderFiltersReducer, INITIAL_STATE);

  const filteredOrders = 
      orders?.filter((order) => {
        if (state.selectedStatus === "all") return true;
        return order.status?.toLowerCase() === state.selectedStatus;
      }) || [];

  const openOrderModal = (order: OrderWithItemsT) => {
    dispatch({ type: "OPEN_ORDER_MODAL", payload: order });
  };

  const closeOrderModal = () => {
    dispatch({ type: "CLOSE_ORDER_MODAL" });
  };

  const setStatusFilter = (status: OrderStatusFilterT) => {
    dispatch({ type: "SET_STATUS", payload: status });
  };

  const setTimeframeFilter = (timeframe: OrderTimeframeFilterT) => {
    dispatch({ type: "SET_TIMEFRAME", payload: timeframe });
  };

  return {
    filteredOrders,
    state,
    openOrderModal,
    closeOrderModal,
    setStatusFilter,
    setTimeframeFilter,
  };
}
