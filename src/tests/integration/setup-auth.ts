/**
 * Authentication setup for integration tests
 * Gets JWT token from actual user login
 */

import { describe } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** True when the live-Supabase credentials the integration suites need are present. */
export const hasIntegrationEnv = Boolean(supabaseUrl && supabaseAnonKey);

const SKIP_MESSAGE =
  '[integration] Skipping: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are not set. ' +
  'Point them at a Supabase project to run the integration suites (npm run test:integration).';

let warned = false;

/**
 * `describe` for suites that need a live Supabase. When the env is missing
 * the suite is skipped (reported as skipped, not failed) with one clear
 * message instead of throwing at import time.
 */
export const describeIntegration: typeof describe = ((...args: Parameters<typeof describe>) => {
  if (hasIntegrationEnv) {
    return describe(...args);
  }
  if (!warned) {
    warned = true;
    console.warn(SKIP_MESSAGE);
  }
  return describe.skip(...args);
}) as typeof describe;

export interface AuthenticatedClient {
  supabase: SupabaseClient;
  userId: string;
  accessToken: string;
}

export async function getAuthenticatedClient(): Promise<AuthenticatedClient> {
  if (!hasIntegrationEnv) {
    throw new Error(SKIP_MESSAGE);
  }
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Sign in with real user credentials
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'bruno.afonso94@hotmail.com',
    password: 'Bruno-afonso94',
  });

  if (error) {
    console.error('Authentication failed:', error);
    throw error;
  }

  if (!data.session) {
    throw new Error('No session returned from authentication');
  }

  console.log('✅ Authenticated as:', data.user.email);
  console.log('✅ User ID:', data.user.id);
  console.log('✅ JWT token obtained');

  // Create a new client with the access token
  const authenticatedSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
      },
    },
  });

  return {
    supabase: authenticatedSupabase,
    userId: data.user.id,
    accessToken: data.session.access_token,
  };
}
