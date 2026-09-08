import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { captureError } from "@/lib/observability/errorCapture";
import type { PromoCodeValidationResult, PromoCodeT } from "@/schemas/promocode";

export const runtime = "nodejs";

interface ValidatePromoCodeRequest {
  code: string;
  subtotal: number;
}

export async function POST(request: NextRequest): Promise<NextResponse<PromoCodeValidationResult>> {
  try {
    const body: ValidatePromoCodeRequest = await request.json();
    const { code, subtotal } = body;

    const normalizedCode = (code ?? "").trim().toUpperCase();

    if (!normalizedCode) {
      return NextResponse.json({
        isValid: false,
        message: "Please enter a promo code.",
        appliedPromo: null,
      });
    }

    if (typeof subtotal !== "number" || subtotal <= 0) {
      return NextResponse.json({
        isValid: false,
        message: "Your cart total must be greater than 0.",
        appliedPromo: null,
      });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("promocodes")
      .select("promocode_id, code, type, value, created_at")
      .eq("code", normalizedCode)
      .single();

    if (error) {
      // PGRST116 = "not found" for .single() - this means invalid code, not an error
      if (error.code === "PGRST116") {
        return NextResponse.json({
          isValid: false,
          message: "Invalid promo code.",
          appliedPromo: null,
        });
      }
      throw error;
    }

    if (!data) {
      return NextResponse.json({
        isValid: false,
        message: "Invalid promo code.",
        appliedPromo: null,
      });
    }

    const promo = data as PromoCodeT;

    const discountRaw =
      promo.type === "percentage"
        ? subtotal * (promo.value / 100)
        : promo.value;

    // Clamp discount: prevent negative and prevent exceeding subtotal
    const discountValue = Math.max(0, Math.min(discountRaw, subtotal));

    return NextResponse.json({
      isValid: true,
      message: "Promo code applied.",
      appliedPromo: {
        code: promo.code,
        type: promo.type,
        value: promo.value,
        discountValue,
      },
    });
  } catch (error) {
    captureError(error, {
      service: "PromoCodeAPI",
      action: "validatePromoCode",
    });

    return NextResponse.json(
      {
        isValid: false,
        message: "Failed to validate promo code.",
        appliedPromo: null,
      },
      { status: 500 }
    );
  }
}
