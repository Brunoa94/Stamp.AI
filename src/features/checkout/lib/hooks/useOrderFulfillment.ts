import { fulfillPaidOrder } from "../services/orderFulfillmentService";
import type { FulfillOrderT } from "../types/paymentReturn";
import { useRemoveCartItems } from "@/shared/queries/cartQueries";
import {
  useCreateOrderFromCart,
  useUpdateOrderStatus,
} from "@/shared/queries/orderQueries";
import { useCreatePrintifyOrder } from "@/shared/queries/printifyOrderQueries";

/** Binds the order React Query mutations to the fulfillment pipeline. */
export function useOrderFulfillment(): FulfillOrderT {
  const createOrderFromCart = useCreateOrderFromCart();
  const createPrintifyOrder = useCreatePrintifyOrder();
  const updateOrderStatus = useUpdateOrderStatus();
  const removeCartItems = useRemoveCartItems();

  return (request) =>
    fulfillPaidOrder(
      {
        createOrderFromCart: createOrderFromCart.mutateAsync,
        createPrintifyOrder: createPrintifyOrder.mutateAsync,
        updateOrderStatus: updateOrderStatus.mutateAsync,
        removeCartItems: removeCartItems.mutateAsync,
      },
      request,
    );
}
