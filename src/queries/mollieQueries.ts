import { useMutation } from "@tanstack/react-query";
import {
  MollieService,
  type CreateMolliePaymentPayloadI,
  type VerifyMolliePaymentPayloadI,
} from "@/services/mollieService";

/**
 * Create a Mollie payment via edge function
 * Returns the payment ID and checkout URL for redirect
 */
export function useCreateMolliePayment() {
  return useMutation({
    mutationKey: ["mollie", "create-payment"],
    mutationFn: (payload: CreateMolliePaymentPayloadI) =>
      MollieService.createPayment(payload),
  });
}

/**
 * Verify a Mollie payment status via edge function
 * Used after redirect back from Mollie to check payment status
 */
export function useVerifyMolliePayment() {
  return useMutation({
    mutationKey: ["mollie", "verify-payment"],
    mutationFn: (payload: VerifyMolliePaymentPayloadI) =>
      MollieService.verifyPayment(payload),
  });
}
