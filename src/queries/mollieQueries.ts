import { useMutation } from "@tanstack/react-query";
import {
  MollieService,
  type CreateMolliePaymentPayloadI,
  type VerifyMolliePaymentPayloadI,
} from "@/services/mollieService";
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
    onError: (error: Error) => {
      handleError(error);
    },
  });
}
