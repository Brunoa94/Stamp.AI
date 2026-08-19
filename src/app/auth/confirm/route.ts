import { createServerClient } from '@supabase/ssr'
import type { EmailOtpType } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_OTP_TYPES: EmailOtpType[] = ['signup', 'magiclink', 'email']

function isAllowedOtpType(type: string): type is EmailOtpType {
  return (ALLOWED_OTP_TYPES as string[]).includes(type)
}

// Only same-origin paths are valid destinations (open-redirect guard)
function sanitizeNextPath(next: string | null): string {
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    return next
  }
  return '/stamp'
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const tokenHash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') ?? 'signup'
  const next = sanitizeNextPath(requestUrl.searchParams.get('next'))

  if (!tokenHash || !isAllowedOtpType(type)) {
    return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
  }

  // Create a response object that we can modify
  const response = NextResponse.next({
    request,
  })

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
      return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
    }

    // Create redirect response and copy cookies from the original response
    const redirectResponse = NextResponse.redirect(new URL(next, request.url))
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })

    return redirectResponse
  } catch (err) {
    console.error('Email confirmation error:', err)
    return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
  }
}
