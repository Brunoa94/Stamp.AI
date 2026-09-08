import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, handleError } from "../_shared/errors.ts";
import { verifyAuth } from "../_shared/validators.ts";
import { supabaseRest } from "../_shared/supabase.ts";
import { createInvoiceSignedUrl, ensureInvoiceForOrder } from "../_shared/invoice.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface GenerateInvoiceRequestI {
  order_id: string;
}

interface OrderOwnershipI {
  id: string;
  user_id: string | null;
  payment_status: string | null;
}

/**
 * Generate (or fetch) the invoice for a paid order.
 *
 * Idempotent: issuing, PDF rendering and emailing each happen at most once.
 * Returns the invoice record plus a short-lived signed download URL.
 * Callable by the order's owner (user JWT) or server-side (service role) —
 * webhooks use the shared helper directly instead of this endpoint.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    const { userId } = await verifyAuth(authHeader);

    const { order_id }: GenerateInvoiceRequestI = await req.json();

    if (!order_id) {
      throw ErrorCodes.ORDER_ID_REQUIRED();
    }

    console.log("=== GENERATE INVOICE ===");
    console.log("Order ID:", order_id);
    console.log("User ID:", userId);

    // Fetch order for ownership + payment checks
    const orderResult = await supabaseRest<OrderOwnershipI[]>(
      `orders?id=eq.${order_id}&select=id,user_id,payment_status`,
      "GET"
    );

    if (!orderResult.data || orderResult.data.length === 0) {
      throw ErrorCodes.RESOURCE_NOT_FOUND(`Order ${order_id} not found`);
    }

    const order = orderResult.data[0];

    if (userId !== "service-role" && order.user_id !== userId) {
      throw ErrorCodes.UNAUTHORIZED("You do not have permission to access this order's invoice");
    }

    if (order.payment_status !== "paid") {
      throw ErrorCodes.INVOICE_ORDER_NOT_PAID();
    }

    const invoice = await ensureInvoiceForOrder(order_id);

    const downloadUrl = invoice.pdf_path
      ? await createInvoiceSignedUrl(invoice.pdf_path)
      : null;

    return new Response(
      JSON.stringify({
        success: true,
        invoice,
        download_url: downloadUrl,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Generate invoice error:", err);
    return handleError(err, corsHeaders);
  }
});
