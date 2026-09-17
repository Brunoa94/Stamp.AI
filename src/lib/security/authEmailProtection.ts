import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/shared/types/database.types";
import { getClientIdentifier } from "@/lib/security/rate-limiter/utils";
import type { NextRequest } from "next/server";

const RATE_LIMIT_WINDOW_SECONDS = 60 * 60;
const IP_LIMIT = 10;
const EMAIL_LIMIT = 3;

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

export async function isAuthEmailRequestAllowed(
  supabase: SupabaseClient<Database>,
  request: NextRequest,
  scope: "signup" | "resend-confirmation" | "login",
  email: string,
): Promise<boolean> {
  const ipAllowed = await consumeLimit(
    supabase,
    `${scope}:ip`,
    getClientIdentifier(request),
    IP_LIMIT,
  );
  if (!ipAllowed) return false;

  const emailAllowed = await consumeLimit(
    supabase,
    `${scope}:email`,
    email.trim().toLowerCase(),
    EMAIL_LIMIT,
  );

  return ipAllowed && emailAllowed;
}
