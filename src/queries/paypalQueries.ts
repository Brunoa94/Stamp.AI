import { useMutation } from "@tanstack/react-query";
import { PayPalService } from "@/services/paypalService";
import type {
  CapturePayPalOrderPayloadI,
  CreatePayPalOrderPayloadI,
} from "@/types/payment";
import { useErrorHandler } from "@/hooks/useErrorHandler";

export function useCreatePayPalOrder() {
  const { handleError } = useErrorHandler();
  return useMutation({
    mutationKey: ["paypal", "create-order"],
    mutationFn: (payload: CreatePayPalOrderPayloadI) =>
      PayPalService.createOrder(payload),
    onError: (error: Error) => {
      handleError(error);
    },
  });
}

export function useCapturePayPalOrder() {
  const { handleError } = useErrorHandler();
  return useMutation({
    mutationKey: ["paypal", "capture-order"],
    mutationFn: (payload: CapturePayPalOrderPayloadI) =>
      PayPalService.captureOrder(payload),
    onError: (error: Error) => {
      handleError(error);
    },
  });
}
