import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEnsureGuestSession, useIsAuthenticated } from "./authQueries";
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
});
