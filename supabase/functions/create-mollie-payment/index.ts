import { enforceOperationLimit } from "../_shared/operationLimit.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, FunctionError, handleError } from "../_shared/errors.ts";
import { validateEnvVars, validateRequest, verifyAuth } from "../_shared/validators.ts";
import { createMolliePayment } from "../_shared/mollie.ts";
import { supabaseRest } from "../_shared/supabase.ts";
import {
  priceCheckout,
  pricingMetadata,
  providerPricingMetadata,
  requireClientTotal,
} from "../_shared/checkoutPricing.ts";
import { withoutOrderId } from "../_shared/checkoutPricingRules.ts";
import type { MolliePaymentRequestI, MolliePaymentResponseI } from "../../types/index.ts";
import { corsHeadersFor } from "../_shared/cors.ts";
import "../_shared/sentry.ts";

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
      promo_code,
      metadata,
      method,
    }: MolliePaymentRequestI & { promo_code?: string } = parsedBody ?? {};

    // Validate request data
    const validAmount = validateRequest.amount(amount);

    // SERVER-SIDE PRICING (C4 - Amount Tampering Prevention)
    // The charged amount comes from catalog prices, the promo code and the
    // shipping rule. The client total must agree; it never sets the price.
    if (String(currency).toLowerCase() !== "eur") {
      throw new FunctionError(400, "INVALID_CURRENCY", "Checkout is priced in EUR");
    }
    if (userId === "service-role") throw ErrorCodes.INVALID_REQUEST_BODY();
    await enforceOperationLimit(userId, "payment-create", 30, 60);
    const pricing = await priceCheckout({ lineItems: line_items, promoCode: promo_code, userId });
    requireClientTotal(pricing, Math.round(validAmount * 100));

    // Get site URL for redirect URLs
    const siteUrl = Deno.env.get("SITE_URL") || "http://localhost:3000";
    const supabaseUrl = validateEnvVars.supabaseUrl();

    // Mollie rejects webhook URLs it cannot reach, so skip it for local development
    const isLocalSupabase =
      supabaseUrl.includes("localhost") || supabaseUrl.includes("127.0.0.1");
    const webhookUrl = isLocalSupabase
      ? undefined
      : `${supabaseUrl}/functions/v1/mollie-webhook`;


    // Build metadata to store with payment
    const paymentMetadata = {
      // Orders are linked server-side; a client-supplied order id is never stored.
      ...withoutOrderId(metadata),
      user_id: userId,
      user_email: userEmail,
      line_items: line_items,
      shipping_address: shipping_address,
      ...providerPricingMetadata(pricing),
    };

    // Create Mollie payment
    const molliePayment = await createMolliePayment({
      amount: pricing.totalCents / 100,
      currency: "EUR",
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

    // The transaction row carries the server pricing that fulfilment and
    // promo redemption verify against, so the checkout cannot continue
    // without it. CRITICAL: user_id must be set so the owner can link the
    // order (linkPaymentTransactionToOrder requires auth.uid() = user_id).
    const transaction = await supabaseRest(
      'payment_transactions',
      'POST',
      {
        user_id: userId,
        payment_provider: 'mollie',
        mollie_payment_id: molliePayment.id,
        mollie_status: molliePayment.status,
        amount: pricing.totalCents / 100,
        currency: 'eur',
        status: 'pending',
        payment_method_type: molliePayment.method || method || null,
        metadata: { ...paymentMetadata, ...pricingMetadata(pricing) },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { prefer: 'resolution=merge-duplicates' }
    );
    if (transaction.error) {
      throw new Error('Could not record the payment transaction');
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
