import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  order: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: mocks.getUser },
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            order: () => ({ order: mocks.order }),
          }),
        }),
      }),
    }),
  }),
}));

import { POST } from "./route";

function request(body: unknown) {
  return new NextRequest("https://stamp.ai/api/get-blueprint-variants", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/get-blueprint-variants", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mocks.order.mockResolvedValue({
      data: [
        { printify_variant_id: 2, color: "Black", size: "M", price_cents: 1000, is_available: true },
        { printify_variant_id: 1, color: "Black", size: "S", price_cents: 1000, is_available: true },
        { printify_variant_id: 3, color: "Default", size: "XL", price_cents: 1000, is_available: true },
      ],
      error: null,
    });
  });

  it("rejects unauthenticated callers", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });

    const response = await POST(request({ blueprint_id: 12 }));

    expect(response.status).toBe(401);
    expect(mocks.order).not.toHaveBeenCalled();
  });

  it("validates blueprint_id", async () => {
    const response = await POST(request({ blueprint_id: "abc" }));

    expect(response.status).toBe(400);
    expect(mocks.order).not.toHaveBeenCalled();
  });

  it("returns variants, colors and ordered sizes for a signed-in user", async () => {
    const response = await POST(request({ blueprint_id: 12 }));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.variants).toHaveLength(3);
    expect(body.colors).toEqual(["Black"]);
    expect(body.sizes).toEqual(["S", "M", "XL"]);
    expect(body.printProviderId).toBe(99);
  });

  it("returns 500 when the database read fails", async () => {
    mocks.order.mockResolvedValue({ data: null, error: { message: "boom" } });

    const response = await POST(request({ blueprint_id: 12 }));

    expect(response.status).toBe(500);
  });
});
