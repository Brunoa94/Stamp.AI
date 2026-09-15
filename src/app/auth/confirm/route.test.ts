import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@supabase/ssr", () => ({
  createServerClient: (
    _url: string,
    _key: string,
    config: {
      cookies: {
        setAll: (
          cookies: Array<{
            name: string;
            value: string;
            options: Record<string, unknown>;
          }>,
        ) => void;
      };
    },
  ) => ({
    auth: {
      verifyOtp: async () => {
        config.cookies.setAll([{
          name: "sb-session",
          value: "session-value",
          options: {
            path: "/",
            sameSite: "lax",
            secure: true,
            maxAge: 3600,
          },
        }]);
        return { error: null };
      },
    },
  }),
}));

import { GET } from "./route";

describe("GET /auth/confirm", () => {
  it("redirects to the configured site and preserves auth cookie options", async () => {
    const response = await GET(new NextRequest(
      "https://attacker.example/auth/confirm?token_hash=token&type=signup&next=/stamp",
    ));

    expect(response.headers.get("location")).toBe("https://stamp.ai/stamp");
    const cookie = response.headers.get("set-cookie");
    expect(cookie).toContain("sb-session=session-value");
    expect(cookie).toContain("Max-Age=3600");
    expect(cookie).toContain("SameSite=lax");
    expect(cookie).toContain("Secure");
  });
});
