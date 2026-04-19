import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { OrderWithItemsT } from "@/types/order";
import { toast } from "sonner";
import { canCancelOrder } from "../utils/orderCancellation";

import type { CancelOrderResponseI } from "@/services/orderService";
import { OrderService } from "@/services/orderService";

export function useCancelOrder() {
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<OrderWithItemsT | null>(null);
  const queryClient = useQueryClient();

  const { mutate: executeCancelOrder, isPending: isCancelling } = useMutation({
    mutationFn: (orderId: string) => OrderService.cancelOrder(orderId),
    onSuccess: (data, orderId) => {
      // Invalidate orders queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", orderId] });

      // Show detailed success message
      const { results } = data;
      let description = "Your order has been cancelled.";

      if (results) {
        const details: string[] = [];
        if (results.cancelled_at_printify) {
          details.push("Order cancelled at Printify");
        }
        if (results.refund_processed) {
          details.push("Refund processed successfully");
        } else if (results.refund_error) {
          details.push("Note: Refund could not be processed automatically");
        }

        if (details.length > 0) {
          description = details.join(". ") + ".";
        }
      }

      toast.success("Order cancelled", {
        description,
      });

      handleCloseCancelModal();
    },
    onError: (error: Error) => {
      toast.error("Failed to cancel order", {
        description: error.message,
      });
    },
  });

  const handleCancelOrder = (order: OrderWithItemsT) => {
    if (!canCancelOrder(order)) {
      toast.error("Order can no longer be cancelled", {
        description: "Orders can only be cancelled before entering In Production.",
      });
      return;
    }

    setOrderToCancel(order);
    setCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    setCancelModalOpen(false);
    setOrderToCancel(null);
  };

  const handleConfirmCancel = () => {
    if (!orderToCancel) return;
    if (!canCancelOrder(orderToCancel)) {
      toast.error("Order can no longer be cancelled", {
        description: "Orders can only be cancelled before entering In Production.",
      });
      handleCloseCancelModal();
      return;
    }

    executeCancelOrder(orderToCancel.id);
  };

  return {
    cancelModalOpen,
    orderToCancel,
    isCancelling,
    handleCancelOrder,
    handleCloseCancelModal,
    handleConfirmCancel,
  };
}
