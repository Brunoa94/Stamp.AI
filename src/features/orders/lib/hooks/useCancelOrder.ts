import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { OrderWithItemsT } from "@/types/order";
import { toast } from "sonner";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { canCancelOrder } from "../utils/orderCancellation";

import { OrderService } from "@/services/orderService";

type CancelResults = {
    cancelled_at_printify?: boolean;
    refund_processed?: boolean;
    refund_error?: string;
};

function buildCancellationDescription(results?: CancelResults): string {
    const defaultMessage = "Your order has been cancelled.";

    if (!results) {
        return defaultMessage;
    }

    const details: string[] = [];

    if (results.cancelled_at_printify) {
        details.push("Order cancelled at Printify");
    }
    if (results.refund_processed) {
        details.push("Refund processed successfully");
    } else if (results.refund_error) {
        details.push("Note: Refund could not be processed automatically");
    }

    return details.length > 0 ? `${details.join(". ")}.` : defaultMessage;
}

export function useCancelOrder() {
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState<OrderWithItemsT | null>(
        null,
    );
    const queryClient = useQueryClient();
    const { handleError } = useErrorHandler();

    const { mutate: executeCancelOrder, isPending: isCancelling } = useMutation(
        {
            mutationFn: (orderId: string) => OrderService.cancelOrder(orderId),
            onSuccess: (data, orderId) => {
                queryClient.invalidateQueries({ queryKey: ["orders"] });
                queryClient.invalidateQueries({
                    queryKey: ["orders", orderId],
                });

                toast.success("Order cancelled", {
                    description: buildCancellationDescription(data.results),
                });

                handleCloseCancelModal();
            },
            onError: (error: Error) => {
                handleError(
                    new Error(`Failed to cancel order: ${error.message}`),
                );
            },
        },
    );

    const handleCancelOrder = (order: OrderWithItemsT) => {
        if (!canCancelOrder(order)) {
            handleError(
                new Error(
                    "Order can no longer be cancelled. Orders can only be cancelled before entering In Production.",
                ),
            );
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
            handleError(
                new Error(
                    "Order can no longer be cancelled. Orders can only be cancelled before entering In Production.",
                ),
            );
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
