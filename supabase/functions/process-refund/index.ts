import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.11.0?target=deno";
import { handleError, ErrorCodes } from "../_shared/errors.ts";
import { validateEnvVars } from "../_shared/validators.ts";
import { supabaseRest } from "../_shared/supabase.ts";
import { paypalRequest } from "../_shared/paypal.ts";
import { mollieRequest } from "../_shared/mollie.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type PaymentProvider = "stripe" | "paypal" | "mollie";

interface RefundRequestI {
  order_id: string;
  payment_provider: PaymentProvider;
  amount?: number;
  currency?: string;
  reason?: string;
  // Provider-specific payment identifiers
  stripe_payment_intent_id?: string;
  paypal_capture_id?: string;
  mollie_payment_id?: string;
}

/**
 * Idempotency guard — check whether this order already has a refund record.
 */
async function isAlreadyRefunded(orderId: string): Promise<boolean> {
  const result = await supabaseRest<unknown[]>(
    `payment_transactions?order_id=eq.${orderId}&status=eq.refunded`,
    "GET"
  );
  return Array.isArray(result.data) && result.data.length > 0;
}

/**
 * Process a Stripe refund via the Refunds API.
 */
async function refundStripe(
  stripePaymentIntentId: string,
  amount?: number,
  reason?: string
): Promise<string> {
  const stripeSecretKey = validateEnvVars.stripeSecretKey();
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2023-10-16",
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

  const refund = await stripe.refunds.create(refundParams as Parameters<typeof stripe.refunds.create>[0]);
  return refund.id;
}

/**
 * Process a PayPal refund via the Captures API.
 */
async function refundPayPal(
  captureId: string,
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
    body
  );

  return result.id;
}

/**
 * Process a Mollie refund via the Payments Refunds API.
 */
async function refundMollie(
  molliePaymentId: string,
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
    }
  );

  return result.id;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: RefundRequestI = await req.json();

    const {
      order_id,
      payment_provider,
      amount,
      currency,
      reason = "Order creation failed after successful payment",
      stripe_payment_intent_id,
      paypal_capture_id,
      mollie_payment_id,
    } = body;

    // Validate required fields
    if (!order_id || !payment_provider) {
      throw ErrorCodes.INVALID_REQUEST_BODY();
    }

    if (!["stripe", "paypal", "mollie"].includes(payment_provider)) {
      throw ErrorCodes.INVALID_REQUEST_BODY();
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

    console.log(`Processing ${payment_provider} refund for order ${order_id}`);

    let refundId: string;

    switch (payment_provider) {
      case "stripe": {
        if (!stripe_payment_intent_id) {
          throw ErrorCodes.INVALID_REQUEST_BODY();
        }
        refundId = await refundStripe(stripe_payment_intent_id, amount, reason);
        break;
      }

      case "paypal": {
        if (!paypal_capture_id) {
          throw ErrorCodes.INVALID_REQUEST_BODY();
        }
        refundId = await refundPayPal(paypal_capture_id, amount, currency);
        break;
      }

      case "mollie": {
        if (!mollie_payment_id) {
          throw ErrorCodes.INVALID_REQUEST_BODY();
        }
        // Mollie refunds require an explicit amount
        if (amount === undefined) {
          throw ErrorCodes.INVALID_REQUEST_BODY();
        }
        refundId = await refundMollie(mollie_payment_id, amount, currency);
        break;
      }

      default:
        throw ErrorCodes.INVALID_REQUEST_BODY();
    }

    console.log(`Refund created: ${refundId}`);

    // ✅ CRITICAL FIX: Use atomic stored procedure
    // This ensures payment_transactions and orders are updated together
    // Either both succeed or both rollback
    const atomicResult = await supabaseRest(
      "rpc/process_refund_atomic",
      "POST",
      {
        p_order_id: order_id,
        p_refund_id: refundId,
        p_reason: reason,
        p_payment_provider: payment_provider,
      }
    );

    if (atomicResult.error) {
      console.error("Atomic refund operation failed:", atomicResult.error);
      throw new Error(`Failed to update database: ${atomicResult.error.message}`);
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
