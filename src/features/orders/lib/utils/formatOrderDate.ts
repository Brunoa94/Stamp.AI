/**
 * Format date to display format, in the visitor's locale
 */
export function formatOrderDate(date: string | null | undefined, locale: string): string {
    if (!date) return "";

    return new Date(date).toLocaleDateString(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}
