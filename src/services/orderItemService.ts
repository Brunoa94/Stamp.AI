import { createClient } from "@/lib/supabase/client";
import { CreateOrderItemT, OrderItemT, UpdateOrderItemT } from "@/types/orderItem";

export class OrderItemService {
  private static getSupabase() {
    return createClient();
  }

  /**
   * Get all order items for a specific order
   */
  static async getOrderItems(orderId: string): Promise<OrderItemT[]> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });


      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from query');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Order items fetch failed: ${error.message}`);
      }
      throw new Error('Order items fetch failed: Unknown error occurred');
    }
  }

  /**
   * Get a single order item by ID
   */
  static async getOrderItem(orderItemId: string): Promise<OrderItemT> {
    try {
      const supabase = this.getSupabase();

      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('id', orderItemId)
        .single();

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (!data) {
        throw new Error(`Order item not found with id: ${orderItemId}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Order item fetch failed: ${error.message}`);
      }
      throw new Error('Order item fetch failed: Unknown error occurred');
    }
  }

  /**
   * Create a new order item
   */
  static async createOrderItem(payload: CreateOrderItemT): Promise<OrderItemT> {
    try {
      const supabase = this.getSupabase();

      const { data, error } = await supabase
        .from('order_items')
        .insert(payload)
        .select()
        .single();

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned after order item creation');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Order item creation failed: ${error.message}`);
      }
      throw new Error('Order item creation failed: Unknown error occurred');
    }
  }

  /**
   * Create multiple order items
   */
  static async createOrderItems(payloads: CreateOrderItemT[]): Promise<OrderItemT[]> {
    try {
      const supabase = this.getSupabase();

      const { data, error } = await supabase
        .from('order_items')
        .insert(payloads)
        .select();

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned after order items creation');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Order items creation failed: ${error.message}`);
      }
      throw new Error('Order items creation failed: Unknown error occurred');
    }
  }

  /**
   * Update an existing order item
   */
  static async updateOrderItem(
    orderItemId: string,
    payload: UpdateOrderItemT
  ): Promise<OrderItemT> {
    try {
      const supabase = this.getSupabase();

      const { data, error } = await supabase
        .from('order_items')
        .update(payload)
        .eq('id', orderItemId)
        .select()
        .single();

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (!data) {
        throw new Error(`Order item not found or update failed for id: ${orderItemId}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Order item update failed: ${error.message}`);
      }
      throw new Error('Order item update failed: Unknown error occurred');
    }
  }

  /**
   * Delete an order item
   */
  static async deleteOrderItem(orderItemId: string): Promise<void> {
    try {
      const supabase = this.getSupabase();

      const { error } = await supabase
        .from('order_items')
        .delete()
        .eq('id', orderItemId);

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Order item deletion failed: ${error.message}`);
      }
      throw new Error('Order item deletion failed: Unknown error occurred');
    }
  }
}
