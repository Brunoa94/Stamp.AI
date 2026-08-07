/**
 * Format price with currency symbol
 */
export function formatPrice(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "€0.00";
  return `€${amount.toFixed(2)}`;
}
