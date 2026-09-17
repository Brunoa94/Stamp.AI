import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import {
  checkCombinedRateLimit,
  checkUserRateLimit,
} from "@/lib/security/rate-limiter/check";
import {
  RATE_LIMIT_CONFIGS,
  type RateLimitType,
} from "@/lib/security/rate-limiter/configs";
import {
  generateRequestId,
  getRequestIdFromHeaders,
  REQUEST_ID_HEADER,
} from "@/lib/observability/requestId";

/**
 * Determine the rate limit type based on the request path
 */
function getRateLimitType(pathname: string): RateLimitType | null {
  // Auth endpoints - strict rate limiting
  if (pathname.startsWith("/auth") || pathname.startsWith("/api/auth")) {
    return "auth";
  }

  // Password reset - very strict
  if (pathname.includes("password") || pathname.includes("reset-password")) {
    return "passwordReset";
  }

  // Image generation - expensive operation
  if (pathname.startsWith("/api/generate-image")) {
    return "imageGeneration";
  }

  // Payment endpoints
  if (
    pathname.startsWith("/api/paypal") ||
    pathname.startsWith("/api/stripe") ||
    pathname.includes("payment")
  ) {
    return "payment";
  }

  // Webhook endpoints (from payment providers)
  if (pathname.includes("webhook")) {
    return "webhook";
  }

  // Other API routes
  if (pathname.startsWith("/api")) {
    return "api";
  }

  // Don't rate limit static pages
  return null;
}

function rateLimitedResponse(
  result: ReturnType<typeof checkCombinedRateLimit>,
  message: string | undefined,
  requestId: string,
): NextResponse {
  const response = NextResponse.json(
    {
      error: message || "Too many requests",
      retryAfter: result.retryAfter,
    },
    { status: 429 },
  );

  Object.entries(result.headers).forEach(([key, value]: [string, string]) => {
    response.headers.set(key, value);
  });
  response.headers.set(REQUEST_ID_HEADER, requestId);

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Request ID ──────────────────────────────────────────────────────────────
  // Generate or extract request ID for correlation across the request lifecycle
  const requestId = getRequestIdFromHeaders(request.headers) || generateRequestId();

  // ── Rate Limiting (IP bucket) ─────────────────────────────────────────────────
  // Runs before the session lookup so a flood is rejected without spending a
  // Supabase Auth round-trip per request. The per-user bucket is applied
  // further down, once the session has been resolved for route protection.
  const rateLimitType = getRateLimitType(pathname);
  const rateLimitConfig = rateLimitType ? RATE_LIMIT_CONFIGS[rateLimitType] : null;
  let rateLimitResult: ReturnType<typeof checkCombinedRateLimit> | null = null;

  if (rateLimitConfig) {
    rateLimitResult = checkCombinedRateLimit(request, pathname, rateLimitConfig);

    if (rateLimitResult.isLimited) {
      return rateLimitedResponse(rateLimitResult, rateLimitConfig.message, requestId);
    }
  }

  // ── Supabase Auth ─────────────────────────────────────────────────────────────
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Add request ID to response headers for client-side correlation
  supabaseResponse.headers.set(REQUEST_ID_HEADER, requestId);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    },
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Rate Limiting (per-user bucket) ──────────────────────────────────────────
  // Reuses the session resolved above; no second Supabase call. Catches one
  // account spreading requests across many IPs.
  if (rateLimitConfig && rateLimitResult && user) {
    const userResult = checkUserRateLimit(user.id, pathname, rateLimitConfig);

    if (userResult.isLimited) {
      const response = rateLimitedResponse(userResult, rateLimitConfig.message, requestId);
      supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
      return response;
    }

    if (userResult.remaining < rateLimitResult.remaining) {
      rateLimitResult = userResult;
    }
  }

  // Protected routes — server-side auth gate. The client-side <ProtectedRoute>
  // is UX only and is NOT a security control; these must be gated here before
  // any page data renders.
  const PROTECTED_PREFIXES = [
    "/stamp",
    "/orders",
    "/profile",
    "/cart",
    "/checkout",
    "/dashboard",
  ];
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (isProtected && !user) {
    // no user — redirect to the login/home page
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("redirectedFrom", pathname);
    const response = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
    response.headers.set(REQUEST_ID_HEADER, requestId);
    return response;
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  // Security headers (CSP, HSTS, etc.) are applied centrally in next.config.ts
  // (`headers()`), which covers every route without per-request cost. Keeping
  // them in one place avoids the two definitions drifting apart.

  // Add rate limit headers to successful responses (reuse earlier result to avoid double-counting)
  if (rateLimitResult) {
    Object.entries(rateLimitResult.headers).forEach(
      ([key, value]: [string, string]) => {
        supabaseResponse.headers.set(key, value);
      },
    );
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
