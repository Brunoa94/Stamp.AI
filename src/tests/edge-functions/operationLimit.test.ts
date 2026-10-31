import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSupabaseRest = vi.fn();
vi.mock("../../../supabase/functions/_shared/supabase.ts", () => ({
  supabaseRest: mockSupabaseRest,
}));

const { enforceCallerLimits } = await import(
  "../../../supabase/functions/_shared/operationLimit"
);

const LIMITS = {
  user: { limit: 20, seconds: 60 },
  anonymousUser: { limit: 5, seconds: 60 },
  anonymousIp: { limit: 30, seconds: 3600 },
};

function request(ip?: string): Request {
  return new Request("http://localhost", {
    method: "POST",
    headers: ip ? { "x-forwarded-for": ip } : {},
  });
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Every RPC call as [rpc name, body]. */
function rpcCalls(): Array<[string, Record<string, unknown>]> {
  return mockSupabaseRest.mock.calls.map(([path, , body]) => [path, body]);
}

describe("enforceCallerLimits", () => {
  beforeEach(() => {
    mockSupabaseRest.mockReset();
    mockSupabaseRest.mockResolvedValue({ data: true, error: null });
  });

  it("takes only from today's per-user limit for a registered caller", async () => {
    await enforceCallerLimits(
      { userId: "user-1", isAnonymous: false },
      request("203.0.113.7"),
      "product-create",
      LIMITS,
    );

    expect(rpcCalls()).toEqual([
      [
        "rpc/consume_operation_limit",
        { p_user_id: "user-1", p_operation: "product-create", p_limit: 20, p_seconds: 60 },
      ],
    ]);
  });

  it("uses the anonymous per-user limit and the per-IP bucket for an anonymous caller", async () => {
    await enforceCallerLimits(
      { userId: "anon-1", isAnonymous: true },
      request("203.0.113.7, 10.0.0.1"),
      "product-create",
      LIMITS,
    );

    expect(rpcCalls()).toEqual([
      [
        "rpc/consume_operation_limit",
        { p_user_id: "anon-1", p_operation: "product-create", p_limit: 5, p_seconds: 60 },
      ],
      [
        "rpc/consume_operation_limit_key",
        {
          p_key: `ip:${await sha256Hex("203.0.113.7")}`,
          p_operation: "product-create",
          p_limit: 30,
          p_seconds: 3600,
        },
      ],
    ]);
  });

  it("never sends the raw IP to the database", async () => {
    await enforceCallerLimits(
      { userId: "anon-1", isAnonymous: true },
      request("203.0.113.7"),
      "image-upload",
      LIMITS,
    );

    expect(JSON.stringify(mockSupabaseRest.mock.calls)).not.toContain("203.0.113.7");
  });

  it("throws 429 RATE_LIMITED when the anonymous per-user limit is exhausted", async () => {
    mockSupabaseRest.mockResolvedValueOnce({ data: false, error: null });

    await expect(
      enforceCallerLimits(
        { userId: "anon-1", isAnonymous: true },
        request("203.0.113.7"),
        "product-create",
        LIMITS,
      ),
    ).rejects.toMatchObject({ status: 429, errorId: "RATE_LIMITED" });
  });

  it("throws 429 RATE_LIMITED when the per-IP limit is exhausted", async () => {
    mockSupabaseRest
      .mockResolvedValueOnce({ data: true, error: null })
      .mockResolvedValueOnce({ data: false, error: null });

    await expect(
      enforceCallerLimits(
        { userId: "anon-2", isAnonymous: true },
        request("203.0.113.7"),
        "product-create",
        LIMITS,
      ),
    ).rejects.toMatchObject({ status: 429, errorId: "RATE_LIMITED" });
  });

  it("counts anonymous requests without an IP header in one shared unknown bucket", async () => {
    await enforceCallerLimits(
      { userId: "anon-1", isAnonymous: true },
      request(),
      "payment-create",
      LIMITS,
    );

    expect(rpcCalls()[1]).toEqual([
      "rpc/consume_operation_limit_key",
      {
        p_key: `ip:${await sha256Hex("unknown")}`,
        p_operation: "payment-create",
        p_limit: 30,
        p_seconds: 3600,
      },
    ]);
  });

  it("throws 503 when the limit store is unavailable", async () => {
    mockSupabaseRest.mockResolvedValueOnce({ data: null, error: "down" });

    await expect(
      enforceCallerLimits(
        { userId: "user-1", isAnonymous: false },
        request("203.0.113.7"),
        "product-create",
        LIMITS,
      ),
    ).rejects.toMatchObject({ status: 503, errorId: "RATE_LIMIT_UNAVAILABLE" });
  });
});
