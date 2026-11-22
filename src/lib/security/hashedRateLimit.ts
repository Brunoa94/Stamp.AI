import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/shared/types/database.types";

function hashIdentifier(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Takes one request from a database-backed bucket shared by every server
 * instance (the middleware limiter is per instance). The identifier is
 * stored hashed. Needs the service-role client. Returns false when the
 * bucket is empty.
 */
export async function consumeHashedRateLimit(
  supabase: SupabaseClient<Database>,
  scope: string,
  identifier: string,
  maxRequests: number,
  windowSeconds: number,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("consume_auth_email_rate_limit", {
    p_scope: scope,
    p_identifier_hash: hashIdentifier(identifier),
    p_max_requests: maxRequests,
    p_window_seconds: windowSeconds,
  });

  if (error) throw error;
  return data;
}
