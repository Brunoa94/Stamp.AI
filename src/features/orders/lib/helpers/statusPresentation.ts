import { normalizeOrderStatus } from "./normalizeOrderStatus";
import type { OrdersStatusFilterType } from "../types/filters";
import type { OrderT } from "@/types/order";

export type OrderDisplayStatusT =
  | "processing"
  | "preparing"
  | "inProduction"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "hasIssues";

// Raw Printify status (orders.printify_status) → granular display status
const PRINTIFY_DISPLAY_STATUS: Record<string, OrderDisplayStatusT> = {
  "pending": "preparing",
  "on-hold": "preparing",
  "payment-not-received": "preparing",
  "cost-calculation": "preparing",
  "sending-to-production": "inProduction",
  "sending_to_production_delegate": "inProduction",
  "sending_to_production_delegate_sync": "inProduction",
  "in-production": "inProduction",
  "fulfilled": "shipped",
  "partially-fulfilled": "shipped",
  "canceled": "cancelled",
  "has-issues": "hasIssues",
  "unfulfillable": "hasIssues",
  "source-check-failed": "hasIssues",
};

export function getStatusBadgeClass(status: string): string {
  if (status === "delivered")
    return "bg-(--color-stamp-success)/10 text-(--color-stamp-success)";
  if (status === "shipped")
    return "bg-(--color-stamp-info)/10 text-(--color-stamp-info)";
  if (status === "cancelled" || status === "hasIssues")
    return "bg-(--color-stamp-error)/10 text-(--color-stamp-error)";
  return "bg-(--color-stamp-warning)/10 text-(--color-stamp-warning)"; // processing / preparing / inProduction
}

/**
 * Granular display status for the order status badge.
 *
 * Terminal states from the database win; otherwise the raw Printify status
 * (kept fresh by the sync-printify-orders cron job) provides the granular
 * stage, falling back to the collapsed database status for orders that were
 * never submitted to Printify.
 */
export function getOrderDisplayStatus(
  order: Pick<OrderT, "status" | "printify_status">
): OrderDisplayStatusT {
  const dbStatus = toDisplayStatus(order.status);
  if (dbStatus === "delivered" || dbStatus === "cancelled") return dbStatus;

  const printifyStatus = order.printify_status
    ? PRINTIFY_DISPLAY_STATUS[order.printify_status]
    : undefined;
  if (printifyStatus) return printifyStatus;

  if (dbStatus === "shipped") return "shipped";
  return "processing";
}

export function toDisplayStatus(status: string | null | undefined): string {
  const normalized = normalizeOrderStatus(status);
  if (!normalized) return "processing";

  if (normalized === "waitingconfirmation") return "processing";
  if (normalized === "unsuccessfulconfirmation") return "cancelled";
  if (normalized === "confirmed") return "processing";

  return normalized;
}

export function getStatusFilterLabel(value: OrdersStatusFilterType): string {
  if (value === "all") return "All Statuses";
  return value.replaceAll("_", " ");
}

/**
 * Get localized status label for display
 */
export function getStatusLabel(
  status: string,
  t: (key: string) => string
): string {
  const displayStatus = toDisplayStatus(status);
  return t(displayStatus) || status;
}
