import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, FunctionError, handleError } from "../_shared/errors.ts";
import { validateEnvVars, validateRequest, verifyAuth } from "../_shared/validators.ts";
import { createPayPalOrder } from "../_shared/paypal.ts";
import { supabaseRest } from "../_shared/supabase.ts";
import { validatePricingAgainstDatabase, type LineItemForPricingI } from "../_shared/serverPriceService.ts";
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
      shipping_cost_cents = 0,
      discount_cents = 0,
      metadata,
    }: PayPalOrderRequestI & { shipping_cost_cents?: number; discount_cents?: number } = await req.json();

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
          amount: validAmount,
          currency: currency.toLowerCase(),
          status: 'pending',
          metadata: {
            ...metadata,
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
