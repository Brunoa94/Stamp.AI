import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  isAuthEmailRequestAllowed: vi.fn(),
  verifyCaptchaForAction: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mocks.signInWithPassword,
    },
  }),
}));

vi.mock("@/lib/security/authEmailProtection", () => ({
  isAuthEmailRequestAllowed: mocks.isAuthEmailRequestAllowed,
}));

vi.mock("@/lib/security/captcha/verify", () => ({
  verifyCaptchaForAction: mocks.verifyCaptchaForAction,
}));

vi.mock("@/lib/observability/errorCapture", () => ({
  captureError: vi.fn(),
}));

import { POST } from "./route";

function request(body = {}) {
  return new NextRequest("https://stamp.ai/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "user@example.com",
      password: "password123",
      ...body,
    }),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    delete process.env.RECAPTCHA_SECRET_KEY;
    mocks.isAuthEmailRequestAllowed.mockResolvedValue(true);
    mocks.verifyCaptchaForAction.mockResolvedValue({ success: true });
  });

  it("rejects login when server-side CAPTCHA verification fails", async () => {
    process.env.RECAPTCHA_SECRET_KEY = "secret";
    mocks.verifyCaptchaForAction.mockResolvedValue({ success: false });

    const response = await POST(request());

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: "CAPTCHA_VERIFICATION_FAILED",
    });
    expect(mocks.isAuthEmailRequestAllowed).not.toHaveBeenCalled();
    expect(mocks.signInWithPassword).not.toHaveBeenCalled();
  });

  it("rejects login when rate limit is exceeded", async () => {
    mocks.isAuthEmailRequestAllowed.mockResolvedValue(false);

    const response = await POST(request());

    expect(response.status).toBe(429);
    expect(mocks.signInWithPassword).not.toHaveBeenCalled();
  });

  it("returns error for invalid credentials", async () => {
    mocks.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { code: "invalid_credentials", message: "Invalid login credentials" },
    });

    const response = await POST(request());

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: "INVALID_CREDENTIALS",
    });
  });

  it("returns error when email is not confirmed", async () => {
    mocks.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { code: "email_not_confirmed", message: "Email not confirmed" },
    });

    const response = await POST(request());

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: "EMAIL_NOT_CONFIRMED",
    });
  });

  it("returns session tokens on successful login", async () => {
    mocks.signInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: "user-123",
          email: "user@example.com",
          email_confirmed_at: "2026-01-01T00:00:00Z",
          user_metadata: { first_name: "Test", last_name: "User" },
        },
        session: {
          access_token: "access-token",
          refresh_token: "refresh-token",
          expires_at: 1234567890,
        },
      },
      error: null,
    });

    const response = await POST(request());

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.session.accessToken).toBe("access-token");
    expect(result.session.refreshToken).toBe("refresh-token");
    expect(result.user.email).toBe("user@example.com");
  });

  it("enforces email confirmation even if Supabase returns a user", async () => {
    mocks.signInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: "user-123",
          email: "user@example.com",
          email_confirmed_at: null, // Not confirmed
          user_metadata: {},
        },
        session: {
          access_token: "access-token",
          refresh_token: "refresh-token",
          expires_at: 1234567890,
        },
      },
      error: null,
    });

    const response = await POST(request());

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: "EMAIL_NOT_CONFIRMED",
    });
  });
});
