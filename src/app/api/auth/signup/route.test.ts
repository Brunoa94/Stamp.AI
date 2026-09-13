import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  updateUserById: vi.fn(),
  generateLink: vi.fn(),
  sendBrevoEmail: vi.fn(),
  isAuthEmailRequestAllowed: vi.fn(),
  verifyCaptchaForAction: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    rpc: mocks.rpc,
    auth: {
      admin: {
        generateLink: mocks.generateLink,
        updateUserById: mocks.updateUserById,
      },
    },
  }),
}));

vi.mock("@/lib/security/authEmailProtection", () => ({
  isAuthEmailRequestAllowed: mocks.isAuthEmailRequestAllowed,
}));

vi.mock("@/lib/security/captcha/verify", () => ({
  verifyCaptchaForAction: mocks.verifyCaptchaForAction,
}));

vi.mock("@/lib/email/brevo", () => ({
  sendBrevoEmail: mocks.sendBrevoEmail,
}));

vi.mock("@/lib/observability/errorCapture", () => ({
  captureError: vi.fn(),
}));

import { POST } from "./route";

function request() {
  return new NextRequest("https://attacker.example/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      email: "user@example.com",
      firstName: "Test",
      lastName: "User",
    }),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    delete process.env.RECAPTCHA_SECRET_KEY;
    mocks.isAuthEmailRequestAllowed.mockResolvedValue(true);
    mocks.verifyCaptchaForAction.mockResolvedValue({ success: true });
    mocks.rpc.mockResolvedValue({ data: null, error: null });
  });

  it("does not reveal that an email is already registered", async () => {
    mocks.generateLink.mockResolvedValue({
      data: { properties: null, user: null },
      error: { code: "email_exists", message: "Email already registered" },
    });

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true });
    expect(mocks.sendBrevoEmail).not.toHaveBeenCalled();
  });

  it("rejects a distributed rate-limit violation before creating a user", async () => {
    mocks.isAuthEmailRequestAllowed.mockResolvedValue(false);

    const response = await POST(request());

    expect(response.status).toBe(429);
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.generateLink).not.toHaveBeenCalled();
  });

  it("rejects signup when server-side CAPTCHA verification fails", async () => {
    process.env.RECAPTCHA_SECRET_KEY = "secret";
    mocks.verifyCaptchaForAction.mockResolvedValue({ success: false });

    const response = await POST(request());

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: "CAPTCHA_VERIFICATION_FAILED",
    });
    expect(mocks.isAuthEmailRequestAllowed).not.toHaveBeenCalled();
    expect(mocks.generateLink).not.toHaveBeenCalled();
  });

  it("never puts the request origin in the confirmation email", async () => {
    mocks.generateLink.mockResolvedValue({
      data: {
        properties: { hashed_token: "secret-token" },
        user: { user_metadata: {} },
      },
      error: null,
    });
    mocks.sendBrevoEmail.mockResolvedValue(true);

    const response = await POST(request());

    expect(response.status).toBe(200);
    const [{ htmlContent }] = mocks.sendBrevoEmail.mock.calls[0];
    expect(htmlContent).toContain("stamp.ai");
    expect(htmlContent).not.toContain("attacker.example");
    expect(htmlContent).toContain("reset-password%3Fonboarding%3Dtrue");
    expect(mocks.generateLink.mock.calls[0][0].password).not.toBe(
      "password123",
    );
  });

  it("invalidates a pre-registered password before resending confirmation", async () => {
    mocks.rpc.mockResolvedValue({
      data: {
        id: "123e4567-e89b-42d3-a456-426614174000",
        email: "user@example.com",
        first_name: "Test",
      },
      error: null,
    });
    mocks.updateUserById.mockResolvedValue({ error: null });
    mocks.generateLink.mockResolvedValue({
      data: {
        properties: { hashed_token: "secret-token" },
        user: { user_metadata: {} },
      },
      error: null,
    });
    mocks.sendBrevoEmail.mockResolvedValue(true);

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(mocks.updateUserById).toHaveBeenCalledWith(
      "123e4567-e89b-42d3-a456-426614174000",
      expect.objectContaining({ password: expect.any(String) }),
    );
  });
});
