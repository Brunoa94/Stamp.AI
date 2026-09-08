/**
 * Compact display id for an order row, e.g. `ORD-2026-A1B2C`.
 */
export function formatOrderId(
  id: string,
  createdAt: string | null | undefined,
): string {
  const year = createdAt ? new Date(createdAt).getFullYear() : "";
  const shortId = id.slice(0, 5).toUpperCase();
  return year ? `ORD-${year}-${shortId}` : `ORD-${shortId}`;
}
