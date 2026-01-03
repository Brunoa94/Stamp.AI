import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { ErrorCodes, handleError } from "../_shared/errors.ts"
import { validateRequest } from "../_shared/validators.ts"
import { createServiceClient } from "../_shared/supabase.ts"
import type { RegisterRequestI, AuthResponseI, UserI } from "../../../types/index.ts"

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
    const { email, password, first_name, last_name, metadata }: RegisterRequestI = await req.json()

    console.log('=== AUTH REGISTER ===')
    console.log('Email:', email)
    console.log('Has password:', !!password)

    // Validate request data
    const validEmail = validateRequest.email(email)
    const validPassword = validateRequest.password(password)

    // Create Supabase service client
    const supabase = createServiceClient()

    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: validEmail,
      password: validPassword,
      email_confirm: false, // Require email verification
      user_metadata: {
        first_name,
        last_name,
        ...metadata
      }
    })

    if (authError) {
      console.error('Auth registration error:', authError)

      // Handle specific auth errors
      if (authError.message.includes('already registered')) {
        throw ErrorCodes.EMAIL_ALREADY_REGISTERED()
      }

      throw ErrorCodes.AUTH_REGISTRATION_FAILED(authError.message)
    }

    console.log('✅ User registered successfully:', authData.user?.id)

    const userProfile: UserI = {
      id: authData.user!.id,
      email: authData.user!.email!,
      email_confirmed_at: authData.user!.email_confirmed_at,
      created_at: authData.user!.created_at,
      user_metadata: authData.user!.user_metadata
    }

    const response: AuthResponseI = {
      success: true,
      user: userProfile,
      message: 'Registration successful. Please check your email to verify your account.'
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in auth registration:', error)
    return handleError(error, corsHeaders)
  }
})