
export interface CancelOrderResponseI {
  success: boolean;
  message: string;
  results?: {
    order_id: string;
    cancelled_at_printify: boolean;
    database_updated: boolean;
    refund_processed: boolean;
    refund_id?: string;
    refund_error?: string;
    printify_error?: string;
  };
  reason?: string;
}


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
import type { ShippingAddressT } from "@/schemas/checkout";
import { RefundService } from "./refundService";
import { PaymentProviderT } from "../../supabase/types";
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
   * Get order by idempotency key
   * Used to prevent duplicate order creation for the same payment
   *
   * CRITICAL FIX: Implements idempotency check to prevent race conditions
   * where the same payment_intent_id triggers multiple order creations.
   *
   * Example idempotency key format: "stripe_pi_1234567890"
   */
  static async getOrderByIdempotencyKey(idempotencyKey: string): Promise<OrderT | null> {
    try {
      const supabase = this.getSupabase();

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle();

      if (error) {
        console.error("Error checking idempotency:", error);
        // Don't throw - return null so order creation can proceed
        // This prevents idempotency check failures from blocking orders
        return null;
      }

      return data;
    } catch (error) {
      console.error("Idempotency check failed:", error);
      // Don't throw - fail open to allow order creation
      return null;
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

  /**
   * Link a payment transaction to an order
   * Updates payment_transactions.order_id after order creation
   */
  static async linkPaymentTransactionToOrder({
    paymentProvider,
    paymentIntentId,
    orderId,
  }: {
    paymentProvider: PaymentProviderT;
    paymentIntentId: string;
    orderId: string;
  }): Promise<void> {
    try {
      const supabase = this.getSupabase();

      // Build the query based on payment provider
      let query = supabase
        .from('payment_transactions')
        .update({ order_id: orderId, updated_at: new Date().toISOString() });

      // Add provider-specific filter
      switch (paymentProvider) {
        case 'stripe':
          query = query.eq('stripe_payment_intent_id', paymentIntentId);
          break;
        case 'paypal':
          query = query.eq('paypal_order_id', paymentIntentId);
          break;
        case 'mollie':
          query = query.eq('mollie_payment_id', paymentIntentId);
          break;
        default:
          throw new Error(`Unsupported payment provider: ${paymentProvider}`);
      }

      const { error } = await query;

      if (error) {
        console.error(`Failed to link payment transaction to order:`, error);
        // Don't throw - this is non-critical, webhook can still use metadata fallback
      } else {
        console.log(`✅ Linked payment transaction (${paymentProvider}:${paymentIntentId}) to order ${orderId}`);
      }
    } catch (error) {
      console.error('Exception linking payment transaction to order:', error);
      // Non-blocking error - webhook has fallback
    }
  }


  static async createOrderFromCart({
    user,
    cart,
    paymentStatus = "paid",
    shippingAddress,
    idempotencyKey,
    orderStatus,
  }: {
    user: UserI;
    cart: CartWithItems;
    paymentStatus?: string;
    shippingAddress?: ShippingAddressT;
    idempotencyKey?: string;
    orderStatus?: string;
  }) {
    try {
      // Use mapper to generate unique order number
      const orderNumber = OrderServiceMapper.generateOrderNumber();

      // Use mapper to calculate order totals
      const totals = OrderServiceMapper.calculateOrderTotals(cart.cart_items);

      // Derive order status: use provided or default logic
      const finalOrderStatus = orderStatus ?? (paymentStatus === "paid" ? "confirmed" : "pending");

      // Use mapper to create order payload
      const orderPayload = OrderServiceMapper.mapUserAndTotalsToCreateOrder(
        user,
        orderNumber,
        totals,
        shippingAddress,
        0, // discount amount
        paymentStatus,
        finalOrderStatus,
        idempotencyKey
      );

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
      throw ErrorClient.handleError({ error, service: "Order", action: "Create Order From Cart" });
    }
  }

  /**
   * Handle Printify order creation failure
   *
   * When Printify order creation fails:
   * 1. Mark order as "unsuccessful_confirmation"
   * 2. Process immediate refund
   *
   * @param orderId - The order ID
   * @param paymentProvider - Payment provider (stripe, paypal, mollie)
   * @param amount - Amount to refund
   * @param paymentId - Payment intent/capture/payment ID
   * @param printifyError - The Printify error that occurred
   */
  static async handlePrintifyFailure({
    orderId,
    paymentProvider,
    amount,
    stripePaymentIntentId,
    paypalCaptureId,
    molliePaymentId,
    printifyError,
  }: {
    orderId: string;
    paymentProvider: PaymentProviderT;
    amount: number;
    stripePaymentIntentId?: string;
    paypalCaptureId?: string;
    molliePaymentId?: string;
    printifyError: unknown;
  }): Promise<void> {
    try {
      console.error(`❌ Printify order creation failed for order ${orderId}:`, printifyError);

      // Step 1: Mark order as unsuccessful_confirmation
      try {
        await this.updateOrderStatus(orderId, "unsuccessful_confirmation");
        console.log(`✅ Order ${orderId} marked as unsuccessful_confirmation`);
      } catch (statusError) {
        console.error(`Failed to update order status to unsuccessful_confirmation:`, statusError);
        // Continue with refund even if status update fails
      }

      // Step 2: Process refund
      try {
        await RefundService.processRefund({
          orderId,
          paymentProvider,
          amount,
          reason: "Printify order creation failed",
          stripePaymentIntentId,
          paypalCaptureId,
          molliePaymentId,
        });
        console.log(`✅ Refund initiated for order ${orderId}`);
      } catch (refundError) {
        console.error(`❌ Refund initiation failed for order ${orderId}:`, refundError);
        // Don't throw - log error but don't block
      }
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "Order",
        action: "Handle Printify Failure"
      });
    }
  }

  /**
   * Cancel an order (calls Supabase Edge Function)
   */
  static async cancelOrder(orderId: string): Promise<CancelOrderResponseI> {
    const supabase = this.getSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/cancel-order`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: orderId,
          cancellation_reason: "Cancelled by customer",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to cancel order");
    }

    return data;
  }
}
