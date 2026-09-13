import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@16.12.0?target=deno";
import { ErrorCodes, FunctionError, handleError } from "../_shared/errors.ts";
import { validateEnvVars, validateRequest } from "../_shared/validators.ts";
import { supabaseRest } from "../_shared/supabase.ts";
import { validatePricingAgainstDatabase, type LineItemForPricingI } from "../_shared/serverPriceService.ts";
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
      payment_method, // Optional: for testing with pm_card_visa, etc.
      confirm = false, // Optional: auto-confirm payment (for testing)
    } = await req.json();

    // Validate environment variables and request data
    const stripeSecretKey = validateEnvVars.stripeSecretKey();
    const validAmount = validateRequest.amount(amount);

    // SERVER-SIDE PRICE VALIDATION (C4 - Amount Tampering Prevention)
    // If line_items contain blueprint_id and printify_variant_id, validate against DB prices
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

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Build payment intent options
    const paymentIntentOptions: any = {
      amount: Math.round(validAmount * 100), // Convert to cents
      currency: currency,
      metadata: {
        ...metadata,
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
    } catch (stripeError: any) {
      throw ErrorCodes.STRIPE_API_ERROR(
        stripeError.message || JSON.stringify(stripeError),
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
          amount: validAmount,
          currency: currency.toLowerCase(),
          status: "pending",
          payment_method_type: payment_method ? "card" : null,
          metadata: {
            ...metadata,
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
