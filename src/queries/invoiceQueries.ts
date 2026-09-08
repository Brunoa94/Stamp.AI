import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InvoiceService } from "@/services/invoiceService";
import { useErrorHandler } from "@/hooks/useErrorHandler";

/**
 * Fetch the issued invoice for an order (null when none exists yet)
 */
export function useOrderInvoice(orderId: string | null) {
  return useQuery({
    queryKey: ["invoices", "order", orderId],
    queryFn: () => {
      if (!orderId) {
        throw new Error("Order ID is required");
      }
      return InvoiceService.getInvoiceForOrder(orderId);
    },
    enabled: !!orderId,
  });
}

/**
 * Generate (or fetch) the invoice for a paid order and return its
 * signed download URL. Idempotent server-side.
 */
export function useGenerateInvoice() {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: (orderId: string) => InvoiceService.generateInvoice(orderId),
    onSuccess: (data) => {
      queryClient.setQueryData(["invoices", "order", data.invoice.order_id], data.invoice);
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (error: Error) => {
      handleError(error);
    },
  });
}
