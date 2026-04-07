import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, handleError } from "../_shared/errors.ts";
import { validateEnvVars, validateRequest, verifyAuth } from "../_shared/validators.ts";
import { createMolliePayment } from "../_shared/mollie.ts";
import { revalidateOrderForPayment } from "../_shared/order-lifecycle.ts";
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
    // Verify authentication
    const authHeader = req.headers.get("authorization");
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
    }: MolliePaymentRequestI = await req.json();

    // Validate request data
    const validAmount = validateRequest.amount(amount);

    const candidateOrderId =
      typeof order_id === "string"
        ? order_id
        : metadata && typeof metadata.order_id === "string"
          ? metadata.order_id
          : undefined;

    if (candidateOrderId && validateRequest.isUuid(candidateOrderId)) {
      const revalidation = await revalidateOrderForPayment(candidateOrderId, userId);
      if (!revalidation.ok) {
        throw ErrorCodes.INVALID_REQUEST_BODY();
      }
    } else if (candidateOrderId) {
      console.warn("Skipping order revalidation because order_id is not a UUID:", candidateOrderId);
    }

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
      webhookUrl: `${supabaseUrl}/functions/v1/mollie-webhook`,
      metadata: paymentMetadata,
    });

    // Get the checkout URL from the response
    const checkoutUrl = molliePayment._links.checkout?.href;

    if (!checkoutUrl) {
      throw ErrorCodes.MOLLIE_PAYMENT_FAILED("No checkout URL returned from Mollie");
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
