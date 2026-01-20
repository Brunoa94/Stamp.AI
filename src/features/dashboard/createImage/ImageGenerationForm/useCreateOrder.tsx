import { OrderService } from "@/services/orderService";
import { OrderItemService } from "@/services/orderItemService";
import { CreateOrderT, OrderT } from "@/types/order";
import { CreateOrderItemT } from "@/types/orderItem";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface CreateOrderWithItemsPayload {
  order: Omit<CreateOrderT, "order_number">;
  orderItem: Omit<CreateOrderItemT, "order_id">;
}

export default function useCreateOrder() {
  return useMutation({
    mutationFn: async (
      payload: CreateOrderWithItemsPayload,
    ): Promise<OrderT> => {
      const supabase = createClient();

      // Generate unique order number using database function
      const { data: orderNumberData, error: orderNumberError } =
        await supabase.rpc("generate_order_number");

      if (orderNumberError || !orderNumberData) {
        throw new Error("Failed to generate order number");
      }

      // Create the order with generated order number
      const createdOrder = await OrderService.createOrder({
        ...payload.order,
        order_number: orderNumberData,
      });

      // Create the order item with the order_id
      await OrderItemService.createOrderItem({
        ...payload.orderItem,
        order_id: createdOrder.id,
      });

      return createdOrder;
    },
    onSuccess: (data) => {
      toast.success("Order created successfully", {
        description: `Order ${data.order_number} has been created and is pending payment.`,
        duration: 5000,
      });
    },
    onError: (error: Error) => {
      toast.error("Order creation failed", {
        description: error.message,
        duration: 5000,
      });
    },
  });
}
