import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const rawNext = requestUrl.searchParams.get('next') ?? '/stamp'
  const type = requestUrl.searchParams.get('type')

  // Only allow same-site relative redirects. Reject absolute URLs and
  // protocol-relative (`//host`) values to prevent an open redirect.
  const next =
    rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/stamp'

  if (!code) {
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
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth exchange error:', error)
      return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
    }

    // Determine redirect destination
    const redirectUrl = type === 'recovery'
      ? new URL('/reset-password', request.url)
      : new URL(next, request.url)

    // Create redirect response and copy cookies from the original response
    const redirectResponse = NextResponse.redirect(redirectUrl)
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })

    return redirectResponse
  } catch (err) {
    console.error('Auth callback error:', err)
    return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
  }
}