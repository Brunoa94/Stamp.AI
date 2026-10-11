import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { FunctionError, handleError } from "../_shared/errors.ts";
import { requireUser } from "../_shared/authGuard.ts";
import { corsHeadersFor } from "../_shared/cors.ts";
import { finalizePaidOrder } from "../_shared/finalizePaidOrder.ts";
import { isPaymentProvider } from "../_shared/orderFinalizationRules.ts";
import "../_shared/sentry.ts";

/**
 * Creates (or returns) the paid order for a completed checkout payment.
 *
 * The checkout return pages call this instead of inserting orders with the
 * browser client. The caller only names the payment and the cart rows it is
 * buying; totals come from the server pricing stored with the payment and
 * the charge is verified with the provider.
 */
serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const caller = await requireUser(req.headers.get("authorization"));
    if (caller.isServiceRole) {
      throw new FunctionError(403, "FORBIDDEN", "Orders are finalized for their customer");
    }

    const body = await req.json().catch(() => null);
    const { provider, payment_id, cart_items, shipping_address, billing_address } = body ?? {};
    if (!isPaymentProvider(provider) || typeof payment_id !== "string" || !payment_id) {
      throw new FunctionError(400, "INVALID_REQUEST_BODY", "provider and payment_id are required");
    }

    const order = await finalizePaidOrder({
      provider,
      paymentId: payment_id,
      callerUserId: caller.userId,
      cartItems: cart_items,
      shippingAddress: shipping_address,
      billingAddress: billing_address,
    });

    return new Response(
      JSON.stringify({ success: true, order_id: order.orderId, order_number: order.orderNumber, created: order.created }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    if (!(error instanceof FunctionError)) console.error("finalize-order failed:", error);
    return handleError(error, corsHeaders);
  }
});
