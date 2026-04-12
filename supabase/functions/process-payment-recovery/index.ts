import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, handleError } from "../_shared/errors.ts";
import { validateEnvVars } from "../_shared/validators.ts";
import { supabaseRest } from "../_shared/supabase.ts";

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
    const body = await req.json();
    const {
      recovery_id,
      payment_provider,
      payment_intent_id,
      cart_snapshot,
      shipping_address,
      line_items,
    } = body;

    console.log("=== PROCESS PAYMENT RECOVERY ===");
    console.log("Recovery ID:", recovery_id);
    console.log("Payment Provider:", payment_provider);
    console.log("Payment Intent ID:", payment_intent_id);

    // Validate required fields
    if (!recovery_id || !payment_provider || !payment_intent_id) {
      throw ErrorCodes.INVALID_REQUEST_BODY();
    }

    if (!cart_snapshot || !shipping_address || !line_items) {
      throw ErrorCodes.INVALID_REQUEST_BODY();
    }

    // Increment recovery attempt counter
    await supabaseRest("rpc/increment_recovery_attempt", "POST", {
      p_payment_intent_id: payment_intent_id,
      p_payment_provider: payment_provider,
    });

    // Check if order already exists for this payment
    const idempotencyKey = `${payment_provider}_${payment_intent_id}`;
    const existingOrderResult = await supabaseRest(
      `rpc/get_order_by_idempotency_key`,
      "POST",
      {
        p_idempotency_key: idempotencyKey,
      }
    );

    if (existingOrderResult.data) {
      console.log("✅ Order already exists:", existingOrderResult.data.id);

      // Mark as recovered
      await supabaseRest("rpc/mark_payment_recovered", "POST", {
        p_payment_intent_id: payment_intent_id,
        p_payment_provider: payment_provider,
        p_order_id: existingOrderResult.data.id,
      });

      return new Response(
        JSON.stringify({
          success: true,
          order_id: existingOrderResult.data.id,
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

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create order
    const orderData = {
      user_id: cart_snapshot.user_id,
      order_number: orderNumber,
      subtotal,
      shipping_cost: shippingCost,
      discount_amount: discount,
      total_amount: totalAmount,
      payment_status: "paid",
      status: "pending",
      payment_method: payment_provider,
      shipping_address: shipping_address,
      idempotency_key: idempotencyKey,
    };

    const orderResult = await supabaseRest("orders", "POST", orderData);

    if (orderResult.error || !orderResult.data) {
      console.error("Failed to create order:", orderResult.error);

      // Record error in recovery record
      await supabaseRest("rpc/increment_recovery_attempt", "POST", {
        p_payment_intent_id: payment_intent_id,
        p_payment_provider: payment_provider,
        p_error: `Order creation failed: ${orderResult.error?.message || "Unknown error"}`,
      });

      throw new Error(
        `Failed to create order: ${orderResult.error?.message || "Unknown error"}`
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
