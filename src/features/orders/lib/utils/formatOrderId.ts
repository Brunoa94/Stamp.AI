/**
 * Format order ID to display format (first 8 characters, uppercase)
 */
export function formatOrderId(orderId: string | null | undefined): string {
    if (!orderId) return "";
    return `#${orderId.slice(0, 8).toUpperCase()}`;
}
