import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, FunctionError, handleError } from "../_shared/errors.ts";
import { supabaseRest } from "../_shared/supabase.ts";
import { selectCheckoutCartItems } from "../_shared/cartSelection.ts";
import { requireUser } from "../_shared/authGuard.ts";
import { corsHeadersFor } from "../_shared/cors.ts";
import { finalizePaidOrder } from "../_shared/finalizePaidOrder.ts";
import { isPaymentProvider } from "../_shared/orderFinalizationRules.ts";
import "../_shared/sentry.ts";

/**
 * Process Payment Recovery Edge Function
 *
 * Completes order creation for payments that succeeded but weren't finalized
 * due to browser crashes, network failures, etc. The order is built by the
 * shared finalization from the server pricing stored with the payment (the
 * snapshot only names the items), then sent to Printify if it is not yet.
 */
serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Require an authenticated caller (or service-role for automated recovery).
    const auth = await requireUser(req.headers.get("authorization"));

    const body = await req.json();
    const {
      recovery_id,
      payment_provider,
      payment_intent_id,
    } = body;

    // Validate required fields
    if (!recovery_id || !isPaymentProvider(payment_provider) || typeof payment_intent_id !== "string") {
      throw ErrorCodes.INVALID_REQUEST_BODY();
    }

    const recoveryResult = await supabaseRest<Array<{
      user_id: string;
      currency: string;
      cart_snapshot: { cart_items?: Array<Record<string, any>>; items?: Array<Record<string, any>>; shipping_cost?: number; discount?: number };
      shipping_address: Record<string, unknown>;
      line_items: Array<Record<string, unknown>>;
    }>>(
      `payment_recovery?id=eq.${encodeURIComponent(recovery_id)}&payment_provider=eq.${encodeURIComponent(payment_provider)}&payment_intent_id=eq.${encodeURIComponent(payment_intent_id)}&select=user_id,currency,cart_snapshot,shipping_address,line_items`, "GET",
    );
    if (recoveryResult.error) throw new Error("Could not load recovery record");
    const recovery = recoveryResult.data?.[0];
    if (!recovery || (!auth.isServiceRole && recovery.user_id !== auth.userId)) {
      throw new FunctionError(403, "FORBIDDEN", "Recovery record not found for this user");
    }
    const { cart_snapshot, shipping_address, line_items } = recovery;
    if (!cart_snapshot || !shipping_address || !line_items?.length) throw ErrorCodes.INVALID_REQUEST_BODY();

    // Increment recovery attempt counter
    await supabaseRest("rpc/increment_recovery_attempt", "POST", {
      p_payment_intent_id: payment_intent_id,
      p_payment_provider: payment_provider,
    });

    const cartItems = selectCheckoutCartItems(cart_snapshot.cart_items || cart_snapshot.items || []);
    if (cartItems.length === 0) {
      throw new Error("Cannot recover an order without selected cart items");
    }

    let order;
    try {
      order = await finalizePaidOrder({
        provider: payment_provider,
        paymentId: payment_intent_id,
        callerUserId: recovery.user_id,
        cartItems,
        shippingAddress: shipping_address,
      });
    } catch (finalizeError) {
      await supabaseRest("rpc/increment_recovery_attempt", "POST", {
        p_payment_intent_id: payment_intent_id,
        p_payment_provider: payment_provider,
        p_error: finalizeError instanceof FunctionError ? finalizeError.errorId : "Order creation failed",
      });
      throw finalizeError;
    }
    const orderId = order.orderId;

    const fulfilledResult = await supabaseRest<Array<{ printify_order_id: string | null }>>(
      `orders?id=eq.${orderId}&select=printify_order_id`, "GET",
    );
    if (fulfilledResult.data?.[0]?.printify_order_id) {
      await supabaseRest("rpc/mark_payment_recovered", "POST", {
        p_payment_intent_id: payment_intent_id,
        p_payment_provider: payment_provider,
        p_order_id: orderId,
      });

      return new Response(
        JSON.stringify({
          success: true,
          order_id: orderId,
          message: "Order already exists",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Printify order

    const printifyResponse = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/create-printify-order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: Deno.env.get("SUPABASE_ANON_KEY") || "",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          line_items,
          shipping_address,
          metadata: {
            order_id: orderId,
            payment_intent_id,
            payment_provider,
            recovered: true,
          },
        }),
      }
    );

    const errorText = printifyResponse.ok ? "" : await printifyResponse.text();
    // ALREADY_FULFILLED: a concurrent checkout sent the order meanwhile.
    if (!printifyResponse.ok && !errorText.includes("ALREADY_FULFILLED")) {

      // Order exists but Printify failed - create reconciliation alert
      await supabaseRest("order_status_reconciliation", "POST", {
        order_id: orderId,
        expected_status: "confirmed",
        actual_status: "pending",
        error_message: `Printify failed during recovery: ${errorText}`,
        reconciliation_status: "pending",
      });

      // Still mark as recovered (order exists)
      await supabaseRest("rpc/mark_payment_recovered", "POST", {
        p_payment_intent_id: payment_intent_id,
        p_payment_provider: payment_provider,
        p_order_id: orderId,
      });

      return new Response(
        JSON.stringify({
          success: true,
          order_id: orderId,
          warning: "Order created but Printify failed - manual intervention needed",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Mark payment as recovered
    await supabaseRest("rpc/mark_payment_recovered", "POST", {
      p_payment_intent_id: payment_intent_id,
      p_payment_provider: payment_provider,
      p_order_id: orderId,
    });

    return new Response(
      JSON.stringify({
        success: true,
        order_id: orderId,
        message: "Payment recovered and order created successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return handleError(error, corsHeaders);
  }
});
