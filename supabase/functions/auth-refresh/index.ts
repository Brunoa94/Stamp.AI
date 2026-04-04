import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { ErrorCodes, handleError } from "../_shared/errors.ts"
import { validateRequest } from "../_shared/validators.ts"
import { createAnonClient } from "../_shared/supabase.ts"
import type { RefreshRequestI, AuthResponseI, UserI, SessionI } from "../../types/index.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Types are imported from shared types

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const { refresh_token }: RefreshRequestI = await req.json()

    console.log('=== AUTH REFRESH ===')
    console.log('Has refresh token:', !!refresh_token)

    // Validate refresh token
    const validRefreshToken = validateRequest.token(refresh_token)

    // Create Supabase anon client
    const supabase = createAnonClient()

    // Refresh the session using the refresh token
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
      refresh_token: validRefreshToken
    })

    if (refreshError) {
      console.error('Session refresh error:', refreshError)

      // Handle specific refresh errors
      if (refreshError.message.includes('Invalid refresh token') ||
          refreshError.message.includes('refresh_token_not_found')) {
        throw ErrorCodes.INVALID_TOKEN()
      }

      throw ErrorCodes.AUTH_LOGIN_FAILED(refreshError.message)
    }

    if (!refreshData.session || !refreshData.user) {
      throw ErrorCodes.INVALID_TOKEN()
    }

    console.log('✅ Session refreshed successfully for user:', refreshData.user.id)

    const userProfile: UserI = {
      id: refreshData.user.id,
      email: refreshData.user.email!,
      email_confirmed_at: refreshData.user.email_confirmed_at,
      last_sign_in_at: refreshData.user.last_sign_in_at,
      created_at: refreshData.user.created_at,
      user_metadata: refreshData.user.user_metadata
    }

    const session: SessionI = {
      access_token: refreshData.session.access_token,
      refresh_token: refreshData.session.refresh_token,
      expires_at: refreshData.session.expires_at!,
      expires_in: refreshData.session.expires_in,
      token_type: refreshData.session.token_type
    }

    const response: AuthResponseI = {
      success: true,
      user: userProfile,
      session
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in session refresh:', error)
    return handleError(error, corsHeaders)
  }
})