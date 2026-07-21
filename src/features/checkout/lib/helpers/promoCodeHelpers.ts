import type { PromoCodeValidationResult } from "@/schemas/promocode";

/**
 * Calculate discount value from promo code validation result
 * @param validationResult - The result from promo code validation
 * @returns The discount value in dollars
 */
export function getDiscountValue(
  validationResult: PromoCodeValidationResult | null
): number {
  if (!validationResult?.isValid || !validationResult.appliedPromo) {
    return 0;
  }
  return validationResult.appliedPromo.discountValue;
}

