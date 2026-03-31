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

/**
 * REST API response interface
 */
export interface SupabaseRestResponseI<T = unknown> {
  data: T | null;
  error: unknown | null;
  status: number;
}

/**
 * REST API options interface
 */
export interface SupabaseRestOptionsI {
  prefer?: string;
}

/**
 * Helper to call Supabase REST API directly without the client library.
 * Useful for webhooks and edge functions that need direct database access.
 */
export async function supabaseRest<T = unknown>(
  endpoint: string,
  method: string,
  body?: Record<string, unknown>,
  options?: SupabaseRestOptionsI
): Promise<SupabaseRestResponseI<T>> {
  const supabaseUrl = validateEnvVars.supabaseUrl();
  const serviceKey = validateEnvVars.supabaseServiceKey();

  const headers: Record<string, string> = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };

  if (options?.prefer) {
    headers["Prefer"] = options.prefer;
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle empty responses (204 No Content, or empty body)
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  return {
    data,
    error: response.ok ? null : data,
    status: response.status,
  };
}