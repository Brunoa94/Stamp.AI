import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { ErrorCodes, handleError } from "../_shared/errors.ts"
import { extractBearerToken } from "../_shared/validators.ts"
import { createUserClient, createServiceClient } from "../_shared/supabase.ts"
import type { UserI, UpdateProfileRequestI, ApiResponseI } from "../../../types/index.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
}

// Types are imported from shared types

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    // Extract and validate JWT token
    const authHeader = req.headers.get('authorization')
    const token = extractBearerToken(authHeader)

    // Create Supabase client with user token
    const supabase = createUserClient(token)

    // Verify the user's token and get user info
    const { data: userData, error: userError } = await supabase.auth.getUser(token)

    if (userError || !userData.user) {
      console.error('User verification error:', userError)
      throw ErrorCodes.INVALID_TOKEN()
    }

    const user = userData.user

    console.log('=== AUTH PROFILE ===')
    console.log('Method:', req.method)
    console.log('User ID:', user.id)

    if (req.method === 'GET') {
      // Get user profile
      const userProfile: UserI = {
        id: user.id,
        email: user.email!,
        email_confirmed_at: user.email_confirmed_at,
        last_sign_in_at: user.last_sign_in_at,
        created_at: user.created_at,
        updated_at: user.updated_at,
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata
      }

      const response: ApiResponseI<UserI> = {
        success: true,
        data: userProfile
      }

      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    else if (req.method === 'PUT') {
      // Update user profile
      const updates: UpdateProfileRequestI = await req.json()

      console.log('Profile updates:', JSON.stringify(updates, null, 2))

      // Prepare user metadata updates
      const userMetadataUpdates: Record<string, any> = {}

      if (updates.first_name !== undefined) {
        userMetadataUpdates.first_name = updates.first_name
      }

      if (updates.last_name !== undefined) {
        userMetadataUpdates.last_name = updates.last_name
      }

      if (updates.avatar_url !== undefined) {
        userMetadataUpdates.avatar_url = updates.avatar_url
      }

      if (updates.metadata) {
        Object.assign(userMetadataUpdates, updates.metadata)
      }

      // Update user metadata
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        data: userMetadataUpdates
      })

      if (updateError) {
        console.error('Profile update error:', updateError)
        throw ErrorCodes.AUTH_REGISTRATION_FAILED(updateError.message)
      }

      console.log('✅ Profile updated successfully for user:', updateData.user?.id)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Profile updated successfully',
          user: {
            id: updateData.user?.id,
            email: updateData.user?.email,
            user_metadata: updateData.user?.user_metadata,
            updated_at: updateData.user?.updated_at
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    else if (req.method === 'DELETE') {
      // Delete user account
      const supabaseService = createServiceClient()

      const { error: deleteError } = await supabaseService.auth.admin.deleteUser(user.id)

      if (deleteError) {
        console.error('Account deletion error:', deleteError)
        throw ErrorCodes.AUTH_REGISTRATION_FAILED(deleteError.message)
      }

      console.log('✅ Account deleted successfully for user:', user.id)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Account deleted successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    else {
      throw ErrorCodes.INVALID_REQUEST_BODY()
    }
  } catch (error) {
    console.error('Error in profile management:', error)
    return handleError(error, corsHeaders)
  }
})