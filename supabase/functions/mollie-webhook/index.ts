import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleError } from "../_shared/errors.ts";
import { validateEnvVars } from "../_shared/validators.ts";
import { supabaseRest } from "../_shared/supabase.ts";
import { getMolliePayment, mapMollieStatusToInternal, isMolliePaymentPaid } from "../_shared/mollie.ts";
import { tryGenerateInvoiceForOrder } from "../_shared/invoice.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Mollie sends webhook with payment ID - can be form data or JSON
    let paymentId: string | null = null;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      paymentId = formData.get("id") as string;
    } else if (contentType.includes("application/json")) {
      const json = await req.json();
      paymentId = json.id;
    } else {
      // Fallback: try to parse as text (Mollie sometimes sends just the ID)
      const text = await req.text();
      // Check if it looks like form data
      if (text.includes("id=")) {
        const params = new URLSearchParams(text);
        paymentId = params.get("id");
      } else {
        // Try parsing as JSON
        try {
          const json = JSON.parse(text);
          paymentId = json.id;
        } catch {
          // Assume the text itself is the payment ID
          paymentId = text.trim() || null;
        }
      }
    }

    if (!paymentId) {
      console.error("No payment ID in webhook");
      return new Response(JSON.stringify({ error: "No payment ID" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    console.log("Mollie webhook received for payment:", paymentId);

    // ✅ CRITICAL FIX: Idempotency check
    // Prevent duplicate webhook processing
    // Check if this webhook was already processed
    const isProcessed = await supabaseRest(
      "rpc/is_webhook_processed",
      "POST",
      { p_provider: "mollie", p_event_id: paymentId }
    );

    if (isProcessed.data === true) {
      console.log(`✅ Mollie webhook ${paymentId} already processed, skipping`);
      return new Response(
        JSON.stringify({ received: true, skipped: true, reason: "already_processed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Fetch payment details from Mollie
    const payment = await getMolliePayment(paymentId);
    console.log("Payment status:", payment.status);

    // Record this webhook as being processed
    await supabaseRest(
      "rpc/record_webhook_event",
      "POST",
      {
        p_provider: "mollie",
        p_event_id: paymentId,
        p_event_type: `payment.${payment.status}`,
        p_payload: payment,
      }
    );

    // Map status
    const internalStatus = mapMollieStatusToInternal(payment.status);
    const isPaid = isMolliePaymentPaid(payment.status);

    // Parse metadata
    let metadata: Record<string, unknown> = {};
    let lineItems: unknown[] = [];
    let userId: string | undefined;
    let orderId: string | undefined;
    let shippingAddress: Record<string, unknown> | undefined;

    if (payment.metadata) {
      metadata = payment.metadata as Record<string, unknown>;
      lineItems = (metadata.line_items as unknown[]) || [];
      userId = metadata.user_id as string | undefined;
      orderId =
        typeof metadata.order_id === "string"
          ? metadata.order_id
          : typeof metadata.orderId === "string"
            ? (metadata.orderId as string)
            : undefined;
      shippingAddress = metadata.shipping_address as Record<string, unknown> | undefined;
    }

    console.log("Parsed metadata - order_id:", orderId, "user_id:", userId);

    // CRITICAL: Use atomic UPSERT to handle race conditions
    // Validate order_id is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const safeOrderId = orderId && uuidRegex.test(orderId) ? orderId : null;

    if (orderId && !safeOrderId) {
      console.warn(`⚠️ Invalid order_id format: ${orderId}`);
    }

    const upsertResult = await supabaseRest(
      "rpc/upsert_mollie_payment_transaction",
      "POST",
      {
        p_mollie_payment_id: payment.id,
        p_user_id: userId || null,
        p_order_id: safeOrderId,
        p_amount: parseFloat(payment.amount.value),
        p_currency: payment.amount.currency.toLowerCase(),
        p_status: internalStatus,
        p_metadata: metadata,
      }
    );

    if (upsertResult.error) {
      console.error("❌ Upsert error:", upsertResult.error);
    } else {
      console.log("✅ Payment transaction upserted atomically:", payment.id);

      // Update order payment_status if order_id is valid
      if (safeOrderId || upsertResult.data?.order_id) {
        const finalOrderId = safeOrderId || upsertResult.data?.order_id;
        const orderUpdateResult = await supabaseRest(
          `orders?id=eq.${finalOrderId}`,
          "PATCH",
          {
            payment_status: "paid",
            payment_method: "mollie",
            updated_at: new Date().toISOString(),
          }
        );
        if (orderUpdateResult.error) {
          console.error(`Failed to update order ${finalOrderId} payment_status:`, orderUpdateResult.error);
        } else {
          console.log(`✅ Order ${finalOrderId} payment_status updated to: paid`);

          // Issue the invoice now that the order is paid (idempotent, non-blocking)
          await tryGenerateInvoiceForOrder(finalOrderId);
        }
      } else {
        console.warn("⚠️ No valid order_id found, skipping payment_status update.");
      }
    }

    // If orderId not in metadata, try to get it from payment_transactions.order_id column
    // (set by client-side after order creation)
    if (!orderId) {
      const txResult = await supabaseRest(
        `payment_transactions?mollie_payment_id=eq.${payment.id}&select=order_id`,
        "GET"
      );
      orderId = txResult.data?.[0]?.order_id;
      if (orderId) {
        console.log(`✅ Found order_id in payment_transactions: ${orderId}`);
      }
    }

    // If payment is successful, update order and create Printify order
    if (isPaid) {
      console.log("Payment is paid, processing order...");

      // Update order payment_status if we have an order_id
      if (orderId) {
        // ✅ Update payment_status to "paid"
        // NOTE: Webhooks should ONLY update payment_status, NEVER order status
        // Order status is managed by the fulfillment service to prevent race conditions
        const orderUpdateResult = await supabaseRest(
          `orders?id=eq.${orderId}`,
          "PATCH",
          {
            payment_status: "paid",
            payment_method: "mollie",
            updated_at: new Date().toISOString(),
          }
        );

        if (orderUpdateResult.error) {
          console.error(`Failed to update order ${orderId} payment_status:`, orderUpdateResult.error);
        } else {
          console.log(`✅ Order ${orderId} payment_status updated to: paid`);

          // Issue the invoice now that the order is paid (idempotent, non-blocking)
          await tryGenerateInvoiceForOrder(orderId);
        }
      }

      // ⚠️ NOTE: For Mollie (redirect-based flow), Printify order creation is handled client-side
      // in mollie-return page. The webhook only updates payment status.
      // This prevents duplicate order creation since both webhook and client would try to create it.
      console.log("✅ Mollie webhook completed. Client-side will handle Printify order creation.");
    } else if (payment.status === "failed" || payment.status === "canceled" || payment.status === "expired") {
      // Update payment_status if payment failed
      // NOTE: Webhooks should ONLY update payment_status, NEVER order status
      if (orderId) {
        const orderUpdateResult = await supabaseRest(`orders?id=eq.${orderId}`, "PATCH", {
          payment_status: internalStatus,
          updated_at: new Date().toISOString(),
        });

        if (orderUpdateResult.error) {
          console.error(`Failed to update order ${orderId}:`, orderUpdateResult.error);
        } else {
          console.log(`Order ${orderId} payment_status updated to: ${internalStatus}`);
        }
      }
    }

    // Always return 200 to acknowledge webhook receipt
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Mollie webhook error:", error);
    // Still return 200 to prevent Mollie from retrying
    return new Response(JSON.stringify({ received: true, error: "Processing error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
