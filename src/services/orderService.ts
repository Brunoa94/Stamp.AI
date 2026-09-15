
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
import { CreateOrderT, OrderT, UpdateOrderT, OrderWithItemsT, OrderStatusHistoryT } from "../types/order";
import { OrderWithItemsSchema, OrderSchema } from "@/schemas/order";
import { OrderServiceMapper } from "@/mappers/services/orderServiceMapper";
import { CartServiceMapper } from "@/mappers/services/cartServiceMapper";
import { z } from "zod";
import { CartItem, CartT, CartWithItems } from "@/types/cart";
import { CartService } from "./cartService";
import { UserI } from "../../supabase/types";
import { ErrorClient } from "./errorClient";
import { getAuthenticatedHeaders } from "./authHelpers";
import type { ShippingAddressT } from "@/schemas/checkout";
import type { FinalizeOrderRequestT, FinalizeOrderResponseT } from "@/types/finalizeOrder";
import { parseIdempotencyKey } from "../../supabase/functions/_shared/paymentReference";
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
      try {
        const validatedData = z.array(OrderWithItemsSchema).parse(data);

        return validatedData as unknown as OrderWithItemsT[];
      } catch (zodError: any) {
        console.error("❌ Zod validation failed for orders");
        console.error("Error details:", zodError.errors || zodError.message);
        console.error("📦 First order data sample:", JSON.stringify(data[0], null, 2));
        throw zodError;
      }
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

      return validatedData as unknown as OrderWithItemsT;
    } catch (error) {
      throw ErrorClient.handleError({error, service: "Order", action: "Get Order"})
    }
  }

  /**
   * Get status history for an order (for tracking timeline)
   */
  static async getOrderStatusHistory(orderId: string): Promise<OrderStatusHistoryT[]> {
    try {
      const supabase = this.getSupabase();

      const { data, error } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) {
        throw ErrorClient.handleError({ error, service: "Order", action: "Get Status History" });
      }

      return (data ?? []) as OrderStatusHistoryT[];
    } catch (error) {
      throw ErrorClient.handleError({ error, service: "Order", action: "Get Status History" });
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

      return validatedData as unknown as OrderWithItemsT;
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
        // CRITICAL: Fail closed - throw error to prevent duplicate orders
        // If we can't check for duplicates, we shouldn't create the order
        throw ErrorClient.handleError({
          error,
          service: "Order",
          action: "Check Idempotency Key"
        });
      }

      return data;
    } catch (error) {
      console.error("Idempotency check failed:", error);
      // CRITICAL: Fail closed - rethrow to prevent duplicate orders
      throw ErrorClient.handleError({
        error,
        service: "Order",
        action: "Check Idempotency Key"
      });
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
   * Link a payment transaction to an order.
   *
   * @deprecated No longer needed: `finalize-order` records the payment
   * transaction with its `order_id` server-side, and `payment_transactions`
   * money/link columns are protected from client updates. Kept as a no-op so
   * the checkout return pages keep working until they are cleaned up.
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
    console.log(
      `ℹ️ Payment transaction (${paymentProvider}:${paymentIntentId}) is linked to order ${orderId} by finalize-order`,
    );
  }

  /**
   * Create the order for a completed payment.
   *
   * The browser never inserts orders: the `finalize-order` edge function
   * verifies the payment with the provider, reprices every item from the
   * catalog, checks the total against the amount charged and inserts the paid
   * order with the service role. `idempotencyKey` (`${provider}_${paymentId}`)
   * identifies the payment; repeated calls return the same order id.
   *
   * `paymentStatus` and `orderStatus` are accepted for backwards
   * compatibility with the checkout return pages but are decided server-side.
   */
  static async createOrderFromCart({
    user,
    cart,
    shippingAddress,
    billingAddress,
    idempotencyKey,
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
  }): Promise<string> {
    try {
      const payment = parseIdempotencyKey(idempotencyKey);
      if (!payment) {
        throw new Error("A payment reference (idempotency key) is required to create an order");
      }
      if (paymentMethod && paymentMethod !== payment.provider) {
        throw new Error(`Payment method ${paymentMethod} does not match payment reference ${idempotencyKey}`);
      }

      // Only the items selected for checkout belong to the order (and its invoice)
      const checkoutCart = CartServiceMapper.mapCartToCheckoutCart(cart);
      if (checkoutCart.cart_items.length === 0) {
        throw new Error("Cannot create an order without selected cart items");
      }

      const body: FinalizeOrderRequestT = {
        provider: payment.provider,
        payment_id: payment.paymentId,
        cart_items: OrderServiceMapper.mapCartItemsToFinalizeOrderItems(checkoutCart.cart_items),
        shipping_address: shippingAddress ?? null,
        billing_address: billingAddress ?? null,
      };

      const headers = await getAuthenticatedHeaders("Order");
      const { data, error } = await this.getSupabase().functions.invoke<FinalizeOrderResponseT>(
        "finalize-order",
        { body, headers },
      );

      if (error) {
        throw ErrorClient.handleError({
          error: await this.readFunctionError(error),
          service: "Order",
          action: "Finalize Order",
        });
      }

      if (!data?.order_id) {
        throw new Error("finalize-order did not return an order id");
      }

      console.log(
        data.created
          ? `✅ Order ${data.order_id} finalized for ${user.id}`
          : `⚠️ Order already exists for ${idempotencyKey}, returning existing order: ${data.order_id}`,
      );

      return data.order_id;
    } catch (error) {
      throw ErrorClient.handleError({ error, service: "Order", action: "Create Order From Cart" });
    }
  }

  /**
   * Edge functions answer errors as `{ error: "<CODE>" }`; surface the code so
   * callers (and observability) see AMOUNT_MISMATCH rather than a bare 4xx.
   */
  private static async readFunctionError(error: unknown): Promise<unknown> {
    const context = (error as { context?: { json?: () => Promise<unknown> } }).context;
    if (!context?.json) return error;
    try {
      const payload = (await context.json()) as { error?: unknown };
      if (typeof payload?.error === "string") {
        return { error: payload.error };
      }
    } catch {
      // Fall through to the raw error
    }
    return error;
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
      throw ErrorClient.handleError({
        error: new Error("Not authenticated"),
        service: "Order",
        action: "Cancel Order"
      });
    }

    try {
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
        throw ErrorClient.handleError({
          error: { error: data.error || data.message || "Failed to cancel order" },
          service: "Order",
          action: "Cancel Order"
        });
      }

      return data;
    } catch (error) {
      throw ErrorClient.handleError({ error, service: "Order", action: "Cancel Order" });
    }
  }
}
