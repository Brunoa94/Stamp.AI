import { OrderStatusFilterT, OrderWithItemsT } from "@/types/order";

export type OrderTimeframeType = "last-30" | "last-90" | "2023" | "all-time";

export interface OrderFiltersStateType {
  isModalOpen: boolean;
  selectedOrder: OrderWithItemsT | null;
  selectedStatus: OrderStatusFilterT;
  selectedTimeframe: OrderTimeframeType;
}

export type OrderFiltersActionType =
  | { type: "OPEN_ORDER_MODAL"; payload: OrderWithItemsT }
  | { type: "CLOSE_ORDER_MODAL" }
  | { type: "SET_STATUS"; payload: OrderStatusFilterT }
  | { type: "SET_TIMEFRAME"; payload: OrderTimeframeType };
