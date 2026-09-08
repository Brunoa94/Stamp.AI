import { useQuery, useMutation } from "@tanstack/react-query";
import { PrintifyService } from "@/services/printifyService";
import { CustomProductService } from "@/services/customProductService";
import { CreateProductPayloadT, CreatedProductT } from "@/types/customProduct";
import { useErrorHandler } from "@/hooks/useErrorHandler";

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
