import { useState } from "react";
import { useUpdateOrderStatus } from "@/queries/orderQueries";
import { OrderWithItemsT } from "@/types/order";
import { toast } from "sonner";

export function useCancelOrder() {
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<OrderWithItemsT | null>(null);
  const { mutate: updateOrderStatus, isPending: isCancelling } = useUpdateOrderStatus();

  const handleCancelOrder = (order: OrderWithItemsT) => {
    setOrderToCancel(order);
    setCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    setCancelModalOpen(false);
    setOrderToCancel(null);
  };

  const handleConfirmCancel = () => {
    if (!orderToCancel) return;

    updateOrderStatus(
      { orderId: orderToCancel.id, status: "cancelled" },
      {
        onSuccess: () => {
          toast.success("Order cancelled", {
            description: `Order #${orderToCancel.order_number || orderToCancel.id.slice(0, 8)} has been cancelled.`,
          });
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
