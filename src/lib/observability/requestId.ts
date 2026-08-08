/**
 * Request ID Utilities
 *
 * Provides request correlation across the application.
 * Each request gets a unique ID that flows through:
 * - Middleware (generation)
 * - API routes (extraction)
 * - Client components (via header)
 * - Error capture (correlation)
 * - Logs (tracing)
 *
 * NOTE: This module is Edge-compatible. For server-only helpers
 * that use next/headers, see requestId.server.ts
 */

/**
 * Header name for request ID
 * Standard header used by many observability tools
 */
export const REQUEST_ID_HEADER = "x-request-id";

/**
 * Generate a unique request ID
 *
 * Format: req_{timestamp}_{random}
 * Example: req_1a2b3c4d_5e6f7g8h
 */
export function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `req_${timestamp}_${random}`;
}

/**
 * Get request ID from incoming headers
 * Falls back to generating a new one if not present
 *
 * @param headersList - Headers object from request
 * @returns Request ID (existing or newly generated)
 */
export function getRequestIdFromHeaders(headersList: Headers): string {
  const existingId = headersList.get(REQUEST_ID_HEADER);
  return existingId || generateRequestId();
}

/**
 * Create headers object with request ID
 *
 * @param requestId - Request ID to include
 * @param existingHeaders - Optional existing headers to extend
 * @returns Headers object with request ID
 */
export function createRequestIdHeaders(
  requestId: string,
  existingHeaders?: Record<string, string>
): Record<string, string> {
  return {
    ...existingHeaders,
    [REQUEST_ID_HEADER]: requestId,
  };
}

/**
 * Extract request ID from Response headers
 *
 * @param response - Fetch Response object
 * @returns Request ID or undefined
 */
export function getRequestIdFromResponse(
  response: Response
): string | undefined {
  return response.headers.get(REQUEST_ID_HEADER) || undefined;
}
