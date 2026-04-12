import { OrderWithItemsT } from "@/types/order";

const CANCELLABLE_ORDER_STATUSES = new Set(["", "created", "pending", "confirmed"]);
const BLOCKED_FULFILLMENT_STATUSES = new Set([
  "inproduction",
  "processing",
  "shipped",
  "fulfilled",
  "delivered",
]);

function normalizeStatus(value: string | null | undefined): string {
  return (value ?? "").toLowerCase().replace(/[_-]/g, "").trim();
}

export function canCancelOrder(order: Pick<OrderWithItemsT, "status" | "fulfillment_status">): boolean {
  const orderStatus = normalizeStatus(order.status);
  const fulfillmentStatus = normalizeStatus(order.fulfillment_status);

  if (orderStatus === "cancelled" || orderStatus === "canceled") return false;
  if (BLOCKED_FULFILLMENT_STATUSES.has(fulfillmentStatus)) return false;

  return CANCELLABLE_ORDER_STATUSES.has(orderStatus);
}
