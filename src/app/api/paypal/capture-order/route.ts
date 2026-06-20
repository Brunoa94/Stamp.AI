import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { capturePayPalOrder, PayPalCaptureError } from "@/lib/paypal-server";

export const runtime = "nodejs";

interface CaptureOrderRequest {
  orderId: string;
  payerId?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CaptureOrderRequest = await request.json();
    const { orderId, payerId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    console.log("Capturing PayPal order:", orderId);

    // Capture the PayPal order
    const captureResult = await capturePayPalOrder(orderId);

    // Extract capture and payer info
    const capture = captureResult.purchase_units?.[0]?.payments?.captures?.[0];
    const payer = captureResult.payer;

    // Parse custom_id to get metadata
    let metadata: Record<string, unknown> = {};
    let userId: string | undefined;

    try {
      const customData = JSON.parse(captureResult.purchase_units?.[0]?.custom_id || "{}");
      metadata = customData;
      userId = customData.user_id;
    } catch (e) {
      console.warn("Could not parse custom_id:", e);
    }

    // Update payment transaction in database
    try {
      await supabase
        .from("payment_transactions")
        .update({
          paypal_capture_id: capture?.id,
          paypal_payer_id: payer?.payer_id || payerId,
          paypal_payer_email: payer?.email_address,
          status: "succeeded",
          payment_method_type: "paypal",
          updated_at: new Date().toISOString(),
        })
        .eq("paypal_order_id", orderId);

      console.log("Payment transaction updated:", orderId);
    } catch (dbError) {
      console.error("Database update error:", dbError);
    }

    // Update order payment_status if order_id exists in metadata
    const dbOrderId = metadata.order_id as string | undefined;
    if (dbOrderId) {
      try {
        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            payment_method: "paypal",
            updated_at: new Date().toISOString(),
          })
          .eq("id", dbOrderId);

        console.log(`Order ${dbOrderId} payment_status updated to: paid`);
      } catch (orderError) {
        console.error("Failed to update order payment_status:", orderError);
      }
    }

    console.log("PayPal order captured successfully:", orderId);

    return NextResponse.json({
      success: true,
      captureId: capture?.id || orderId,
      status: captureResult.status,
      payerEmail: payer?.email_address,
    });
  } catch (error) {
    console.error("Error capturing PayPal order:", error);

    // Handle PayPalCaptureError with user-friendly message
    if (error instanceof PayPalCaptureError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          debugId: error.debugId,
          isRetryable: error.isRetryable,
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to capture PayPal order",
      },
      { status: 500 }
    );
  }
}
