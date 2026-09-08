import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { useRemoveCartItems } from "./cartQueries";
import { CartService } from "@/services/cartService";

vi.mock("@/services/cartService");
vi.mock("@/hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({
    handleError: vi.fn(),
    handleSuccess: vi.fn(),
  }),
}));
vi.mock("@/queries/authQueries", () => ({
  useUser: () => ({ data: null, isLoading: false }),
}));

/**
 * Post-payment cart cleanup for partial checkouts: only the ordered items
 * are removed, and the cart cache is refreshed afterwards.
 */

describe("cartQueries", () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );
    }
    return Wrapper;
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  describe("useRemoveCartItems", () => {
    it("removes only the given item ids", async () => {
      vi.mocked(CartService.removeCartItems).mockResolvedValue(undefined);

      const { result } = renderHook(() => useRemoveCartItems(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync(["item_1", "item_3"]);

      expect(CartService.removeCartItems).toHaveBeenCalledWith([
        "item_1",
        "item_3",
      ]);
      expect(CartService.clearCart).not.toHaveBeenCalled();
    });

    it("invalidates the cart cache after removing items", async () => {
      vi.mocked(CartService.removeCartItems).mockResolvedValue(undefined);
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useRemoveCartItems(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync(["item_1"]);

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["cart"] });
      });
    });
  });
});
