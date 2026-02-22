import { useQuery, useMutation } from "@tanstack/react-query";
import { PrintifyService } from "@/services/printifyService";
import { CustomProductT } from "@/types/printify";
import { CustomProductService } from "@/services/customProductService";
import { CreateProductPayloadT, CreatedProductT } from "@/types/customProduct";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { TshirtType } from "@/types/product";

// Re-export TshirtType for backward compatibility
export type { TshirtType };

/**
 * Fetch a custom Printify product by ID
 * @param productId - The Printify product ID to fetch
 * @returns React Query result with product data, loading state, and error
 */
export function useCustomProduct(productId: string | null | undefined) {
  return useQuery<CustomProductT, Error>({
    queryKey: ["products", "custom", productId],
    queryFn: async () => {
      if (!productId) {
        throw new Error("Product ID is required");
      }
      return await PrintifyService.getCustomProduct(productId);
    },
    enabled: !!productId, // Only run query if productId exists
    retry: 2, // Retry failed requests twice
  });
}

/**
 * Fetch all t-shirt products from Printify catalog
 */
export function useTshirtProducts() {
  return useQuery({
    queryKey: ["products", "tshirts"],
    queryFn: () => PrintifyService.getTshirtProducts(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

/**
 * Fetch blueprint variants for a specific blueprint and print provider
 * Uses ProductCustomizationService to fetch variants directly from Supabase Edge Function
 */
export function useBlueprintVariants(
  blueprintId: number | undefined,
  printProviderId: number | undefined
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

// ============================================
// MUTATIONS (Write Operations)
// ============================================

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
