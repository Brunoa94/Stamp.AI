import { OrderWithItemsT } from "@/types/order";

const CANCELLABLE_ORDER_STATUSES = new Set(["", "created", "pending", "confirmed"]);

function normalizeStatus(value: string | null | undefined): string {
  return (value ?? "").toLowerCase().replace(/[_-]/g, "").trim();
}

export function canCancelOrder(order: Pick<OrderWithItemsT, "status">): boolean {
  const orderStatus = normalizeStatus(order.status);

  if (orderStatus === "cancelled" || orderStatus === "canceled") return false;

  return CANCELLABLE_ORDER_STATUSES.has(orderStatus);
}
