/**
 * Format date with time for timeline entries
 */
export function formatTimestamp(dateString: string | null | undefined): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
