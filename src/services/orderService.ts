import { createClient } from "@/lib/supabase/client";
import { CreateOrderT, OrderT, UpdateOrderT, OrderWithItemsT } from "../types/order";
import { OrderWithItemsSchema, OrderSchema } from "@/schemas/order";
import { z } from "zod";
import { CartItemWithProduct, CartT, CartWithItems } from "@/types/cart";
import { CartService } from "./cartService";
import { UserI } from "@/shared-types";
import { OrderItemService } from "./orderItemService";

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
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from query');
      }

      // Validate response with Zod schema
      const validatedData = z.array(OrderWithItemsSchema).parse(data);

      return validatedData as OrderWithItemsT[];
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Order validation failed: ${error.message}`);
      }
      if (error instanceof Error) {
        throw new Error(`Orders fetch failed: ${error.message}`);
      }
      throw new Error('Orders fetch failed: Unknown error occurred');
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
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (!data) {
        throw new Error(`Order not found with id: ${orderId}`);
      }

      // Validate response with Zod schema
      const validatedData = OrderWithItemsSchema.parse(data);

      return validatedData as OrderWithItemsT;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Order validation failed: ${error.message}`);
      }
      if (error instanceof Error) {
        throw new Error(`Order fetch failed: ${error.message}`);
      }
      throw new Error('Order fetch failed: Unknown error occurred');
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
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (!data) {
        throw new Error(`Order not found with number: ${orderNumber}`);
      }

      // Validate response with Zod schema
      const validatedData = OrderWithItemsSchema.parse(data);

      return validatedData as OrderWithItemsT;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Order validation failed: ${error.message}`);
      }
      if (error instanceof Error) {
        throw new Error(`Order fetch failed: ${error.message}`);
      }
      throw new Error('Order fetch failed: Unknown error occurred');
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
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned after order creation');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Order creation failed: ${error.message}`);
      }
      throw new Error('Order creation failed: Unknown error occurred');
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
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (!data) {
        throw new Error(`Order not found or update failed for id: ${orderId}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Order update failed: ${error.message}`);
      }
      throw new Error('Order update failed: Unknown error occurred');
    }
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(
    orderId: string,
    status: string
  ): Promise<OrderT> {
    try {
      return await this.updateOrder(orderId, { status });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Order status update failed: ${error.message}`);
      }
      throw new Error('Order status update failed: Unknown error occurred');
    }
  }

  /**
   * Update order fulfillment status
   */
  static async updateFulfillmentStatus(
    orderId: string,
    fulfillmentStatus: string
  ): Promise<OrderT> {
    try {
      return await this.updateOrder(orderId, {
        fulfillment_status: fulfillmentStatus
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Fulfillment status update failed: ${error.message}`);
      }
      throw new Error('Fulfillment status update failed: Unknown error occurred');
    }
  }

  /**
   * Update order payment status
   */
  static async updatePaymentStatus(
    orderId: string,
    paymentStatus: string
  ): Promise<OrderT> {
    try {
      return await this.updateOrder(orderId, {
        payment_status: paymentStatus
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Payment status update failed: ${error.message}`);
      }
      throw new Error('Payment status update failed: Unknown error occurred');
    }
  }

  /**
   * Add tracking information to an order
   */
  static async updateTracking(
    orderId: string,
    trackingNumber: string,
    trackingUrl?: string
  ): Promise<OrderT> {
    try {
      return await this.updateOrder(orderId, {
        tracking_number: trackingNumber,
        tracking_url: trackingUrl,
        shipped_at: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Tracking update failed: ${error.message}`);
      }
      throw new Error('Tracking update failed: Unknown error occurred');
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
        throw new Error(`Supabase error: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Order deletion failed: ${error.message}`);
      }
      throw new Error('Order deletion failed: Unknown error occurred');
    }
  }

  static async createOrderFromCart({user, cart}: {user: UserI, cart: CartWithItems}){
          try {
            const cartSummary = CartService.calculateCartSummary(cart);
  
            // Generate a unique order number
            const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
  
            // Create order from cart
            const newOrder = await this.createOrder({
              user_id: user.id,
              customer_email: user.email || "",
              order_number: orderNumber,
              status: "pending",
              payment_status: "pending",
              subtotal: cartSummary.subtotal,
              shipping_cost: 5.99,
              discount_amount: 0,
              total_amount: cartSummary.subtotal + 5.99,
            });
  
            console.log("✅ Order created from cart:", newOrder.id);
  
            // Create order items from cart items
            if (cart.cart_items && cart.cart_items.length > 0) {
              const orderItems = cart.cart_items.map((cartItem) => {
                const totalPrice = cartItem.unit_price * cartItem.quantity;
                return {
                  order_id: newOrder.id,
                  product_id: cartItem.product_id || null,
                  variant_id: cartItem.variant_id || null,
                  quantity: cartItem.quantity,
                  unit_price: cartItem.unit_price,
                  total_price: totalPrice,
                  custom_image_url: cartItem.custom_image_url || "",
                  product_name: cartItem.product?.name || "Custom Product",
                  variant_name: cartItem.variant?.name || null,
                  design_config: cartItem.custom_image_url ? { custom_image_url: cartItem.custom_image_url } : null,
                };
              });
  
              await OrderItemService.createOrderItems(orderItems);
              console.log("✅ Order items created:", orderItems.length);
            }
  
            return newOrder.id;
          } catch (error) {
            console.error("❌ Failed to create order from cart:", error);
            throw new Error("Error creating order")
          }
        };
}
