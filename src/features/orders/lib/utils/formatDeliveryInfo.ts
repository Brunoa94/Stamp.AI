import { formatOrderDate } from "./formatOrderDate";

type DeliveryOrderType = {
    status: string | null;
    delivered_at: string | null;
    shipped_at: string | null;
    created_at: string | null;
};

type DeliveryInfoType = {
    dotClass: string;
    text: string;
};

/**
 * Returns delivery status info for mobile card display.
 */
export function formatDeliveryInfo(
    order: DeliveryOrderType,
): DeliveryInfoType | null {
    const status = order.status?.toLowerCase();

    if (status === "delivered" && order.delivered_at) {
        return {
            dotClass: "w-1.5 h-1.5 rounded-full bg-green-500",
            text: `Delivered ${formatOrderDate(order.delivered_at)}`,
        };
    }

    if (status === "shipped" && order.shipped_at) {
        return {
            dotClass: "w-1.5 h-1.5 rounded-full bg-orange-500",
            text: `Shipped ${formatOrderDate(order.shipped_at)}`,
        };
    }

    if (order.created_at) {
        const est = new Date(order.created_at);
        est.setDate(est.getDate() + 7);
        return {
            dotClass: "w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse",
            text: `Est. ${
                est.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                })
            }`,
        };
    }

    return null;
}
