import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import type { Database } from "@/shared/types/database.types";
import { getClientIdentifier } from "@/lib/security/rate-limiter/utils";
import { consumeHashedRateLimit } from "@/lib/security/hashedRateLimit";

export type AccountActionScopeType = "account-export" | "account-delete" | "account-password";

type LimitType = { ip: number; user: number };

const RATE_LIMIT_WINDOW_SECONDS = 60 * 60;

/** Per-hour ceilings. Deletion and password changes are stricter: they are password-guessable. */
export const ACCOUNT_ACTION_LIMITS: Record<AccountActionScopeType, LimitType> = {
  "account-export": { ip: 20, user: 5 },
  "account-delete": { ip: 10, user: 3 },
  "account-password": { ip: 10, user: 5 },
};

function consumeLimit(
  supabase: SupabaseClient<Database>,
  scope: string,
  identifier: string,
  maxRequests: number,
): Promise<boolean> {
  return consumeHashedRateLimit(supabase, scope, identifier, maxRequests, RATE_LIMIT_WINDOW_SECONDS);
}

/**
 * DB-backed rate limit for authenticated account actions, keyed by client IP
 * and by user id (both hashed). Reuses the auth_email_rate_limits store.
 */
export async function isAccountActionAllowed(
  supabase: SupabaseClient<Database>,
  request: NextRequest,
  scope: AccountActionScopeType,
  userId: string,
): Promise<boolean> {
  const limits = ACCOUNT_ACTION_LIMITS[scope];

  const ipAllowed = await consumeLimit(
    supabase,
    `${scope}:ip`,
    getClientIdentifier(request),
    limits.ip,
  );
  if (!ipAllowed) return false;

  return consumeLimit(supabase, `${scope}:user`, userId, limits.user);
}
