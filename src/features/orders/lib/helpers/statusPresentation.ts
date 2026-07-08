import { normalizeOrderStatus } from "./normalizeOrderStatus";
import type { OrdersStatusFilterType } from "../types/filters";

export function getStatusBadgeClass(status: string): string {
  if (status === "delivered") return "bg-[#E6F7F0] text-[#10B981]";
  if (status === "shipped") return "bg-[#EBF2FF] text-[#3B82F6]";
  if (status === "cancelled") return "bg-[#FEF2F2] text-[#EF4444]";
  return "bg-[#FFF7ED] text-[#F59E0B]"; // processing
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
