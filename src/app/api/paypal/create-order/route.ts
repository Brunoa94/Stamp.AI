import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPayPalOrder } from "@/lib/paypal-server";
import { captureError } from "@/lib/observability/errorCapture";
import type { ShippingAddressT } from "@/schemas/checkout";
import type { PrintifyLineItem } from "@/types/printifyOrder";

export const runtime = "nodejs";

interface CreateOrderRequest {
  amount: number;
  lineItems: PrintifyLineItem[];
  shippingAddress: ShippingAddressT;
  returnUrl: string;
  cancelUrl: string;
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

    const body: CreateOrderRequest = await request.json();
    const { amount, lineItems, shippingAddress, returnUrl, cancelUrl } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (!returnUrl || !cancelUrl) {
      return NextResponse.json(
        { error: "Return and cancel URLs are required" },
        { status: 400 }
      );
    }

    // Build custom_id with metadata for webhook processing
    const customId = JSON.stringify({
      user_id: user.id,
      user_email: user.email,
      line_items: lineItems,
    });

    // Create PayPal order
    const paypalOrder = await createPayPalOrder({
      amount,
      currency: "USD",
      description: `Order for ${user.email}`,
      customId,
      shippingAddress: shippingAddress
        ? {
            firstName: shippingAddress.first_name,
            lastName: shippingAddress.last_name,
            address1: shippingAddress.address1,
            address2: shippingAddress.address2,
            city: shippingAddress.city,
            region: shippingAddress.region,
            zip: shippingAddress.zip?.trim() || "",
            country: shippingAddress.country,
          }
        : undefined,
      returnUrl,
      cancelUrl,
    });

    // Find approval URL
    const approvalLink = paypalOrder.links?.find((link) => link.rel === "approve");

    // Store payment transaction in database for tracking
    try {
      await supabase.from("payment_transactions").upsert(
        {
          user_id: user.id,
          payment_provider: "paypal",
          paypal_order_id: paypalOrder.id,
          amount,
          currency: "usd",
          status: "pending",
          metadata: {
            user_id: user.id,
            user_email: user.email,
            line_items: lineItems,
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "paypal_order_id" }
      );
      console.log("Payment transaction record created:", paypalOrder.id);
    } catch (dbError) {
      // Log error but don't fail the request - webhook can still process it
      console.error("Failed to create payment_transactions record:", dbError);
    }

    console.log("PayPal order created:", paypalOrder.id);

    return NextResponse.json({
      success: true,
      orderId: paypalOrder.id,
      approvalUrl: approvalLink?.href,
    });
  } catch (error) {
    captureError(error, {
      service: "PayPalAPI",
      action: "createOrder",
    });

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create PayPal order",
      },
      { status: 500 }
    );
  }
}
