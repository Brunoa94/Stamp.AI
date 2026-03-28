import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleError } from "../_shared/errors.ts";
import { validateEnvVars } from "../_shared/validators.ts";
import { getMolliePayment, mapMollieStatusToInternal, isMolliePaymentPaid } from "../_shared/mollie.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Helper to call Supabase REST API directly
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

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  return {
    data,
    error: response.ok ? null : data,
    status: response.status,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Mollie sends webhook as form data with just the payment ID
    const formData = await req.formData();
    const paymentId = formData.get("id") as string;

    if (!paymentId) {
      console.error("No payment ID in webhook");
      return new Response(JSON.stringify({ error: "No payment ID" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    console.log("Mollie webhook received for payment:", paymentId);

    // Fetch payment details from Mollie
    const payment = await getMolliePayment(paymentId);
    console.log("Payment status:", payment.status);

    // Map status
    const internalStatus = mapMollieStatusToInternal(payment.status);
    const isPaid = isMolliePaymentPaid(payment.status);

    // Parse metadata
    let metadata: Record<string, unknown> = {};
    let lineItems: unknown[] = [];
    let userId: string | undefined;
    let shippingAddress: Record<string, unknown> | undefined;

    if (payment.metadata) {
      metadata = payment.metadata as Record<string, unknown>;
      lineItems = (metadata.line_items as unknown[]) || [];
      userId = metadata.user_id as string | undefined;
      shippingAddress = metadata.shipping_address as Record<string, unknown> | undefined;
    }

    // Save/update payment transaction in database
    const result = await supabaseRest(
      "payment_transactions",
      "POST",
      {
        user_id: userId,
        payment_provider: "mollie",
        mollie_payment_id: payment.id,
        mollie_status: payment.status,
        amount: parseFloat(payment.amount.value),
        currency: payment.amount.currency.toLowerCase(),
        status: internalStatus,
        payment_method_type: payment.method || "unknown",
        metadata: metadata,
        updated_at: new Date().toISOString(),
      },
      { prefer: "resolution=merge-duplicates" }
    );

    if (result.error) {
      console.error("Database error:", result.error);
    } else {
      console.log("Payment transaction saved/updated");
    }

    // If payment is successful, update order and create Printify order
    if (isPaid) {
      console.log("Payment is paid, processing order...");

      // Update order payment_status if we have an order_id
      const dbOrderId = metadata.order_id;
      if (dbOrderId) {
        await supabaseRest(`orders?id=eq.${dbOrderId}`, "PATCH", {
          payment_status: "paid",
          payment_method: "mollie",
          updated_at: new Date().toISOString(),
        });
        console.log(`Order ${dbOrderId} payment_status updated to: paid`);
      }

      // Create Printify order if we have line items
      if (lineItems.length > 0 && shippingAddress) {
        console.log("Creating Printify order...");
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
                order_id: metadata.order_id || `mollie-${Date.now()}`,
                mollie_payment_id: payment.id,
              },
            }),
          }
        );

        if (printifyResponse.ok) {
          const printifyResult = await printifyResponse.json();
          console.log("Printify order created:", printifyResult);
        } else {
          const errorText = await printifyResponse.text();
          console.error("Printify order creation failed:", errorText);
        }
      }
    } else if (payment.status === "failed" || payment.status === "canceled" || payment.status === "expired") {
      // Update order status if payment failed
      const dbOrderId = metadata.order_id;
      if (dbOrderId) {
        await supabaseRest(`orders?id=eq.${dbOrderId}`, "PATCH", {
          payment_status: internalStatus,
          updated_at: new Date().toISOString(),
        });
        console.log(`Order ${dbOrderId} payment_status updated to: ${internalStatus}`);
      }
    }

    // Always return 200 to acknowledge webhook receipt
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Mollie webhook error:", error);
    // Still return 200 to prevent Mollie from retrying
    return new Response(JSON.stringify({ received: true, error: "Processing error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
