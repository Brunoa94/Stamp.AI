import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, FunctionError, handleError } from "../_shared/errors.ts";
import { validateEnvVars, validateRequest, verifyAuth } from "../_shared/validators.ts";
import { createMolliePayment } from "../_shared/mollie.ts";
import { supabaseRest } from "../_shared/supabase.ts";
import { validatePricingAgainstDatabase } from "../_shared/serverPriceService.ts";
import { parseLineItemsForPricing } from "../_shared/lineItemsForPricing.ts";
import { majorUnitsToCents, toPricingMetadata } from "../_shared/orderTotals.ts";
import { getOrderTotalsConfig } from "../_shared/orderTotalsEnv.ts";
import { normalizePromoCode } from "../_shared/promoDiscount.ts";
import type { MolliePaymentRequestI, MolliePaymentResponseI } from "../../types/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
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

    let parsedBody: (MolliePaymentRequestI & { promo_code?: string }) | null = null;
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
      order_id,
      line_items,
      shipping_address,
      promo_code,
      metadata,
      method,
    }: MolliePaymentRequestI & { promo_code?: string } = parsedBody ?? {};

    // Validate request data
    const validAmount = validateRequest.amount(amount);

    // SERVER-SIDE PRICE VALIDATION (C4/C6 - Amount Tampering Prevention)
    // Every line item is repriced from the catalog and shipping, VAT and the
    // promo discount are computed server-side. Requests whose items cannot be
    // priced are rejected, never skipped; client-sent shipping/discount values
    // are ignored.
    const parsedLineItems = parseLineItemsForPricing(line_items);
    if (parsedLineItems.errors.length > 0) {
      throw new FunctionError(400, "INVALID_LINE_ITEMS", parsedLineItems.errors.join("; "));
    }
    const promoCode = normalizePromoCode(promo_code ?? metadata?.promoCode ?? metadata?.promo_code);
    const priced = await validatePricingAgainstDatabase({
      lineItems: parsedLineItems.items,
      promoCode,
      clientTotalCents: majorUnitsToCents(validAmount),
      currency,
      config: getOrderTotalsConfig(),
    });
    const pricingMetadata = toPricingMetadata(priced.totals, promoCode);

    // Get site URL for redirect URLs
    const siteUrl = Deno.env.get("SITE_URL") || "http://localhost:3000";
    const supabaseUrl = validateEnvVars.supabaseUrl();

    // Mollie rejects webhook URLs it cannot reach, so skip it for local development
    const isLocalSupabase =
      supabaseUrl.includes("localhost") || supabaseUrl.includes("127.0.0.1");
    const webhookUrl = isLocalSupabase
      ? undefined
      : `${supabaseUrl}/functions/v1/mollie-webhook`;

    const metadataOrderId =
      metadata && typeof metadata.order_id === "string" ? metadata.order_id : undefined;
    const resolvedOrderId = order_id ?? metadataOrderId;

    // Build metadata to store with payment
    const paymentMetadata = {
      ...metadata,
      ...pricingMetadata,
      ...(resolvedOrderId ? { order_id: resolvedOrderId } : {}),
      user_id: userId,
      user_email: userEmail,
      line_items: line_items,
      shipping_address: shipping_address,
    };

    // Create Mollie payment
    // Server-computed total (validated against the client amount above)
    const serverAmount = priced.totals.total_cents / 100;

    const molliePayment = await createMolliePayment({
      amount: serverAmount,
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
          amount: serverAmount,
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
