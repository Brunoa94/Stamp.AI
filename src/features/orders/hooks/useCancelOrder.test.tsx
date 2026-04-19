import React from "react";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCancelOrder } from "./useCancelOrder";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: vi
        .fn()
        .mockResolvedValue({ data: { session: { access_token: "token" } } }),
    },
  }),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("../utils/orderCancellation", () => ({
  canCancelOrder: vi.fn(() => true),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useCancelOrder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens cancel modal when handleCancelOrder is called and canCancelOrder returns true", () => {
    const { result } = renderHook(() => useCancelOrder(), {
      wrapper: createWrapper(),
    });
    const order = { id: "order1", status: "created" } as any;
    act(() => {
      result.current.handleCancelOrder(order);
    });
    expect(result.current.cancelModalOpen).toBe(true);
    expect(result.current.orderToCancel).toBe(order);
  });

  it("does not open modal if canCancelOrder returns false", () => {
    const { canCancelOrder } = require("../utils/orderCancellation");
    canCancelOrder.mockReturnValue(false);
    const { result } = renderHook(() => useCancelOrder(), {
      wrapper: createWrapper(),
    });
    const order = { id: "order2", status: "in_production" } as any;
    act(() => {
      result.current.handleCancelOrder(order);
    });
    expect(result.current.cancelModalOpen).toBe(false);
  });

  it("closes modal and resets state on handleCloseCancelModal", () => {
    const { result } = renderHook(() => useCancelOrder(), {
      wrapper: createWrapper(),
    });
    act(() => {
      result.current.handleCancelOrder({
        id: "order3",
        status: "created",
      } as any);
      result.current.handleCloseCancelModal();
    });
    expect(result.current.cancelModalOpen).toBe(false);
    expect(result.current.orderToCancel).toBeNull();
  });

  it("calls executeCancelOrder and closes modal on handleConfirmCancel", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: "Cancelled" }),
    });
    const { result } = renderHook(() => useCancelOrder(), {
      wrapper: createWrapper(),
    });
    act(() => {
      result.current.handleCancelOrder({
        id: "order4",
        status: "created",
      } as any);
    });
    await act(async () => {
      await result.current.handleConfirmCancel();
    });
    expect(mockFetch).toHaveBeenCalled();
    expect(result.current.cancelModalOpen).toBe(false);
    expect(result.current.orderToCancel).toBeNull();
  });

  it("shows error and closes modal if canCancelOrder returns false on confirm", async () => {
    const { canCancelOrder } = require("../utils/orderCancellation");
    canCancelOrder.mockReturnValue(false);
    const { result } = renderHook(() => useCancelOrder(), {
      wrapper: createWrapper(),
    });
    act(() => {
      result.current.handleCancelOrder({
        id: "order5",
        status: "in_production",
      } as any);
    });
    await act(async () => {
      await result.current.handleConfirmCancel();
    });
    expect(result.current.cancelModalOpen).toBe(false);
    expect(result.current.orderToCancel).toBeNull();
  });

  it("shows error if not authenticated", async () => {
    const { createClient } = require("@/lib/supabase/client");
    createClient().auth.getSession.mockResolvedValueOnce({
      data: { session: null },
    });
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Not authenticated" }),
    });
    const { result } = renderHook(() => useCancelOrder(), {
      wrapper: createWrapper(),
    });
    act(() => {
      result.current.handleCancelOrder({
        id: "order6",
        status: "created",
      } as any);
    });
    await act(async () => {
      await result.current.handleConfirmCancel();
    });
    expect(mockFetch).not.toHaveBeenCalled(); // Should not call fetch if not authenticated
  });
});
