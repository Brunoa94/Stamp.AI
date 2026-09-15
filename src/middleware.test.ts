import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  checkCombinedRateLimit: vi.fn(),
  checkUserRateLimit: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({ auth: { getUser: mocks.getUser } }),
}));

vi.mock("@/lib/security/rate-limiter/check", () => ({
  checkCombinedRateLimit: mocks.checkCombinedRateLimit,
  checkUserRateLimit: mocks.checkUserRateLimit,
}));

import { middleware } from "./middleware";
import { RATE_LIMIT_CONFIGS } from "@/lib/security/rate-limiter/configs";

const allowed = {
  isLimited: false,
  remaining: 5,
  resetTime: Date.now() + 60_000,
  retryAfter: 0,
  headers: { "X-RateLimit-Remaining": "5" },
};

const limited = {
  isLimited: true,
  remaining: 0,
  resetTime: Date.now() + 60_000,
  retryAfter: 42,
  headers: { "X-RateLimit-Remaining": "0", "Retry-After": "42" },
};

function request(path: string) {
  return new NextRequest(`https://stamp.ai${path}`, { method: "POST" });
}

describe("middleware rate limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
    mocks.checkCombinedRateLimit.mockReturnValue(allowed);
    mocks.checkUserRateLimit.mockReturnValue(allowed);
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
  });

  it("applies the IP limit before resolving the session", async () => {
    mocks.checkCombinedRateLimit.mockReturnValue(limited);

    const response = await middleware(request("/api/generate-image"));

    expect(response.status).toBe(429);
    expect(mocks.getUser).not.toHaveBeenCalled();
    expect(mocks.checkUserRateLimit).not.toHaveBeenCalled();
  });

  it("applies the per-user limit with the resolved session user id", async () => {
    await middleware(request("/api/generate-image"));

    expect(mocks.getUser).toHaveBeenCalledTimes(1);
    expect(mocks.checkUserRateLimit).toHaveBeenCalledWith(
      "user-1",
      "/api/generate-image",
      RATE_LIMIT_CONFIGS.imageGeneration,
    );
  });

  it("returns 429 with rate-limit headers when the user bucket is exhausted", async () => {
    mocks.checkUserRateLimit.mockReturnValue(limited);

    const response = await middleware(request("/api/generate-image"));

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("42");
    expect(await response.json()).toMatchObject({ retryAfter: 42 });
  });

  it("skips the user bucket when there is no session", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });

    const response = await middleware(request("/api/generate-image"));

    expect(response.status).toBe(200);
    expect(mocks.checkUserRateLimit).not.toHaveBeenCalled();
  });

  it("does not rate limit static pages at all", async () => {
    await middleware(request("/about"));

    expect(mocks.checkCombinedRateLimit).not.toHaveBeenCalled();
    expect(mocks.checkUserRateLimit).not.toHaveBeenCalled();
  });
});
