import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, handleError } from "../_shared/errors.ts";
import { validateEnvVars, verifyAuth } from "../_shared/validators.ts";
import { supabaseRest } from "../_shared/supabase.ts";
import { insertOrderStatusHistory } from "../_shared/orderStatusHistory.ts";
import { corsHeadersFor } from "../_shared/cors.ts";

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
  status: string;
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

const PRINTIFY_CANCELLED = new Set(["canceled", "cancelled"]);
// Transitional states right after creation during which Printify rejects cancellation.
const PRINTIFY_NOT_YET_CANCELLABLE = new Set(["pending", "cost-calculation"]);

/**
 * Cancel an order at Printify and verify the result remotely.
 *
 * A freshly created Printify order stays in `pending` / `cost-calculation` for a short while and
 * rejects cancellation until it reaches `on-hold`; retry with backoff for a
 * bounded time in that case. Success means a subsequent GET reports the
 * order as cancelled, never merely a 2xx on the cancel call.
 */
async function cancelAtPrintifyVerified(
  shopId: string,
  token: string,
  printifyOrderId: string,
  maxAttempts = 6,
): Promise<{ cancelled: boolean; remoteStatus?: string; reason?: string }> {
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const base = `https://api.printify.com/v1/shops/${shopId}/orders/${printifyOrderId}`;
  const readStatus = async (): Promise<string | undefined> => {
    const r = await fetch(`${base}.json`, { headers });
    if (!r.ok) return undefined;
    return (await r.json())?.status;
  };
  let reason: string | undefined;
  let status: string | undefined;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const r = await fetch(`${base}/cancel.json`, { method: "POST", headers });
    if (!r.ok) {
      const data = await r.json().catch(() => ({}));
      reason = data?.errors?.reason || data?.message || `HTTP ${r.status}`;
    }
    status = await readStatus();
    if (status && PRINTIFY_CANCELLED.has(status)) return { cancelled: true, remoteStatus: status };
    if (!status || !PRINTIFY_NOT_YET_CANCELLABLE.has(status)) break; // Non-cancellable for a reason other than timing.
    await new Promise((resolve) => setTimeout(resolve, 3000 * Math.min(attempt + 1, 4)));
  }
  return { cancelled: false, remoteStatus: status, reason };
}

function isAlreadyCancelled(status: string | null): boolean {
  const orderStatus = normalizeStatus(status);
  return orderStatus === "cancelled" || orderStatus === "canceled";
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
  const corsHeaders = corsHeadersFor(req);
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

    // Check if order is already cancelled - return success with refund status
    if (isAlreadyCancelled(order.status)) {
      console.log("Order is already cancelled, checking refund status...");

      // Check if refund was processed
      const refundResult = await supabaseRest<PaymentTransactionI[]>(
        `payment_transactions?order_id=eq.${order_id}&select=payment_provider,stripe_payment_intent_id,paypal_capture_id,mollie_payment_id,amount,currency,status`,
        "GET"
      );

      const hasRefund = refundResult.data?.some(tx => tx.status === "refunded");
      const hasPaidTransaction = refundResult.data?.some(tx => tx.status === "succeeded");

      console.log("Refund status check:", {
        hasRefund,
        hasPaidTransaction,
        transactions: refundResult.data?.length || 0,
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Order is already cancelled",
          already_cancelled: true,
          results: {
            order_id,
            cancelled_at_printify: true, // Assume it was cancelled if order is cancelled
            database_updated: true,
            refund_processed: hasRefund,
            refund_pending: hasPaidTransaction && !hasRefund,
          },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if order can be cancelled (not in production/shipped)
    if (!canCancelOrder(order.status)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Order cannot be cancelled",
          reason: "Orders can only be cancelled before entering production",
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

        const outcome = await cancelAtPrintifyVerified(
          PRINTIFY_SHOP_ID,
          PRINTIFY_API_TOKEN,
          order.printify_order_id,
        );

        if (outcome.cancelled) {
          console.log("✅ Order cancelled at Printify (remotely verified)");
          results.cancelled_at_printify = true;
        } else if (outcome.remoteStatus && PRINTIFY_NOT_YET_CANCELLABLE.has(outcome.remoteStatus)) {
          // Printify has not finished creating the order yet, so it cannot be
          // cancelled and we must not pretend otherwise. The caller can retry.
          return new Response(
            JSON.stringify({
              success: false,
              error: "PRINTIFY_CANCELLATION_PENDING",
              message: "The production order is still being created; retry the cancellation in a moment.",
              printify_status: outcome.remoteStatus,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 409 },
          );
        } else {
          console.warn("⚠️ Failed to cancel at Printify:", outcome.reason);
          results.printify_error = outcome.reason || "Unknown error";
          // Already cancelled / non-cancellable (in production, shipped): keep
          // the legacy behaviour of continuing with the local cancellation.
          results.printify_blocked = true;
          if (outcome.remoteStatus === "canceled" || outcome.remoteStatus === "cancelled") {
            results.cancelled_at_printify = true;
            results.printify_note = "Order was already cancelled at Printify";
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

    // Insert status history for cancellation
    await insertOrderStatusHistory(order_id, "cancelled", "cancellation");

    // Step 3: Process refund if payment was successful
    // NOTE: We check payment_transactions directly instead of relying on orders.payment_method
    // because payment_method may be NULL in some orders (legacy data or incomplete flows)
    console.log("Order payment details:", {
      payment_status: order.payment_status,
      payment_method: order.payment_method,
      total_amount: order.total_amount,
    });

    // Get payment transaction details - check this FIRST before deciding on refund
    const paymentResult = await supabaseRest<PaymentTransactionI[]>(
      `payment_transactions?order_id=eq.${order_id}&status=eq.succeeded&select=payment_provider,stripe_payment_intent_id,paypal_capture_id,mollie_payment_id,amount,currency`,
      "GET"
    );

    console.log("Payment transaction query result:", {
      hasData: !!paymentResult.data,
      count: paymentResult.data?.length || 0,
      error: paymentResult.error,
    });

    // Process refund if we have a succeeded payment transaction
    // This is more reliable than checking orders.payment_method which may be NULL
    if (paymentResult.data && paymentResult.data.length > 0) {
      const payment = paymentResult.data[0];

      console.log("Found succeeded payment transaction, processing refund via", payment.payment_provider);

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
      console.log("No successful payment transaction found, skipping refund");
      results.refund_skipped = "No successful payment transaction found";
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
