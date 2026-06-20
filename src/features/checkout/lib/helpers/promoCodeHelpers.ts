import type { PromoCodeValidationResult } from "@/types/promocode";

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

/**
 * Check if a promo code validation result is valid
 * @param validationResult - The result from promo code validation
 * @returns true if the promo code is valid and has been applied
 */
export function isPromoCodeValid(
  validationResult: PromoCodeValidationResult | null
): boolean {
  return Boolean(validationResult?.isValid && validationResult.appliedPromo);
}
