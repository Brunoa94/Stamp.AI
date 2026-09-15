import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, FunctionError, handleError } from "../_shared/errors.ts";
import { supabaseRest } from "../_shared/supabase.ts";
import { requireUser } from "../_shared/authGuard.ts";
import { isPaymentProvider } from "../_shared/paymentReference.ts";
import { finalizePaidOrder } from "../_shared/finalizePaidOrder.ts";
import { createFinalizeOrderPorts } from "../_shared/finalizePaidOrderDeps.ts";
import { resolveStoredOrderContext, type PaymentRecoveryRowI } from "../_shared/storedOrderContext.ts";
import { tryGenerateInvoiceForOrder } from "../_shared/invoice.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Process Payment Recovery Edge Function
 *
 * Completes order creation for payments that succeeded but weren't finalized
 * due to browser crashes, network failures, etc. The order is minted through
 * the same server-side finalization as the checkout: payment verified with the
 * provider, items repriced from the catalog, total reconciled against the
 * amount charged. Snapshot prices are never trusted.
 */
serve(async (req) => {
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
    if (!recovery_id || !isPaymentProvider(payment_provider) || typeof payment_intent_id !== "string" || !payment_intent_id) {
      throw ErrorCodes.INVALID_REQUEST_BODY();
    }

    const recoveryResult = await supabaseRest<Array<PaymentRecoveryRowI & { currency: string }>>(
      `payment_recovery?id=eq.${encodeURIComponent(recovery_id)}&payment_provider=eq.${payment_provider}&payment_intent_id=eq.${encodeURIComponent(payment_intent_id)}&select=user_id,user_email,currency,cart_snapshot,shipping_address,line_items,metadata`, "GET",
    );
    if (recoveryResult.error) throw new Error("Could not load recovery record");
    const recovery = recoveryResult.data?.[0];
    if (!recovery || (!auth.isServiceRole && recovery.user_id !== auth.userId)) {
      throw new FunctionError(403, "FORBIDDEN", "Recovery record not found for this user");
    }

    const context = resolveStoredOrderContext({ recovery });
    if (!context) throw ErrorCodes.INVALID_REQUEST_BODY();
    const { shipping_address, line_items } = recovery;

    // Increment recovery attempt counter
    await supabaseRest("rpc/increment_recovery_attempt", "POST", {
      p_payment_intent_id: payment_intent_id,
      p_payment_provider: payment_provider,
    });

    // Reuse the order minted earlier for this payment, or mint it now. The
    // idempotency key, ownership, payment proof and amount reconciliation are
    // all enforced inside finalizePaidOrder.
    let finalized;
    try {
      finalized = await finalizePaidOrder(
        {
          provider: payment_provider,
          paymentId: payment_intent_id,
          caller: { userId: "service-role", userEmail: "service@system.internal", isServiceRole: true },
          owner: context.owner,
          source: context.source,
          shippingAddress: context.shippingAddress,
          billingAddress: context.billingAddress,
          promoCode: context.promoCode,
          currency: recovery.currency,
        },
        createFinalizeOrderPorts(),
      );
    } catch (error) {
      await supabaseRest("rpc/increment_recovery_attempt", "POST", {
        p_payment_intent_id: payment_intent_id,
        p_payment_provider: payment_provider,
        p_error: error instanceof Error ? error.message : "Order creation failed",
      });
      throw error;
    }

    const orderId = finalized.orderId;

    if (!finalized.created) {
      // Mark as recovered
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

    await tryGenerateInvoiceForOrder(orderId);

    // Create Printify order (validated against the stored paid order). A
    // recovery row left by a webhook may carry no Printify line items; the
    // paid order then needs manual fulfilment.
    const printifyResponse = Array.isArray(line_items) && line_items.length > 0
      ? await fetch(
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
      )
      : new Response("No Printify line items stored with the payment", { status: 422 });

    if (!printifyResponse.ok) {
      const errorText = await printifyResponse.text();

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

    // Update order status to confirmed
    await supabaseRest(`orders?id=eq.${orderId}`, "PATCH", {
      status: "confirmed",
      updated_at: new Date().toISOString(),
    });

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
