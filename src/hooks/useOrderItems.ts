import { useQuery } from "@tanstack/react-query";
import { OrderItemService } from "@/services/orderItemService";

/**
 * Hook to fetch order items for a specific order
 */
export function useOrderItems(orderId: string | null) {
  return useQuery({
    queryKey: ["order-items", orderId],
    queryFn: () => {
      if (!orderId) {
        throw new Error("Order ID is required");
      }
      return OrderItemService.getOrderItems(orderId);
    },
    enabled: !!orderId,
  });
}
