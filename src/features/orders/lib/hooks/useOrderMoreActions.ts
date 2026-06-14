import { useMemo } from "react";
import { OrderWithItemsT } from "@/types/order";

export function useOrderMoreActions(order: OrderWithItemsT) {
    const supportEmailHref = useMemo(() => {
        const subject = encodeURIComponent(
            `Support request for order ${order.id}`,
        );
        const body = encodeURIComponent(
            `Hi support,%0D%0A%0D%0AI need help with order ${order.id}.%0D%0AStatus: ${
                order.status ?? "processing"
            }.%0D%0A%0D%0AThanks.`,
        );

        return `mailto:?subject=${subject}&body=${body}`;
    }, [order.id, order.status]);

    const preferredReusableOrderItemId = useMemo(() => {
        return (
            order.order_items?.find((item) => Boolean(item.custom_image_url))
                ?.id ??
                order.order_items?.[0]?.id ??
                ""
        );
    }, [order.order_items]);

    const reuseImageUrl = useMemo(() => {
        return preferredReusableOrderItemId
            ? `/stamp?sourceOrder=${order.id}&sourceOrderItem=${preferredReusableOrderItemId}`
            : `/stamp?sourceOrder=${order.id}`;
    }, [order.id, preferredReusableOrderItemId]);

    return {
        supportEmailHref,
        preferredReusableOrderItemId,
        reuseImageUrl,
    };
}
