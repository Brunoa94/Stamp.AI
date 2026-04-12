import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { OrderWithItemsT } from "@/types/order";
import { toast } from "sonner";
import { OrderLifecycleService } from "@/services/orderLifecycleService";
import { canCancelOrder } from "../utils/orderCancellation";

export function useCancelOrder() {
  const queryClient = useQueryClient();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<OrderWithItemsT | null>(null);
  const { mutate: cancelOrder, isPending: isCancelling } = useMutation({
    mutationFn: (orderId: string) => OrderLifecycleService.cancelOrder(orderId),
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

    cancelOrder(
      orderToCancel.id,
      {
        onSuccess: (result) => {
          if (result.status === "refund_failed") {
            toast.error("Refund failed", {
              description: "The order could not be cancelled because the refund failed. The owner has been alerted.",
            });
            return;
          }

          toast.success("Order cancelled", {
            description:
              orderToCancel.status === "confirmed"
                ? `Order #${orderToCancel.order_number || orderToCancel.id.slice(0, 8)} was cancelled and fully refunded.`
                : `Order #${orderToCancel.order_number || orderToCancel.id.slice(0, 8)} has been cancelled.`,
          });

          queryClient.invalidateQueries({ queryKey: ["orders"] });
          handleCloseCancelModal();
        },
        onError: (error) => {
          toast.error("Failed to cancel order", {
            description: error.message,
          });
        },
      }
    );
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
