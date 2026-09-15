import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@16.12.0?target=deno";
import { ErrorCodes, FunctionError, handleError } from "../_shared/errors.ts";
import { validateEnvVars, validateRequest } from "../_shared/validators.ts";
import { supabaseRest } from "../_shared/supabase.ts";
import { validatePricingAgainstDatabase } from "../_shared/serverPriceService.ts";
import { parseLineItemsForPricing } from "../_shared/lineItemsForPricing.ts";
import { majorUnitsToCents, toPricingMetadata } from "../_shared/orderTotals.ts";
import { getOrderTotalsConfig } from "../_shared/orderTotalsEnv.ts";
import { normalizePromoCode } from "../_shared/promoDiscount.ts";
import type { PaymentIntentResponseI } from "../../types/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Verify authentication - accepts both user JWT tokens and service role key
 * Returns user info if available, or service identifier if using service role
 */
async function verifyAuth(
  authHeader: string | null,
): Promise<{ userId: string; userEmail: string }> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw ErrorCodes.INVALID_TOKEN();
  }

  const token = authHeader.replace("Bearer ", "");
  const supabaseUrl = validateEnvVars.supabaseUrl();
  const supabaseAnonKey = validateEnvVars.supabaseAnonKey();
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  // Check if it's the service role key (server-to-server calls)
  if (serviceRoleKey && token === serviceRoleKey) {
    return {
      userId: "service-role",
      userEmail: "service@system.internal",
    };
  }

  // Otherwise, validate as user JWT token
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "apikey": supabaseAnonKey,
    },
  });

  if (!response.ok) {
    throw ErrorCodes.INVALID_TOKEN();
  }

  const user = await response.json();

  if (!user || !user.id) {
    throw ErrorCodes.INVALID_TOKEN();
  }

  return {
    userId: user.id,
    userEmail: user.email || "",
  };
}

/** Stripe metadata values must be strings. */
function stripeMetadataStrings(values: Record<string, string | number | null>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, value === null ? "" : String(value)]),
  );
}

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
      payment_method, // Optional: for testing with pm_card_visa, etc.
      confirm = false, // Optional: auto-confirm payment (for testing)
    } = await req.json();

    // Validate environment variables and request data
    const stripeSecretKey = validateEnvVars.stripeSecretKey();
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
      config: getOrderTotalsConfig(),
    });
    const pricingMetadata = toPricingMetadata(priced.totals, promoCode);

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Build payment intent options
    const paymentIntentOptions: Stripe.PaymentIntentCreateParams = {
      amount: priced.totals.total_cents, // server-computed total (validated against the client amount)
      currency: currency,
      metadata: {
        ...metadata,
        ...stripeMetadataStrings(pricingMetadata),
        user_id: userId,
        user_email: userEmail,
        line_items: JSON.stringify(line_items),
        shipping_address: JSON.stringify(shipping_address),
      },
    };

    // If a test payment method is provided (e.g., pm_card_visa), attach it
    if (payment_method) {
      paymentIntentOptions.payment_method = payment_method;
      paymentIntentOptions.payment_method_types = ["card"];
      if (confirm) {
        paymentIntentOptions.confirm = true;
      }
    } else {
      // For regular checkout flow with card element
      paymentIntentOptions.automatic_payment_methods = {
        enabled: true,
      };
    }

    // Create payment intent
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create(paymentIntentOptions);
    } catch (stripeError: unknown) {
      throw ErrorCodes.STRIPE_API_ERROR(
        stripeError instanceof Error ? stripeError.message : JSON.stringify(stripeError),
      );
    }

    // Create payment_transactions record immediately with user_id
    // Webhook will later update this record to 'succeeded' or 'failed'
    try {
      await supabaseRest(
        "payment_transactions",
        "POST",
        {
          user_id: userId,
          payment_provider: "stripe",
          stripe_payment_intent_id: paymentIntent.id,
          stripe_customer_id: paymentIntent.customer,
          amount: priced.totals.total_cents / 100,
          currency: currency.toLowerCase(),
          status: "pending",
          payment_method_type: payment_method ? "card" : null,
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
        { prefer: "resolution=merge-duplicates" },
      );
    } catch {
      // Transaction record creation is best-effort; webhook can still process it
    }

    const response: PaymentIntentResponseI = {
      success: true,
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return handleError(error, corsHeaders);
  }
});
