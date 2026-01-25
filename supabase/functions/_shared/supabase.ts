import { createClient } from "jsr:@supabase/supabase-js@2"
import { validateEnvVars } from "./validators.ts"

// Common Supabase client configurations
const commonAuthConfig = {
  autoRefreshToken: false,
  persistSession: false
}

// Create Supabase client with service role (admin privileges)
export const createServiceClient = () => {
  const supabaseUrl = validateEnvVars.supabaseUrl()
  const serviceKey = validateEnvVars.supabaseServiceKey()

  return createClient(supabaseUrl, serviceKey, {
    auth: commonAuthConfig
  })
}

// Create Supabase client with anon key (user-level access)
export const createAnonClient = () => {
  const supabaseUrl = validateEnvVars.supabaseUrl()
  const anonKey = validateEnvVars.supabaseAnonKey()

  return createClient(supabaseUrl, anonKey, {
    auth: commonAuthConfig
  })
}

// Create Supabase client with user token for authenticated requests
export const createUserClient = (userToken: string) => {
  const supabaseUrl = validateEnvVars.supabaseUrl()
  const anonKey = validateEnvVars.supabaseAnonKey()

  return createClient(supabaseUrl, anonKey, {
    auth: commonAuthConfig,
    global: {
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    }
  })
}