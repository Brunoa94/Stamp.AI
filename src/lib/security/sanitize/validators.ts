import { stripHtml } from "./html";

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

  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }
    return parsed.href;
  } catch {
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
    .replace(/\.\./g, "")
    .replace(/[/\\]/g, "")
    .replace(/\0/g, "")
    .replace(/[\x00-\x1f\x80-\x9f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/^\.+/, "")
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
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    return null;
  }

  const sanitized = stripHtml(trimmed);

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

  return phone.replace(/[^\d+]/g, "").slice(0, 20);
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
