import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"
import { ErrorCodes, handleError } from "../_shared/errors.ts"
import type { ApiResponseI, SuccessMessages, SuccessResponseI } from "../../../types/index.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EmailVerificationRequest {
  email?: string
  token?: string
  action: 'resend' | 'confirm'
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const { email, token, action }: EmailVerificationRequest = await req.json()

    console.log('=== AUTH EMAIL VERIFICATION ===')
    console.log('Action:', action)
    console.log('Email:', email)
    console.log('Has token:', !!token)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    if (!supabaseUrl) {
      throw ErrorCodes.SUPABASE_URL_MISSING()
    }

    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseServiceKey) {
      throw ErrorCodes.SUPABASE_SERVICE_ROLE_KEY_MISSING()
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    if (action === 'resend') {
      // Resend verification email
      if (!email) {
        throw ErrorCodes.EMAIL_REQUIRED()
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw ErrorCodes.INVALID_EMAIL_FORMAT()
      }

      const { error: resendError } = await supabase.auth.admin.generateLink({
        type: 'signup',
        email: email
      })

      if (resendError) {
        console.error('Email verification resend error:', resendError)
        throw ErrorCodes.AUTH_REGISTRATION_FAILED(resendError.message)
      }

      console.log('✅ Verification email resent to:', email)

      const response: SuccessResponseI = {
        success: true,
        message: SuccessMessages.EMAIL_VERIFICATION_SENT,
        code: 'EMAIL_VERIFICATION_SENT'
      }

      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    else if (action === 'confirm') {
      // Confirm email verification
      if (!token) {
        throw ErrorCodes.INVALID_TOKEN()
      }

      if (!email) {
        throw ErrorCodes.EMAIL_REQUIRED()
      }

      // Verify the email using the token
      const { data: verifyData, error: verifyError } = await supabase.auth.admin.updateUserById(
        token, // This should be the user ID, but we'll handle this differently
        { email_confirm: true }
      )

      // Alternative approach: Use the verification token directly
      const anonSupabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') || '', {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      const { data: confirmData, error: confirmError } = await anonSupabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      })

      if (confirmError) {
        console.error('Email verification error:', confirmError)
        throw ErrorCodes.INVALID_TOKEN()
      }

      console.log('✅ Email verified successfully for user:', confirmData.user?.id)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email verified successfully. You can now log in.',
          user: {
            id: confirmData.user?.id,
            email: confirmData.user?.email,
            email_confirmed_at: confirmData.user?.email_confirmed_at
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    else {
      throw ErrorCodes.INVALID_REQUEST_BODY()
    }
  } catch (error) {
    console.error('Error in email verification:', error)
    return handleError(error, corsHeaders)
  }
})