import { useMutation } from "@tanstack/react-query";
import { MollieService } from "@/services/mollieService";
import type {
  CreateMolliePaymentPayloadI,
  VerifyMolliePaymentPayloadI,
} from "@/types/payment";
import { useErrorHandler } from "@/hooks/useErrorHandler";

export function useCreateMolliePayment() {
  const { handleError } = useErrorHandler();
  return useMutation({
    mutationKey: ["mollie", "create-payment"],
    mutationFn: (payload: CreateMolliePaymentPayloadI) =>
      MollieService.createPayment(payload),
    onError: (error: Error) => {
      handleError(error);
    },
  });
}

export function useVerifyMolliePayment() {
  const { handleError } = useErrorHandler();
  return useMutation({
    mutationKey: ["mollie", "verify-payment"],
    mutationFn: (payload: VerifyMolliePaymentPayloadI) =>
      MollieService.verifyPayment(payload),
    retry: 3, // Retry 3 times for transient failures
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff: 2s, 4s, 8s
    onError: (error: Error) => {
      handleError(error);
    },
  });
}
