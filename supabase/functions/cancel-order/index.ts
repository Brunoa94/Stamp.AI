import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, handleError } from "../_shared/errors.ts";
import { validateEnvVars, verifyAuth } from "../_shared/validators.ts";
import { supabaseRest } from "../_shared/supabase.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface CancelOrderRequestI {
  order_id: string;
  cancellation_reason?: string;
}

interface OrderDataI {
  id: string;
  printify_order_id: string | null;
  payment_status: string | null;
  payment_method: string | null;
  status: string | null;
  total_amount: number | null;
  currency: string | null;
  user_id: string | null;
}

interface PaymentTransactionI {
  payment_provider: string;
  stripe_payment_intent_id: string | null;
  paypal_capture_id: string | null;
  mollie_payment_id: string | null;
  amount: number;
  currency: string | null;
}

const CANCELLABLE_ORDER_STATUSES = new Set(["", "created", "pending", "confirmed"]);

function normalizeStatus(value: string | null | undefined): string {
  return (value ?? "").toLowerCase().replace(/[_-]/g, "").trim();
}

function canCancelOrder(status: string | null): boolean {
  const orderStatus = normalizeStatus(status);
  if (orderStatus === "cancelled" || orderStatus === "canceled") return false;
  return CANCELLABLE_ORDER_STATUSES.has(orderStatus);
}

/**
 * Cancel an order
 *
 * This function:
 * 1. Validates order can be cancelled
 * 2. Cancels order at Printify (if printify_order_id exists)
 * 3. Updates order status to "cancelled" in database
 * 4. Processes refund if payment_status is "paid"
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    const { userId } = await verifyAuth(authHeader);

    const { order_id, cancellation_reason }: CancelOrderRequestI = await req.json();

    if (!order_id) {
      throw ErrorCodes.MISSING_REQUIRED_FIELDS("order_id is required");
    }

    console.log("=== CANCEL ORDER ===");
    console.log("Order ID:", order_id);
    console.log("User ID:", userId);
    console.log("Cancellation reason:", cancellation_reason || "none provided");

    // Get order details
    const orderResult = await supabaseRest<OrderDataI[]>(
      `orders?id=eq.${order_id}&select=id,printify_order_id,payment_status,payment_method,status,total_amount,currency,user_id`,
      "GET"
    );

    if (!orderResult.data || orderResult.data.length === 0) {
      throw ErrorCodes.RESOURCE_NOT_FOUND(`Order ${order_id} not found`);
    }

    const order = orderResult.data[0];

    // Verify user owns this order
    if (order.user_id !== userId) {
      throw ErrorCodes.UNAUTHORIZED("You do not have permission to cancel this order");
    }

    // Check if order can be cancelled
    if (!canCancelOrder(order.status)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Order cannot be cancelled",
          reason: order.status === "cancelled"
            ? "Order is already cancelled"
            : "Orders can only be cancelled before entering production",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const results: Record<string, any> = {
      order_id,
      cancelled_at_printify: false,
      database_updated: false,
      refund_processed: false,
    };

    // Step 1: Cancel at Printify if printify_order_id exists
    if (order.printify_order_id) {
      console.log("Cancelling order at Printify:", order.printify_order_id);

      try {
        const PRINTIFY_API_TOKEN = validateEnvVars.printifyToken();
        const PRINTIFY_SHOP_ID = validateEnvVars.printifyShopId();

        const printifyResponse = await fetch(
          `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/orders/${order.printify_order_id}/cancel.json`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${PRINTIFY_API_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );

        const printifyData = await printifyResponse.json();

        if (printifyResponse.ok) {
          console.log("✅ Order cancelled at Printify");
          results.cancelled_at_printify = true;
        } else {
          console.warn("⚠️ Failed to cancel at Printify:", printifyData);
          results.printify_error = printifyData.errors?.reason || "Unknown error";

          // If Printify says order cannot be cancelled, stop here
          if (printifyData.errors?.reason?.includes("status")) {
            return new Response(
              JSON.stringify({
                success: false,
                message: "Order cannot be cancelled at Printify",
                reason: "Order is already in production or shipped",
                error: printifyData.errors?.reason,
              }),
              {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
        }
      } catch (printifyError) {
        console.error("Error cancelling at Printify:", printifyError);
        results.printify_error = String(printifyError);
        // Continue with database update even if Printify fails
      }
    } else {
      console.log("No printify_order_id, skipping Printify cancellation");
    }

    // Step 2: Update order status in database
    console.log("Updating order status to cancelled in database");

    const updateResult = await supabaseRest(
      `orders?id=eq.${order_id}`,
      "PATCH",
      {
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancellation_reason: cancellation_reason || "Cancelled by customer",
        updated_at: new Date().toISOString(),
      }
    );

    if (updateResult.error) {
      console.error("Failed to update order status:", updateResult.error);
      throw new Error(`Failed to update order status: ${updateResult.error.message}`);
    }

    console.log("✅ Order status updated to cancelled");
    results.database_updated = true;

    // Step 3: Process refund if payment was successful
    if (order.payment_status === "paid" && order.payment_method) {
      console.log("Order was paid, processing refund");

      // Get payment transaction details
      const paymentResult = await supabaseRest<PaymentTransactionI[]>(
        `payment_transactions?order_id=eq.${order_id}&status=eq.succeeded&select=payment_provider,stripe_payment_intent_id,paypal_capture_id,mollie_payment_id,amount,currency`,
        "GET"
      );

      if (paymentResult.data && paymentResult.data.length > 0) {
        const payment = paymentResult.data[0];

        console.log("Processing refund via", payment.payment_provider);

        try {
          // Call process-refund function
          const SUPABASE_URL = validateEnvVars.supabaseUrl();
          const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

          const refundResponse = await fetch(
            `${SUPABASE_URL}/functions/v1/process-refund`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                order_id: order.id,
                payment_provider: payment.payment_provider,
                amount: payment.amount,
                currency: payment.currency || order.currency,
                reason: cancellation_reason || "Order cancelled by customer",
                stripe_payment_intent_id: payment.stripe_payment_intent_id,
                paypal_capture_id: payment.paypal_capture_id,
                mollie_payment_id: payment.mollie_payment_id,
              }),
            }
          );

          const refundData = await refundResponse.json();

          if (refundResponse.ok) {
            console.log("✅ Refund processed successfully:", refundData);
            results.refund_processed = true;
            results.refund_id = refundData.refundId;
          } else {
            console.error("Failed to process refund:", refundData);
            results.refund_error = refundData.message || "Unknown error";
          }
        } catch (refundError) {
          console.error("Error processing refund:", refundError);
          results.refund_error = String(refundError);
        }
      } else {
        console.log("No successful payment transaction found for refund");
        results.refund_skipped = "No successful payment transaction found";
      }
    } else {
      console.log("Order was not paid, skipping refund");
      results.refund_skipped = "Order payment status is not 'paid'";
    }

    console.log("=== CANCEL ORDER COMPLETE ===");
    console.log("Results:", results);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Order cancelled successfully",
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error cancelling order:", error);
    return handleError(error, corsHeaders);
  }
});
