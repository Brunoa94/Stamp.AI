import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, handleError } from "../_shared/errors.ts";
import { validateEnvVars, verifyAuth } from "../_shared/validators.ts";
import { supabaseRest } from "../_shared/supabase.ts";
import { getMolliePayment, isMolliePaymentPaid, mapMollieStatusToInternal } from "../_shared/mollie.ts";
import type { MollieVerifyRequestI, MollieVerifyResponseI } from "../../types/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

    const { paymentId }: MollieVerifyRequestI = await req.json();

    if (!paymentId) {
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

    // Fallback sync: upsert payment transaction from verification endpoint
    // This ensures order/payment statuses are updated even when webhook is delayed/unavailable.
    const txResult = await supabaseRest(
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
        metadata,
        updated_at: new Date().toISOString(),
      },
      { prefer: "resolution=merge-duplicates" }
    );

    if (txResult.error) {
      console.error("Failed to sync payment_transactions from verify endpoint:", txResult.error);
    }

    if (orderId) {
      if (payment.status === "paid") {
        const orderResult = await supabaseRest(`orders?id=eq.${orderId}`, "PATCH", {
          status: "processing",
          payment_status: "paid",
          payment_method: "mollie",
          updated_at: new Date().toISOString(),
        });

        if (orderResult.error) {
          console.error(`Failed to update order ${orderId} from verify endpoint:`, orderResult.error);
        }
      } else if (
        payment.status === "failed" ||
        payment.status === "canceled" ||
        payment.status === "expired"
      ) {
        const orderResult = await supabaseRest(`orders?id=eq.${orderId}`, "PATCH", {
          status: "cancelled",
          payment_status: internalStatus,
          updated_at: new Date().toISOString(),
        });

        if (orderResult.error) {
          console.error(`Failed to update order ${orderId} from verify endpoint:`, orderResult.error);
        }
      }
    }

    const response: MollieVerifyResponseI = {
      success: true,
      paymentId: payment.id,
      status: payment.status,
      isPaid: isMolliePaymentPaid(payment.status),
      metadata: payment.metadata || undefined,
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
