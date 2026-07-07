import {
  OrderFiltersActionType,
  OrderFiltersStateType,
} from "../types/order-filters";

export function orderFiltersReducer(
  state: OrderFiltersStateType,
  action: OrderFiltersActionType,
): OrderFiltersStateType {
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
