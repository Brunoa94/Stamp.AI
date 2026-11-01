import { supabaseRest } from "./supabase.ts";
import { FunctionError } from "./errors.ts";
import { clientIp } from "./authGuard.ts";

export type LimitT = { limit: number; seconds: number };

export type CallerLimitsT = {
  /** A registered user's per-user limit. */
  user: LimitT;
  /** An anonymous (guest) user's per-user limit. */
  anonymousUser: LimitT;
  /** Shared by every anonymous user on the same IP, since a guest can get a new uid on each sign-in. */
  anonymousIp: LimitT;
};

type LimitedCallerT = { userId: string; isAnonymous: boolean };

const MINUTE = 60;
const HOUR = 3600;

/** Limits per operation. `payment-create` is shared by the three payment functions. */
export const OPERATION_LIMITS: Record<"image-upload" | "product-create" | "payment-create", CallerLimitsT> = {
  "image-upload": {
    user: { limit: 60, seconds: MINUTE },
    anonymousUser: { limit: 20, seconds: MINUTE },
    anonymousIp: { limit: 60, seconds: HOUR },
  },
  "product-create": {
    user: { limit: 20, seconds: MINUTE },
    anonymousUser: { limit: 5, seconds: MINUTE },
    anonymousIp: { limit: 30, seconds: HOUR },
  },
  "payment-create": {
    user: { limit: 30, seconds: MINUTE },
    anonymousUser: { limit: 10, seconds: MINUTE },
    anonymousIp: { limit: 30, seconds: HOUR },
  },
};

function assertAllowed(result: { data: boolean | null; error: unknown }): void {
  if (result.error) throw new FunctionError(503, "RATE_LIMIT_UNAVAILABLE", "Please try again later");
  if (result.data !== true) throw new FunctionError(429, "RATE_LIMITED", "Too many requests; please try again later");
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Database-backed counters apply to direct Edge calls across all replicas. */
export async function enforceOperationLimit(userId: string, operation: string, limit: number, seconds: number): Promise<void> {
  assertAllowed(await supabaseRest<boolean>("rpc/consume_operation_limit", "POST", {
    p_user_id: userId, p_operation: operation, p_limit: limit, p_seconds: seconds,
  }));
}

/**
 * Registered callers take from their per-user limit. Anonymous callers take
 * from a tighter per-user limit and from a per-IP bucket keyed by a hash of
 * the IP (the raw IP is never stored).
 */
export async function enforceCallerLimits(
  caller: LimitedCallerT,
  req: Request,
  operation: string,
  limits: CallerLimitsT,
): Promise<void> {
  if (!caller.isAnonymous) {
    await enforceOperationLimit(caller.userId, operation, limits.user.limit, limits.user.seconds);
    return;
  }
  await enforceOperationLimit(caller.userId, operation, limits.anonymousUser.limit, limits.anonymousUser.seconds);
  assertAllowed(await supabaseRest<boolean>("rpc/consume_operation_limit_key", "POST", {
    p_key: `ip:${await sha256Hex(clientIp(req))}`,
    p_operation: operation,
    p_limit: limits.anonymousIp.limit,
    p_seconds: limits.anonymousIp.seconds,
  }));
}
