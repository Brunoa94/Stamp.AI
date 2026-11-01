import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthService } from "./authService";
import { createClient } from "@/lib/supabase/client";

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

function mockAuth(auth: Record<string, ReturnType<typeof vi.fn>>) {
  vi.mocked(createClient).mockReturnValue(
    { auth } as unknown as ReturnType<typeof createClient>,
  );
}

describe("AuthService.signInAsGuest", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("starts an anonymous session and returns the anonymous user", async () => {
    const signInAnonymously = vi.fn().mockResolvedValue({
      data: {
        user: {
          id: "anon-1",
          aud: "authenticated",
          app_metadata: {},
          user_metadata: {},
          created_at: "2026-10-01T00:00:00Z",
          is_anonymous: true,
        },
        session: {},
      },
      error: null,
    });
    mockAuth({ signInAnonymously });

    const user = await AuthService.signInAsGuest();

    expect(signInAnonymously).toHaveBeenCalledTimes(1);
    expect(user).toMatchObject({ id: "anon-1", is_anonymous: true });
  });

  it("throws when Supabase refuses the anonymous sign-in", async () => {
    mockAuth({
      signInAnonymously: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: { name: "AuthApiError", message: "Anonymous sign-ins are disabled", status: 422 },
      }),
    });

    await expect(AuthService.signInAsGuest()).rejects.toBeDefined();
  });
});
