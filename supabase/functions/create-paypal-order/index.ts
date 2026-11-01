import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, FunctionError, handleError } from "../_shared/errors.ts";
import { validateEnvVars, validateRequest, verifyAuth } from "../_shared/validators.ts";
import { createPayPalOrder } from "../_shared/paypal.ts";
import { supabaseRest } from "../_shared/supabase.ts";
import { enforceCallerLimits, OPERATION_LIMITS } from "../_shared/operationLimit.ts";
import { priceCheckout, pricingMetadata, requireClientTotal } from "../_shared/checkoutPricing.ts";
import { withoutOrderId } from "../_shared/checkoutPricingRules.ts";
import type { PayPalOrderRequestI, PayPalOrderResponseI } from "../../types/index.ts";
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
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    const { userId, userEmail, isAnonymous } = await verifyAuth(authHeader);

    const {
      amount,
      currency = "usd",
      line_items,
      shipping_address,
      promo_code,
      metadata,
    }: PayPalOrderRequestI & { promo_code?: string } = await req.json();

    // Validate request data
    const validAmount = validateRequest.amount(amount);

    // SERVER-SIDE PRICING (C4 - Amount Tampering Prevention)
    // The charged amount comes from catalog prices, the promo code and the
    // shipping rule. The client total must agree; it never sets the price.
    if (String(currency).toLowerCase() !== "eur") {
      throw new FunctionError(400, "INVALID_CURRENCY", "Checkout is priced in EUR");
    }
    if (userId === "service-role") throw ErrorCodes.INVALID_REQUEST_BODY();
    await enforceCallerLimits({ userId, isAnonymous }, req, "payment-create", OPERATION_LIMITS["payment-create"]);
    const pricing = await priceCheckout({ lineItems: line_items, promoCode: promo_code, userId });
    requireClientTotal(pricing, Math.round(validAmount * 100));

    if (shipping_address) {
      if (!shipping_address.zip?.trim()) {
        throw ErrorCodes.MISSING_REQUIRED_FIELDS("shipping_address.zip");
      }
      if (!shipping_address.country?.trim()) {
        throw ErrorCodes.MISSING_REQUIRED_FIELDS("shipping_address.country");
      }
    }

    // Build custom_id with metadata for webhook processing
    // custom_id is length-limited by PayPal; the cart id lives on our transaction only.
    const { cartId: _cartId, ...customMetadata } = withoutOrderId(metadata);
    const customId = JSON.stringify({
      ...customMetadata,
      user_id: userId,
      user_email: userEmail,
      line_items: line_items,
    });

    // Get site URL for return/cancel URLs
    const siteUrl = Deno.env.get("SITE_URL") || "http://localhost:3000";

    // Create PayPal order
    const paypalOrder = await createPayPalOrder({
      amount: pricing.totalCents / 100,
      currency: "EUR",
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

    // The transaction row carries the server pricing that capture and
    // fulfilment verify against, so the checkout cannot continue without it.
    const transaction = await supabaseRest(
      'payment_transactions',
      'POST',
      {
        user_id: userId,
        payment_provider: 'paypal',
        paypal_order_id: paypalOrder.id,
        amount: pricing.totalCents / 100,
        currency: 'eur',
        status: 'pending',
        metadata: {
          ...withoutOrderId(metadata),
          user_id: userId,
          user_email: userEmail,
          line_items: line_items,
          shipping_address: shipping_address,
          ...pricingMetadata(pricing),
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { prefer: 'resolution=merge-duplicates' }
    );
    if (transaction.error) {
      throw new Error('Could not record the payment transaction');
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
