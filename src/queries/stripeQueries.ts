import { useMutation } from "@tanstack/react-query";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { StripeService } from "@/services/stripeService";
import type { CreatePaymentIntentPayloadI } from "@/types/payment";

export function useCreatePaymentIntent() {
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationKey: ["stripe", "create-payment-intent"],
    mutationFn: (payload: CreatePaymentIntentPayloadI) =>
      StripeService.createPaymentIntent(payload),
    onError: (error: Error) => {
      handleError(error);
    },
  });
}
