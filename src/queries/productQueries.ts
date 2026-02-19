import { useQuery, useMutation } from "@tanstack/react-query";
import { PrintifyService } from "@/services/printifyService";
import { CustomProductT } from "@/types/printify";
import { CustomProductService } from "@/services/customProductService";
import { CreateProductPayloadT, CreatedProductT } from "@/types/customProduct";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { BlueprintI } from "@/types/api";

export interface TshirtType {
  id: string;
  name: string;
  description: string;
  image: string;
  features: string[];
  price: number;
  material: string;
  fit: string;
  blueprint_id: number;
  print_provider_id: number;
  brand: string;
  model: string;
}

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
 * Fetch all t-shirt products from catalog
 */
const fetchTshirtProducts = async (): Promise<TshirtType[]> => {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase configuration missing");
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/get-catalog-blueprints`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({}),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to fetch catalog blueprints");
    }

    // Transform BlueprintI to TshirtType
    const blueprints: BlueprintI[] = data.blueprints;

    // Map blueprints to TshirtType format
    const tshirtProducts: TshirtType[] = blueprints.map((blueprint) => ({
      id: `blueprint-${blueprint.id}`,
      name: blueprint.title,
      description: blueprint.description || `${blueprint.brand} ${blueprint.model}`,
      image: blueprint.images[0] || "/api/placeholder/200/200",
      features: blueprint.printAreas.map((area) => area.position),
      price: 0, // Base price, will be determined by variant selection
      material: blueprint.brand || "Cotton",
      fit: "Classic",
      blueprint_id: blueprint.id,
      print_provider_id: data.printProviderId || 99,
      brand: blueprint.brand,
      model: blueprint.model,
    }));

    return tshirtProducts;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Product fetch failed: ${error.message}`);
    }
    throw new Error("Product fetch failed: Unknown error occurred");
  }
};

export function useTshirtProducts() {
  return useQuery({
    queryKey: ["products", "tshirts"],
    queryFn: fetchTshirtProducts,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

/**
 * Fetch blueprint variants for a specific blueprint and print provider
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
