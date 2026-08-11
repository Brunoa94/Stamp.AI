/**
 * Format a price given in cents as a EUR currency string.
 */
export function formatPrice(cents: number | null | undefined): string {
    if (cents === null || cents === undefined) return "€0.00";
    return `€${(cents / 100).toFixed(2)}`;
}
