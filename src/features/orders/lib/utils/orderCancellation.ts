import { OrderWithItemsT } from "@/types/order";
import { normalizeOrderStatus } from "@/features/orders/helpers/normalizeOrderStatus";

type CancellableOrderStatusType = "" | "created" | "pending" | "confirmed";

const CANCELLABLE_ORDER_STATUSES: ReadonlySet<CancellableOrderStatusType> =
    new Set([
        "",
        "created",
        "pending",
        "confirmed",
    ]);

function isCancellableOrderStatus(
    status: string,
): status is CancellableOrderStatusType {
    return CANCELLABLE_ORDER_STATUSES.has(status as CancellableOrderStatusType);
}

export function canCancelOrder(
    order: Pick<OrderWithItemsT, "status">,
): boolean {
    const orderStatus = normalizeOrderStatus(order.status);

    if (orderStatus === "cancelled" || orderStatus === "canceled") return false;

    return isCancellableOrderStatus(orderStatus);
}
