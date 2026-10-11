import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, FunctionError, handleError } from "../_shared/errors.ts";
import { verifyAuth } from "../_shared/validators.ts";
import { supabaseRest } from "../_shared/supabase.ts";
import { getMolliePayment, isMolliePaymentPaid, mapMollieStatusToInternal } from "../_shared/mollie.ts";
import type { MollieVerifyRequestI, MollieVerifyResponseI } from "../../types/index.ts";
import { corsHeadersFor } from "../_shared/cors.ts";
import "../_shared/sentry.ts";

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

    const { paymentId }: MollieVerifyRequestI = await req.json();

    if (!paymentId) {
      throw ErrorCodes.MOLLIE_PAYMENT_ID_REQUIRED();
    }

    console.log("Verifying Mollie payment:", paymentId);

    // Fetch payment from Mollie
    const payment = await getMolliePayment(paymentId);
    const internalStatus = mapMollieStatusToInternal(payment.status);

    // Only the customer who paid may read or sync this payment.
    const metadata = (payment.metadata as Record<string, unknown> | null) || {};
    const userId = typeof metadata.user_id === "string" ? metadata.user_id : undefined;
    if (caller.userId !== "service-role" && (!userId || userId !== caller.userId)) {
      throw new FunctionError(403, "FORBIDDEN", "Payment does not belong to this user");
    }

    // Sync payment transaction status using atomic RPC (same as webhook)
    // This ensures the status is updated even when webhook is delayed/unavailable.
    // Orders are settled by the webhook and finalize-order, never from here.
    const upsertResult = await supabaseRest(
      "rpc/upsert_mollie_payment_transaction",
      "POST",
      {
        p_mollie_payment_id: payment.id,
        p_user_id: userId,
        p_order_id: null,
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

    const response: MollieVerifyResponseI = {
      success: true,
      paymentId: payment.id,
      status: payment.status,
      isPaid: isMolliePaymentPaid(payment.status),
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
