/**
 * Format a price given in cents as a EUR currency string.
 */
export function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}
