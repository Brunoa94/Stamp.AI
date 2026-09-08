import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { useOrders } from "./orderQueries";
import { OrderService } from "@/services/orderService";

// Mock dependencies
vi.mock("@/services/orderService");
vi.mock("@/hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({
    handleError: vi.fn(),
    handleSuccess: vi.fn(),
  }),
}));

/**
 * ========================================================================
 * orderQueries Hook Tests
 * ========================================================================
 * Tests for the orders list hook, including the live-status polling
 * behavior added for the Printify order status sync.
 */

describe("orderQueries", () => {
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
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    queryClient.clear();
  });

  describe("useOrders", () => {
    it("fetches orders when a userId is provided", async () => {
      const orders = [{ id: "order-1", status: "confirmed", order_items: [] }];
      vi.mocked(OrderService.getOrders).mockResolvedValue(
        orders as unknown as Awaited<ReturnType<typeof OrderService.getOrders>>
      );

      const { result } = renderHook(() => useOrders("user-123"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(OrderService.getOrders).toHaveBeenCalledWith("user-123");
      expect(result.current.data).toEqual(orders);
    });

    it("does not fetch without a userId", () => {
      renderHook(() => useOrders(undefined), {
        wrapper: createWrapper(),
      });

      expect(OrderService.getOrders).not.toHaveBeenCalled();
    });

    it("polls for live order status once per minute", async () => {
      vi.mocked(OrderService.getOrders).mockResolvedValue(
        [] as unknown as Awaited<ReturnType<typeof OrderService.getOrders>>
      );

      const { result } = renderHook(() => useOrders("user-123"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(OrderService.getOrders).toHaveBeenCalledTimes(1);

      const query = queryClient
        .getQueryCache()
        .find({ queryKey: ["orders", { userId: "user-123" }] });
      expect(query?.observers[0]?.options.refetchInterval).toBe(60_000);
    });
  });
});
