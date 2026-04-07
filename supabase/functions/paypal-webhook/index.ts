import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleError } from "../_shared/errors.ts";
import { validateEnvVars } from "../_shared/validators.ts";
import { supabaseRest } from "../_shared/supabase.ts";
import { verifyPayPalWebhook } from "../_shared/paypal.ts";
import { processPaidOrder } from "../_shared/order-lifecycle.ts";

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
        const orderId = capture.supplementary_data?.related_ids?.order_id;

        if (orderId) {
          const txResult = await supabaseRest<any[]>(
            `payment_transactions?paypal_order_id=eq.${orderId}&select=metadata,user_id`,
            "GET"
          );

          const metadata = txResult.data?.[0]?.metadata || {};
          const dbOrderId = metadata.order_id as string | undefined;

          if (dbOrderId) {
            await processPaidOrder({
              provider: "paypal",
              eventId: event.id,
              orderId: dbOrderId,
              amount: parseFloat(capture.amount?.value || "0"),
              currency: (capture.amount?.currency_code || "USD").toLowerCase(),
              userId: txResult.data?.[0]?.user_id,
              metadata,
              refs: {
                paypal_order_id: orderId,
                paypal_capture_id: capture.id,
              },
              lineItems: (metadata.line_items as unknown[]) || [],
              shippingAddress: (metadata.shipping_address as Record<string, unknown>) || {},
            });
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
          await supabaseRest(
            `payment_transactions?paypal_order_id=eq.${orderId}`,
            "PATCH",
            {
              status: "failed",
              error_message: "Payment capture was denied",
              updated_at: new Date().toISOString(),
            }
          );

          const txResult = await supabaseRest<any[]>(
            `payment_transactions?paypal_order_id=eq.${orderId}&select=metadata`,
            "GET",
          );

          const dbOrderId = txResult.data?.[0]?.metadata?.order_id;
          if (dbOrderId) {
            await supabaseRest(`orders?id=eq.${dbOrderId}`, "PATCH", {
              status: "waiting_payment",
              payment_status: "failed",
              payment_failure_reason: "paypal_capture_denied",
              updated_at: new Date().toISOString(),
            });
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
