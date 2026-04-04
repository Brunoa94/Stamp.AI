import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleError } from "../_shared/errors.ts";
import { validateEnvVars } from "../_shared/validators.ts";
import { supabaseRest } from "../_shared/supabase.ts";
import { getMolliePayment, mapMollieStatusToInternal, isMolliePaymentPaid } from "../_shared/mollie.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Mollie sends webhook with payment ID - can be form data or JSON
    let paymentId: string | null = null;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      paymentId = formData.get("id") as string;
    } else if (contentType.includes("application/json")) {
      const json = await req.json();
      paymentId = json.id;
    } else {
      // Fallback: try to parse as text (Mollie sometimes sends just the ID)
      const text = await req.text();
      // Check if it looks like form data
      if (text.includes("id=")) {
        const params = new URLSearchParams(text);
        paymentId = params.get("id");
      } else {
        // Try parsing as JSON
        try {
          const json = JSON.parse(text);
          paymentId = json.id;
        } catch {
          // Assume the text itself is the payment ID
          paymentId = text.trim() || null;
        }
      }
    }

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
    let orderId: string | undefined;
    let shippingAddress: Record<string, unknown> | undefined;

    if (payment.metadata) {
      metadata = payment.metadata as Record<string, unknown>;
      lineItems = (metadata.line_items as unknown[]) || [];
      userId = metadata.user_id as string | undefined;
      orderId =
        typeof metadata.order_id === "string"
          ? metadata.order_id
          : typeof metadata.orderId === "string"
            ? (metadata.orderId as string)
            : undefined;
      shippingAddress = metadata.shipping_address as Record<string, unknown> | undefined;
    }

    console.log("Parsed metadata - order_id:", orderId, "user_id:", userId);

    // Save/update payment transaction in database
    const result = await supabaseRest(
      "payment_transactions?on_conflict=mollie_payment_id",
      "POST",
      {
        user_id: userId,
        order_id: orderId,
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

      // Update order payment_status and status if we have an order_id
      if (orderId) {
        const orderUpdateResult = await supabaseRest(`orders?id=eq.${orderId}`, "PATCH", {
          status: "processing",
          payment_status: "paid",
          payment_method: "mollie",
          updated_at: new Date().toISOString(),
        });

        if (orderUpdateResult.error) {
          console.error(`Failed to update order ${orderId}:`, orderUpdateResult.error);
        } else {
          console.log(`Order ${orderId} updated: status=processing, payment_status=paid`);
        }
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
      if (orderId) {
        const orderUpdateResult = await supabaseRest(`orders?id=eq.${orderId}`, "PATCH", {
          status: "cancelled",
          payment_status: internalStatus,
          updated_at: new Date().toISOString(),
        });

        if (orderUpdateResult.error) {
          console.error(`Failed to update order ${orderId}:`, orderUpdateResult.error);
        } else {
          console.log(`Order ${orderId} updated: status=cancelled, payment_status=${internalStatus}`);
        }
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
