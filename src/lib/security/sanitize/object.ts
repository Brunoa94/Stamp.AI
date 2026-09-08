import { sanitizeForDisplay } from "./html";

/**
 * Sanitize an object recursively
 * Applies sanitization to all string values
 *
 * @param obj - Object to sanitize
 * @param sanitizer - Sanitization function to apply (default: sanitizeForDisplay)
 * @returns New object with sanitized string values
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  sanitizer: (input: string) => string = sanitizeForDisplay
): T {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[key] = sanitizer(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) => {
        if (typeof item === "string") {
          return sanitizer(item);
        }
        if (typeof item === "object" && item !== null) {
          return sanitizeObject(item as Record<string, unknown>, sanitizer);
        }
        return item;
      });
    } else if (typeof value === "object" && value !== null) {
      result[key] = sanitizeObject(value as Record<string, unknown>, sanitizer);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}
