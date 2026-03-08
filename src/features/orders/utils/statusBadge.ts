import { ordersTheme } from "@/theme/components";

/**
 * Get the CSS class for order status badge based on status value
 */
export function getStatusBadgeClass(status: string | null): string {
  const base = ordersTheme.table.statusBadge;
  switch (status?.toLowerCase()) {
    case "processing":
      return `${base} ${ordersTheme.table.statusProcessing}`;
    case "delivered":
      return `${base} ${ordersTheme.table.statusDelivered}`;
    case "shipped":
      return `${base} ${ordersTheme.table.statusShipped}`;
    case "cancelled":
      return `${base} ${ordersTheme.table.statusCancelled}`;
    default:
      return `${base} ${ordersTheme.table.statusProcessing}`;
  }
}
