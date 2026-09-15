import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleError } from "../_shared/errors.ts";
import { validateEnvVars } from "../_shared/validators.ts";
import { supabaseRest } from "../_shared/supabase.ts";
import { verifyPayPalWebhook } from "../_shared/paypal.ts";
import { tryGenerateInvoiceForOrder } from "../_shared/invoice.ts";
import { claimWebhookEvent } from "../_shared/webhookEvents.ts";
import { buildIdempotencyKey } from "../_shared/paymentReference.ts";
import {
  ensureOrderForPaidPayment,
  findOrderByIdempotencyKey,
  loadPaymentTransaction,
} from "../_shared/finalizePaidOrderDeps.ts";

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

    // Verify the webhook signature with PayPal BEFORE trusting any of the
    // payload. Reject forged events outright — never fulfill on an unverified
    // "payment succeeded" notification.
    const isValid = await verifyPayPalWebhook(req.headers, body);
    if (!isValid) {
      console.warn("PayPal webhook signature validation failed — rejecting");
      return new Response(
        JSON.stringify({ error: "INVALID_WEBHOOK_SIGNATURE" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const event = JSON.parse(body);

    console.log("PayPal webhook event:", event.event_type);
    console.log("Resource ID:", event.resource?.id);

    // CRITICAL: Atomic idempotency check + event recording
    // Prevents race condition between check and record
    const eventId = event.id || `${event.event_type}_${event.resource?.id}`;

    // Atomic: Record event and check if it was already processed in one operation
    const claim = await claimWebhookEvent("paypal", eventId, event.event_type, event);
    if (claim.duplicate) {
      console.log(`✅ PayPal webhook ${eventId} already processed, skipping`);
      return new Response(
        JSON.stringify({ received: true, skipped: true, reason: "already_processed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
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
          // Extract metadata from capture if available; keep the structured
          // metadata written at order creation (address, line items) since
          // custom_id only carries a subset.
          const customId = capture.custom_id ? JSON.parse(capture.custom_id) : {};
          const userId = customId.user_id;
          const storedTransaction = await loadPaymentTransaction("paypal", orderId).catch(() => null);

          const upsertResult = await supabaseRest(
            "rpc/upsert_paypal_payment_transaction",
            "POST",
            {
              p_paypal_order_id: orderId,
              p_user_id: userId || null,
              p_order_id: customId.order_id || null,
              p_amount: parseFloat(capture.amount.value),
              p_currency: capture.amount.currency_code.toLowerCase(),
              p_status: "succeeded",
              p_paypal_capture_id: capture.id,
              p_metadata: { ...customId, ...(storedTransaction?.metadata || {}) },
            }
          );

          if (upsertResult.error) {
            console.error("❌ Upsert error:", upsertResult.error);
          } else {
            console.log("✅ Payment transaction upserted atomically:", orderId);

            // Resolve the order: custom_id, the transaction link, the order
            // minted by finalize-order, or mint it now from the stored payment
            // context — never wait for the browser.
            // NOTE: Webhooks should ONLY update payment_status, NEVER order status
            // Order status is managed by the fulfillment service to prevent race conditions
            let finalOrderId: string | null | undefined =
              customId.order_id || upsertResult.data?.order_id || storedTransaction?.order_id;
            if (!finalOrderId) {
              finalOrderId = (await findOrderByIdempotencyKey(buildIdempotencyKey("paypal", orderId)).catch(() => null))?.id;
            }
            if (!finalOrderId) {
              finalOrderId = await ensureOrderForPaidPayment({
                provider: "paypal",
                paymentId: orderId,
                providerMetadata: customId,
                charged: { amount: parseFloat(capture.amount.value), currency: capture.amount.currency_code },
              });
            }

            if (finalOrderId) {
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
                console.log(`✅ Order ${finalOrderId} payment_status updated to: paid`);

                // Issue the invoice now that the order is paid (idempotent, non-blocking)
                await tryGenerateInvoiceForOrder(finalOrderId);
              }
            } else {
              console.warn(`⚠️ PayPal payment ${orderId} captured but no order could be created; left in payment_recovery`);
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
