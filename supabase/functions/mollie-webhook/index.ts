import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleError } from "../_shared/errors.ts";
import { validateEnvVars } from "../_shared/validators.ts";
import { supabaseRest } from "../_shared/supabase.ts";
import { getMolliePayment, mapMollieStatusToInternal, isMolliePaymentPaid } from "../_shared/mollie.ts";
import { tryGenerateInvoiceForOrder } from "../_shared/invoice.ts";
import { corsHeadersFor } from "../_shared/cors.ts";
import { isValidMolliePaymentId } from "../_shared/molliePaymentId.ts";

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);
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

    // Mollie webhooks carry no signature by design. The body is treated only
    // as a hint: nothing below trusts it beyond the payment id, and the id
    // must be well-formed because it is interpolated into the Mollie API path
    // and stored as the webhook event id. All payment facts are re-fetched
    // from Mollie with our API key.
    if (!isValidMolliePaymentId(paymentId)) {
      console.error("Mollie webhook rejected: missing or malformed payment id");
      return new Response(JSON.stringify({ error: "Invalid payment ID" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    console.log("Mollie webhook received for payment:", paymentId);

    // Fetch payment details from Mollie FIRST. Mollie sends one webhook per
    // status transition (open -> paid, ...), so the idempotency key must
    // include the fetched status; keying on the payment id alone would let
    // the first (e.g. "open") webhook permanently suppress the later "paid".
    const payment = await getMolliePayment(paymentId);
    console.log("Payment status:", payment.status);

    const webhookEventId = `${paymentId}:${payment.status}`;

    // ✅ CRITICAL FIX: Idempotency check
    // Prevent duplicate webhook processing for the same (payment, status)
    const isProcessed = await supabaseRest(
      "rpc/is_webhook_processed",
      "POST",
      { p_provider: "mollie", p_event_id: webhookEventId }
    );

    if (isProcessed.data === true) {
      console.log(`✅ Mollie webhook ${webhookEventId} already processed, skipping`);
      return new Response(
        JSON.stringify({ received: true, skipped: true, reason: "already_processed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Record this webhook as being processed
    await supabaseRest(
      "rpc/record_webhook_event",
      "POST",
      {
        p_provider: "mollie",
        p_event_id: webhookEventId,
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
      userId = typeof metadata.user_id === "string" ? metadata.user_id : undefined;
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

    const upsertResult = await supabaseRest<{ order_id?: string | null }>(
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
      // Surface as 500 (below) so Mollie retries instead of losing the payment.
      console.error("❌ Upsert error:", upsertResult.error);
      throw new Error("Failed to upsert payment transaction");
    }

    console.log("✅ Payment transaction upserted atomically:", payment.id);

    // Resolve the order id: metadata first, then the row returned by the
    // upsert, then the payment_transactions.order_id column (set by the
    // client after order creation).
    let finalOrderId: string | undefined = safeOrderId || upsertResult.data?.order_id || undefined;

    if (!finalOrderId) {
      const txResult = await supabaseRest<Array<{ order_id: string | null }>>(
        `payment_transactions?mollie_payment_id=eq.${payment.id}&select=order_id`,
        "GET"
      );
      finalOrderId = txResult.data?.[0]?.order_id || undefined;
      if (finalOrderId) {
        console.log(`✅ Found order_id in payment_transactions: ${finalOrderId}`);
      }
    }

    // Every orders write is scoped to the paying user so a payment can never
    // flip another user's order. Without a user_id we do not touch orders.
    const ownerFilter = userId ? `&user_id=eq.${userId}` : "";
    if (finalOrderId && !userId) {
      console.error("⚠️ Mollie payment has no metadata.user_id; skipping order update:", payment.id);
    }

    // If payment is successful, update order payment_status
    if (isPaid) {
      console.log("Payment is paid, processing order...");

      if (finalOrderId && userId) {
        // ✅ Update payment_status to "paid"
        // NOTE: Webhooks should ONLY update payment_status, NEVER order status
        // Order status is managed by the fulfillment service to prevent race conditions
        const orderUpdateResult = await supabaseRest(
          `orders?id=eq.${finalOrderId}${ownerFilter}`,
          "PATCH",
          {
            payment_status: "paid",
            payment_method: "mollie",
            updated_at: new Date().toISOString(),
          }
        );

        if (orderUpdateResult.error) {
          console.error(`Failed to update order ${finalOrderId} payment_status:`, orderUpdateResult.error);
          throw new Error("Failed to update order payment_status");
        }

        console.log(`✅ Order ${finalOrderId} payment_status updated to: paid`);

        // Issue the invoice now that the order is paid (idempotent, non-blocking)
        await tryGenerateInvoiceForOrder(finalOrderId);
      } else if (!finalOrderId) {
        console.warn("⚠️ No valid order_id found, skipping payment_status update.");
      }

      // ⚠️ NOTE: For Mollie (redirect-based flow), Printify order creation is handled client-side
      // in mollie-return page. The webhook only updates payment status.
      // This prevents duplicate order creation since both webhook and client would try to create it.
      console.log("✅ Mollie webhook completed. Client-side will handle Printify order creation.");
    } else if (payment.status === "failed" || payment.status === "canceled" || payment.status === "expired") {
      // Update payment_status if payment failed
      // NOTE: Webhooks should ONLY update payment_status, NEVER order status
      if (finalOrderId && userId) {
        const orderUpdateResult = await supabaseRest(`orders?id=eq.${finalOrderId}${ownerFilter}`, "PATCH", {
          payment_status: internalStatus,
          updated_at: new Date().toISOString(),
        });

        if (orderUpdateResult.error) {
          console.error(`Failed to update order ${finalOrderId}:`, orderUpdateResult.error);
        } else {
          console.log(`Order ${finalOrderId} payment_status updated to: ${internalStatus}`);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    // Return a non-2xx so Mollie retries the webhook (it retries on non-2xx).
    // The payment id was already validated above, so this only covers
    // genuine internal failures (Mollie API, database, ...).
    console.error("Mollie webhook error:", error);
    return new Response(JSON.stringify({ received: false, error: "Processing error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
