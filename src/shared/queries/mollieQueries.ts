import { useMutation } from "@tanstack/react-query";
import { MollieService } from "@/shared/services/mollieService";
import type { VerifyMolliePaymentPayloadI } from "@/shared/types/payment";
import { useErrorHandler } from "@/shared/hooks/useErrorHandler";

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
