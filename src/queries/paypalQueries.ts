import { useMutation } from "@tanstack/react-query";
import {
  PayPalService,
  type CapturePayPalOrderPayloadI,
  type CreatePayPalOrderPayloadI,
} from "@/services/paypalService";

/**
 * Create a PayPal order via edge function
 */
export function useCreatePayPalOrder() {
  return useMutation({
    mutationKey: ["paypal", "create-order"],
    mutationFn: (payload: CreatePayPalOrderPayloadI) =>
      PayPalService.createOrder(payload),
  });
}

/**
 * Capture a PayPal order via edge function
 */
export function useCapturePayPalOrder() {
  return useMutation({
    mutationKey: ["paypal", "capture-order"],
    mutationFn: (payload: CapturePayPalOrderPayloadI) =>
      PayPalService.captureOrder(payload),
  });
}
