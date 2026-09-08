/**
 * Format date to display format
 */
export function formatOrderDate(date: string | null | undefined): string {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
