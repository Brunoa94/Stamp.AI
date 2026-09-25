import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, handleError } from "../_shared/errors.ts";
import { validateEnvVars } from "../_shared/validators.ts";
import { capturePayPalOrder, getPayPalOrder } from "../_shared/paypal.ts";
import { tryGenerateInvoiceForOrder } from "../_shared/invoice.ts";
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
    const { userId: callerId } = await verifyAuth(authHeader);

    const { orderId, payerId }: PayPalCaptureRequestI = await req.json();

    // PayPal order ids are alphanumeric; the id is interpolated into the
    // PayPal API path, so reject anything else before it is used.
    if (!orderId || typeof orderId !== "string" || !/^[A-Z0-9]+$/i.test(orderId)) {
      throw ErrorCodes.PAYPAL_ORDER_ID_REQUIRED();
    }

    console.log("Capturing PayPal order:", orderId);

    // Fetch the order BEFORE capturing and require that every purchase unit
    // was created for the authenticated user. Without this, any signed-in
    // user could capture (and get credited for) someone else's PayPal order.
    const paypalOrder = await getPayPalOrder(orderId);
    const purchaseUnits = paypalOrder.purchase_units || [];

    // Parse custom_id to get metadata and line items
    let metadata: Record<string, unknown> = {};
    let lineItems: unknown[] = [];
    let userId: string | undefined;
    let userEmail: string | undefined;

    try {
      const customData = JSON.parse(purchaseUnits[0]?.custom_id || "{}");
      metadata = customData;
      lineItems = customData.line_items || [];
      userId = typeof customData.user_id === "string" ? customData.user_id : undefined;
      userEmail = customData.user_email;
    } catch (e) {
      console.warn("Could not parse custom_id:", e);
    }

    const isServiceCall = callerId === "service-role";
    const ownsEveryPurchaseUnit =
      purchaseUnits.length > 0 &&
      purchaseUnits.every((unit) => {
        try {
          const customData = JSON.parse(unit.custom_id || "{}");
          return typeof customData.user_id === "string" && customData.user_id === callerId;
        } catch {
          return false;
        }
      });

    if (!isServiceCall && !ownsEveryPurchaseUnit) {
      console.warn("PayPal order does not belong to the authenticated user:", orderId);
      throw ErrorCodes.UNAUTHORIZED("PayPal order does not belong to the authenticated user");
    }

    if (!userId) {
      throw ErrorCodes.UNAUTHORIZED("PayPal order has no owner");
    }

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

    // Update order payment_status to "paid" — scoped to the order owner so a
    // PayPal order can never flip someone else's order to paid.
    const dbOrderId = typeof metadata.order_id === "string" ? metadata.order_id : undefined;
    if (dbOrderId) {
      const orderResult = await supabaseRest(
        `orders?id=eq.${dbOrderId}&user_id=eq.${userId}`,
        "PATCH",
        {
          payment_status: "paid",
          payment_method: "paypal",
          updated_at: new Date().toISOString(),
        }
      );

      if (orderResult.error) {
        console.error("Failed to update order payment_status:", orderResult.error);
      } else {
        console.log(`Order ${dbOrderId} payment_status updated to: paid`);

        // Issue the invoice now that the order is paid (idempotent, non-blocking)
        await tryGenerateInvoiceForOrder(dbOrderId);
      }
    }

    // ✅ CRITICAL FIX: Removed automatic Printify order creation
    // The main checkout flow (actions.ts) now handles Printify order creation consistently
    // This prevents:
    // - Bypassing main flow error handling
    // - Hardcoded is_test: true in production
    // - Duplicate logic with main flow
    // - No automatic refund on Printify failure

    // Minimal response: no payer email/address is returned to the client.
    const response: PayPalCaptureResponseI & { amount?: string; currency?: string } = {
      success: true,
      captureId: capture?.id || orderId,
      status: captureResult.status,
      amount: capture?.amount?.value,
      currency: capture?.amount?.currency_code,
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
