import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { ErrorCodes, handleError } from "../_shared/errors.ts"
import { validateRequest } from "../_shared/validators.ts"
import { createAnonClient } from "../_shared/supabase.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface LoginRequest {
  email: string
  password: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const { email, password }: LoginRequest = await req.json()

    console.log('=== AUTH LOGIN ===')
    console.log('Email:', email)
    console.log('Has password:', !!password)

    // Validate request data
    const validEmail = validateRequest.email(email)
    const validPassword = validateRequest.password(password)

    // Create Supabase anon client for user login
    const supabase = createAnonClient()

    // Authenticate user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validEmail,
      password: validPassword
    })

    if (authError) {
      console.error('Auth login error:', authError)

      // Handle specific auth errors
      if (authError.message.includes('Invalid login credentials')) {
        throw ErrorCodes.INVALID_CREDENTIALS()
      }

      if (authError.message.includes('Email not confirmed')) {
        throw ErrorCodes.EMAIL_NOT_CONFIRMED()
      }

      throw ErrorCodes.AUTH_LOGIN_FAILED(authError.message)
    }

    if (!authData.user || !authData.session) {
      throw ErrorCodes.AUTH_LOGIN_FAILED('No user or session returned')
    }

    console.log('✅ User logged in successfully:', authData.user.id)

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          email_confirmed_at: authData.user.email_confirmed_at,
          last_sign_in_at: authData.user.last_sign_in_at,
          user_metadata: authData.user.user_metadata
        },
        session: {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
          expires_at: authData.session.expires_at,
          expires_in: authData.session.expires_in,
          token_type: authData.session.token_type
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in auth login:', error)
    return handleError(error, corsHeaders)
  }
})