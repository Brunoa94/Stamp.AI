import { createServerClient } from '@supabase/ssr'
import type { EmailOtpType } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { SITE_URL } from '@/features/seo/config/site'
import { getSafeRedirectPath } from '@/shared/helpers/redirectTarget'

const ALLOWED_OTP_TYPES: EmailOtpType[] = ['signup', 'magiclink', 'email']

function isAllowedOtpType(type: string): type is EmailOtpType {
  return (ALLOWED_OTP_TYPES as string[]).includes(type)
}

// Only same-origin paths are valid destinations (open-redirect guard). The
// shared check also rejects backslashes and tabs, which URL parsing turns
// into a protocol-relative `//host`.
function sanitizeNextPath(next: string | null): string {
  return getSafeRedirectPath(next) ?? '/stamp'
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const tokenHash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') ?? 'signup'
  const next = sanitizeNextPath(requestUrl.searchParams.get('next'))

  if (!tokenHash || !isAllowedOtpType(type)) {
    return NextResponse.redirect(new URL('/auth/auth-code-error', SITE_URL))
  }

  // Supabase writes its cookies directly to the final response so all cookie
  // attributes (expiry, SameSite, Secure, and path) survive the redirect.
  const response = NextResponse.redirect(new URL(next, SITE_URL))

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            if (options) {
              response.cookies.set(name, value, options)
            } else {
              response.cookies.set(name, value)
            }
          })
        },
      },
    }
  )

  try {
    // Verifying the emailed token marks the account confirmed and starts a
    // session, so the redirect below lands the user in as an active account
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    })

    if (error) {
      console.error('Email confirmation error:', error)
      return NextResponse.redirect(new URL('/auth/auth-code-error', SITE_URL))
    }

    return response
  } catch (err) {
    console.error('Email confirmation error:', err)
    return NextResponse.redirect(new URL('/auth/auth-code-error', SITE_URL))
  }
}
