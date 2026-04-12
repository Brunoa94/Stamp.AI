import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, FunctionError, handleError } from "../_shared/errors.ts";
import { validateEnvVars } from "../_shared/validators.ts";
import { capturePayPalOrder } from "../_shared/paypal.ts";
import { processPaidOrder } from "../_shared/order-lifecycle.ts";
import type { PayPalCaptureRequestI, PayPalCaptureResponseI } from "../../types/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Helper to call Supabase REST API directly without the client library
 */
async function supabaseRest(
  endpoint: string,
  method: string,
  body?: Record<string, unknown>,
  options?: { prefer?: string }
) {
  const supabaseUrl = validateEnvVars.supabaseUrl();
  const serviceKey = validateEnvVars.supabaseServiceKey();

  const headers: Record<string, string> = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };

  if (options?.prefer) {
    headers["Prefer"] = options.prefer;
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle empty responses (204 No Content, or empty body)
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  return {
    data,
    error: response.ok ? null : data,
    status: response.status,
  };
}

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
    await verifyAuth(authHeader);

    const { orderId, payerId }: PayPalCaptureRequestI = await req.json();

    if (!orderId) {
      throw ErrorCodes.PAYPAL_ORDER_ID_REQUIRED();
    }

    console.log("Capturing PayPal order:", orderId);

    // Capture the PayPal order
    let captureResult;
    try {
      captureResult = await capturePayPalOrder(orderId);
    } catch (error) {
      // Avoid noisy edge-function error logs for recoverable funding-source declines.
      if (error instanceof FunctionError && error.errorId === "PAYPAL_CAPTURE_FAILED") {
        const declineResponse: PayPalCaptureResponseI = {
          success: false,
          captureId: orderId,
          status: "DECLINED",
          error: "PAYPAL_CAPTURE_FAILED",
          restartable: true,
        };

        return new Response(JSON.stringify(declineResponse), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      throw error;
    }

    if (captureResult.status !== "COMPLETED") {
      const pendingResponse: PayPalCaptureResponseI = {
        success: false,
        captureId: orderId,
        status: captureResult.status,
        error: "PAYPAL_CAPTURE_FAILED",
        restartable: true,
      };

      return new Response(JSON.stringify(pendingResponse), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Extract capture and payer info
    const capture = captureResult.purchase_units?.[0]?.payments?.captures?.[0];
    const payer = captureResult.payer;

    // Parse custom_id to get metadata and line items
    let metadata: Record<string, unknown> = {};
    let lineItems: unknown[] = [];
    let userId: string | undefined;
    let userEmail: string | undefined;

    try {
      const customData = JSON.parse(captureResult.purchase_units?.[0]?.custom_id || "{}");
      metadata = customData;
      lineItems = customData.line_items || [];
      userId = customData.user_id;
      userEmail = customData.user_email;
    } catch (e) {
      console.warn("Could not parse custom_id:", e);
    }

    const dbOrderId = metadata.order_id as string | undefined;
    if (dbOrderId) {
      await processPaidOrder({
        provider: "paypal",
        eventId: `paypal-capture-${capture?.id || orderId}`,
        orderId: dbOrderId,
        amount: parseFloat(capture?.amount?.value || "0"),
        currency: (capture?.amount?.currency_code || "USD").toLowerCase(),
        userId,
        metadata,
        refs: {
          paypal_order_id: orderId,
          paypal_capture_id: capture?.id,
        },
        lineItems,
        shippingAddress: (metadata.shipping_address as Record<string, unknown>) || {},
      });
    }

    const response: PayPalCaptureResponseI = {
      success: true,
      captureId: capture?.id || orderId,
      status: captureResult.status,
      payerEmail: payer?.email_address,
    };

    console.log("PayPal order captured successfully:", orderId);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error capturing PayPal order:", error);
    return handleError(error, corsHeaders);
  }
});
