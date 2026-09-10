import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@16.12.0?target=deno";
import { handleError, ErrorCodes } from "../_shared/errors.ts";
import { validateEnvVars } from "../_shared/validators.ts";
import { supabaseRest } from "../_shared/supabase.ts";
import { paypalRequest } from "../_shared/paypal.ts";
import { mollieRequest } from "../_shared/mollie.ts";
import { requireUser } from "../_shared/authGuard.ts";
import { FunctionError } from "../_shared/errors.ts";
import { authorizeRefund, type RefundRequest, type RefundOrder, type RefundPayment } from "./authorization.ts";
import { verifyPaidPayment } from "../_shared/verifyPaidPayment.ts";
import { requirePaymentCurrency } from "../_shared/paymentProof.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Idempotency guard — check whether this order already has a refund record.
 */
async function isAlreadyRefunded(orderId: string): Promise<boolean> {
  const result = await supabaseRest<unknown[]>(
    `payment_transactions?order_id=eq.${encodeURIComponent(orderId)}&status=eq.refunded`,
    "GET"
  );
  if (result.error) throw new Error("Could not verify refund status");
  return Array.isArray(result.data) && result.data.length > 0;
}

/**
 * Process a Stripe refund via the Refunds API.
 */
async function refundStripe(
  stripePaymentIntentId: string,
  orderId: string,
  amount?: number,
  reason?: string
): Promise<string> {
  const stripeSecretKey = validateEnvVars.stripeSecretKey();
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-06-20",
    httpClient: Stripe.createFetchHttpClient(),
  });

  const refundParams: Record<string, unknown> = {
    payment_intent: stripePaymentIntentId,
  };

  if (amount !== undefined) {
    refundParams.amount = Math.round(amount * 100); // Convert to cents
  }

  if (reason) {
    // Stripe only accepts: duplicate | fraudulent | requested_by_customer
    refundParams.reason = "requested_by_customer";
    refundParams.metadata = { internal_reason: reason };
  }

  try {
    const refund = await stripe.refunds.create(refundParams as Parameters<typeof stripe.refunds.create>[0], { idempotencyKey: `order-refund-${orderId}` });
    return refund.id;
  } catch (error: unknown) {
    // Handle idempotency: if charge already refunded, get existing refund ID
    if (error && typeof error === 'object' && 'code' in error && error.code === 'charge_already_refunded') {
      console.log(`Charge already refunded for payment intent ${stripePaymentIntentId}, fetching existing refund...`);

      // Get the payment intent to find the refund ID
      const existingRefund = (await stripe.refunds.list({ payment_intent: stripePaymentIntentId, limit: 1 })).data[0];

      if (existingRefund?.id && existingRefund.status === "succeeded" && existingRefund.amount === Math.round((amount || 0) * 100)) {
        console.log(`Found existing refund: ${existingRefund.id}`);
        return existingRefund.id;
      }

      throw new Error("Could not reconcile the existing refund");
    }

    // Re-throw other errors
    throw error;
  }
}

/**
 * Process a PayPal refund via the Captures API.
 */
async function refundPayPal(
  captureId: string,
  orderId: string,
  amount?: number,
  currency = "USD"
): Promise<string> {
  const body: Record<string, unknown> = {};

  if (amount !== undefined) {
    body.amount = {
      currency_code: currency.toUpperCase(),
      value: amount.toFixed(2),
    };
  }

  const result = await paypalRequest<{ id: string }>(
    `/v2/payments/captures/${captureId}/refund`,
    "POST",
    body,
    orderId,
  );

  return result.id;
}

/**
 * Process a Mollie refund via the Payments Refunds API.
 */
async function refundMollie(
  molliePaymentId: string,
  orderId: string,
  amount: number,
  currency = "EUR"
): Promise<string> {
  const result = await mollieRequest<{ id: string }>(
    `/payments/${molliePaymentId}/refunds`,
    "POST",
    {
      amount: {
        currency: currency.toUpperCase(),
        value: amount.toFixed(2),
      },
    },
    orderId,
  );

  return result.id;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Require an authenticated caller (or service-role for automated recovery).
    const auth = await requireUser(req.headers.get("authorization"));

    const body: RefundRequest = await req.json();

    const { order_id, payment_provider, reason = "Order creation failed after successful payment" } = body;

    // Validate required fields
    if (typeof order_id !== "string" || !/^[a-f0-9-]{36}$/i.test(order_id) || !payment_provider) {
      throw ErrorCodes.INVALID_REQUEST_BODY();
    }

    if (!["stripe", "paypal", "mollie"].includes(payment_provider)) {
      throw ErrorCodes.INVALID_REQUEST_BODY();
    }

    const orderResult = await supabaseRest<RefundOrder[]>(
      `orders?id=eq.${encodeURIComponent(order_id)}&select=id,user_id,status,payment_status,printify_order_id,currency`, "GET",
    );
    if (orderResult.error) throw new Error("Could not load order");
    const order = orderResult.data?.[0];
    if (!order || (!auth.isServiceRole && order.user_id !== auth.userId)) {
      throw new FunctionError(403, "FORBIDDEN", "Order not found for this user");
    }

    // Idempotency check — never refund the same order twice
    const alreadyRefunded = await isAlreadyRefunded(order_id);
    if (alreadyRefunded) {
      console.log(`Refund already processed for order ${order_id}, skipping.`);
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "already_refunded" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Resolve the payment through the owned order, never through a request ID.
    const result = await supabaseRest<RefundPayment[]>(
      `payment_transactions?order_id=eq.${encodeURIComponent(order_id)}&payment_provider=eq.${payment_provider}&status=eq.succeeded&select=*`, "GET",
    );
    if (result.error) throw new Error("Could not load payment");
    if (result.data?.length !== 1) {
      throw new FunctionError(409, "MISSING_PAYMENT", "Expected one successful order payment");
    }
    const { providerId, verificationId, amount, currency } = authorizeRefund(body, order, result.data[0], auth);
    // Permit a completed full refund when replaying the same idempotent provider
    // request after a database/network failure. Recovery never enables this.
    const paid = await verifyPaidPayment(payment_provider, verificationId, order.user_id, true);
    requirePaymentCurrency(paid, currency);
    if (Math.round(paid.amount * 100) !== Math.round(amount * 100) ||
      (payment_provider === "paypal" && paid.captureId !== providerId)) {
      throw new FunctionError(409, "PAYMENT_MISMATCH", "Provider payment does not match order payment");
    }

    let refundId: string;
    switch (payment_provider) {
      case "stripe":
        refundId = await refundStripe(providerId, order_id, amount, reason);
        break;
      case "paypal":
        refundId = await refundPayPal(providerId, order_id, amount, currency);
        break;
      case "mollie":
        refundId = await refundMollie(providerId, order_id, amount, currency);
        break;
      default:
        throw ErrorCodes.INVALID_REQUEST_BODY();
    }

    console.log(`Refund created: ${refundId}`);

    // ✅ CRITICAL FIX: Use atomic stored procedure
    // This ensures payment_transactions, orders, invoices, and refunds table are all updated together
    // Either all succeed or all rollback
    const atomicResult = await supabaseRest(
      "rpc/process_refund_atomic",
      "POST",
      {
        p_order_id: order_id,
        p_refund_id: refundId,
        p_reason: reason,
        p_payment_provider: payment_provider,
        p_amount: amount ?? null,
        p_currency: currency ?? "USD",
      }
    );

    if (atomicResult.error) {
      console.error("Atomic refund operation failed:", atomicResult.error);
      throw new Error("Failed to record refund in database");
    }

    console.log("✅ Atomic refund operation completed:", atomicResult.data);

    return new Response(
      JSON.stringify({ success: true, refundId, atomic_result: atomicResult.data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Refund processing error:", error);
    return handleError(error, corsHeaders);
  }
});
