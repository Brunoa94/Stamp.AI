import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PrintifyService } from "@/shared/services/printifyService";
import { CustomProductService } from "@/shared/services/customProductService";
import { CreatedProductT, CreateProductPayloadT } from "@/shared/types/customProduct";
import { useErrorHandler } from "@/shared/hooks/useErrorHandler";

/**
 * Fetch blueprint variants for a specific blueprint and print provider
 * Uses ProductCustomizationService to fetch variants directly from Supabase Edge Function
 */
export function useBlueprintVariants(
  blueprintId: number | undefined,
  printProviderId: number | undefined,
) {
  return useQuery({
    queryKey: ["products", "blueprint-variants", blueprintId, printProviderId],
    queryFn: () => {
      if (!blueprintId) {
        throw new Error("Blueprint ID is required");
      }
      // Call ProductCustomizationService directly (client-side Supabase Edge Function call)
      return PrintifyService.getBlueprintVariants(blueprintId, printProviderId);
    },
    enabled: !!blueprintId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
  });
}

/**
 * Prefetch variants (colors & sizes) for every product in a grid, so opening
 * one is instant. Each product is prefetched at most once per mount and only
 * when its variants are not cached yet.
 */
export function usePrefetchBlueprintVariants(
  products: ReadonlyArray<{ blueprintId: number; printProviderId: number }>,
) {
  const queryClient = useQueryClient();
  const prefetchedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    for (const { blueprintId, printProviderId } of products) {
      const cacheKey = `${blueprintId}-${printProviderId}`;
      if (prefetchedRef.current.has(cacheKey)) continue;

      const queryKey = ["products", "blueprint-variants", blueprintId, printProviderId];
      if (queryClient.getQueryData(queryKey)) continue;

      prefetchedRef.current.add(cacheKey);
      void queryClient.prefetchQuery({
        queryKey,
        queryFn: () => PrintifyService.getBlueprintVariants(blueprintId, printProviderId),
        staleTime: 1000 * 60 * 10, // 10 minutes
      });
    }
  }, [products, queryClient]);
}

/**
 * Create a custom product
 */
export function useCreateCustomProduct() {
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: (payload: CreateProductPayloadT): Promise<CreatedProductT> => {
      return CustomProductService.createCustomProduct(payload);
    },
    onError: (error: Error) => {
      handleError({
        message: error.message,
        error: "CUSTOM_PRODUCT_CREATION_FAILED",
      });
    },
  });
}
