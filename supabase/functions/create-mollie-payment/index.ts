import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, handleError } from "../_shared/errors.ts";
import { validateEnvVars, validateRequest, verifyAuth } from "../_shared/validators.ts";
import { createMolliePayment } from "../_shared/mollie.ts";
import { supabaseRest } from "../_shared/supabase.ts";
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
    // Read and log incoming request headers/body (masked) for debugging
    const authHeader = req.headers.get("authorization");
    const apikeyHeader = req.headers.get("apikey");

    let rawBody: string | null = null;
    try {
      rawBody = await req.text();
    } catch (e) {
      rawBody = null;
    }

    let parsedBody: any = null;
    try {
      parsedBody = rawBody ? JSON.parse(rawBody) : {};
    } catch (e) {
      parsedBody = null;
    }

    // Mask tokens for logs
    const mask = (s?: string | null) => {
      if (!s) return null;
      if (s.length <= 16) return '*****';
      return `${s.slice(0,8)}...${s.slice(-8)}`;
    };

    console.log('Incoming function request - header previews:', {
      authorization: mask(authHeader?.replace('Bearer ', '')),
      apikey: mask(apikeyHeader),
    });

    console.log('Incoming function request - body preview:', {
      amount: parsedBody?.amount,
      currency: parsedBody?.currency,
      order_id: parsedBody?.metadata?.order_id ?? parsedBody?.order_id,
      line_items_count: Array.isArray(parsedBody?.line_items) ? parsedBody.line_items.length : undefined,
    });

    // Verify authentication
    const { userId, userEmail } = await verifyAuth(authHeader);

    console.log("Authenticated user:", userId);

    const {
      amount,
      currency = "EUR",
      description,
      order_id,
      line_items,
      shipping_address,
      metadata,
    }: MolliePaymentRequestI = parsedBody ?? {};

    // Validate request data
    const validAmount = validateRequest.amount(amount);

    // Get site URL for redirect URLs
    const siteUrl = Deno.env.get("SITE_URL") || "http://localhost:3000";
    const supabaseUrl = validateEnvVars.supabaseUrl();

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

    console.log("Creating Mollie payment with order_id:", resolvedOrderId ?? "none");

    // Create Mollie payment
    const molliePayment = await createMolliePayment({
      amount: validAmount,
      currency: currency.toUpperCase(),
      description: description || `Order for ${userEmail}`,
      redirectUrl: `${siteUrl}/checkout/mollie-return`,
      metadata: paymentMetadata,
    });

    // Get the checkout URL from the response
    const checkoutUrl = molliePayment._links.checkout?.href;

    if (!checkoutUrl) {
      throw ErrorCodes.MOLLIE_PAYMENT_FAILED("No checkout URL returned from Mollie");
    }

    // Create payment_transactions record immediately with user_id
    // Webhook will later update this record to 'succeeded' or 'failed'
    try {
      await supabaseRest(
        'payment_transactions',
        'POST',
        {
          payment_provider: 'mollie',
          mollie_payment_id: molliePayment.id,
          mollie_status: molliePayment.status,
          amount: validAmount,
          currency: currency.toLowerCase(),
          status: 'pending',
          payment_method_type: molliePayment.method || null,
          metadata: paymentMetadata,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { prefer: 'resolution=merge-duplicates' }
      )
      console.log('✅ Payment transaction record created:', molliePayment.id)
    } catch (dbError) {
      // Log error but don't fail the request - webhook can still process it
      console.error('Failed to create payment_transactions record:', dbError)
    }

    const response: MolliePaymentResponseI = {
      success: true,
      paymentId: molliePayment.id,
      checkoutUrl: checkoutUrl,
    };

    console.log("Mollie payment created:", molliePayment.id);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating Mollie payment:", error);
    return handleError(error, corsHeaders);
  }
});
