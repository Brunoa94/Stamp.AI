/**
 * Format order ID to display format (first 8 characters, uppercase)
 */
export function formatOrderId(orderId: string | null | undefined): string {
  if (!orderId) return "";
  return `#${orderId.slice(0, 8).toUpperCase()}`;
}

/**
 * Format date to display format
 */
export function formatOrderDate(date: string | null | undefined): string {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format price with currency symbol
 */
export function formatPrice(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "$0.00";
  return `$${amount.toFixed(2)}`;
}

/**
 * Returns delivery status info for mobile card display.
 * dot class + label text based on order status.
 */
export function formatDeliveryInfo(order: {
  status: string | null;
  delivered_at: string | null;
  shipped_at: string | null;
  created_at: string | null;
}): { dotClass: string; text: string } | null {
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
      text: `Est. ${est.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    };
  }

  return null;
}
