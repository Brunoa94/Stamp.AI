/**
 * HTML entities that need escaping to prevent XSS
 */
const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;",
};

/**
 * Escape HTML special characters to prevent XSS attacks
 *
 * @param input - String to sanitize
 * @returns Sanitized string with HTML entities escaped
 */
export function escapeHtml(input: string): string {
  return input.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Remove HTML tags from a string
 *
 * @param input - String potentially containing HTML
 * @returns String with all HTML tags removed
 */
export function stripHtml(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

/**
 * Sanitize a string for safe display
 * Combines HTML stripping and entity escaping
 *
 * @param input - User input string
 * @returns Sanitized string safe for display
 */
export function sanitizeForDisplay(input: string): string {
  const stripped = stripHtml(input);
  return escapeHtml(stripped);
}

/**
 * Truncate string to maximum length with ellipsis
 * Useful for preventing extremely long inputs
 *
 * @param input - String to truncate
 * @param maxLength - Maximum length
 * @returns Truncated string
 */
export function truncate(input: string, maxLength: number): string {
  if (input.length <= maxLength) {
    return input;
  }
  return input.slice(0, maxLength - 3) + "...";
}
