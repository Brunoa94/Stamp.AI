import { supabaseRest } from "./supabase.ts";
import { FunctionError } from "./errors.ts";
/** Database-backed counters apply to direct Edge calls across all replicas. */
export async function enforceOperationLimit(userId: string, operation: string, limit: number, seconds: number): Promise<void> {
  const result = await supabaseRest<boolean>("rpc/consume_operation_limit", "POST", {
    p_user_id: userId, p_operation: operation, p_limit: limit, p_seconds: seconds,
  });
  if (result.error) throw new FunctionError(503, "RATE_LIMIT_UNAVAILABLE", "Please try again later");
  if (result.data !== true) throw new FunctionError(429, "RATE_LIMITED", "Too many requests; please try again later");
}
