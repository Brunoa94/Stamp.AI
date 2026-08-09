/**
 * Security Headers Configuration
 *
 * Implements OWASP security headers recommendations:
 * - Content Security Policy (CSP)
 * - HTTP Strict Transport Security (HSTS)
 * - X-Frame-Options
 * - X-Content-Type-Options
 * - Referrer-Policy
 * - Permissions-Policy
 */

import { NextResponse } from "next/server";

// Trusted domains for CSP
const TRUSTED_DOMAINS = {
  supabase: [
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://*.supabase.co",
    "https://*.supabase.co",
  ],
  images: [
    "https://images.printify.com",
    "https://images-api.printify.com",
    "https://pfy-prod-image-storage.s3.us-east-2.amazonaws.com",
    "https://oaidalleapiprodscus.blob.core.windows.net",
    "https://placehold.co",
    "https://images.unsplash.com",
    "https://picsum.photos",
    "https://www.googletagmanager.com",
  ],
  scripts: [
    "https://js.stripe.com",
    "https://www.paypal.com",
    "https://www.google.com",
    "https://www.gstatic.com",
    "https://www.googletagmanager.com",
    "https://googletagmanager.com",
  ],
  frames: [
    "https://js.stripe.com",
    "https://www.paypal.com",
    "https://www.google.com",
  ],
  fonts: [
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
  ],
  styles: [
    "https://fonts.googleapis.com",
  ],
};

/**
 * Generate Content Security Policy header value
 * @param nonce - Optional nonce for inline scripts (generated per request)
 */
export function generateCSP(nonce?: string): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      ...(nonce ? [`'nonce-${nonce}'`] : ["'unsafe-inline'"]),
      ...TRUSTED_DOMAINS.scripts,
    ],
    "style-src": [
      "'self'",
      "'unsafe-inline'",
      ...TRUSTED_DOMAINS.styles,
    ],
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      ...TRUSTED_DOMAINS.images,
      ...TRUSTED_DOMAINS.supabase,
    ],
    "font-src": [
      "'self'",
      "data:",
      ...TRUSTED_DOMAINS.fonts,
    ],
    "connect-src": [
      "'self'",
      ...TRUSTED_DOMAINS.supabase,
      "https://api.stripe.com",
      "https://api.paypal.com",
      "https://api.sandbox.paypal.com",
      "https://api.mollie.com",
      "https://www.google-analytics.com",
      "https://*.google-analytics.com",
      "https://analytics.google.com",
      "https://www.googletagmanager.com",
    ],
    "frame-src": [
      "'self'",
      ...TRUSTED_DOMAINS.frames,
    ],
    "frame-ancestors": ["'self'"],
    "form-action": ["'self'"],
    "base-uri": ["'self'"],
    "object-src": ["'none'"],
    "upgrade-insecure-requests": [],
  };

  return Object.entries(directives)
    .map(([key, values]) => {
      if (values.length === 0) return key;
      return `${key} ${values.join(" ")}`;
    })
    .join("; ");
}

/**
 * Security headers to be applied to all responses
 */
export const SECURITY_HEADERS: Record<string, string> = {
  // Prevent clickjacking attacks
  "X-Frame-Options": "SAMEORIGIN",

  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",

  // Deprecated — set to 0; rely on CSP for XSS protection instead
  "X-XSS-Protection": "0",

  // Control referrer information
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // HTTP Strict Transport Security (1 year, include subdomains, preload)
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",

  // Permissions Policy (formerly Feature Policy)
  "Permissions-Policy": [
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "interest-cohort=()", // Disable FLoC
  ].join(", "),

  // Cross-Origin policies
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
};

/**
 * Apply security headers to a NextResponse object
 */
export function applySecurityHeaders(
  response: NextResponse,
  options?: { nonce?: string },
): NextResponse {
  // Apply static security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Apply CSP
  const csp = generateCSP(options?.nonce);
  response.headers.set("Content-Security-Policy", csp);

  return response;
}

/**
 * Generate a cryptographically secure nonce for CSP
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString("base64");
}
