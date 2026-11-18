/**
 * Format date with time for timeline entries, in the visitor's locale
 */
export function formatTimestamp(dateString: string | null | undefined, locale: string): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
