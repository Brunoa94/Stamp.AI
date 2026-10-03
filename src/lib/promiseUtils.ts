/**
 * Promise Utilities
 *
 * Shared utilities for working with promises and async operations
 */

/**
 * Fetch with AbortController-based timeout.
 * Use this for external API calls that need timeout handling.
 *
 * @param url - The URL to fetch
 * @param options - Standard fetch options (method, headers, body, etc.)
 * @param timeoutMs - Timeout in milliseconds (default: 15000)
 * @returns Promise<Response>
 * @throws Error if the request times out
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 15_000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request to ${url} timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Wraps a promise with a timeout that will reject if the operation takes too long
 *
 * @param promise - The promise to wrap
 * @param ms - Timeout in milliseconds
 * @param timeoutError - Optional custom error to throw on timeout (defaults to Error)
 * @returns Promise that resolves/rejects based on race between operation and timeout
 *
 * @example
 * ```ts
 * const result = await withTimeout(
 *   fetchData(),
 *   5000,
 *   new CustomTimeoutError("Operation timed out")
 * );
 * ```
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  timeoutError?: Error,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        timeoutError ||
          new Error(`Operation timed out after ${Math.round(ms / 1000)} seconds`),
      );
    }, ms);
  });

  return Promise.race([promise, timeout]).finally(() =>
    clearTimeout(timeoutId),
  );
}
