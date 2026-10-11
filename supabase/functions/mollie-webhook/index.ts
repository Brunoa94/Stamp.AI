import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { FunctionError } from "../_shared/errors.ts";
import { supabaseRest } from "../_shared/supabase.ts";
import { getMolliePayment, mapMollieStatusToInternal, isMolliePaymentPaid } from "../_shared/mollie.ts";
import { claimWebhookEvent, releaseWebhookEvent } from "../_shared/webhookEvents.ts";
import { settlePaidOrder } from "../_shared/paidOrderSettlement.ts";
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

    const acknowledge = (extra: Record<string, unknown> = {}) =>
      new Response(JSON.stringify({ received: true, ...extra }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    // Fetch payment details from Mollie. An id Mollie does not know is
    // acknowledged (nothing to process); any other failure is retried.
    let payment;
    try {
      payment = await getMolliePayment(paymentId);
    } catch (lookupError) {
      if (lookupError instanceof FunctionError && lookupError.status === 404) {
        console.warn(`Mollie webhook for unknown payment ${paymentId}, ignoring`);
        return acknowledge({ ignored: true });
      }
      // Without a key no Mollie payment can have been created, so there is
      // nothing a retry could settle.
      if (lookupError instanceof FunctionError && lookupError.errorId === "MOLLIE_API_KEY_MISSING") {
        console.error("Mollie webhook received but MOLLIE_API_KEY is not configured");
        return acknowledge({ ignored: true });
      }
      throw lookupError;
    }
    console.log("Payment status:", payment.status);

    // Mollie calls the webhook once per status change: deduplicate per status
    // so a later "paid" is processed after an earlier "open".
    const eventId = `${payment.id}:${payment.status}`;
    if (!(await claimWebhookEvent("mollie", eventId, `payment.${payment.status}`, payment))) {
      console.log(`✅ Mollie webhook ${eventId} already processed, skipping`);
      return acknowledge({ skipped: true, reason: "already_processed" });
    }

    try {
      const internalStatus = mapMollieStatusToInternal(payment.status);
      const metadata = (payment.metadata ?? {}) as Record<string, unknown>;
      const userId = typeof metadata.user_id === "string" ? metadata.user_id : null;

      // CRITICAL: Use atomic UPSERT to handle race conditions. The order link
      // is never taken from metadata, which the checkout client can influence.
      const upsertResult = await supabaseRest(
        "rpc/upsert_mollie_payment_transaction",
        "POST",
        {
          p_mollie_payment_id: payment.id,
          p_user_id: userId,
          p_order_id: null,
          p_amount: parseFloat(payment.amount.value),
          p_currency: payment.amount.currency.toLowerCase(),
          p_status: internalStatus,
          p_metadata: metadata,
        }
      );
      if (upsertResult.error) throw new Error("Failed to record the Mollie payment");

      if (isMolliePaymentPaid(payment.status)) {
        // The order is created here when the customer never came back to the
        // shop; the return page then only fulfils it.
        const settledOrderId = await settlePaidOrder("mollie", payment.id);
        console.log(settledOrderId ? `✅ Order ${settledOrderId} settled as paid` : "⚠️ No order could be settled for this payment");
      } else if (payment.status === "failed" || payment.status === "canceled" || payment.status === "expired") {
        // Only a linked, still unpaid order of the same customer is updated.
        const txResult = await supabaseRest<Array<{ order_id: string | null; user_id: string | null }>>(
          `payment_transactions?mollie_payment_id=eq.${payment.id}&select=order_id,user_id`,
          "GET"
        );
        const linked = txResult.data?.[0];
        if (linked?.order_id && linked.user_id) {
          const orderUpdateResult = await supabaseRest(
            `orders?id=eq.${linked.order_id}&user_id=eq.${linked.user_id}&payment_status=neq.paid`,
            "PATCH",
            { payment_status: internalStatus, updated_at: new Date().toISOString() },
          );
          if (orderUpdateResult.error) throw new Error("Failed to update the order payment status");
        }
      }
    } catch (processingError) {
      // Let Mollie retry: the status change must be processed, not just recorded.
      await releaseWebhookEvent("mollie", eventId);
      throw processingError;
    }

    return acknowledge();
  } catch (error) {
    console.error("Mollie webhook error:", error);
    // A 500 makes Mollie retry the delivery later.
    return new Response(JSON.stringify({ error: "PROCESSING_ERROR" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
