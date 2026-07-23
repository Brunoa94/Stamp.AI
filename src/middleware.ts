import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { applySecurityHeaders, generateNonce } from "@/lib/security/headers";
import { checkCombinedRateLimit } from "@/lib/security/rate-limiter/check";
import {
  RATE_LIMIT_CONFIGS,
  type RateLimitType,
} from "@/lib/security/rate-limiter/configs";

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nonce = generateNonce();

  // ── Rate Limiting ─────────────────────────────────────────────────────────────
  const rateLimitType = getRateLimitType(pathname);
  let rateLimitResult: ReturnType<typeof checkCombinedRateLimit> | null = null;

  if (rateLimitType) {
    const config = RATE_LIMIT_CONFIGS[rateLimitType];
    rateLimitResult = checkCombinedRateLimit(request, pathname, config);

    if (rateLimitResult.isLimited) {
      const response = NextResponse.json(
        {
          error: config.message || "Too many requests",
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429 },
      );

      // Add rate limit headers
      Object.entries(rateLimitResult.headers).forEach(
        ([key, value]: [string, string]) => {
          response.headers.set(key, value);
        },
      );

      // Apply security headers even to rate-limited responses
      applySecurityHeaders(response, { nonce });

      return response;
    }
  }

  // ── Supabase Auth ─────────────────────────────────────────────────────────────
  let supabaseResponse = NextResponse.next({
    request,
  });

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

  // Protected routes
  if (request.nextUrl.pathname.startsWith("/stamp") && !user) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
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

  // ── Apply Security Headers ────────────────────────────────────────────────────
  applySecurityHeaders(supabaseResponse, { nonce });
  supabaseResponse.headers.set("x-nonce", nonce);

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
