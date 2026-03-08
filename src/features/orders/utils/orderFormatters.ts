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
