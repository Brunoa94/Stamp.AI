// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ exchangeCodeForSession: vi.fn() }));

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: { exchangeCodeForSession: mocks.exchangeCodeForSession },
  }),
}));

import { GET } from "./route";

function callback(query: string) {
  return GET(new NextRequest(`https://stamp.ai/auth/callback?${query}`));
}

function redirectPath(response: Response): string {
  const url = new URL(response.headers.get("location")!);
  return `${url.pathname}${url.search}`;
}

describe("GET /auth/callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.exchangeCodeForSession.mockResolvedValue({ error: null });
  });

  it("sends a guest whose Google account already exists to a normal Google sign-in", async () => {
    const response = await callback(
      "next=/stamp&error=server_error&error_code=identity_already_exists&error_description=Identity+is+already+linked",
    );

    expect(redirectPath(response)).toBe("/auth/google-sign-in?next=%2Fstamp");
    expect(mocks.exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("shows the error page for other failures without a code", async () => {
    const response = await callback("error=access_denied&error_code=bad_oauth_state");

    expect(redirectPath(response)).toBe("/auth/auth-code-error");
  });

  it("exchanges the code and continues to next", async () => {
    const response = await callback("code=abc&next=/cart");

    expect(mocks.exchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(redirectPath(response)).toBe("/cart");
  });
});
