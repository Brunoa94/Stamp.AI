import { useMutation } from "@tanstack/react-query";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { StripeService } from "@/services/stripeService";
import type {
  CreatePaymentIntentPayloadI,
  CreatePaymentIntentResponseI
} from "@/types/payment";

// Re-export types for backward compatibility
export type { CreatePaymentIntentPayloadI, CreatePaymentIntentResponseI };

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
