import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, FunctionError, handleError } from "../_shared/errors.ts";
import { supabaseRest } from "../_shared/supabase.ts";
import { requireUser } from "../_shared/authGuard.ts";
import { verifyPaidPayment } from "../_shared/verifyPaidPayment.ts";
import { requirePaymentCurrency } from "../_shared/paymentProof.ts";
import { validatePaymentAmount } from "../_shared/amountValidator.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Process Payment Recovery Edge Function
 *
 * Completes order creation for payments that succeeded but weren't finalized
 * due to browser crashes, network failures, etc.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Require an authenticated caller (or service-role for automated recovery).
    const auth = await requireUser(req.headers.get("authorization"));

    const body = await req.json();
    const {
      recovery_id,
      payment_provider,
      payment_intent_id,
    } = body;

    console.log("=== PROCESS PAYMENT RECOVERY ===");

    // Validate required fields
    if (!recovery_id || !payment_provider || !payment_intent_id) {
      throw ErrorCodes.INVALID_REQUEST_BODY();
    }

    const recoveryResult = await supabaseRest<Array<{
      user_id: string;
      currency: string;
      cart_snapshot: { cart_items?: Array<Record<string, any>>; items?: Array<Record<string, any>>; shipping_cost?: number; discount?: number };
      shipping_address: Record<string, unknown>;
      line_items: Array<Record<string, unknown>>;
    }>>(
      `payment_recovery?id=eq.${encodeURIComponent(recovery_id)}&payment_provider=eq.${encodeURIComponent(payment_provider)}&payment_intent_id=eq.${encodeURIComponent(payment_intent_id)}&select=user_id,currency,cart_snapshot,shipping_address,line_items`, "GET",
    );
    if (recoveryResult.error) throw new Error("Could not load recovery record");
    const recovery = recoveryResult.data?.[0];
    if (!recovery || (!auth.isServiceRole && recovery.user_id !== auth.userId)) {
      throw new FunctionError(403, "FORBIDDEN", "Recovery record not found for this user");
    }
    const { cart_snapshot, shipping_address, line_items } = recovery;
    if (!cart_snapshot || !shipping_address || !line_items?.length) throw ErrorCodes.INVALID_REQUEST_BODY();
    const effectiveUserId = recovery.user_id;
    const payment = await verifyPaidPayment(payment_provider, payment_intent_id, effectiveUserId);
    requirePaymentCurrency(payment, recovery.currency);

    // Increment recovery attempt counter
    await supabaseRest("rpc/increment_recovery_attempt", "POST", {
      p_payment_intent_id: payment_intent_id,
      p_payment_provider: payment_provider,
    });

    // Check if order already exists for this payment
    const idempotencyKey = `${payment_provider}_${payment_intent_id}`;
    const existingOrderResult = await supabaseRest<Array<{ id: string; user_id: string }>>(
      `orders?idempotency_key=eq.${encodeURIComponent(idempotencyKey)}&select=id,user_id`, "GET",
    );
    const existingOrder = existingOrderResult.data?.[0];

    if (existingOrderResult.error) throw new Error("Could not check existing order");
    if (existingOrder) {
      if (existingOrder.user_id !== effectiveUserId) {
        throw new FunctionError(403, "FORBIDDEN", "Order belongs to another user");
      }
      console.log("✅ Order already exists:", existingOrder.id);

      // Mark as recovered
      await supabaseRest("rpc/mark_payment_recovered", "POST", {
        p_payment_intent_id: payment_intent_id,
        p_payment_provider: payment_provider,
        p_order_id: existingOrder.id,
      });

      return new Response(
        JSON.stringify({
          success: true,
          order_id: existingOrder.id,
          message: "Order already exists",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create order from cart snapshot
    console.log("📝 Creating order from recovered payment...");

    // Calculate totals from cart snapshot
    const cartItems = cart_snapshot.cart_items || cart_snapshot.items || [];
    const subtotal = cartItems.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const shippingCost = cart_snapshot.shipping_cost || 0;
    const discount = cart_snapshot.discount || 0;
    const totalAmount = subtotal + shippingCost - discount;

    // The order total must match what the provider actually charged — reject
    // recovery of a snapshot whose price differs from the real payment.
    const amountCheck = validatePaymentAmount({
      paymentAmount: payment.amount,
      paymentCurrency: payment.currency,
      expectedTotal: totalAmount,
    });
    if (!amountCheck.isValid) {
      throw new FunctionError(
        400,
        "AMOUNT_MISMATCH",
        "Recovered cart total does not match the amount paid",
      );
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create order
    const orderData = {
      user_id: effectiveUserId,
      order_number: orderNumber,
      subtotal,
      shipping_cost: shippingCost,
      discount_amount: discount,
      total_amount: totalAmount,
      payment_status: "paid",
      status: "pending",
      payment_method: payment_provider,
      currency: payment.currency,
      shipping_address: shipping_address,
      idempotency_key: idempotencyKey,
    };

    const orderResult = await supabaseRest<Array<{ id: string }> | { id: string }>("orders", "POST", orderData, { prefer: "return=representation" });

    if (orderResult.error || !orderResult.data) {
      console.error("Failed to create order:", orderResult.error);

      // Record error in recovery record
      await supabaseRest("rpc/increment_recovery_attempt", "POST", {
        p_payment_intent_id: payment_intent_id,
        p_payment_provider: payment_provider,
        p_error: "Order creation failed",
      });

      throw new Error(
        "Failed to create order"
      );
    }

    const orderId = Array.isArray(orderResult.data)
      ? orderResult.data[0].id
      : orderResult.data.id;

    console.log("✅ Order created:", orderId);

    // Create order items
    const orderItems = cartItems.map((item: any) => ({
      order_id: orderId,
      product_id: item.product_id || item.id,
      product_name: item.product_name || item.name || "Product",
      variant_id: item.variant_id,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
      printify_product_id: item.printify_product_id,
      printify_blueprint_id: item.printify_blueprint_id,
    }));

    await supabaseRest("order_items", "POST", orderItems);
    console.log("✅ Order items created");

    // Create Printify order
    console.log("🚀 Creating Printify order...");

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
          line_items,
          shipping_address,
          metadata: {
            order_id: orderId,
            payment_intent_id,
            payment_provider,
            recovered: true,
          },
        }),
      }
    );

    if (!printifyResponse.ok) {
      const errorText = await printifyResponse.text();
      console.error("Printify order creation failed:", errorText);

      // Order exists but Printify failed - create reconciliation alert
      await supabaseRest("order_status_reconciliation", "POST", {
        order_id: orderId,
        expected_status: "confirmed",
        actual_status: "pending",
        error_message: `Printify failed during recovery: ${errorText}`,
        reconciliation_status: "pending",
      });

      // Still mark as recovered (order exists)
      await supabaseRest("rpc/mark_payment_recovered", "POST", {
        p_payment_intent_id: payment_intent_id,
        p_payment_provider: payment_provider,
        p_order_id: orderId,
      });

      return new Response(
        JSON.stringify({
          success: true,
          order_id: orderId,
          warning: "Order created but Printify failed - manual intervention needed",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ Printify order created");

    // Update order status to confirmed
    await supabaseRest(`orders?id=eq.${orderId}`, "PATCH", {
      status: "confirmed",
      updated_at: new Date().toISOString(),
    });

    // Mark payment as recovered
    await supabaseRest("rpc/mark_payment_recovered", "POST", {
      p_payment_intent_id: payment_intent_id,
      p_payment_provider: payment_provider,
      p_order_id: orderId,
    });

    console.log("✅ Payment recovery completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        order_id: orderId,
        message: "Payment recovered and order created successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Payment recovery error:", error);
    return handleError(error, corsHeaders);
  }
});
