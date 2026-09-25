import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, handleError } from "../_shared/errors.ts";
import { validateEnvVars, verifyAuth } from "../_shared/validators.ts";
import { supabaseRest } from "../_shared/supabase.ts";
import { getMolliePayment, isMolliePaymentPaid, mapMollieStatusToInternal } from "../_shared/mollie.ts";
import { tryGenerateInvoiceForOrder } from "../_shared/invoice.ts";
import type { MollieVerifyRequestI, MollieVerifyResponseI } from "../../types/index.ts";
import { corsHeadersFor } from "../_shared/cors.ts";
import { isValidMolliePaymentId } from "../_shared/molliePaymentId.ts";

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

    const { paymentId }: MollieVerifyRequestI = await req.json();

    // The id is interpolated into the Mollie API path; reject malformed ids.
    if (!isValidMolliePaymentId(paymentId)) {
      throw ErrorCodes.MOLLIE_PAYMENT_ID_REQUIRED();
    }

    console.log("Verifying Mollie payment:", paymentId);

    // Fetch payment from Mollie
    const payment = await getMolliePayment(paymentId);
    const internalStatus = mapMollieStatusToInternal(payment.status);

    // Parse metadata for DB synchronization
    const metadata = (payment.metadata as Record<string, unknown> | null) || {};
    const userId = typeof metadata.user_id === "string" ? metadata.user_id : undefined;
    const orderId =
      typeof metadata.order_id === "string"
        ? metadata.order_id
        : typeof metadata.orderId === "string"
          ? (metadata.orderId as string)
          : undefined;

    // Ownership check: the payment must have been created for the caller.
    // Respond exactly as if the payment did not exist so a caller cannot probe
    // whether an arbitrary payment id is real.
    const isServiceCall = callerId === "service-role";
    if (!isServiceCall && (!userId || userId !== callerId)) {
      console.warn("Mollie payment does not belong to the authenticated user:", paymentId);
      throw ErrorCodes.MOLLIE_PAYMENT_NOT_FOUND();
    }

    // Every orders write below is scoped to the payment owner so a payment
    // can never flip another user's order.
    const ownerFilter = userId ? `&user_id=eq.${userId}` : "";

    // Sync payment transaction status using atomic RPC (same as webhook)
    // This ensures the status is updated even when webhook is delayed/unavailable.
    // Use the RPC function for reliable upsert behavior.
    const upsertResult = await supabaseRest(
      "rpc/upsert_mollie_payment_transaction",
      "POST",
      {
        p_mollie_payment_id: payment.id,
        p_user_id: userId || null,
        p_order_id: orderId || null,
        p_amount: parseFloat(payment.amount.value),
        p_currency: payment.amount.currency.toLowerCase(),
        p_status: internalStatus,
        p_metadata: metadata,
      }
    );

    if (upsertResult.error) {
      console.error("Failed to upsert payment_transactions from verify endpoint:", upsertResult.error);

      // Fallback: try direct PATCH to update existing transaction
      const patchResult = await supabaseRest(
        `payment_transactions?mollie_payment_id=eq.${payment.id}`,
        "PATCH",
        {
          mollie_status: payment.status,
          status: internalStatus,
          updated_at: new Date().toISOString(),
        }
      );

      if (patchResult.error) {
        console.error("Fallback PATCH also failed:", patchResult.error);
      } else {
        console.log("✅ Payment transaction updated via fallback PATCH");
      }
    } else {
      console.log("✅ Payment transaction upserted:", payment.id, "status:", internalStatus);
    }

    if (orderId && userId) {
      if (payment.status === "paid") {
        const orderResult = await supabaseRest(`orders?id=eq.${orderId}${ownerFilter}`, "PATCH", {
          status: "processing",
          payment_status: "paid",
          payment_method: "mollie",
          updated_at: new Date().toISOString(),
        });

        if (orderResult.error) {
          console.error(`Failed to update order ${orderId} from verify endpoint:`, orderResult.error);
        } else {
          // Issue the invoice now that the order is paid (idempotent, non-blocking)
          await tryGenerateInvoiceForOrder(orderId);
        }
      } else if (
        payment.status === "failed" ||
        payment.status === "canceled" ||
        payment.status === "expired"
      ) {
        const orderResult = await supabaseRest(`orders?id=eq.${orderId}${ownerFilter}`, "PATCH", {
          status: "cancelled",
          payment_status: internalStatus,
          updated_at: new Date().toISOString(),
        });

        if (orderResult.error) {
          console.error(`Failed to update order ${orderId} from verify endpoint:`, orderResult.error);
        }
      }
    }

    // Return only what the client needs; never echo the raw metadata blob
    // (it carries line items, shipping address, and other PII).
    const response: MollieVerifyResponseI & { orderId?: string; amount: string; currency: string } = {
      success: true,
      paymentId: payment.id,
      status: payment.status,
      isPaid: isMolliePaymentPaid(payment.status),
      orderId,
      amount: payment.amount.value,
      currency: payment.amount.currency,
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
