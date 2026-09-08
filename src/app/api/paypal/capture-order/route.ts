import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { capturePayPalOrder, getPayPalOrder, PayPalCaptureError } from "@/lib/paypal-server";
import { PayPalCaptureMapper } from "./paypalCaptureMapper";
import { captureError } from "@/lib/observability/errorCapture";

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
      // `error` is shown to the user in the payment alert — keep it friendly
      return NextResponse.json(
        { error: "Your session has expired. Please log in and try again." },
        { status: 401 }
      );
    }

    const body: CaptureOrderRequest = await request.json();
    const { orderId, payerId } = body;

    if (typeof orderId !== "string" || !/^[A-Z0-9]+$/i.test(orderId)) {
      return NextResponse.json(
        { error: "We couldn't find your payment details. Please try again from the checkout page." },
        { status: 400 }
      );
    }

    // Verify provider-held ownership before performing any financial operation.
    const order = await getPayPalOrder(orderId);
    const units = order.purchase_units;
    if (!units?.length || units.some((unit) =>
      PayPalCaptureMapper.parseCustomId(unit.custom_id).userId !== user.id
    )) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const captureResult = await capturePayPalOrder(orderId);

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
    captureError(error, {
      service: "PayPalAPI",
      action: "captureOrder",
    });

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

    // Never surface raw internal errors (database, network) to the user —
    // the details are already captured above for debugging.
    return NextResponse.json(
      {
        error:
          "We couldn't complete your PayPal payment. If you were charged, please contact support.",
      },
      { status: 500 }
    );
  }
}
