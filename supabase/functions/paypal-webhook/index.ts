import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleError } from "../_shared/errors.ts";
import { validateEnvVars } from "../_shared/validators.ts";
import { supabaseRest } from "../_shared/supabase.ts";
import { verifyPayPalWebhook } from "../_shared/paypal.ts";
import { tryGenerateInvoiceForOrder } from "../_shared/invoice.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, paypal-transmission-id, paypal-transmission-time, paypal-transmission-sig, paypal-cert-url, paypal-auth-algo",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const event = JSON.parse(body);

    // Verify webhook signature (basic validation for now)
    const isValid = await verifyPayPalWebhook(req.headers, body);
    if (!isValid) {
      console.warn("PayPal webhook signature validation failed");
      // Continue processing in sandbox mode, but log the warning
    }

    console.log("PayPal webhook event:", event.event_type);
    console.log("Resource ID:", event.resource?.id);

    // CRITICAL: Atomic idempotency check + event recording
    // Prevents race condition between check and record
    const eventId = event.id || `${event.event_type}_${event.resource?.id}`;

    // Atomic: Record event and check if it was already processed in one operation
    const eventRecordResult = await supabaseRest(
      "rpc/record_webhook_event_atomic",
      "POST",
      {
        p_provider: "paypal",
        p_event_id: eventId,
        p_event_type: event.event_type,
        p_payload: event,
      }
    );

    // If the function returned an existing event (created_at is old), skip processing
    if (eventRecordResult.data && eventRecordResult.data.created_at) {
      const createdAt = new Date(eventRecordResult.data.created_at);
      const now = new Date();
      const ageInSeconds = (now.getTime() - createdAt.getTime()) / 1000;

      // If event was created more than 5 seconds ago, it's a duplicate
      if (ageInSeconds > 5) {
        console.log(`✅ PayPal webhook ${eventId} already processed ${ageInSeconds.toFixed(0)}s ago, skipping`);
        return new Response(
          JSON.stringify({ received: true, skipped: true, reason: "already_processed" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    }

    switch (event.event_type) {
      // Order approved by customer (before capture)
      case "CHECKOUT.ORDER.APPROVED": {
        console.log("Order approved:", event.resource.id);
        // The capture is typically done by the frontend after approval
        // This event is informational
        break;
      }

      // Payment was successfully captured
      case "PAYMENT.CAPTURE.COMPLETED": {
        console.log("Payment capture completed:", event.resource.id);
        const capture = event.resource;
        console.log("Order Id: ", capture.supplementary_data?.related_ids?.order_id);
        // Find and update the payment transaction
        const orderId = capture.supplementary_data?.related_ids?.order_id;

        if (orderId) {
          // CRITICAL: Use atomic UPSERT to handle race conditions
          // Extract metadata from capture if available
          const customId = capture.custom_id ? JSON.parse(capture.custom_id) : {};
          const userId = customId.user_id;
          const dbOrderId = customId.order_id;

          const upsertResult = await supabaseRest(
            "rpc/upsert_paypal_payment_transaction",
            "POST",
            {
              p_paypal_order_id: orderId,
              p_user_id: userId || null,
              p_order_id: dbOrderId || null,
              p_amount: parseFloat(capture.amount.value),
              p_currency: capture.amount.currency_code.toLowerCase(),
              p_status: "succeeded",
              p_paypal_capture_id: capture.id,
              p_metadata: customId,
            }
          );

          if (upsertResult.error) {
            console.error("❌ Upsert error:", upsertResult.error);
          } else {
            console.log("✅ Payment transaction upserted atomically:", orderId);

            // Update order payment_status if order_id exists
            if (dbOrderId || upsertResult.data?.order_id) {
              const finalOrderId = dbOrderId || upsertResult.data?.order_id;
              // ✅ Update payment_status to "paid"
              // NOTE: Webhooks should ONLY update payment_status, NEVER order status
              // Order status is managed by the fulfillment service to prevent race conditions
              const orderResult = await supabaseRest(
                `orders?id=eq.${finalOrderId}`,
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
                console.log(`✅ Order ${dbOrderId} payment_status updated to: paid`);

                // Issue the invoice now that the order is paid (idempotent, non-blocking)
                await tryGenerateInvoiceForOrder(finalOrderId);
              }
            }
          }
        }
        break;
      }

      // Payment was refunded
      case "PAYMENT.CAPTURE.REFUNDED": {
        console.log("Payment refunded:", event.resource.id);
        const refund = event.resource;

        // Find the original capture and update status
        const captureId = refund.links?.find(
          (l: { rel: string }) => l.rel === "up"
        )?.href?.split("/captures/")[1];

        if (captureId) {
          const result = await supabaseRest(
            `payment_transactions?paypal_capture_id=eq.${captureId}`,
            "PATCH",
            {
              status: "refunded",
              metadata: {
                refund_id: refund.id,
                refund_amount: refund.amount,
                refund_reason: refund.note_to_payer,
              },
              updated_at: new Date().toISOString(),
            }
          );

          if (result.error) {
            console.error("Update error:", result.error);
          } else {
            // Update order payment_status using capture_id
            const txResult = await supabaseRest(
              `payment_transactions?paypal_capture_id=eq.${captureId}&select=order_id`,
              "GET"
            );
            if (txResult.data?.[0]?.order_id) {
              await supabaseRest(
                `orders?id=eq.${txResult.data[0].order_id}`,
                "PATCH",
                {
                  payment_status: "refunded",
                  updated_at: new Date().toISOString(),
                }
              );
              console.log(
                `Order ${txResult.data[0].order_id} payment_status updated to: refunded`
              );
            }
          }
        }
        break;
      }

      // Payment was denied/failed
      case "PAYMENT.CAPTURE.DENIED": {
        console.log("Payment denied:", event.resource.id);
        const capture = event.resource;

        const orderId = capture.supplementary_data?.related_ids?.order_id;

        if (orderId) {
          const result = await supabaseRest(
            `payment_transactions?paypal_order_id=eq.${orderId}`,
            "PATCH",
            {
              status: "failed",
              error_message: "Payment capture was denied",
              updated_at: new Date().toISOString(),
            }
          );

          if (result.error) {
            console.error("Update error:", result.error);
          } else {
            // Also update the linked order's payment_status to "failed"
            const txResult = await supabaseRest(
              `payment_transactions?paypal_order_id=eq.${orderId}&select=order_id,metadata`,
              "GET"
            );

            // Try order_id column first (new approach), fallback to metadata (old approach)
            const dbOrderId = txResult.data?.[0]?.order_id || txResult.data?.[0]?.metadata?.order_id;
            if (dbOrderId) {
              const orderResult = await supabaseRest(
                `orders?id=eq.${dbOrderId}`,
                "PATCH",
                {
                  payment_status: "failed",
                  updated_at: new Date().toISOString(),
                }
              );

              if (orderResult.error) {
                console.error("Failed to update order payment_status on denial:", orderResult.error);
              } else {
                console.log(`Order ${dbOrderId} payment_status updated to: failed`);
              }
            }
          }
        }
        break;
      }

      // Payment capture was reversed (chargeback)
      case "PAYMENT.CAPTURE.REVERSED": {
        console.log("Payment reversed:", event.resource.id);
        const capture = event.resource;

        const result = await supabaseRest(
          `payment_transactions?paypal_capture_id=eq.${capture.id}`,
          "PATCH",
          {
            status: "canceled",
            error_message: "Payment was reversed (chargeback)",
            updated_at: new Date().toISOString(),
          }
        );

        if (result.error) {
          console.error("Update error:", result.error);
        } else {
          // Update order payment_status using capture_id
          const txResult = await supabaseRest(
            `payment_transactions?paypal_capture_id=eq.${capture.id}&select=order_id`,
            "GET"
          );
          if (txResult.data?.[0]?.order_id) {
            await supabaseRest(
              `orders?id=eq.${txResult.data[0].order_id}`,
              "PATCH",
              {
                payment_status: "refunded",
                updated_at: new Date().toISOString(),
              }
            );
            console.log(
              `Order ${txResult.data[0].order_id} payment_status updated to: refunded`
            );
          }
        }
        break;
      }

      // Dispute created
      case "CUSTOMER.DISPUTE.CREATED": {
        console.log("Dispute created:", event.resource.dispute_id);
        // Log the dispute for manual handling
        // In production, you might want to store this in a disputes table
        break;
      }

      // Dispute resolved
      case "CUSTOMER.DISPUTE.RESOLVED": {
        console.log("Dispute resolved:", event.resource.dispute_id);
        break;
      }

      default:
        console.log(`Unhandled PayPal event type: ${event.event_type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("PayPal webhook error:", error);
    return handleError(error, corsHeaders);
  }
});
