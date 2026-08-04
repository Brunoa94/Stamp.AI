import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { useUserCoins, useDeductCoin } from "./coinsQueries";
import { CoinsService } from "@/services/coinsService";
import { useUser } from "@/queries/authQueries";

// Mock dependencies
vi.mock("@/services/coinsService");
vi.mock("@/queries/authQueries");
vi.mock("@/hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({
    handleError: vi.fn(),
    handleSuccess: vi.fn(),
  }),
}));

/**
 * ========================================================================
 * coinsQueries Hook Tests
 * ========================================================================
 * Tests for React Query hooks that manage coins state.
 */

describe("coinsQueries", () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
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
      vi.mocked(useUser).mockReturnValue({
        data: { id: "user-123", email: "test@example.com" },
        isLoading: false,
      } as any);

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
      vi.mocked(useUser).mockReturnValue({
        data: null,
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useUserCoins(), {
        wrapper: createWrapper(),
      });

      // Query should not be enabled
      expect(result.current.fetchStatus).toBe("idle");
      expect(CoinsService.getUserCoins).not.toHaveBeenCalled();
    });

    it("should handle loading state", async () => {
      vi.mocked(useUser).mockReturnValue({
        data: { id: "user-123" },
        isLoading: false,
      } as any);

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
      vi.mocked(useUser).mockReturnValue({
        data: { id: "user-123" },
        isLoading: false,
      } as any);

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

  /**
   * ========================================================================
   * useDeductCoin Tests
   * ========================================================================
   */

  describe("useDeductCoin", () => {
    it("should call deduct_coin RPC and return true on success", async () => {
      vi.mocked(useUser).mockReturnValue({
        data: { id: "user-123" },
        isLoading: false,
      } as any);

      vi.mocked(CoinsService.deductCoin).mockResolvedValueOnce(true);

      const { result } = renderHook(() => useDeductCoin(), {
        wrapper: createWrapper(),
      });

      const deductResult = await result.current.mutateAsync();

      expect(deductResult).toBe(true);
      expect(CoinsService.deductCoin).toHaveBeenCalledWith("user-123");
    });

    it("should return false when no coins available", async () => {
      vi.mocked(useUser).mockReturnValue({
        data: { id: "user-123" },
        isLoading: false,
      } as any);

      vi.mocked(CoinsService.deductCoin).mockResolvedValueOnce(false);

      const { result } = renderHook(() => useDeductCoin(), {
        wrapper: createWrapper(),
      });

      const deductResult = await result.current.mutateAsync();

      expect(deductResult).toBe(false);
    });

    it("should throw error when user is not authenticated", async () => {
      vi.mocked(useUser).mockReturnValue({
        data: null,
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useDeductCoin(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync()).rejects.toThrow(
        "User not authenticated"
      );
    });

    it("should handle mutation errors", async () => {
      vi.mocked(useUser).mockReturnValue({
        data: { id: "user-123" },
        isLoading: false,
      } as any);

      vi.mocked(CoinsService.deductCoin).mockRejectedValueOnce(
        new Error("RPC failed")
      );

      const { result } = renderHook(() => useDeductCoin(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync()).rejects.toThrow("RPC failed");
    });

    it("should invalidate coins query on success", async () => {
      vi.mocked(useUser).mockReturnValue({
        data: { id: "user-123" },
        isLoading: false,
      } as any);

      vi.mocked(CoinsService.deductCoin).mockResolvedValueOnce(true);

      const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useDeductCoin(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync();

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ["coins", "user-123"],
      });
    });
  });
});
