import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: mocks.getUser, getSession: mocks.getSession },
  }),
}));

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

import { POST } from "./route";

describe("POST /api/get-catalog-blueprints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mocks.getSession.mockResolvedValue({
      data: { session: { access_token: "user-access-token" } },
    });
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ success: true, blueprints: [] }), {
        status: 200,
      }),
    );
  });

  it("rejects unauthenticated callers without calling the edge function", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });

    const response = await POST();

    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards the caller's own access token to the edge function", async () => {
    const response = await POST();

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://project.supabase.co/functions/v1/get-catalog-blueprints",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer user-access-token",
        }),
      }),
    );
  });

  it("propagates edge function errors", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: "PRINTIFY_API_ERROR" }), {
        status: 502,
      }),
    );

    const response = await POST();

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "PRINTIFY_API_ERROR" });
  });
});
