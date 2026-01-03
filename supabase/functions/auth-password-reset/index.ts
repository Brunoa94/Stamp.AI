import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { ErrorCodes, handleError } from "../_shared/errors.ts"
import { validateRequest } from "../_shared/validators.ts"
import { createAnonClient } from "../_shared/supabase.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface PasswordResetRequest {
  email?: string
  new_password?: string
  access_token?: string
  action: 'request' | 'confirm'
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const { email, new_password, access_token, action }: PasswordResetRequest = await req.json()

    console.log('=== AUTH PASSWORD RESET ===')
    console.log('Action:', action)
    console.log('Email:', email)
    console.log('Has new password:', !!new_password)
    console.log('Has access token:', !!access_token)

    // Create Supabase anon client
    const supabase = createAnonClient()

    if (action === 'request') {
      // Request password reset email
      const validEmail = validateRequest.email(email)

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(validEmail, {
        redirectTo: `${Deno.env.get('FRONTEND_URL') || 'http://localhost:3000'}/reset-password`
      })

      if (resetError) {
        console.error('Password reset request error:', resetError)
        throw ErrorCodes.PASSWORD_RESET_FAILED(resetError.message)
      }

      console.log('✅ Password reset email sent to:', validEmail)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Password reset email sent. Please check your email for instructions.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    else if (action === 'confirm') {
      // Confirm password reset with new password
      const validPassword = validateRequest.password(new_password)
      const validToken = validateRequest.token(access_token)

      // Set the access token for the session
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: validToken,
        refresh_token: '' // Not needed for password update
      })

      if (sessionError || !sessionData.user) {
        console.error('Session error:', sessionError)
        throw ErrorCodes.INVALID_TOKEN()
      }

      // Update the user's password
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        password: validPassword
      })

      if (updateError) {
        console.error('Password update error:', updateError)
        throw ErrorCodes.PASSWORD_RESET_FAILED(updateError.message)
      }

      console.log('✅ Password updated successfully for user:', updateData.user?.id)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Password updated successfully. You can now log in with your new password.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    else {
      throw ErrorCodes.INVALID_REQUEST_BODY()
    }
  } catch (error) {
    console.error('Error in password reset:', error)
    return handleError(error, corsHeaders)
  }
})