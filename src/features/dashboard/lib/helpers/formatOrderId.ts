export function formatOrderId(id: string): string {
  const year = new Date().getFullYear();
  const shortId = id.slice(0, 5).toUpperCase();
  return `ORD-${year}-${shortId}`;
}
