import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { usePrefetchBlueprintVariants } from "./productQueries";
import { PrintifyService } from "@/shared/services/printifyService";

vi.mock("@/shared/services/printifyService");
vi.mock("@/shared/hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({ handleError: vi.fn(), handleSuccess: vi.fn() }),
}));

describe("usePrefetchBlueprintVariants", () => {
  let queryClient: QueryClient;

  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  beforeEach(() => {
    queryClient = new QueryClient();
    vi.mocked(PrintifyService.getBlueprintVariants).mockResolvedValue(
      [] as unknown as Awaited<ReturnType<typeof PrintifyService.getBlueprintVariants>>,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it("prefetches the variants of every product into the blueprint-variants cache", async () => {
    renderHook(
      () =>
        usePrefetchBlueprintVariants([
          { blueprintId: 6, printProviderId: 99 },
          { blueprintId: 12, printProviderId: 29 },
        ]),
      { wrapper },
    );

    await waitFor(() =>
      expect(
        queryClient.getQueryData(["products", "blueprint-variants", 12, 29]),
      ).toEqual([]),
    );
    expect(PrintifyService.getBlueprintVariants).toHaveBeenCalledWith(6, 99);
    expect(PrintifyService.getBlueprintVariants).toHaveBeenCalledTimes(2);
  });

  it("skips products whose variants are already cached", () => {
    queryClient.setQueryData(["products", "blueprint-variants", 6, 99], []);

    renderHook(
      () => usePrefetchBlueprintVariants([{ blueprintId: 6, printProviderId: 99 }]),
      { wrapper },
    );

    expect(PrintifyService.getBlueprintVariants).not.toHaveBeenCalled();
  });

  it("does not prefetch a product twice when it re-renders", () => {
    const products = [{ blueprintId: 6, printProviderId: 99 }];
    const { rerender } = renderHook(
      ({ list }) => usePrefetchBlueprintVariants(list),
      { wrapper, initialProps: { list: products } },
    );
    queryClient.clear();

    rerender({ list: [...products] });

    expect(PrintifyService.getBlueprintVariants).toHaveBeenCalledTimes(1);
  });
});
