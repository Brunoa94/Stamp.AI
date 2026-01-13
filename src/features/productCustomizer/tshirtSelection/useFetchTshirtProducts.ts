import { useQuery } from "@tanstack/react-query";
import { BlueprintI } from "@/shared-types";

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

export function useFetchTshirtProducts() {
  return useQuery({
    queryKey: ["tshirt-products"],
    queryFn: fetchTshirtProducts,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}
