/**
 * Printify Order Queries
 * React Query hooks for Printify order creation and management
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PrintifyService } from "@/services/printifyService";
import type {
  CreatePrintifyOrderRequest,
  PrintifyOrderResponse,
} from "@/types/printifyOrder";
import { useErrorHandler } from "@/hooks/useErrorHandler";

/**
 * Create a Printify order
 *
 * This mutation calls the Supabase Edge Function to create an order in Printify
 * after a successful payment.
 *
 * @example
 * const createOrder = useCreatePrintifyOrder();
 *
 * createOrder.mutate({
 *   line_items: [...],
 *   shipping_address: {...},
 *   is_test: false,
 *   metadata: { payment_intent_id: "pi_xxx" }
 * });
 */
export function useCreatePrintifyOrder() {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation<PrintifyOrderResponse, Error, CreatePrintifyOrderRequest>({
    mutationFn: (payload: CreatePrintifyOrderRequest) =>
      PrintifyService.createPrintifyOrder(payload),

    onSuccess: (data) => {
      console.log("✅ Printify order created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },

    onError: (error: Error) => {
      handleError(error);
    },
  });
}
