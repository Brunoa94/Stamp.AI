import { useQuery } from "@tanstack/react-query";
import { OrderService } from "@/services/orderService";

/**
 * Hook to fetch a single order by ID
 */
export function useOrder(orderId: string | null) {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => {
      if (!orderId) {
        throw new Error("Order ID is required");
      }
      return OrderService.getOrder(orderId);
    },
    enabled: !!orderId,
  });
}

/**
 * Hook to fetch orders for a specific user
 */
export function useOrders(userId?: string) {
  return useQuery({
    queryKey: ["orders", { userId }],
    queryFn: () => OrderService.getOrders(userId),
  });
}

/**
 * Hook to fetch order by order number
 */
export function useOrderByNumber(orderNumber: string | null) {
  return useQuery({
    queryKey: ["orders", "number", orderNumber],
    queryFn: () => {
      if (!orderNumber) {
        throw new Error("Order number is required");
      }
      return OrderService.getOrderByNumber(orderNumber);
    },
    enabled: !!orderNumber,
  });
}
