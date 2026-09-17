import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { captureError } from "@/lib/observability/errorCapture";
import { evaluatePromocode } from "@/lib/promocodes/evaluatePromocode";
import type { PromoCodeValidationResult } from "@/shared/schemas/promocode";

export const runtime = "nodejs";

interface ValidatePromoCodeRequest {
  code?: unknown;
  subtotal?: unknown;
}

function rejected(message: string): NextResponse<PromoCodeValidationResult> {
  return NextResponse.json({ isValid: false, message, appliedPromo: null });
}

/**
 * Validates a promo code for the checkout summary.
 *
 * The promocodes table is readable by the service role only, so this route
 * reads it with the service client and applies the business rules from
 * evaluatePromocode (active, not expired, under its usage limit). Messages
 * are `checkout.pricing` catalog keys.
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<PromoCodeValidationResult>> {
  try {
    const body = (await request.json()) as ValidatePromoCodeRequest;

    const normalizedCode = typeof body.code === "string"
      ? body.code.trim().toUpperCase()
      : "";
    if (!normalizedCode) {
      return rejected("enterPromoCode");
    }

    const subtotal = body.subtotal;
    if (
      typeof subtotal !== "number" || !Number.isFinite(subtotal) ||
      subtotal <= 0
    ) {
      return rejected("cartTotalInvalid");
    }

    const { data, error } = await createServiceClient()
      .from("promocodes")
      .select("*")
      .eq("code", normalizedCode)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      evaluatePromocode(data, { subtotal, now: new Date() }),
    );
  } catch (error) {
    captureError(error, {
      service: "PromoCodeAPI",
      action: "validatePromoCode",
    });

    return NextResponse.json(
      { isValid: false, message: "validationFailed", appliedPromo: null },
      { status: 500 },
    );
  }
}
