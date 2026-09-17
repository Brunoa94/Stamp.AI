/**
 * CORS headers for edge functions.
 *
 * Browser origins allowed to call the functions come from the ALLOWED_ORIGINS
 * secret (comma-separated, e.g. "https://stamp.ai,https://www.stamp.ai").
 * The request Origin is reflected only when it is on that list; otherwise no
 * Access-Control-Allow-Origin header is sent and the browser blocks the
 * response. A wildcard is never emitted. Server-to-server callers (cron,
 * webhooks, Next.js API routes) send no Origin and are unaffected.
 *
 * `buildCorsHeaders` / `parseAllowedOrigins` are pure so they can be unit
 * tested from vitest; `corsHeadersFor` is the Deno entry point used by the
 * functions and reads the env through `globalThis` so this module stays
 * importable outside Deno.
 */

export interface CorsOptionsI {
  /** Extra request headers a provider sends (e.g. "stripe-signature"). */
  extraAllowedHeaders?: string[];
  /** Access-Control-Allow-Methods value. Defaults to "POST, OPTIONS". */
  methods?: string;
}

const BASE_ALLOWED_HEADERS = [
  "authorization",
  "x-client-info",
  "apikey",
  "content-type",
];

const DEFAULT_METHODS = "POST, OPTIONS";

/** Used when ALLOWED_ORIGINS is unset so local development keeps working. */
const LOCAL_DEV_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"];

/**
 * Normalise an origin for comparison: lower-case scheme/host, no trailing
 * slash. Returns null when the value is not an absolute http(s) origin.
 */
function normalizeOrigin(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (url.pathname !== "/" || url.search || url.hash) return null;

  return url.origin.toLowerCase();
}

/**
 * Parse the ALLOWED_ORIGINS value into a list of normalised origins.
 * Invalid entries (bare hosts, "*", non-http schemes) are dropped. An empty
 * result falls back to the local development origins.
 */
export function parseAllowedOrigins(raw: string | undefined | null): string[] {
  const origins = (raw ?? "")
    .split(",")
    .map(normalizeOrigin)
    .filter((origin): origin is string => origin !== null);

  return origins.length > 0 ? origins : [...LOCAL_DEV_ORIGINS];
}

/**
 * Build the CORS response headers for a request coming from `requestOrigin`.
 */
export function buildCorsHeaders(
  requestOrigin: string | null,
  allowedOriginsRaw: string | undefined | null,
  options: CorsOptionsI = {},
): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": [
      ...BASE_ALLOWED_HEADERS,
      ...(options.extraAllowedHeaders ?? []),
    ].join(", "),
    "Access-Control-Allow-Methods": options.methods ?? DEFAULT_METHODS,
    Vary: "Origin",
  };

  const normalizedRequestOrigin = requestOrigin
    ? normalizeOrigin(requestOrigin)
    : null;

  if (
    normalizedRequestOrigin &&
    parseAllowedOrigins(allowedOriginsRaw).includes(normalizedRequestOrigin)
  ) {
    headers["Access-Control-Allow-Origin"] = requestOrigin as string;
  }

  return headers;
}

interface DenoEnvLikeI {
  env: { get(name: string): string | undefined };
}

function readAllowedOriginsEnv(): string | undefined {
  const deno = (globalThis as { Deno?: DenoEnvLikeI }).Deno;
  return deno?.env.get("ALLOWED_ORIGINS");
}

/**
 * CORS headers for an incoming edge-function request. Call once at the top
 * of the handler and reuse the result for the preflight and every response.
 */
export function corsHeadersFor(
  req: Request,
  options: CorsOptionsI = {},
): Record<string, string> {
  return buildCorsHeaders(
    req.headers.get("origin"),
    readAllowedOriginsEnv(),
    options,
  );
}
