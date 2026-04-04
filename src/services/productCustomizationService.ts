import { CatalogBlueprintsResponseSchema } from "@/schemas/services";
import { BlueprintVariantsResponseSchema } from "@/schemas/printify";
import { z } from "zod";
import { ErrorClient } from "./errorClient";

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
      const response = await fetch('/api/get-catalog-blueprints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error: ${response.status}`);
      }

      const data = await response.json();

      // Validate response
      const validatedData = CatalogBlueprintsResponseSchema.parse(data);

      if (!validatedData.success) {
        throw new Error(validatedData.error || "Failed to fetch catalog blueprints");
      }

      if (!Array.isArray(validatedData.blueprints)) {
        throw new Error("Invalid response format: blueprints array missing");
      }

      return {
        blueprints: validatedData.blueprints,
        printProviderId: validatedData.printProviderId || 99,
      };
    } catch (error) {
      throw ErrorClient.handleError({error, service: "Product Customization", action: "Fetch Catalog Blueprints"})
    }
  }

  static async fetchBlueprintVariants(
    blueprintId: number,
    printProviderId: number
  ): Promise<BlueprintVariantsResponse> {
    try {
      const response = await fetch('/api/get-blueprint-variants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blueprint_id: blueprintId,
          print_provider_id: printProviderId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error: ${response.status}`);
      }

      const data = await response.json();

      // Validate response
      const validatedData = BlueprintVariantsResponseSchema.parse(data);
      console.log("VALIDATES ", validatedData)
      if (!validatedData.success) {
        throw new Error(validatedData.error || "Failed to fetch variants");
      }

      return {
        variants: validatedData.variants || [],
        colors: validatedData.colors || [],
        sizes: validatedData.sizes || [],
      };
    } catch (error) {
      throw ErrorClient.handleError({error, service: "Product Customization", action: "Fetch Blueprint Variants"})
    }
  }
}
