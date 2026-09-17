import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

import { POST } from "./route";

function request(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("https://stamp.ai/api/sync-blueprint", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json", ...headers },
  });
}

describe("POST /api/sync-blueprint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    process.env.ADMIN_API_SECRET = "admin-secret-value";
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ success: true, blueprint_id: 12 }), {
        status: 200,
      }),
    );
  });

  it("rejects requests without the admin secret", async () => {
    const response = await POST(request({ blueprint_id: 12 }));

    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a wrong admin secret", async () => {
    const response = await POST(
      request({ blueprint_id: 12 }, { authorization: "Bearer nope" }),
    );

    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fails closed when ADMIN_API_SECRET is not configured", async () => {
    delete process.env.ADMIN_API_SECRET;

    const response = await POST(
      request({ blueprint_id: 12 }, { authorization: "Bearer admin-secret-value" }),
    );

    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("validates blueprint_id before calling the edge function", async () => {
    const response = await POST(
      request({ blueprint_id: "12" }, { authorization: "Bearer admin-secret-value" }),
    );

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards an authorised request to the edge function with the service key", async () => {
    const response = await POST(
      request(
        { blueprint_id: 12, print_provider_id: 5 },
        { authorization: "Bearer admin-secret-value" },
      ),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, blueprint_id: 12 });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://project.supabase.co/functions/v1/sync-blueprint",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer service-role-key",
        }),
        body: JSON.stringify({ blueprint_id: 12, print_provider_id: 5 }),
      }),
    );
  });
});
