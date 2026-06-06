"use client";

import { useCallback } from "react";
import type { CheckoutFormData } from "../../lib/context/CheckoutFormContext";
import { useCheckoutFormContext } from "../../lib/context/CheckoutFormContext";
import type { CartWithItems } from "@/types/cart";
import { PaymentService } from "../services/paymentService";
import { usePrepareStripePayment } from "../queries/paymentQueries";
import { useErrorHandler } from "@/hooks/useErrorHandler";

interface UsePaymentSubmissionParams {
  cart: CartWithItems | null;
  amount: number;
}

/**
 * usePaymentSubmission
 * Hook for handling payment submission logic
 *
 * Refactored to follow project patterns:
 * - Uses PaymentService for business logic
 * - Uses TanStack Query mutations for payment preparation
 * - Uses useErrorHandler for consistent error handling
 */
export function usePaymentSubmission({ cart, amount }: UsePaymentSubmissionParams) {
  const { cartId } = useCheckoutFormContext();
  const { handleError } = useErrorHandler();

  // Stripe payment mutation
  const prepareStripePayment = usePrepareStripePayment();

  /**
   * Submit payment based on selected payment method
   */
  const submitPayment = useCallback(
    async (formData: CheckoutFormData): Promise<void> => {
      // Validate payment data
      const validation = PaymentService.validatePaymentData(formData, cart);
      if (!validation.isValid) {
        handleError(new Error(validation.error || "Invalid payment data"));
        return;
      }

      try {
        // Only Stripe uses this submission hook
        // PayPal has its own button component that handles submission
        if (formData.paymentMethod === "stripe") {
          await prepareStripePayment.mutateAsync({
            formData,
            cart: cart!,
            cartId,
            amount,
          });

          // Payment intent created successfully
          // The actual payment processing happens in the Stripe component
          return;
        }

        // PayPal payment is handled by CustomPayPalButton component
        if (formData.paymentMethod === "paypal") {
          // This shouldn't be called for PayPal since it has its own button
          console.warn("PayPal payment should use CustomPayPalButton component");
          return;
        }
      } catch (err) {
        // Error is already handled by the mutation's onError callback
        // Re-throw to allow caller to handle if needed
        throw err;
      }
    },
    [cart, cartId, amount, prepareStripePayment, handleError]
  );

  return {
    submitPayment,
    isSubmitting: prepareStripePayment.isPending,
    error: prepareStripePayment.error?.message || null,
    isSuccess: prepareStripePayment.isSuccess,
    reset: prepareStripePayment.reset,
  };
}
