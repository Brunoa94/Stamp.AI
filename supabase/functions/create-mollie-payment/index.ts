import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, handleError } from "../_shared/errors.ts";
import { validateEnvVars, validateRequest, verifyAuth } from "../_shared/validators.ts";
import { createMolliePayment } from "../_shared/mollie.ts";
import { supabaseRest } from "../_shared/supabase.ts";
import {
  priceOrderRequest,
  pricingMetadata,
  sanitizeClientMetadata,
} from "../_shared/serverPriceService.ts";
import type { MolliePaymentRequestI, MolliePaymentResponseI } from "../../types/index.ts";
import { corsHeadersFor } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("authorization");

    let rawBody: string | null = null;
    try {
      rawBody = await req.text();
    } catch {
      rawBody = null;
    }

    let parsedBody: any = null;
    try {
      parsedBody = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      parsedBody = null;
    }

    // Verify authentication
    const { userId, userEmail } = await verifyAuth(authHeader);

    const {
      amount,
      currency = "EUR",
      description,
      line_items,
      shipping_address,
      shipping_cost_cents,
      discount_cents,
      promo_code,
      metadata,
      method,
    }: MolliePaymentRequestI & {
      shipping_cost_cents?: number;
      discount_cents?: number;
      promo_code?: string;
    } = parsedBody ?? {};

    // `amount` is the client's intended total in major currency units (e.g. euros).
    const clientAmount = validateRequest.amount(amount);

    // SERVER-SIDE PRICING (SEC-06): the server total is what gets charged;
    // the client amount only has to agree with it (else PRICE_MISMATCH).
    const pricing = await priceOrderRequest({
      line_items,
      promo_code,
      shipping_cost_cents,
      discount_cents,
      clientTotalCents: Math.round(clientAmount * 100),
    });
    const chargeAmount = pricing.total_cents / 100;

    // Get site URL for redirect URLs
    const siteUrl = Deno.env.get("SITE_URL") || "http://localhost:3000";
    const supabaseUrl = validateEnvVars.supabaseUrl();

    // Mollie rejects webhook URLs it cannot reach, so skip it for local development
    const isLocalSupabase =
      supabaseUrl.includes("localhost") || supabaseUrl.includes("127.0.0.1");
    const webhookUrl = isLocalSupabase
      ? undefined
      : `${supabaseUrl}/functions/v1/mollie-webhook`;

    // Build metadata to store with payment. The client-supplied `order_id`
    // (request body or metadata) is deliberately dropped: the DB order is
    // created after payment and linked via payment_transactions.order_id.
    const paymentMetadata = {
      ...sanitizeClientMetadata(metadata),
      ...pricingMetadata(pricing),
      user_id: userId,
      user_email: userEmail,
      line_items: line_items,
      shipping_address: shipping_address,
    };

    // Create Mollie payment
    const molliePayment = await createMolliePayment({
      amount: chargeAmount,
      currency: currency.toUpperCase(),
      description: description || `Order for ${userEmail}`,
      redirectUrl: `${siteUrl}/checkout/mollie-return`,
      webhookUrl,
      metadata: paymentMetadata,
      method,
    });

    // Get the checkout URL from the response
    const checkoutUrl = molliePayment._links.checkout?.href;

    if (!checkoutUrl) {
      throw ErrorCodes.MOLLIE_PAYMENT_FAILED("No checkout URL returned from Mollie");
    }

    // Create payment_transactions record immediately with user_id
    // Webhook will later update this record to 'succeeded' or 'failed'
    // CRITICAL: user_id must be set for RLS policy to allow later updates
    // (linkPaymentTransactionToOrder requires auth.uid() = user_id)
    try {
      await supabaseRest(
        'payment_transactions',
        'POST',
        {
          user_id: userId,
          payment_provider: 'mollie',
          mollie_payment_id: molliePayment.id,
          mollie_status: molliePayment.status,
          amount: chargeAmount,
          currency: currency.toLowerCase(),
          status: 'pending',
          payment_method_type: molliePayment.method || method || null,
          metadata: paymentMetadata,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { prefer: 'resolution=merge-duplicates' }
      )
    } catch {
      // Transaction record is best-effort; webhook can still process it
    }

    const response: MolliePaymentResponseI = {
      success: true,
      paymentId: molliePayment.id,
      checkoutUrl: checkoutUrl,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return handleError(error, corsHeaders);
  }
});
