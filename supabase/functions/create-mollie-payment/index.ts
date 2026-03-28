import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, handleError } from "../_shared/errors.ts";
import { validateEnvVars, validateRequest } from "../_shared/validators.ts";
import { createMolliePayment } from "../_shared/mollie.ts";
import type { MolliePaymentRequestI, MolliePaymentResponseI } from "../../types/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Verify authentication - accepts both user JWT tokens and service role key
 * Returns user info if available, or service identifier if using service role
 */
async function verifyAuth(authHeader: string | null): Promise<{ userId: string; userEmail: string }> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw ErrorCodes.INVALID_TOKEN();
  }

  const token = authHeader.replace("Bearer ", "");
  const supabaseUrl = validateEnvVars.supabaseUrl();
  const supabaseAnonKey = validateEnvVars.supabaseAnonKey();
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  // Check if it's the service role key (server-to-server calls)
  if (serviceRoleKey && token === serviceRoleKey) {
    console.log("Authenticated with service role key");
    return {
      userId: "service-role",
      userEmail: "service@system.internal",
    };
  }

  // Otherwise, validate as user JWT token
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: supabaseAnonKey,
    },
  });

  if (!response.ok) {
    console.error("Auth verification failed:", response.status, response.statusText);
    throw ErrorCodes.INVALID_TOKEN();
  }

  const user = await response.json();

  if (!user || !user.id) {
    throw ErrorCodes.INVALID_TOKEN();
  }

  console.log("Authenticated user:", user.id);
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

    console.log("Authenticated user:", userId);

    const {
      amount,
      currency = "EUR",
      description,
      line_items,
      shipping_address,
      metadata,
    }: MolliePaymentRequestI = await req.json();

    // Validate request data
    const validAmount = validateRequest.amount(amount);

    // Get site URL for redirect URLs
    const siteUrl = Deno.env.get("SITE_URL") || "http://localhost:3000";
    const supabaseUrl = validateEnvVars.supabaseUrl();

    // Build metadata to store with payment
    const paymentMetadata = {
      ...metadata,
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
