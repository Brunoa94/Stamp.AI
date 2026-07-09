/**
 * Format a price given in dollars as a USD currency string.
 */
export function formatPrice(dollars: number): string {
  return `$${dollars.toFixed(2)}`;
}
