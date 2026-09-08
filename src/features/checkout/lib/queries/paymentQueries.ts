import { useMutation } from "@tanstack/react-query";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { PaymentService } from "../services/paymentService";
import type { CheckoutFormData } from "../context/CheckoutFormContext";
import type { CartWithItems } from "@/types/cart";

interface PreparePayPalPaymentParams {
  formData: CheckoutFormData;
  cart: CartWithItems;
  cartId: string | null;
  amount: number;
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

interface PrepareIdealPaymentParams {
  formData: CheckoutFormData;
  cart: CartWithItems;
  cartId: string | null;
  amount: number;
}

/**
 * Mutation hook for preparing an iDEAL payment (via Mollie)
 * Creates the Mollie payment and stores checkout data for the return page
 */
export function usePrepareIdealPayment() {
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationKey: ["payment", "prepare-ideal"],
    mutationFn: ({ formData, cart, cartId, amount }: PrepareIdealPaymentParams) =>
      PaymentService.prepareIdealPayment(formData, cart, cartId, amount),
    retry: false, // Don't retry payment operations
    onError: (error: Error) => {
      handleError(error);
    },
  });
}
