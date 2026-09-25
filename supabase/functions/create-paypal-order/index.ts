import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, handleError } from "../_shared/errors.ts";
import { validateRequest, verifyAuth } from "../_shared/validators.ts";
import { createPayPalOrder } from "../_shared/paypal.ts";
import { supabaseRest } from "../_shared/supabase.ts";
import {
  priceOrderRequest,
  pricingMetadata,
  sanitizeClientMetadata,
} from "../_shared/serverPriceService.ts";
import type { PayPalOrderRequestI, PayPalOrderResponseI } from "../../types/index.ts";
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
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    const { userId, userEmail } = await verifyAuth(authHeader);

    const {
      amount,
      currency = "usd",
      line_items,
      shipping_address,
      shipping_cost_cents,
      discount_cents,
      promo_code,
      metadata,
    }: PayPalOrderRequestI & {
      shipping_cost_cents?: number;
      discount_cents?: number;
      promo_code?: string;
    } = await req.json();

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
    const clientMetadata = sanitizeClientMetadata(metadata);

    if (shipping_address) {
      if (!shipping_address.zip?.trim()) {
        throw ErrorCodes.MISSING_REQUIRED_FIELDS("shipping_address.zip");
      }
      if (!shipping_address.country?.trim()) {
        throw ErrorCodes.MISSING_REQUIRED_FIELDS("shipping_address.country");
      }
    }

    // Build custom_id with metadata for webhook processing
    const customId = JSON.stringify({
      ...clientMetadata,
      ...pricingMetadata(pricing),
      user_id: userId,
      user_email: userEmail,
      line_items: line_items,
    });

    // Get site URL for return/cancel URLs
    const siteUrl = Deno.env.get("SITE_URL") || "http://localhost:3000";

    // Create PayPal order
    const paypalOrder = await createPayPalOrder({
      amount: chargeAmount,
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
      returnUrl: `${siteUrl}/checkout/paypal-return`,
      cancelUrl: `${siteUrl}/checkout`,
    });

    // Find approval URL
    const approvalLink = paypalOrder.links?.find((link) => link.rel === "approve");

    // Create payment_transactions record immediately with user_id
    // Webhook will later update this record to 'succeeded' or 'failed'
    try {
      await supabaseRest(
        'payment_transactions',
        'POST',
        {
          user_id: userId,
          payment_provider: 'paypal',
          paypal_order_id: paypalOrder.id,
          amount: chargeAmount,
          currency: currency.toLowerCase(),
          status: 'pending',
          metadata: {
            ...clientMetadata,
            ...pricingMetadata(pricing),
            user_id: userId,
            user_email: userEmail,
            line_items: line_items,
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { prefer: 'resolution=merge-duplicates' }
      )
    } catch {
      // Transaction record is best-effort; webhook can still process it
    }

    const response: PayPalOrderResponseI = {
      success: true,
      orderId: paypalOrder.id,
      approvalUrl: approvalLink?.href,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return handleError(error, corsHeaders);
  }
});
