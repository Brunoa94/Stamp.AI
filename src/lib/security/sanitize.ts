/**
 * Input Sanitization Utilities
 *
 * Provides XSS protection and input sanitization beyond Zod validation.
 * These utilities should be used at system boundaries (user input, external APIs).
 */

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
  // First strip any HTML tags
  const stripped = stripHtml(input);
  // Then escape any remaining special characters
  return escapeHtml(stripped);
}

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

/**
 * Validate and sanitize a URL
 * Prevents javascript: and data: URL attacks
 *
 * @param url - URL string to validate
 * @returns Sanitized URL or null if invalid/dangerous
 */
export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== "string") {
    return null;
  }

  const trimmed = url.trim().toLowerCase();

  // Block dangerous protocols
  const dangerousProtocols = [
    "javascript:",
    "data:",
    "vbscript:",
    "file:",
  ];

  for (const protocol of dangerousProtocols) {
    if (trimmed.startsWith(protocol)) {
      return null;
    }
  }

  // Ensure it's a valid URL
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }
    return parsed.href;
  } catch {
    // If it's a relative URL, that's okay
    if (url.startsWith("/") && !url.startsWith("//")) {
      return url;
    }
    return null;
  }
}

/**
 * Sanitize filename to prevent path traversal attacks
 *
 * @param filename - Filename to sanitize
 * @returns Safe filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    // Remove path traversal attempts
    .replace(/\.\./g, "")
    // Remove path separators
    .replace(/[/\\]/g, "")
    // Remove null bytes
    .replace(/\0/g, "")
    // Remove control characters
    .replace(/[\x00-\x1f\x80-\x9f]/g, "")
    // Limit to safe characters
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    // Prevent hidden files
    .replace(/^\.+/, "")
    // Limit length
    .slice(0, 255);
}

/**
 * Sanitize email address
 * Basic validation and normalization
 *
 * @param email - Email address to sanitize
 * @returns Normalized email or null if invalid
 */
export function sanitizeEmail(email: string): string | null {
  if (!email || typeof email !== "string") {
    return null;
  }

  const trimmed = email.trim().toLowerCase();

  // Basic email regex (not exhaustive, but catches obvious issues)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    return null;
  }

  // Remove any HTML/script content that might be embedded
  const sanitized = stripHtml(trimmed);

  // Revalidate after stripping
  if (!emailRegex.test(sanitized)) {
    return null;
  }

  return sanitized;
}

/**
 * Sanitize phone number
 * Removes non-numeric characters except + for international codes
 *
 * @param phone - Phone number to sanitize
 * @returns Sanitized phone number
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== "string") {
    return "";
  }

  // Keep only digits and + (for international format)
  return phone.replace(/[^\d+]/g, "").slice(0, 20);
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

/**
 * Validate that input doesn't contain SQL injection patterns
 * This is a defense-in-depth measure (use parameterized queries primarily)
 *
 * @param input - String to check
 * @returns true if input appears safe
 */
export function isSqlSafe(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|EXEC|EXECUTE|UNION|DECLARE)\b)/i,
    /(-{2}|\/\*|\*\/)/,
    /(;\s*(SELECT|INSERT|UPDATE|DELETE|DROP))/i,
    /(\bOR\b\s+[\d'"]+=[\d'"]+)/i,
    /(\bAND\b\s+[\d'"]+=[\d'"]+)/i,
  ];

  return !sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Create a sanitizer with custom configuration
 */
export function createSanitizer(options: {
  stripHtml?: boolean;
  escapeHtml?: boolean;
  maxLength?: number;
}) {
  return (input: string): string => {
    let result = input;

    if (options.stripHtml) {
      result = stripHtml(result);
    }

    if (options.escapeHtml) {
      result = escapeHtml(result);
    }

    if (options.maxLength && result.length > options.maxLength) {
      result = truncate(result, options.maxLength);
    }

    return result;
  };
}
