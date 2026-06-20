import { useMutation } from "@tanstack/react-query";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { PaymentService } from "../services/paymentService";
import type { CheckoutFormData } from "../context/CheckoutFormContext";
import type { CartWithItems } from "@/types/cart";

interface PrepareStripePaymentParams {
  formData: CheckoutFormData;
  cart: CartWithItems;
  cartId: string | null;
  amount: number;
}

interface PreparePayPalPaymentParams {
  formData: CheckoutFormData;
  cart: CartWithItems;
  cartId: string | null;
  amount: number;
}

/**
 * Mutation hook for preparing Stripe payment
 * Creates a payment intent and stores checkout data
 */
export function usePrepareStripePayment() {
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationKey: ["payment", "prepare-stripe"],
    mutationFn: ({ formData, cart, cartId, amount }: PrepareStripePaymentParams) =>
      PaymentService.prepareStripePayment(formData, cart, cartId, amount),
    retry: false, // Don't retry payment operations
    onError: (error: Error) => {
      handleError(error);
    },
  });
}

/**
 * Mutation hook for preparing PayPal payment
 * Creates PayPal order and stores checkout data for processing
 */
export function usePreparePayPalPayment() {
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationKey: ["payment", "prepare-paypal"],
    mutationFn: ({ formData, cart, cartId, amount }: PreparePayPalPaymentParams) =>
      PaymentService.preparePayPalPayment(formData, cart, cartId, amount),
    retry: false, // Don't retry payment operations
    onError: (error: Error) => {
      handleError(error);
    },
  });
}
