/**
 * Authentication setup for integration tests
 * Gets JWT token from actual user login
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export interface AuthenticatedClient {
  supabase: ReturnType<typeof createClient<any>>;
  userId: string;
  accessToken: string;
}

export async function getAuthenticatedClient(): Promise<AuthenticatedClient> {
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
