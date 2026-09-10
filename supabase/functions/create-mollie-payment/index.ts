import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, FunctionError, handleError } from "../_shared/errors.ts";
import { validateEnvVars, validateRequest, verifyAuth } from "../_shared/validators.ts";
import { createMolliePayment } from "../_shared/mollie.ts";
import { supabaseRest } from "../_shared/supabase.ts";
import { validatePricingAgainstDatabase, type LineItemForPricingI } from "../_shared/serverPriceService.ts";
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
      order_id,
      line_items,
      shipping_address,
      shipping_cost_cents = 0,
      discount_cents = 0,
      metadata,
      method,
    }: MolliePaymentRequestI & { shipping_cost_cents?: number; discount_cents?: number } = parsedBody ?? {};

    // Validate request data
    const validAmount = validateRequest.amount(amount);

    // SERVER-SIDE PRICE VALIDATION (C4 - Amount Tampering Prevention)
    if (line_items && Array.isArray(line_items) && line_items.length > 0) {
      const itemsForPricing: LineItemForPricingI[] = line_items
        .filter((item: Record<string, unknown>) => item.blueprint_id && item.printify_variant_id)
        .map((item: Record<string, unknown>) => ({
          blueprint_id: Number(item.blueprint_id),
          printify_variant_id: Number(item.printify_variant_id),
          quantity: Number(item.quantity) || 1,
        }));

      if (itemsForPricing.length > 0) {
        const clientTotalCents = Math.round(validAmount * 100);
        const validation = await validatePricingAgainstDatabase({
          lineItems: itemsForPricing,
          clientSubtotalCents: clientTotalCents - shipping_cost_cents + discount_cents,
          shippingCostCents: shipping_cost_cents,
          discountCents: discount_cents,
          clientTotalCents,
        });

        if (!validation.isValid) {
          throw new FunctionError(
            400,
            "PRICE_MISMATCH",
            validation.errorMessage || "Server-side price validation failed"
          );
        }
      }
    }

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
      ...(resolvedOrderId ? { order_id: resolvedOrderId } : {}),
      user_id: userId,
      user_email: userEmail,
      line_items: line_items,
      shipping_address: shipping_address,
    };

    // Create Mollie payment
    const molliePayment = await createMolliePayment({
      amount: validAmount,
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
          amount: validAmount,
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
