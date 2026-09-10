/**
 * Format price with currency symbol.
 * Amounts are stored in cents, so we divide by 100.
 */
export function formatPrice(amountInCents: number | null | undefined): string {
    if (amountInCents === null || amountInCents === undefined) return "€0.00";
    return `€${(amountInCents / 100).toFixed(2)}`;
}
