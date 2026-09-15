import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { FunctionError, handleError } from "../_shared/errors.ts";
import { requireUser } from "../_shared/authGuard.ts";
import { isPaymentProvider } from "../_shared/paymentReference.ts";
import { finalizePaidOrder } from "../_shared/finalizePaidOrder.ts";
import { createFinalizeOrderPorts } from "../_shared/finalizePaidOrderDeps.ts";
import { tryGenerateInvoiceForOrder } from "../_shared/invoice.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Finalize Order
 *
 * The only path that turns a completed payment into a paid order. Called by
 * the checkout return pages after the provider confirms the payment. The
 * caller only tells us WHAT was bought (cart snapshot / line items) and WHERE
 * to ship; the payment is verified with the provider, every item is repriced
 * from the catalog and the total must equal the amount actually charged.
 * Idempotent on the provider payment id.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const caller = await requireUser(req.headers.get("authorization"));
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      throw new FunctionError(400, "INVALID_REQUEST_BODY", "Invalid request body");
    }

    const { provider, payment_id, cart_items, line_items, shipping_address, billing_address, promo_code, currency } =
      body;

    if (!isPaymentProvider(provider)) {
      throw new FunctionError(400, "INVALID_PROVIDER", "Unknown payment provider");
    }
    if (typeof payment_id !== "string" || !payment_id.trim()) {
      throw new FunctionError(400, "PAYMENT_ID_REQUIRED", "payment_id is required");
    }

    const owner = caller.isServiceRole
      ? { userId: String(body.owner_user_id ?? ""), userEmail: String(body.owner_email ?? "") }
      : undefined;

    const result = await finalizePaidOrder(
      {
        provider,
        paymentId: payment_id.trim(),
        caller,
        owner,
        source: {
          cartItems: Array.isArray(cart_items) ? cart_items : null,
          lineItems: Array.isArray(line_items) ? line_items : null,
        },
        shippingAddress: shipping_address && typeof shipping_address === "object" ? shipping_address : null,
        billingAddress: billing_address && typeof billing_address === "object" ? billing_address : null,
        promoCode: typeof promo_code === "string" ? promo_code : null,
        currency: typeof currency === "string" ? currency : null,
      },
      createFinalizeOrderPorts(),
    );

    // Best-effort: the webhook also ensures the invoice; both paths are idempotent.
    if (result.created) await tryGenerateInvoiceForOrder(result.orderId);

    return new Response(
      JSON.stringify({
        success: true,
        order_id: result.orderId,
        order_number: result.orderNumber,
        created: result.created,
        total_cents: result.totalCents,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    return handleError(error, corsHeaders);
  }
});
