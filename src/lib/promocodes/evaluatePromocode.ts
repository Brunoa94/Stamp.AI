import type { Database } from "@/shared/types/database.types";
import type { PromoCodeValidationResult } from "@/shared/schemas/promocode";

/**
 * Pure promo-code business rules shared by the validation API route.
 *
 * `message` values are keys of the `checkout.pricing` catalog; the checkout
 * UI translates them.
 */
export type PromocodeRowT = Database["public"]["Tables"]["promocodes"]["Row"];

interface EvaluatePromocodeOptionsI {
  subtotal: number;
  now: Date;
}

function rejected(message: string): PromoCodeValidationResult {
  return { isValid: false, message, appliedPromo: null };
}

function isExpired(row: PromocodeRowT, now: Date): boolean {
  return row.expires_at !== null &&
    new Date(row.expires_at).getTime() <= now.getTime();
}

function isExhausted(row: PromocodeRowT): boolean {
  return row.max_uses !== null && row.used_count >= row.max_uses;
}

function isPromoType(value: string): value is "percentage" | "numeric" {
  return value === "percentage" || value === "numeric";
}

export function evaluatePromocode(
  row: PromocodeRowT | null,
  { subtotal, now }: EvaluatePromocodeOptionsI,
): PromoCodeValidationResult {
  if (
    typeof subtotal !== "number" || !Number.isFinite(subtotal) || subtotal <= 0
  ) {
    return rejected("cartTotalInvalid");
  }
  if (!row || !row.is_active || !isPromoType(row.type)) {
    return rejected("invalidPromoCode");
  }
  if (isExpired(row, now)) {
    return rejected("promoCodeExpired");
  }
  if (isExhausted(row)) {
    return rejected("promoCodeLimitReached");
  }

  const discountRaw = row.type === "percentage"
    ? subtotal * (row.value / 100)
    : row.value;
  const discountValue = Math.max(0, Math.min(discountRaw, subtotal));

  return {
    isValid: true,
    message: "promoCodeApplied",
    appliedPromo: {
      code: row.code,
      type: row.type,
      value: row.value,
      discountValue,
    },
  };
}
