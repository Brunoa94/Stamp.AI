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

describe("AuthService guest identity", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns the anonymous session's token, user id and token expiry", async () => {
    mockAuth({
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            access_token: "guest-jwt",
            expires_at: 1_793_530_000,
            user: { id: "anon-1", is_anonymous: true },
          },
        },
        error: null,
      }),
    });

    await expect(AuthService.getAnonymousSession()).resolves.toEqual({
      accessToken: "guest-jwt",
      userId: "anon-1",
      expiresAt: 1_793_530_000_000,
    });
  });

  it("returns null when the session belongs to a registered user", async () => {
    mockAuth({
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: "jwt", user: { id: "user-1", is_anonymous: false } } },
        error: null,
      }),
    });

    await expect(AuthService.getAnonymousSession()).resolves.toBeNull();
  });

  it("claims the guest's products with the caller's token and the guest token in the body", async () => {
    mockAuth({
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: "account-jwt", user: { id: "user-1" } } },
        error: null,
      }),
    });
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, products: 1, images: 1 }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await AuthService.claimGuestProducts("guest-jwt");

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/functions/v1/claim-guest-products");
    expect(init.headers.Authorization).toBe("Bearer account-jwt");
    expect(JSON.parse(init.body)).toEqual({ anonymousAccessToken: "guest-jwt" });
  });

  it("throws when the claim is refused", async () => {
    mockAuth({
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: "account-jwt", user: { id: "user-1" } } },
        error: null,
      }),
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "NOT_A_GUEST" }), { status: 403 })),
    );

    await expect(AuthService.claimGuestProducts("guest-jwt")).rejects.toBeDefined();
  });

  it("links Google to the anonymous user instead of signing in", async () => {
    const linkIdentity = vi.fn().mockResolvedValue({ data: { url: "https://google" }, error: null });
    const signInWithOAuth = vi.fn();
    mockAuth({ linkIdentity, signInWithOAuth });

    await AuthService.linkGoogleIdentity();

    expect(linkIdentity).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "google",
        options: { redirectTo: expect.stringContaining("/auth/callback?next=/stamp") },
      }),
    );
    expect(signInWithOAuth).not.toHaveBeenCalled();
  });
});
