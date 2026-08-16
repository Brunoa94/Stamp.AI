import { ErrorClient } from "@/services/errorClient";
import type { PromoCodeValidationResult } from "@/schemas/promocode";

/**
 * CheckoutPromoCodeService
 * Service layer for promo code operations in checkout
 *
 * Responsibilities:
 * - Validate promo codes via backend API
 * - Apply discount calculations
 * - Follow project error handling patterns using ErrorClient
 */
export class CheckoutPromoCodeService {
  /**
   * Validate and apply a promo code via backend API
   * @param code - The promo code to validate
   * @param subtotal - The cart subtotal in dollars to apply discount to
   * @returns PromoCodeValidationResult with validation status and discount
   * @throws AppError with proper context on failure
   */
  static async validateAndApply(
    code: string,
    subtotal: number
  ): Promise<PromoCodeValidationResult> {
    try {
      // Validate input client-side first for fast feedback
      // `message` is an i18n key under the `checkout.pricing` namespace
      if (!code.trim()) {
        return {
          isValid: false,
          message: "enterPromoCode",
          appliedPromo: null,
        };
      }

      if (subtotal <= 0) {
        return {
          isValid: false,
          message: "cartTotalInvalid",
          appliedPromo: null,
        };
      }

      // Call backend API for validation
      const response = await fetch("/api/validate-promocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          subtotal,
        }),
      });

      const result: PromoCodeValidationResult = await response.json();
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
