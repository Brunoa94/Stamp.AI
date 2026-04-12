import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, handleError } from "../_shared/errors.ts";
import { validateEnvVars, validateRequest, verifyAuth } from "../_shared/validators.ts";
import { createPayPalOrder } from "../_shared/paypal.ts";
import type { PayPalOrderRequestI, PayPalOrderResponseI } from "../../types/index.ts";

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
      currency = "usd",
      line_items,
      shipping_address,
      metadata,
    }: PayPalOrderRequestI = await req.json();

    // Validate request data
    const validAmount = validateRequest.amount(amount);

    if (shipping_address && !shipping_address.zip?.trim()) {
      throw ErrorCodes.MISSING_REQUIRED_FIELDS("shipping_address.zip");
    }

    // Build custom_id with metadata for webhook processing
    const customId = JSON.stringify({
      ...metadata,
      user_id: userId,
      user_email: userEmail,
      line_items: line_items,
    });

    // Get site URL for return/cancel URLs
    const siteUrl = Deno.env.get("SITE_URL") || "http://localhost:3000";

    // Create PayPal order
    const paypalOrder = await createPayPalOrder({
      amount: validAmount,
      currency: currency.toUpperCase(),
      description: `Order for ${userEmail}`,
      customId: customId,
      shippingAddress: shipping_address
        ? {
            firstName: shipping_address.first_name,
            lastName: shipping_address.last_name,
            address1: shipping_address.address1,
            address2: shipping_address.address2,
            city: shipping_address.city,
            region: shipping_address.region,
            zip: shipping_address.zip.trim(),
            country: shipping_address.country,
          }
        : undefined,
      returnUrl: `${siteUrl}/checkout/success`,
      cancelUrl: `${siteUrl}/checkout`,
    });

    // Find approval URL
    const approvalLink = paypalOrder.links?.find((link) => link.rel === "approve");

    const response: PayPalOrderResponseI = {
      success: true,
      orderId: paypalOrder.id,
      approvalUrl: approvalLink?.href,
    };

    console.log("PayPal order created:", paypalOrder.id);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    return handleError(error, corsHeaders);
  }
});
