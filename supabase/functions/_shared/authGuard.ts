import { ErrorCodes, FunctionError } from "./errors.ts";
import { validateEnvVars } from "./validators.ts";

/**
 * Shared authentication guards for edge functions.
 *
 * Background: every function deployed here is reachable by anyone who has the
 * public anon key (which ships in the frontend). Supabase's gateway
 * `verify_jwt` only checks that *some* project JWT is present — the anon key
 * satisfies it — so it is NOT authorization. Real authorization must be
 * enforced in-function with these helpers.
 */

export interface AuthedUser {
  userId: string;
  userEmail: string;
  /** true when the caller presented the service-role key (server-to-server). */
  isServiceRole: boolean;
}

const SERVICE_IDENTITY: AuthedUser = {
  userId: "service-role",
  userEmail: "service@system.internal",
  isServiceRole: true,
};

function extractBearer(authHeader: string | null): string {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw ErrorCodes.INVALID_TOKEN();
  }
  return authHeader.slice("Bearer ".length).trim();
}

/** Constant-time string comparison to avoid leaking secrets via timing. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Require a real end user (or the service-role key for server-to-server).
 * Returns the resolved identity. Throws INVALID_TOKEN on failure.
 */
export async function requireUser(authHeader: string | null): Promise<AuthedUser> {
  const token = extractBearer(authHeader);

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (serviceRoleKey && timingSafeEqual(token, serviceRoleKey)) {
    return SERVICE_IDENTITY;
  }

  // The anon key is a valid project JWT but is NOT a user — reject it so it
  // cannot be used to impersonate an authenticated caller.
  const anonKey = validateEnvVars.supabaseAnonKey();
  if (timingSafeEqual(token, anonKey)) {
    throw ErrorCodes.INVALID_TOKEN();
  }

  const supabaseUrl = validateEnvVars.supabaseUrl();
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: anonKey },
  });

  if (!response.ok) {
    throw ErrorCodes.INVALID_TOKEN();
  }

  const user = await response.json();
  if (!user || !user.id) {
    throw ErrorCodes.INVALID_TOKEN();
  }

  return { userId: user.id, userEmail: user.email || "", isServiceRole: false };
}

/**
 * Require a privileged caller for internal/cron endpoints: either the
 * service-role key or a shared CRON_SECRET (sent as the bearer token or an
 * `x-cron-secret` header). Rejects ordinary users and the anon key.
 */
export function requireServiceRoleOrCron(req: Request): AuthedUser {
  const authHeader = req.headers.get("authorization");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const cronSecret = Deno.env.get("CRON_SECRET");

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : null;
  const headerSecret = req.headers.get("x-cron-secret");

  if (serviceRoleKey && token && timingSafeEqual(token, serviceRoleKey)) {
    return SERVICE_IDENTITY;
  }
  if (
    cronSecret &&
    ((token && timingSafeEqual(token, cronSecret)) ||
      (headerSecret && timingSafeEqual(headerSecret, cronSecret)))
  ) {
    return SERVICE_IDENTITY;
  }

  throw new FunctionError(401, "UNAUTHORIZED", "Privileged access required");
}
