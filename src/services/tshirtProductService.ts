import { mapBlueprintsToTshirtProducts } from "@/mappers/blueprintToTshirtMapper";
import { BlueprintI } from "../../supabase/types";

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

export class TshirtProductService {
  static async fetchTshirtProducts(): Promise<TshirtType[]> {
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
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({}),
        }
      );

      // Handle HTTP errors
      if (!response.ok) {
        let errorMessage = "Failed to fetch catalog blueprints";

        try {
          const errorResult = await response.json();
          errorMessage = errorResult.error || errorMessage;
        } catch (parseError) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }

        throw new Error(`HTTP ${response.status}: ${errorMessage}`);
      }

      const data = await response.json();

      // Validate response structure
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch catalog blueprints");
      }

      // Transform BlueprintI to TshirtType
      const blueprints: BlueprintI[] = data.blueprints;

      if (!Array.isArray(blueprints)) {
        throw new Error("Invalid response format: blueprints array missing");
      }

      // Map blueprints to TshirtType format
      const tshirtProducts = mapBlueprintsToTshirtProducts(
        blueprints,
        data.printProviderId
      );

      return tshirtProducts;
    } catch (error) {
      // Handle network errors, parsing errors, and other exceptions
      if (error instanceof Error) {
        // Re-throw known errors with context
        throw new Error(`Product fetch failed: ${error.message}`);
      }

      // Handle unknown errors
      throw new Error("Product fetch failed: Unknown error occurred");
    }
  }
}
