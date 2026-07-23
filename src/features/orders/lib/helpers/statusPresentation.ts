import { normalizeOrderStatus } from "./normalizeOrderStatus";
import type { OrdersStatusFilterType } from "../types/filters";

export function getStatusBadgeClass(status: string): string {
  if (status === "delivered")
    return "bg-(--color-stamp-success)/10 text-(--color-stamp-success)";
  if (status === "shipped")
    return "bg-(--color-stamp-info)/10 text-(--color-stamp-info)";
  if (status === "cancelled")
    return "bg-(--color-stamp-error)/10 text-(--color-stamp-error)";
  return "bg-(--color-stamp-warning)/10 text-(--color-stamp-warning)"; // processing
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
