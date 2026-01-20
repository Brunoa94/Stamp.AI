import { useQuery } from "@tanstack/react-query";
import { PrintifyService } from "@/services/printifyService";
import { CustomProductT } from "@/types/printify";

/**
 * React Query hook to fetch a custom Printify product by ID
 * @param productId - The Printify product ID to fetch
 * @returns React Query result with product data, loading state, and error
 */
export function useCustomProduct(productId: string | null | undefined) {
  return useQuery<CustomProductT, Error>({
    queryKey: ["custom-product", productId],
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
