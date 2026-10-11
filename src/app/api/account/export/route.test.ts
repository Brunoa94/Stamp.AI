import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  rpc: vi.fn(),
  isAccountActionAllowed: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: mocks.getUser },
    rpc: mocks.rpc,
  }),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({ rpc: vi.fn() }),
}));

vi.mock("@/lib/security/accountActionProtection", () => ({
  isAccountActionAllowed: mocks.isAccountActionAllowed,
}));

vi.mock("@/lib/observability/errorCapture", () => ({
  captureError: vi.fn(),
}));

import { POST } from "./route";

function request() {
  return new NextRequest("https://stamp.ai/api/account/export", { method: "POST" });
}

const user = { id: "11111111-1111-4111-8111-111111111111", email: "user@example.com" };

describe("POST /api/account/export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    mocks.getUser.mockResolvedValue({ data: { user }, error: null });
    mocks.isAccountActionAllowed.mockResolvedValue(true);
    mocks.rpc.mockResolvedValue({ data: { user_id: user.id, orders: [] }, error: null });
  });

  it("rejects anonymous requests", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });

    const response = await POST(request());

    expect(response.status).toBe(401);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("rate limits export requests per user", async () => {
    mocks.isAccountActionAllowed.mockResolvedValue(false);

    const response = await POST(request());

    expect(response.status).toBe(429);
    expect(mocks.isAccountActionAllowed).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      "account-export",
      user.id,
    );
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("returns the export as a JSON attachment from the user-scoped rpc", async () => {
    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(mocks.rpc).toHaveBeenCalledWith("export_own_data");
    expect(response.headers.get("content-disposition")).toMatch(
      /^attachment; filename="stamp-ai-data-export-\d{4}-\d{2}-\d{2}\.json"$/,
    );
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ user_id: user.id, orders: [] });
  });

  it("fails closed when the rpc errors", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: new Error("boom") });

    const response = await POST(request());

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "ACCOUNT_EXPORT_FAILED" });
  });
});
