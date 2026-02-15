import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OrderService } from "@/services/orderService";
import { OrderItemService } from "@/services/orderItemService";
import { CreateOrderT, UpdateOrderT } from "@/types/order";
import { UserI } from "@/shared-types";
import { CartWithItems } from "@/types/cart";

/**
 * Fetch a single order by ID
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
 * Fetch orders for a specific user
 */
export function useOrders(userId?: string) {
  return useQuery({
    queryKey: ["orders", { userId }],
    queryFn: () => OrderService.getOrders(userId),
  });
}

/**
 * Fetch order by order number
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

/**
 * Fetch order items for a specific order
 */
export function useOrderItems(orderId: string | null) {
  return useQuery({
    queryKey: ["orders", orderId, "items"],
    queryFn: () => {
      if (!orderId) {
        throw new Error("Order ID is required");
      }
      return OrderItemService.getOrderItems(orderId);
    },
    enabled: !!orderId,
  });
}

/**
 * Create a new order
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderT) => OrderService.createOrder(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(["orders", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

/**
 * Update an existing order
 */
export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: string; payload: UpdateOrderT }) =>
      OrderService.updateOrder(orderId, payload),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["orders", variables.orderId], data);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

/**
 * Update order status
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      OrderService.updateOrderStatus(orderId, status),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["orders", variables.orderId], data);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

/**
 * Update order payment status
 */
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, paymentStatus }: { orderId: string; paymentStatus: string }) =>
      OrderService.updatePaymentStatus(orderId, paymentStatus),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["orders", variables.orderId], data);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

/**
 * Update order fulfillment status
 */
export function useUpdateFulfillmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, fulfillmentStatus }: { orderId: string; fulfillmentStatus: string }) =>
      OrderService.updateFulfillmentStatus(orderId, fulfillmentStatus),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["orders", variables.orderId], data);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

/**
 * Delete an order
 */
export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => OrderService.deleteOrder(orderId),
    onSuccess: (_, orderId) => {
      queryClient.removeQueries({ queryKey: ["orders", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

/**
 * Create order from cart (checkout flow)
 */
export function useCreateOrderFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, cart }: { user: UserI; cart: CartWithItems }) => {
      if (!user) {
        throw new Error("User not authenticated");
      }
      return await OrderService.createOrderFromCart({ cart, user });
    },
    onSuccess: (orderId) => {
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      // Invalidate cart
      queryClient.invalidateQueries({ queryKey: ["cart"] });

      // Set the new order in cache if we have the ID
      if (orderId) {
        queryClient.invalidateQueries({ queryKey: ["orders", orderId] });
      }
    },
  });
}
