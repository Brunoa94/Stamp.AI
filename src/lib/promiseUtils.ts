/**
 * Promise Utilities
 *
 * Shared utilities for working with promises and async operations
 */

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
