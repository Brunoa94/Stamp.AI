import { createClient } from "@/lib/supabase/client";

export interface CatalogBlueprint {
  id: number;
  title: string;
  description: string;
  brand: string;
  model: string;
  images: string[];
  printAreas: Array<{
    position: string;
    width: number;
    height: number;
  }>;
}

export interface VariantInfo {
  id: number;
  title: string;
  options: { color?: string; size?: string };
}

export interface CatalogBlueprintsResponse {
  blueprints: CatalogBlueprint[];
  printProviderId: number;
}

export interface BlueprintVariantsResponse {
  variants: VariantInfo[];
  colors: string[];
  sizes: string[];
}

export class ProductCustomizationService {
  static async fetchCatalogBlueprints(): Promise<CatalogBlueprintsResponse> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.functions.invoke(
        "get-catalog-blueprints",
        { body: {} }
      );

      if (error) {
        throw new Error(`HTTP error: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch catalog blueprints");
      }

      if (!Array.isArray(data.blueprints)) {
        throw new Error("Invalid response format: blueprints array missing");
      }

      return {
        blueprints: data.blueprints,
        printProviderId: data.printProviderId || 99,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Catalog fetch failed: ${error.message}`);
      }
      throw new Error("Catalog fetch failed: Unknown error occurred");
    }
  }

  static async fetchBlueprintVariants(
    blueprintId: number,
    printProviderId: number
  ): Promise<BlueprintVariantsResponse> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.functions.invoke(
        "get-blueprint-variants",
        {
          body: {
            blueprint_id: blueprintId,
            print_provider_id: printProviderId,
          },
        }
      );

      if (error) {
        throw new Error(`HTTP error: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch variants");
      }

      return {
        variants: data.variants || [],
        colors: data.colors || [],
        sizes: data.sizes || [],
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Variants fetch failed: ${error.message}`);
      }
      throw new Error("Variants fetch failed: Unknown error occurred");
    }
  }
}
