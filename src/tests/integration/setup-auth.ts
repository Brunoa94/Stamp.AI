/**
 * Authentication setup for integration tests
 * Gets JWT token from actual user login
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const testEmail = process.env.TEST_USER_EMAIL;
const testPassword = process.env.TEST_USER_PASSWORD;

if (!supabaseUrl || !supabaseAnonKey || !testEmail || !testPassword) {
  throw new Error('Missing test Supabase URL, anon key, or test user credentials');
}

export interface AuthenticatedClient {
  supabase: SupabaseClient;
  userId: string;
  accessToken: string;
}

export async function getAuthenticatedClient(): Promise<AuthenticatedClient> {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Sign in with real user credentials
  const { data, error } = await supabase.auth.signInWithPassword({
    email: testEmail!,
    password: testPassword!,
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
