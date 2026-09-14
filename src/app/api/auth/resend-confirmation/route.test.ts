import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  updateUserById: vi.fn(),
  generateLink: vi.fn(),
  sendBrevoEmail: vi.fn(),
  isAuthEmailRequestAllowed: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    rpc: mocks.rpc,
    auth: {
      admin: {
        updateUserById: mocks.updateUserById,
        generateLink: mocks.generateLink,
      },
    },
  }),
}));

vi.mock("@/lib/security/authEmailProtection", () => ({
  isAuthEmailRequestAllowed: mocks.isAuthEmailRequestAllowed,
}));

vi.mock("@/lib/email/brevo", () => ({
  sendBrevoEmail: mocks.sendBrevoEmail,
}));

vi.mock("@/lib/observability/errorCapture", () => ({
  captureError: vi.fn(),
}));

import { POST } from "./route";

function request(email: string) {
  return new NextRequest("https://attacker.example/api/auth/resend-confirmation", {
    method: "POST",
    body: JSON.stringify({ email }),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/auth/resend-confirmation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    delete process.env.RECAPTCHA_SECRET_KEY;
    mocks.isAuthEmailRequestAllowed.mockResolvedValue(true);
  });

  it("does not generate a magic link for an unknown email", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: null });

    const response = await POST(request("missing@example.com"));

    expect(response.status).toBe(200);
    expect(mocks.generateLink).not.toHaveBeenCalled();
    expect(mocks.sendBrevoEmail).not.toHaveBeenCalled();
  });

  it("uses the configured site origin and Supabase verification type", async () => {
    mocks.rpc.mockResolvedValue({
      data: {
        id: "123e4567-e89b-42d3-a456-426614174000",
        email: "user@example.com",
        first_name: null,
      },
      error: null,
    });
    mocks.updateUserById.mockResolvedValue({ error: null });
    mocks.generateLink.mockResolvedValue({
      data: {
        user: { user_metadata: {} },
        properties: {
          hashed_token: "secret-token",
          verification_type: "magiclink",
        },
      },
      error: null,
    });
    mocks.sendBrevoEmail.mockResolvedValue(true);

    const response = await POST(request("user@example.com"));

    expect(response.status).toBe(200);
    const [{ htmlContent }] = mocks.sendBrevoEmail.mock.calls[0];
    expect(htmlContent).toContain("stamp.ai");
    expect(htmlContent).not.toContain("attacker.example");
    expect(htmlContent).toContain("type&#x3D;magiclink");
    expect(htmlContent).toContain("reset-password%3Fonboarding%3Dtrue");
    expect(mocks.updateUserById).toHaveBeenCalledWith(
      "123e4567-e89b-42d3-a456-426614174000",
      { password: expect.any(String) },
    );
  });
});
