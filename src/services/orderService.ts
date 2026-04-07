import { createClient } from "@/lib/supabase/client";
import { CreateOrderT, OrderT, UpdateOrderT, OrderWithItemsT } from "../types/order";
import { OrderWithItemsSchema, OrderSchema } from "@/schemas/order";
import { OrderServiceMapper } from "@/mappers/services";
import { z } from "zod";
import { CartItem, CartT, CartWithItems } from "@/types/cart";
import { CartService } from "./cartService";
import { OrderItemService } from "./orderItemService";
import { UserI } from "@/types/auth";
import { ErrorClient } from "./errorClient";

export class OrderService {
  private static getSupabase() {
    return createClient();
  }

  /**
   * Get all orders for a specific user
   */
  static async getOrders(userId?: string): Promise<OrderWithItemsT[]> {
    try {
      const supabase = this.getSupabase();

      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      // Filter by user if userId is provided
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      // Handle Supabase errors
      if (error) {
        throw ErrorClient.handleError({ error, service: "Order", action: "Get Orders" });
      }

      if (!data) {
        throw ErrorClient.handleError({ error: new Error("No data returned from query"), service: "Order", action: "Get Orders" });
      }

      // Validate response with Zod schema
      const validatedData = z.array(OrderWithItemsSchema).parse(data);

      return validatedData as OrderWithItemsT[];
    } catch (error) {
      throw ErrorClient.handleError({error, service: "Order", action: "Get Orders"})
    }
  }

  /**
   * Get a single order by ID
   */
  static async getOrder(orderId: string): Promise<OrderWithItemsT> {
    try {
      const supabase = this.getSupabase();

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('id', orderId)
        .single();

      // Handle Supabase errors
      if (error) {
        throw ErrorClient.handleError({ error, service: "Order", action: "Get Order" });
      }

      if (!data) {
        throw ErrorClient.handleError({ error: new Error(`Order not found with id: ${orderId}`), service: "Order", action: "Get Order" });
      }

      // Validate response with Zod schema
      const validatedData = OrderWithItemsSchema.parse(data);

      return validatedData as OrderWithItemsT;
    } catch (error) {
      throw ErrorClient.handleError({error, service: "Order", action: "Get Order"})
    }
  }

  /**
   * Get orders by order number
   */
  static async getOrderByNumber(orderNumber: string): Promise<OrderWithItemsT> {
    try {
      const supabase = this.getSupabase();

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('order_number', orderNumber)
        .single();

      // Handle Supabase errors
      if (error) {
        throw ErrorClient.handleError({ error, service: "Order", action: "Get Order By Number" });
      }

      if (!data) {
        throw ErrorClient.handleError({ error: new Error(`Order not found with number: ${orderNumber}`), service: "Order", action: "Get Order By Number" });
      }

      // Validate response with Zod schema
      const validatedData = OrderWithItemsSchema.parse(data);

      return validatedData as OrderWithItemsT;
    } catch (error) {
      throw ErrorClient.handleError({error, service: "Order", action: "Get Order By Number"})
    }
  }

  /**
   * Create a new order
   */
  static async createOrder(payload: CreateOrderT): Promise<OrderT> {
    try {
      const supabase = this.getSupabase();

      const { data, error } = await supabase
        .from('orders')
        .insert(payload)
        .select()
        .single();

      // Handle Supabase errors
      if (error) {
        throw ErrorClient.handleError({ error, service: "Order", action: "Create Order" });
      }

      if (!data) {
        throw ErrorClient.handleError({ error: new Error("No data returned after order creation"), service: "Order", action: "Create Order" });
      }

      return data;
    } catch (error) {
      throw ErrorClient.handleError({error, service: "Order", action: "Create Order"})
    }
  }

  /**
   * Update an existing order
   */
  static async updateOrder(
    orderId: string,
    payload: UpdateOrderT
  ): Promise<OrderT> {
    try {
      const supabase = this.getSupabase();

      const { data, error } = await supabase
        .from('orders')
        .update(payload)
        .eq('id', orderId)
        .select()
        .single();

      // Handle Supabase errors
      if (error) {
        throw ErrorClient.handleError({ error, service: "Order", action: "Update Order" });
      }

      if (!data) {
        throw ErrorClient.handleError({ error: new Error(`Order not found or update failed for id: ${orderId}`), service: "Order", action: "Update Order" });
      }

      return data;
    } catch (error) {
      throw ErrorClient.handleError({error, service: "Order", action: "Update Order"})
    }
  }

  /**
   * Update order status
   * Uses OrderServiceMapper to create update payload
   */
  static async updateOrderStatus(
    orderId: string,
    status: string
  ): Promise<OrderT> {
    try {
      const updatePayload = OrderServiceMapper.mapStatusToUpdate(status);
      return await this.updateOrder(orderId, updatePayload);
    } catch (error) {
      throw ErrorClient.handleError({error, service: "Order", action: "Update Order Status"})
    }
  }

  /**
   * Update order fulfillment status
   * Uses OrderServiceMapper to create update payload
   */
  static async updateFulfillmentStatus(
    orderId: string,
    fulfillmentStatus: string
  ): Promise<OrderT> {
    try {
      const updatePayload = OrderServiceMapper.mapFulfillmentStatusToUpdate(fulfillmentStatus);
      return await this.updateOrder(orderId, updatePayload);
    } catch (error) {
      throw ErrorClient.handleError({error, service: "Order", action: "Update Fulfillment Status"})
    }
  }

  /**
   * Update order payment status
   * Uses OrderServiceMapper to create update payload
   */
  static async updatePaymentStatus(
    orderId: string,
    paymentStatus: string
  ): Promise<OrderT> {
    try {
      const updatePayload = OrderServiceMapper.mapPaymentStatusToUpdate(paymentStatus);
      return await this.updateOrder(orderId, updatePayload);
    } catch (error) {
      throw ErrorClient.handleError({error, service: "Order", action: "Update Payment Status"})
    }
  }

  /**
   * Add tracking information to an order
   * Uses OrderServiceMapper to create update payload
   */
  static async updateTracking(
    orderId: string,
    trackingNumber: string,
    trackingUrl?: string
  ): Promise<OrderT> {
    try {
      const updatePayload = OrderServiceMapper.mapTrackingToUpdate(trackingNumber, trackingUrl);
      return await this.updateOrder(orderId, updatePayload);
    } catch (error) {
      throw ErrorClient.handleError({error, service: "Order", action: "Update Tracking"})
    }
  }

  /**
   * Delete an order (soft delete recommended, but hard delete available)
   */
  static async deleteOrder(orderId: string): Promise<void> {
    try {
      const supabase = this.getSupabase();

      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      // Handle Supabase errors
      if (error) {
        throw ErrorClient.handleError({ error, service: "Order", action: "Delete Order" });
      }
    } catch (error) {
      throw ErrorClient.handleError({error, service: "Order", action: "Delete Order"})
    }
  }

  static async createOrderFromCart({
    user,
    cart,
    paymentStatus = "paid",
    orderStatus = "pending",
    paymentMethod,
    shippingAddress,
  }: {
    user: UserI
    cart: CartWithItems
    paymentStatus?: string
    orderStatus?: string
    paymentMethod?: string
    shippingAddress?: Record<string, unknown>
  }){
          try {
            // Use mapper to generate unique order number
            const orderNumber = OrderServiceMapper.generateOrderNumber();

            // Use mapper to calculate order totals
            const totals = OrderServiceMapper.calculateOrderTotals(cart.cart_items);

            // Use mapper to create order payload
            const orderPayload = OrderServiceMapper.mapUserAndTotalsToCreateOrder(
              user,
              orderNumber,
              totals,
              0, // discount amount
              paymentStatus,
              orderStatus,
            );

            if (paymentMethod) {
              orderPayload.payment_method = paymentMethod;
            }

            if (shippingAddress) {
              orderPayload.shipping_address = shippingAddress as any;
            }

            // Create order from cart
            const newOrder = await this.createOrder(orderPayload);

            console.log("✅ Order created from cart:", newOrder.id);

            // Create order items from cart items using mapper
            if (cart.cart_items && cart.cart_items.length > 0) {
              const orderItems = cart.cart_items.map((cartItem) =>
                OrderServiceMapper.mapCartItemToOrderItem(cartItem, newOrder.id)
              );

              await OrderItemService.createOrderItems(orderItems);
              console.log("✅ Order items created:", orderItems.length);
            }

            return newOrder.id;
          } catch (error) {
            throw ErrorClient.handleError({error, service: "Order", action: "Create Order From Cart"})
          }
        };
}
