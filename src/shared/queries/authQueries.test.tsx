import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useEnsureGuestSession,
  useGoogleSignIn,
  useIsAuthenticated,
  useLogin,
  useRegister,
} from "./authQueries";
import { GuestClaimStorageService } from "@/shared/services/guestClaimStorageService";
import { AuthService } from "@/shared/services/authService";

vi.mock("@/shared/services/authService");
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));
vi.mock("@/shared/hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({ handleError: vi.fn(), handleSuccess: vi.fn() }),
}));

describe("authQueries", () => {
  let queryClient: QueryClient;

  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  describe("useIsAuthenticated", () => {
    it("is false for an anonymous (guest) session", async () => {
      vi.mocked(AuthService.getUser).mockResolvedValue({
        id: "anon-1",
        email: "",
        created_at: "2026-10-01T00:00:00Z",
        is_anonymous: true,
      });

      const { result } = renderHook(() => useIsAuthenticated(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("is true for a registered user", async () => {
      vi.mocked(AuthService.getUser).mockResolvedValue({
        id: "user-1",
        email: "a@b.c",
        created_at: "2026-10-01T00:00:00Z",
        is_anonymous: false,
      });

      const { result } = renderHook(() => useIsAuthenticated(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe("useEnsureGuestSession", () => {
    const anonymousUser = {
      id: "anon-1",
      email: "",
      created_at: "2026-10-01T00:00:00Z",
      is_anonymous: true,
    };

    it("returns the current user without signing in when there is a session", async () => {
      vi.mocked(AuthService.getUser).mockResolvedValue(anonymousUser);

      const { result } = renderHook(() => useEnsureGuestSession(), { wrapper });
      const user = await result.current();

      expect(user).toEqual(anonymousUser);
      expect(AuthService.signInAsGuest).not.toHaveBeenCalled();
    });

    it("signs in anonymously once when there is no session and caches the user", async () => {
      vi.mocked(AuthService.getUser).mockResolvedValue(null);
      vi.mocked(AuthService.signInAsGuest).mockResolvedValue(anonymousUser);

      const { result } = renderHook(() => useEnsureGuestSession(), { wrapper });
      const user = await result.current();

      expect(user).toEqual(anonymousUser);
      expect(AuthService.signInAsGuest).toHaveBeenCalledTimes(1);
      expect(queryClient.getQueryData(["auth", "user"])).toEqual(anonymousUser);
    });
  });

  describe("leaving a guest session", () => {
    const anonymousSession = { accessToken: "guest-jwt", userId: "anon-1" };

    beforeEach(() => {
      localStorage.clear();
    });

    it("useLogin remembers the anonymous session before signing in", async () => {
      vi.mocked(AuthService.getAnonymousSession).mockResolvedValue(anonymousSession);
      vi.mocked(AuthService.login).mockImplementation(async () => {
        expect(GuestClaimStorageService.read()).toEqual(anonymousSession);
        return { success: true, user: undefined, session: undefined };
      });
      const { result } = renderHook(() => useLogin(), { wrapper });

      await result.current.mutateAsync({ credentials: { email: "a@b.c", password: "secret123" } });

      expect(AuthService.login).toHaveBeenCalledTimes(1);
      expect(GuestClaimStorageService.read()).toEqual(anonymousSession);
    });

    it("useLogin does not remember anything for a visitor without a guest session", async () => {
      vi.mocked(AuthService.getAnonymousSession).mockResolvedValue(null);
      vi.mocked(AuthService.login).mockResolvedValue({ success: true });
      const { result } = renderHook(() => useLogin(), { wrapper });

      await result.current.mutateAsync({ credentials: { email: "a@b.c", password: "secret123" } });

      expect(GuestClaimStorageService.read()).toBeNull();
    });

    it("useRegister remembers the anonymous session for when the account is confirmed", async () => {
      vi.mocked(AuthService.getAnonymousSession).mockResolvedValue(anonymousSession);
      vi.mocked(AuthService.register).mockResolvedValue({ success: true });
      const { result } = renderHook(() => useRegister(), { wrapper });

      await result.current.mutateAsync({
        userData: { email: "a@b.c", firstName: "A", lastName: "B" } as never,
      });

      expect(GuestClaimStorageService.read()).toEqual(anonymousSession);
    });

    it("useGoogleSignIn links Google to an anonymous user instead of signing in", async () => {
      vi.mocked(AuthService.getAnonymousSession).mockResolvedValue(anonymousSession);
      const { result } = renderHook(() => useGoogleSignIn(), { wrapper });

      await result.current.mutateAsync();

      expect(AuthService.linkGoogleIdentity).toHaveBeenCalledTimes(1);
      expect(AuthService.signInWithGoogle).not.toHaveBeenCalled();
      expect(GuestClaimStorageService.read()).toEqual(anonymousSession);
    });

    it("useGoogleSignIn signs in with Google when there is no guest session", async () => {
      vi.mocked(AuthService.getAnonymousSession).mockResolvedValue(null);
      const { result } = renderHook(() => useGoogleSignIn(), { wrapper });

      await result.current.mutateAsync();

      expect(AuthService.signInWithGoogle).toHaveBeenCalledTimes(1);
      expect(AuthService.linkGoogleIdentity).not.toHaveBeenCalled();
    });
  });
});
