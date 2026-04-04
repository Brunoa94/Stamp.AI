import { createClient } from "@/lib/supabase/client";
import { CreateOrderItemT, OrderItemT, UpdateOrderItemT } from "@/types/orderItem";
import { OrderItemSchema } from "@/schemas/order";
import { z } from "zod";
import { ErrorClient } from "./errorClient";

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

      // Validate response
      const validatedData = z.array(OrderItemSchema).parse(data);

      return validatedData as OrderItemT[];
    } catch (error) {
      throw ErrorClient.handleError({error, service: "Order Items", action: "Get Order Items"})
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

      // Validate response
      const validatedData = OrderItemSchema.parse(data);

      return validatedData as OrderItemT;
    } catch (error) {
      throw ErrorClient.handleError({error, service: "Order Items", action: "Get Order Item"})
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

      // Validate response
      const validatedData = OrderItemSchema.parse(data);

      return validatedData as OrderItemT;
    } catch (error) {
      throw ErrorClient.handleError({error, service: "Order Items", action: "Create Order Item"})
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

      // Validate response
      const validatedData = z.array(OrderItemSchema).parse(data);

      return validatedData as OrderItemT[];
    } catch (error) {
      throw ErrorClient.handleError({error, service: "Order Items", action: "Create Order Items"})
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

      // Validate response
      const validatedData = OrderItemSchema.parse(data);

      return validatedData as OrderItemT;
    } catch (error) {
      throw ErrorClient.handleError({error, service: "Order Items", action: "Update Order Item"})
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
      throw ErrorClient.handleError({error, service: "Order Items", action: "Delete Order Item"})
    }
  }
}
