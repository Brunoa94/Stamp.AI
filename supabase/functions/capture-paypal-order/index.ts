import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, FunctionError, handleError } from "../_shared/errors.ts";
import { validateEnvVars } from "../_shared/validators.ts";
import { capturePayPalOrder, getPayPalOrder } from "../_shared/paypal.ts";
import type { PayPalCaptureRequestI, PayPalCaptureResponseI } from "../../types/index.ts";
import { corsHeadersFor } from "../_shared/cors.ts";

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
    const caller = await verifyAuth(authHeader);

    const { orderId, payerId }: PayPalCaptureRequestI = await req.json();

    if (!orderId || typeof orderId !== "string" || !/^[A-Za-z0-9-]{1,64}$/.test(orderId)) {
      throw ErrorCodes.PAYPAL_ORDER_ID_REQUIRED();
    }

    // Before any money moves: the PayPal order must belong to the caller and
    // be one our server created and priced, for exactly that total.
    const approved = await getPayPalOrder(orderId);
    const unit = approved.purchase_units?.[0];
    let ownerId: unknown;
    try {
      ownerId = JSON.parse(unit?.custom_id || "{}").user_id;
    } catch {
      ownerId = undefined;
    }
    if (typeof ownerId !== "string" || (caller.userId !== "service-role" && ownerId !== caller.userId)) {
      throw new FunctionError(403, "FORBIDDEN", "Payment does not belong to this user");
    }
    const transactionResult = await supabaseRest(
      `payment_transactions?paypal_order_id=eq.${encodeURIComponent(orderId)}&user_id=eq.${encodeURIComponent(ownerId)}&select=metadata`,
      "GET",
    );
    const totalCents = transactionResult.data?.[0]?.metadata?.total_cents;
    if (typeof totalCents !== "number" || approved.purchase_units?.length !== 1 ||
      unit?.amount?.currency_code !== "EUR" || Math.round(Number(unit.amount.value) * 100) !== totalCents) {
      throw new FunctionError(409, "PAYMENT_NOT_FOUND", "No matching checkout payment for this PayPal order");
    }

    console.log("Capturing PayPal order:", orderId);

    // Capture the PayPal order
    const captureResult = await capturePayPalOrder(orderId);

    // ✅ CRITICAL FIX: Comprehensive status validation for all PayPal states
    switch (captureResult.status) {
      case "COMPLETED":
        // Payment was successful, continue processing
        console.log("PayPal payment completed successfully");
        break;

      case "PENDING":
        // Payment is pending (e.g., eCheck, manual review)
        console.warn("PayPal payment is pending:", captureResult.status);
        throw ErrorCodes.PAYPAL_CAPTURE_FAILED(
          "PENDING - Payment is being processed. You will receive confirmation when it completes."
        );

      case "DECLINED":
        // Payment was declined by PayPal
        console.error("PayPal payment was declined");
        throw ErrorCodes.PAYPAL_CAPTURE_FAILED(
          "DECLINED - The payment was declined. Please try a different payment method."
        );

      case "REFUNDED":
      case "PARTIALLY_REFUNDED":
        // Payment was refunded (unexpected state during capture)
        console.error("PayPal payment was refunded:", captureResult.status);
        throw ErrorCodes.PAYPAL_CAPTURE_FAILED(
          `${captureResult.status} - This payment has been refunded. Please create a new order.`
        );

      case "FAILED":
      case "DENIED":
        // Payment failed or was denied
        console.error("PayPal payment failed:", captureResult.status);
        throw ErrorCodes.PAYPAL_CAPTURE_FAILED(
          `${captureResult.status} - The payment could not be processed. Please try again.`
        );

      default:
        // Unknown or unexpected status
        console.error("Unknown PayPal status:", captureResult.status);
        throw ErrorCodes.PAYPAL_CAPTURE_FAILED(
          `Unknown status: ${captureResult.status}. Please contact support.`
        );
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

    // Record the capture on our transaction. Its metadata holds the server
    // pricing and is left untouched; the order is settled by the webhook and
    // finalize-order, never from client metadata.
    const result = await supabaseRest(
      `payment_transactions?paypal_order_id=eq.${encodeURIComponent(orderId)}&user_id=eq.${encodeURIComponent(ownerId)}`,
      "PATCH",
      {
        paypal_capture_id: capture?.id,
        paypal_payer_id: payer?.payer_id || payerId,
        paypal_payer_email: payer?.email_address,
        status: "succeeded",
        payment_method_type: "paypal",
        updated_at: new Date().toISOString(),
      },
    );

    if (result.error) {
      console.error("Database update error:", result.error);
    } else {
      console.log("Payment saved to database");
    }

    // ✅ CRITICAL FIX: Removed automatic Printify order creation
    // The main checkout flow (actions.ts) now handles Printify order creation consistently
    // This prevents:
    // - Bypassing main flow error handling
    // - Hardcoded is_test: true in production
    // - Duplicate logic with main flow
    // - No automatic refund on Printify failure

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
