import { createClient } from "@/lib/supabase/client";
import { ErrorClient } from "./errorClient";

/**
 * Validates user session and returns access token
 *
 * @param serviceName - Name of the calling service for error context
 * @returns Access token for authenticated requests
 * @throws Error if session is invalid or user is not authenticated
 */
async function getAuthenticatedSession(serviceName: string): Promise<string> {
  const supabase = createClient();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw ErrorClient.handleError({
      error,
      service: serviceName,
      action: "Validate Session"
    });
  }

  if (!session) {
    throw ErrorClient.handleError({
      error: new Error("You must be logged in to perform this action"),
      service: serviceName,
      action: "Validate Session"
    });
  }

  return session.access_token;
}

/**
 * Creates standard headers for Supabase function invocations
 *
 * @param accessToken - Optional access token (if not provided, only includes API key)
 * @returns Headers object ready for Supabase function invoke
 */
function createSupabaseHeaders(accessToken?: string): Record<string, string> {
  const headers: Record<string, string> = {
    apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

/**
 * Validates session and returns headers in one call
 * Convenience method combining getAuthenticatedSession + createSupabaseHeaders
 *
 * @param serviceName - Name of the calling service for error context
 * @returns Headers object with authentication
 */
export async function getAuthenticatedHeaders(serviceName: string): Promise<Record<string, string>> {
  const accessToken = await getAuthenticatedSession(serviceName);
  return createSupabaseHeaders(accessToken);
}
