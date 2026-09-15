import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import type { Database } from "@/types/database.types";
import { getClientIdentifier } from "@/lib/security/rate-limiter/utils";

export type AccountActionScopeType = "account-export" | "account-delete";

type LimitType = { ip: number; user: number };

const RATE_LIMIT_WINDOW_SECONDS = 60 * 60;

/** Per-hour ceilings. Deletion is stricter: it is destructive and password-guessable. */
export const ACCOUNT_ACTION_LIMITS: Record<AccountActionScopeType, LimitType> = {
  "account-export": { ip: 20, user: 5 },
  "account-delete": { ip: 10, user: 3 },
};

function hashIdentifier(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

async function consumeLimit(
  supabase: SupabaseClient<Database>,
  scope: string,
  identifier: string,
  maxRequests: number,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("consume_auth_email_rate_limit", {
    p_scope: scope,
    p_identifier_hash: hashIdentifier(identifier),
    p_max_requests: maxRequests,
    p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
  });

  if (error) throw error;
  return data;
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
