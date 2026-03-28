import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, handleError } from "../_shared/errors.ts";
import { validateEnvVars } from "../_shared/validators.ts";
import { getMolliePayment, isMolliePaymentPaid } from "../_shared/mollie.ts";
import type { MollieVerifyRequestI, MollieVerifyResponseI } from "../../types/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Verify authentication - accepts both user JWT tokens and service role key
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
    await verifyAuth(authHeader);

    const { paymentId }: MollieVerifyRequestI = await req.json();

    if (!paymentId) {
      throw ErrorCodes.MOLLIE_PAYMENT_ID_REQUIRED();
    }

    console.log("Verifying Mollie payment:", paymentId);

    // Fetch payment from Mollie
    const payment = await getMolliePayment(paymentId);

    const response: MollieVerifyResponseI = {
      success: true,
      paymentId: payment.id,
      status: payment.status,
      isPaid: isMolliePaymentPaid(payment.status),
      metadata: payment.metadata || undefined,
    };

    console.log("Payment status:", payment.status, "isPaid:", response.isPaid);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error verifying Mollie payment:", error);
    return handleError(error, corsHeaders);
  }
});
