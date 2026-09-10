/**
 * Format a price given in cents as a EUR currency string.
 *
 * @example formatPrice(1299) // "€12.99"
 */
export function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}
