/**
 * Retry helper for calls to external providers (OpenAI, Gemini, Printify, ...).
 *
 * Retries ONLY transient failures — rate limits (429), server errors (5xx),
 * network failures and aborted/timed-out attempts — with exponential backoff.
 * Client errors (4xx other than 429) and domain errors are thrown immediately:
 * retrying a moderation block or an invalid request only burns quota.
 *
 * When the caller's `signal` is aborted (the overall request deadline), no
 * further attempts are made even if the last error looked transient.
 */

export interface RetryOptionsI {
  /** Number of retries after the first attempt (default 2 → 3 attempts). */
  retries?: number;
  /** Delay before the first retry (default 500 ms). */
  baseDelayMs?: number;
  /** Upper bound for a single backoff delay (default 8 s). */
  maxDelayMs?: number;
  /** Add up to 25% random jitter to each delay (default true). */
  jitter?: boolean;
  /** Overall deadline: once aborted, stop retrying. */
  signal?: AbortSignal;
  /** Override what counts as transient (default `isTransientError`). */
  isRetryable?: (error: unknown) => boolean;
  /** Injectable sleep for tests. */
  sleep?: (ms: number) => Promise<void>;
}

const TRANSIENT_ERROR_CODES = new Set([
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "ENOTFOUND",
  "EAI_AGAIN",
  "EPIPE",
  "UND_ERR_SOCKET",
  "UND_ERR_CONNECT_TIMEOUT",
]);

const TRANSIENT_ERROR_NAMES = new Set([
  "AbortError",
  "TimeoutError",
  "APIConnectionError",
  "APIConnectionTimeoutError",
]);

function readStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;
  const candidate = error as {
    status?: unknown;
    statusCode?: unknown;
    response?: { status?: unknown };
  };
  for (const value of [candidate.status, candidate.statusCode, candidate.response?.status]) {
    if (typeof value === "number") return value;
  }
  return undefined;
}

/**
 * True when an error is worth retrying: 429, any 5xx, a network-level
 * failure, or an aborted/timed-out attempt.
 */
export function isTransientError(error: unknown): boolean {
  const status = readStatus(error);
  if (status !== undefined) {
    return status === 429 || (status >= 500 && status <= 599);
  }

  if (!error || typeof error !== "object") return false;

  const { name, code, message } = error as { name?: unknown; code?: unknown; message?: unknown };

  if (typeof name === "string" && TRANSIENT_ERROR_NAMES.has(name)) return true;
  if (typeof code === "string" && TRANSIENT_ERROR_CODES.has(code)) return true;

  // undici / fetch surface network failures as TypeError("fetch failed")
  if (error instanceof TypeError && typeof message === "string" && /fetch failed/i.test(message)) {
    return true;
  }

  return false;
}

const defaultSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

function computeDelay(attempt: number, base: number, max: number, jitter: boolean): number {
  const exponential = Math.min(max, base * 2 ** attempt);
  if (!jitter) return exponential;
  const spread = exponential * 0.25;
  return Math.round(exponential - spread + Math.random() * spread * 2);
}

/**
 * Run `operation` and retry it on transient failures with exponential backoff.
 *
 * @param operation - Receives the zero-based attempt index.
 *
 * @example
 * ```ts
 * const result = await withRetry(
 *   () => client.images.generate(params, { signal }),
 *   { retries: 2, signal },
 * );
 * ```
 */
export async function withRetry<T>(
  operation: (attempt: number) => Promise<T>,
  options: RetryOptionsI = {},
): Promise<T> {
  const {
    retries = 2,
    baseDelayMs = 500,
    maxDelayMs = 8_000,
    jitter = true,
    signal,
    isRetryable = isTransientError,
    sleep = defaultSleep,
  } = options;

  for (let attempt = 0; ; attempt++) {
    try {
      return await operation(attempt);
    } catch (error) {
      const canRetry = attempt < retries && !signal?.aborted && isRetryable(error);
      if (!canRetry) throw error;

      await sleep(computeDelay(attempt, baseDelayMs, maxDelayMs, jitter));
    }
  }
}
