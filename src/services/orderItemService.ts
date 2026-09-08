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
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) {
      throw ErrorClient.handleError({ error, service: "OrderItems", action: "Get Order Items" });
    }

    if (!data) {
      return [];
    }

    try {
      return z.array(OrderItemSchema).parse(data) as OrderItemT[];
    } catch (validationError) {
      throw ErrorClient.handleError({ error: validationError, service: "OrderItems", action: "Get Order Items" });
    }
  }

  /**
   * Get a single order item by ID
   */
  static async getOrderItem(orderItemId: string): Promise<OrderItemT | null> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('id', orderItemId)
      .single();

    if (error) {
      // PGRST116 = "not found" for .single()
      if (error.code === "PGRST116") {
        return null;
      }
      throw ErrorClient.handleError({ error, service: "OrderItems", action: "Get Order Item" });
    }

    if (!data) {
      return null;
    }

    try {
      return OrderItemSchema.parse(data) as OrderItemT;
    } catch (validationError) {
      throw ErrorClient.handleError({ error: validationError, service: "OrderItems", action: "Get Order Item" });
    }
  }

  /**
   * Create a new order item
   */
  static async createOrderItem(payload: CreateOrderItemT): Promise<OrderItemT> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('order_items')
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw ErrorClient.handleError({ error, service: "OrderItems", action: "Create Order Item" });
    }

    if (!data) {
      throw ErrorClient.handleError({
        error: new Error("No data returned after order item creation"),
        service: "OrderItems",
        action: "Create Order Item"
      });
    }

    try {
      return OrderItemSchema.parse(data) as OrderItemT;
    } catch (validationError) {
      throw ErrorClient.handleError({ error: validationError, service: "OrderItems", action: "Create Order Item" });
    }
  }

  /**
   * Create multiple order items
   */
  static async createOrderItems(payloads: CreateOrderItemT[]): Promise<OrderItemT[]> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('order_items')
      .insert(payloads)
      .select();

    if (error) {
      throw ErrorClient.handleError({ error, service: "OrderItems", action: "Create Order Items" });
    }

    if (!data) {
      throw ErrorClient.handleError({
        error: new Error("No data returned after order items creation"),
        service: "OrderItems",
        action: "Create Order Items"
      });
    }

    try {
      return z.array(OrderItemSchema).parse(data) as OrderItemT[];
    } catch (validationError) {
      throw ErrorClient.handleError({ error: validationError, service: "OrderItems", action: "Create Order Items" });
    }
  }

  /**
   * Update an existing order item
   */
  static async updateOrderItem(
    orderItemId: string,
    payload: UpdateOrderItemT
  ): Promise<OrderItemT> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('order_items')
      .update(payload)
      .eq('id', orderItemId)
      .select()
      .single();

    if (error) {
      throw ErrorClient.handleError({ error, service: "OrderItems", action: "Update Order Item" });
    }

    if (!data) {
      throw ErrorClient.handleError({
        error: new Error(`Order item not found or update failed for id: ${orderItemId}`),
        service: "OrderItems",
        action: "Update Order Item"
      });
    }

    try {
      return OrderItemSchema.parse(data) as OrderItemT;
    } catch (validationError) {
      throw ErrorClient.handleError({ error: validationError, service: "OrderItems", action: "Update Order Item" });
    }
  }

  /**
   * Delete an order item
   */
  static async deleteOrderItem(orderItemId: string): Promise<void> {
    const supabase = this.getSupabase();

    const { error } = await supabase
      .from('order_items')
      .delete()
      .eq('id', orderItemId);

    if (error) {
      throw ErrorClient.handleError({ error, service: "OrderItems", action: "Delete Order Item" });
    }
  }
}
