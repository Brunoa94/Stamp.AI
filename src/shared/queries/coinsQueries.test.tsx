import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { useUserCoins } from "./coinsQueries";
import { CoinsService } from "@/shared/services/coinsService";
import { useUser } from "@/shared/queries/authQueries";

// Mock dependencies
vi.mock("@/shared/services/coinsService");
vi.mock("@/shared/queries/authQueries");

/**
 * ========================================================================
 * coinsQueries Hook Tests
 * ========================================================================
 * Tests for React Query hooks that manage coins state.
 */

describe("coinsQueries", () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );
    }
    return Wrapper;
  };

  const mockUser = (data: { id: string; email?: string } | null) => {
    vi.mocked(useUser).mockReturnValue({
      data,
      isLoading: false,
    } as unknown as ReturnType<typeof useUser>);
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  /**
   * ========================================================================
   * useUserCoins Tests
   * ========================================================================
   */

  describe("useUserCoins", () => {
    it("should fetch coins when user is authenticated", async () => {
      mockUser({ id: "user-123", email: "test@example.com" });

      vi.mocked(CoinsService.getUserCoins).mockResolvedValueOnce({
        coins: 5,
        coinsResetAt: "2026-08-04",
      });

      const { result } = renderHook(() => useUserCoins(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual({
        coins: 5,
        coinsResetAt: "2026-08-04",
      });
      expect(CoinsService.getUserCoins).toHaveBeenCalledWith("user-123");
    });

    it("should not fetch when user is not authenticated", async () => {
      mockUser(null);

      const { result } = renderHook(() => useUserCoins(), {
        wrapper: createWrapper(),
      });

      // Query should not be enabled
      expect(result.current.fetchStatus).toBe("idle");
      expect(CoinsService.getUserCoins).not.toHaveBeenCalled();
    });

    it("should handle loading state", async () => {
      mockUser({ id: "user-123" });

      // Don't resolve immediately
      vi.mocked(CoinsService.getUserCoins).mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useUserCoins(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it("should handle error state", async () => {
      mockUser({ id: "user-123" });

      vi.mocked(CoinsService.getUserCoins).mockRejectedValueOnce(
        new Error("Failed to fetch coins")
      );

      const { result } = renderHook(() => useUserCoins(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toContain("Failed to fetch coins");
    });
  });
});
