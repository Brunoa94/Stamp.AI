/**
 * @deprecated This file has been moved to @/queries/orderQueries
 * Please update your imports:
 * - import { useOrder, useOrders, etc } from "@/queries/orderQueries"
 * - Or import from "@/queries" for all queries
 */

export {
  useOrder,
  useOrders,
  useOrderByNumber,
  useOrderItems,
  useCreateOrder,
  useUpdateOrder,
  useUpdateOrderStatus,
  useUpdatePaymentStatus,
  useUpdateFulfillmentStatus,
  useDeleteOrder,
} from "@/queries/orderQueries";
