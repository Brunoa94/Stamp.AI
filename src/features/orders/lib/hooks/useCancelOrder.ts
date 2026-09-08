import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { OrderWithItemsT } from "@/types/order";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { canCancelOrder } from "../utils/orderCancellation";

import { OrderService } from "@/services/orderService";

type CancelResults = {
    cancelled_at_printify?: boolean;
    refund_processed?: boolean;
    refund_error?: string;
};

export function useCancelOrder() {
    const t = useTranslations("orders.cancel");
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState<OrderWithItemsT | null>(
        null,
    );
    const queryClient = useQueryClient();
    const { handleError } = useErrorHandler();

    const buildCancellationDescription = (results?: CancelResults): string => {
        const defaultMessage = t("defaultDescription");

        if (!results) {
            return defaultMessage;
        }

        const details: string[] = [];

        if (results.cancelled_at_printify) {
            details.push(t("cancelledAtPrintify"));
        }
        if (results.refund_processed) {
            details.push(t("refundProcessed"));
        } else if (results.refund_error) {
            details.push(t("refundError"));
        }

        return details.length > 0 ? `${details.join(". ")}.` : defaultMessage;
    };

    const { mutate: executeCancelOrder, isPending: isCancelling } = useMutation(
        {
            mutationFn: (orderId: string) => OrderService.cancelOrder(orderId),
            onSuccess: (data, orderId) => {
                queryClient.invalidateQueries({ queryKey: ["orders"] });
                queryClient.invalidateQueries({
                    queryKey: ["orders", orderId],
                });

                toast.success(t("toastTitle"), {
                    description: buildCancellationDescription(data.results),
                });

                handleCloseCancelModal();
            },
            onError: (error: Error) => {
                handleError(
                    new Error(t("failedToCancel", { message: error.message })),
                );
            },
        },
    );

    const handleCancelOrder = (order: OrderWithItemsT) => {
        if (!canCancelOrder(order)) {
            handleError(new Error(t("cannotCancel")));
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
            handleError(new Error(t("cannotCancel")));
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
