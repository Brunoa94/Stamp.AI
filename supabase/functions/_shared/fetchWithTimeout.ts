/**
 * Fetch with timeout support for Deno edge functions.
 *
 * All external API calls (especially Printify) should use this helper to prevent
 * requests from hanging indefinitely. The default timeout is 15 seconds, which
 * is generous enough for most API calls but prevents acceptance tests from
 * timing out at ~17-19 seconds.
 */

export class FetchTimeoutError extends Error {
  constructor(url: string, timeoutMs: number) {
    super(`Request to ${url} timed out after ${timeoutMs}ms`);
    this.name = "FetchTimeoutError";
  }
}

/**
 * Fetch with AbortController-based timeout.
 *
 * @param url - The URL to fetch
 * @param options - Standard fetch options (method, headers, body, etc.)
 * @param timeoutMs - Timeout in milliseconds (default: 15000)
 * @returns Promise<Response>
 * @throws FetchTimeoutError if the request times out
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
      throw new FetchTimeoutError(url, timeoutMs);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Printify API fetch helper with appropriate timeout and headers.
 *
 * @param endpoint - Printify API endpoint (e.g., "/v1/shops/123/products.json")
 * @param token - Printify API token
 * @param options - Additional fetch options (method, body, etc.)
 * @param timeoutMs - Timeout in milliseconds (default: 20000 for Printify)
 * @returns Promise<Response>
 */
export async function fetchPrintify(
  endpoint: string,
  token: string,
  options: RequestInit = {},
  timeoutMs = 20_000
): Promise<Response> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `https://api.printify.com${endpoint}`;

  return fetchWithTimeout(
    url,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    },
    timeoutMs
  );
}
