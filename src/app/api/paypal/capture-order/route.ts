import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { capturePayPalOrder, PayPalCaptureError } from "@/lib/paypal-server";
import { PayPalCaptureMapper } from "./paypalCaptureMapper";

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

    // Extract capture details using mapper
    const { customId } = PayPalCaptureMapper.extractCaptureDetails(captureResult);
    const { metadata, userId } = PayPalCaptureMapper.parseCustomId(customId);

    // Ownership: the order being captured must belong to the authenticated
    // caller. Prevents a user from capturing/settling another user's order.
    if (userId && userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // CRITICAL: Use atomic stored procedure to update payment + order together
    // This prevents scenario where payment succeeds but order stays pending
    try {
      const atomicParams = PayPalCaptureMapper.mapToAtomicCaptureParams(captureResult, orderId);
      const { data: atomicResult, error: atomicError } = await supabase.rpc(
        "atomic_paypal_payment_capture",
        atomicParams
      );

      if (atomicError) {
        console.error("Atomic payment capture failed:", atomicError);
        throw new Error(`Failed to update payment and order: ${atomicError.message}`);
      }

      console.log("✅ Atomic payment capture successful:", atomicResult);

      // Update additional payer info (non-critical, separate transaction OK)
      const payerUpdate = PayPalCaptureMapper.mapPayerInfoToUpdate(captureResult, payerId);
      await supabase
        .from("payment_transactions")
        .update(payerUpdate)
        .eq("paypal_order_id", orderId);

    } catch (dbError) {
      console.error("Database update error:", dbError);
      // CRITICAL: If atomic operation fails, return error to user
      // Don't silently succeed when payment wasn't recorded
      throw dbError;
    }

    console.log("PayPal order captured successfully:", orderId);

    const successResponse = PayPalCaptureMapper.mapToSuccessResponse(captureResult);
    return NextResponse.json(successResponse);
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
      { error: "Failed to capture PayPal order" },
      { status: 500 }
    );
  }
}
