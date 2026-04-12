import { ordersTheme } from "@/theme/components";

/**
 * Get the CSS class for order status badge based on status value
 */
export function getStatusBadgeClass(status: string | null): string {
  const base = ordersTheme.table.statusBadge;
  const normalizedStatus = status?.toLowerCase().replace(/[_-]/g, "") || "";

  switch (normalizedStatus) {
    case "pending":
    case "awaiting":
      return `${base} ${ordersTheme.table.statusPending}`;
    case "processing":
    case "inproduction":
      return `${base} ${ordersTheme.table.statusProcessing}`;
    case "shipped":
    case "dispatched":
      return `${base} ${ordersTheme.table.statusShipped}`;
    case "intransit":
    case "outfordelivery":
      return `${base} ${ordersTheme.table.statusInTransit}`;
    case "delivered":
    case "completed":
      return `${base} ${ordersTheme.table.statusDelivered}`;
    case "cancelled":
    case "canceled":
      return `${base} ${ordersTheme.table.statusCancelled}`;
    case "refunded":
      return `${base} ${ordersTheme.table.statusRefunded}`;
    case "failed":
      return `${base} ${ordersTheme.table.statusFailed}`;
    case "onhold":
    case "hold":
      return `${base} ${ordersTheme.table.statusOnHold}`;
    default:
      return `${base} ${ordersTheme.table.statusPending}`;
  }
}
