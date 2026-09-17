import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  maybeSingle: vi.fn(),
  eq: vi.fn(),
  select: vi.fn(),
  from: vi.fn(),
}));

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({ from: mocks.from }),
}));

vi.mock("@/lib/observability/errorCapture", () => ({
  captureError: vi.fn(),
}));

import { POST } from "./route";

function request(body: unknown) {
  return new NextRequest("https://stamp.ai/api/validate-promocode", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

const row = {
  promocode_id: "p1",
  code: "SAVE10",
  type: "percentage",
  value: 10,
  created_at: "2026-01-01T00:00:00Z",
  expires_at: null,
  max_uses: null,
  used_count: 0,
  is_active: true,
};

describe("POST /api/validate-promocode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.maybeSingle.mockResolvedValue({ data: row, error: null });
    mocks.eq.mockReturnValue({ maybeSingle: mocks.maybeSingle });
    mocks.select.mockReturnValue({ eq: mocks.eq });
    mocks.from.mockReturnValue({ select: mocks.select });
  });

  it("reads promocodes with the service client and normalises the code", async () => {
    const response = await POST(request({ code: " save10 ", subtotal: 50 }));

    expect(response.status).toBe(200);
    expect(mocks.from).toHaveBeenCalledWith("promocodes");
    expect(mocks.eq).toHaveBeenCalledWith("code", "SAVE10");
    expect(await response.json()).toMatchObject({
      isValid: true,
      appliedPromo: { code: "SAVE10", discountValue: 5 },
    });
  });

  it("returns invalidPromoCode for an unknown code without leaking details", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: null, error: null });

    const response = await POST(request({ code: "NOPE", subtotal: 50 }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      isValid: false,
      message: "invalidPromoCode",
      appliedPromo: null,
    });
  });

  it("rejects expired and exhausted codes", async () => {
    mocks.maybeSingle.mockResolvedValue({
      data: { ...row, expires_at: "2000-01-01T00:00:00Z" },
      error: null,
    });
    expect((await (await POST(request({ code: "SAVE10", subtotal: 50 }))).json()).message).toBe(
      "promoCodeExpired",
    );

    mocks.maybeSingle.mockResolvedValue({
      data: { ...row, max_uses: 1, used_count: 1 },
      error: null,
    });
    expect((await (await POST(request({ code: "SAVE10", subtotal: 50 }))).json()).message).toBe(
      "promoCodeLimitReached",
    );
  });

  it("rejects an empty code and an invalid subtotal before querying", async () => {
    const empty = await POST(request({ code: "  ", subtotal: 50 }));
    expect((await empty.json()).message).toBe("enterPromoCode");

    const badSubtotal = await POST(request({ code: "SAVE10", subtotal: "50" }));
    expect((await badSubtotal.json()).message).toBe("cartTotalInvalid");

    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("returns 500 with a generic message on a database error", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: null, error: { message: "boom" } });

    const response = await POST(request({ code: "SAVE10", subtotal: 50 }));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      isValid: false,
      message: "validationFailed",
      appliedPromo: null,
    });
  });
});
