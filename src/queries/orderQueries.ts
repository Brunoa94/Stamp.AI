import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OrderService } from "@/services/orderService";
import { CartWithItems } from "@/types/cart";
import { UserI } from "../../supabase/types";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import type { ShippingAddressT } from "@/schemas/checkout";

/**
 * Fetch orders for a specific user
 *
 * Orders should always show fresh data since users expect to see
 * recent order updates immediately (e.g., after placing an order).
 */
export function useOrders(userId?: string) {
  return useQuery({
    queryKey: ["orders", { userId }],
    queryFn: () => OrderService.getOrders(userId),
    enabled: Boolean(userId),
    staleTime: 0, // Orders data is always considered stale
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when user returns to tab
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
      paymentMethod,
    }: {
      user: UserI;
      cart: CartWithItems;
      paymentStatus?: string;
      shippingAddress?: ShippingAddressT;
      billingAddress?: ShippingAddressT;
      idempotencyKey?: string;
      orderStatus?: string;
      paymentMethod?: string;
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
        paymentMethod,
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
