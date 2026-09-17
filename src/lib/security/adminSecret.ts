import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

/**
 * Guard for operator-only API routes (catalog sync, maintenance tasks).
 *
 * The caller must send `Authorization: Bearer <ADMIN_API_SECRET>`. The route
 * fails closed when the secret is not configured so a missing env var can
 * never open the endpoint.
 */
export type AdminAuthResultT = "ok" | "unconfigured" | "unauthorized";

function secretsMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function checkAdminSecret(request: NextRequest): AdminAuthResultT {
  const expected = process.env.ADMIN_API_SECRET;
  if (!expected) return "unconfigured";

  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ")) return "unauthorized";

  const provided = header.slice("Bearer ".length).trim();
  return secretsMatch(provided, expected) ? "ok" : "unauthorized";
}
