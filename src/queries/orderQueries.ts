import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OrderService } from "@/services/orderService";
import { OrderItemService } from "@/services/orderItemService";
import { CreateOrderT, UpdateOrderT } from "@/types/order";
import { CartWithItems } from "@/types/cart";
import { UserI } from "@/types/auth";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import type { ShippingAddressT } from "@/schemas/checkout";

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
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: (payload: CreateOrderT) => OrderService.createOrder(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(["orders", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: Error) => {
      handleError(error);
    },
  });
}

/**
 * Update an existing order
 */
export function useUpdateOrder() {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: string; payload: UpdateOrderT }) =>
      OrderService.updateOrder(orderId, payload),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["orders", variables.orderId], data);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: Error) => {
      handleError(error);
    },
  });
}

/**
 * Update order status
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      OrderService.updateOrderStatus(orderId, status),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["orders", variables.orderId], data);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: Error) => {
      handleError(error);
    },
  });
}

/**
 * Update order payment status
 */
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: ({ orderId, paymentStatus }: { orderId: string; paymentStatus: string }) =>
      OrderService.updatePaymentStatus(orderId, paymentStatus),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["orders", variables.orderId], data);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: Error) => {
      handleError(error);
    },
  });
}

/**
 * Delete an order
 */
export function useDeleteOrder() {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: (orderId: string) => OrderService.deleteOrder(orderId),
    onSuccess: (_, orderId) => {
      queryClient.removeQueries({ queryKey: ["orders", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: Error) => {
      handleError(error);
    },
  });
}

/**
 * Create order from cart (checkout flow)
 */
export function useCreateOrderFromCart() {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: async ({
      user,
      cart,
      paymentStatus = "paid",
      shippingAddress,
      billingAddress,
      idempotencyKey,
      orderStatus,
    }: {
      user: UserI;
      cart: CartWithItems;
      paymentStatus?: string;
      shippingAddress?: ShippingAddressT;
      billingAddress?: ShippingAddressT;
      idempotencyKey?: string;
      orderStatus?: string;
    }) => {
      if (!user) {
        throw new Error("User not authenticated");
      }
      return await OrderService.createOrderFromCart({
        cart,
        user,
        paymentStatus,
        shippingAddress,
        billingAddress,
        idempotencyKey,
        orderStatus,
      });
    },
    onSuccess: (orderId) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });

      if (orderId) {
        queryClient.invalidateQueries({ queryKey: ["orders", orderId] });
      }
    },
    onError: (error: Error) => {
      handleError(error);
    },
    // CRITICAL: Do NOT retry order creation - duplicates can be created
    // Idempotency is handled at the database level via idempotency_key
    retry: false,
  });
}
