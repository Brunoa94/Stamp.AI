/**
 * Format a price given in euros as a EUR currency string.
 */
export function formatPrice(euros: number): string {
  return `€${euros.toFixed(2)}`;
}
