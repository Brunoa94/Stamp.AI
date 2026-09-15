import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import {
  ACCOUNT_ACTION_LIMITS,
  isAccountActionAllowed,
} from "./accountActionProtection";

const rpc = vi.fn();
const supabase = { rpc } as unknown as SupabaseClient<Database>;

function request() {
  return new NextRequest("https://stamp.ai/api/account/delete", {
    method: "POST",
    headers: { "x-forwarded-for": "203.0.113.5" },
  });
}

describe("isAccountActionAllowed", () => {
  beforeEach(() => {
    rpc.mockReset();
    process.env.VERCEL = "1";
  });

  it("consumes the ip bucket then the user bucket with hashed identifiers", async () => {
    rpc.mockResolvedValue({ data: true, error: null });

    await expect(
      isAccountActionAllowed(supabase, request(), "account-delete", "user-1"),
    ).resolves.toBe(true);

    expect(rpc).toHaveBeenCalledTimes(2);
    const [ipCall, userCall] = rpc.mock.calls;
    expect(ipCall[0]).toBe("consume_auth_email_rate_limit");
    expect(ipCall[1]).toMatchObject({
      p_scope: "account-delete:ip",
      p_max_requests: ACCOUNT_ACTION_LIMITS["account-delete"].ip,
      p_window_seconds: 3600,
    });
    expect(ipCall[1].p_identifier_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(ipCall[1].p_identifier_hash).not.toContain("203.0.113.5");
    expect(userCall[1]).toMatchObject({
      p_scope: "account-delete:user",
      p_max_requests: ACCOUNT_ACTION_LIMITS["account-delete"].user,
    });
    expect(userCall[1].p_identifier_hash).not.toBe("user-1");
  });

  it("short-circuits when the ip bucket is exhausted", async () => {
    rpc.mockResolvedValueOnce({ data: false, error: null });

    await expect(
      isAccountActionAllowed(supabase, request(), "account-export", "user-1"),
    ).resolves.toBe(false);
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it("denies when the user bucket is exhausted", async () => {
    rpc
      .mockResolvedValueOnce({ data: true, error: null })
      .mockResolvedValueOnce({ data: false, error: null });

    await expect(
      isAccountActionAllowed(supabase, request(), "account-export", "user-1"),
    ).resolves.toBe(false);
  });

  it("propagates rpc errors so the route fails closed", async () => {
    rpc.mockResolvedValue({ data: null, error: new Error("db down") });

    await expect(
      isAccountActionAllowed(supabase, request(), "account-delete", "user-1"),
    ).rejects.toThrow("db down");
  });

  it("uses stricter limits for deletion than for export", () => {
    expect(ACCOUNT_ACTION_LIMITS["account-delete"].user).toBeLessThan(
      ACCOUNT_ACTION_LIMITS["account-export"].user,
    );
  });
});
