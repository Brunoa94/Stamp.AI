import { createClient } from "@/lib/supabase/client";
import { CreateOrderT, OrderT, UpdateOrderT } from "../types/order";

export class OrderService {
  private static getSupabase() {
    return createClient();
  }

  /**
   * Get all orders for a specific user
   */
  static async getOrders(userId?: string): Promise<OrderT[]> {
    try {
      const supabase = this.getSupabase();

      let query = supabase
        .from('orders')
        .select('*')
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

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Orders fetch failed: ${error.message}`);
      }
      throw new Error('Orders fetch failed: Unknown error occurred');
    }
  }

  /**
   * Get a single order by ID
   */
  static async getOrder(orderId: string): Promise<OrderT> {
    try {
      const supabase = this.getSupabase();

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      // Handle Supabase errors
      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (!data) {
        throw new Error(`Order not found with id: ${orderId}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Order fetch failed: ${error.message}`);
      }
      throw new Error('Order fetch failed: Unknown error occurred');
    }
  }

  /**
   * Get orders by order number
   */
  static async getOrderByNumber(orderNumber: string): Promise<OrderT> {
    try {
      const supabase = this.getSupabase();

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .single();

      // Handle Supabase errors
      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (!data) {
        throw new Error(`Order not found with number: ${orderNumber}`);
      }

      return data;
    } catch (error) {
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
}
