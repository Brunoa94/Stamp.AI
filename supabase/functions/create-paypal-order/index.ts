import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, FunctionError, handleError } from "../_shared/errors.ts";
import { validateRequest, verifyAuth } from "../_shared/validators.ts";
import { createPayPalOrder } from "../_shared/paypal.ts";
import { supabaseRest } from "../_shared/supabase.ts";
import { validatePricingAgainstDatabase } from "../_shared/serverPriceService.ts";
import { parseLineItemsForPricing } from "../_shared/lineItemsForPricing.ts";
import { majorUnitsToCents, toPricingMetadata } from "../_shared/orderTotals.ts";
import { getOrderTotalsConfig } from "../_shared/orderTotalsEnv.ts";
import { normalizePromoCode } from "../_shared/promoDiscount.ts";
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
      ...metadata,
      promo_code: pricingMetadata.promo_code,
      total_cents: pricingMetadata.total_cents,
      user_id: userId,
      user_email: userEmail,
      line_items: line_items,
    });

    // Get site URL for return/cancel URLs
    const siteUrl = Deno.env.get("SITE_URL") || "http://localhost:3000";

    // Create PayPal order
    // Server-computed total (validated against the client amount above)
    const serverAmount = priced.totals.total_cents / 100;

    const paypalOrder = await createPayPalOrder({
      amount: serverAmount,
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
          amount: serverAmount,
          currency: currency.toLowerCase(),
          status: 'pending',
          metadata: {
            ...metadata,
            ...pricingMetadata,
            user_id: userId,
            user_email: userEmail,
            line_items: line_items,
            shipping_address: shipping_address,
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
