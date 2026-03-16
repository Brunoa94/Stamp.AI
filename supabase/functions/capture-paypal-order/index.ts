import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, handleError } from "../_shared/errors.ts";
import { validateEnvVars } from "../_shared/validators.ts";
import { capturePayPalOrder } from "../_shared/paypal.ts";
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
    const captureResult = await capturePayPalOrder(orderId);

    if (captureResult.status !== "COMPLETED") {
      throw ErrorCodes.PAYPAL_CAPTURE_FAILED(captureResult.status);
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

    // Save payment to database
    const result = await supabaseRest(
      "payment_transactions",
      "POST",
      {
        user_id: userId,
        payment_provider: "paypal",
        paypal_order_id: orderId,
        paypal_capture_id: capture?.id,
        paypal_payer_id: payer?.payer_id || payerId,
        paypal_payer_email: payer?.email_address,
        amount: parseFloat(capture?.amount?.value || "0"),
        currency: capture?.amount?.currency_code?.toLowerCase() || "usd",
        status: "succeeded",
        payment_method_type: "paypal",
        metadata: metadata,
        updated_at: new Date().toISOString(),
      },
      { prefer: "resolution=merge-duplicates" }
    );

    if (result.error) {
      console.error("Database insert error:", result.error);
    } else {
      console.log("Payment saved to database");
    }

    // Update order payment_status to "paid"
    const dbOrderId = metadata.order_id;
    if (dbOrderId) {
      const orderResult = await supabaseRest(`orders?id=eq.${dbOrderId}`, "PATCH", {
        payment_status: "paid",
        payment_method: "paypal",
        updated_at: new Date().toISOString(),
      });

      if (orderResult.error) {
        console.error("Failed to update order payment_status:", orderResult.error);
      } else {
        console.log(`Order ${dbOrderId} payment_status updated to: paid`);
      }
    }

    // Create Printify order if we have line items
    if (lineItems.length > 0) {
      console.log("Creating Printify order with", lineItems.length, "items");

      const shippingAddress = metadata.shipping_address || {};

      const printifyResponse = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/create-printify-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: Deno.env.get("SUPABASE_ANON_KEY") || "",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            is_test: true,
            auto_cancel: true,
            line_items: lineItems,
            shipping_address: shippingAddress,
            metadata: {
              order_id: metadata.order_id || `paypal-${Date.now()}`,
              paypal_order_id: orderId,
              paypal_capture_id: capture?.id,
            },
          }),
        }
      );

      const printifyResult = await printifyResponse.json();
      console.log("Printify order result:", printifyResult);

      if (!printifyResponse.ok) {
        console.error("Failed to create Printify order:", printifyResult);
      }
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
