import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { consumeHashedRateLimit } from "@/lib/security/hashedRateLimit";
import { getClientIdentifier } from "@/lib/security/rate-limiter/utils";
import { captureError } from "@/lib/observability/errorCapture";
import { evaluatePromocode } from "@/lib/promocodes/evaluatePromocode";
import type { PromoCodeValidationResult } from "@/shared/schemas/promocode";

export const runtime = "nodejs";

/** Per client IP. A shopper tries a handful of codes; guessing needs thousands. */
const PROMO_VALIDATIONS_PER_HOUR = 30;

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

    const supabase = createServiceClient();
    // Shared across instances, so codes cannot be guessed by spreading
    // requests over replicas the in-memory middleware limiter does not see.
    // Without a trusted client IP (no VERCEL, TRUST_PROXY_HEADERS or
    // TRUST_CF_HEADERS) every shopper would share one bucket and promo codes
    // would stop working site-wide, so the limit is skipped and logged.
    const clientIp = getClientIdentifier(request);
    if (clientIp === "unknown") {
      console.warn("[validate-promocode] no trusted client IP; per-IP limit skipped");
    } else {
      const allowed = await consumeHashedRateLimit(
        supabase,
        "promocode-validate:ip",
        clientIp,
        PROMO_VALIDATIONS_PER_HOUR,
        60 * 60,
      );
      if (!allowed) {
        return NextResponse.json(
          { isValid: false, message: "tooManyAttempts", appliedPromo: null },
          { status: 429 },
        );
      }
    }

    const { data, error } = await supabase
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
