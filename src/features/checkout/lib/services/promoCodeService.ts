import { PromoCodeService } from "@/services/promocodeService";
import { ErrorClient } from "@/services/errorClient";
import type { PromoCodeValidationResult } from "@/types/promocode";

/**
 * CheckoutPromoCodeService
 * Service layer for promo code operations in checkout
 *
 * Responsibilities:
 * - Validate promo codes with proper error handling
 * - Apply discount calculations
 * - Follow project error handling patterns using ErrorClient
 */
export class CheckoutPromoCodeService {
  /**
   * Validate and apply a promo code
   * @param code - The promo code to validate
   * @param subtotal - The cart subtotal to apply discount to
   * @returns PromoCodeValidationResult with validation status and discount
   * @throws AppError with proper context on failure
   */
  static async validateAndApply(
    code: string,
    subtotal: number
  ): Promise<PromoCodeValidationResult> {
    try {
      // Validate input
      if (!code.trim()) {
        return {
          isValid: false,
          message: "Please enter a promo code",
          appliedPromo: null,
        };
      }

      if (subtotal <= 0) {
        return {
          isValid: false,
          message: "Cart total must be greater than 0",
          appliedPromo: null,
        };
      }

      // Call promo code service
      const result = await PromoCodeService.validatePromoCode({
        code: code.trim(),
        subtotal,
      });

      return result;
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "CheckoutPromoCodeService",
        action: "validateAndApply",
      });
    }
  }
}
