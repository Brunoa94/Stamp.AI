import type {
  ProviderCatalogEntryI,
  BlueprintProviderSummaryI,
  BestProviderResultI,
} from "../../supabase/types/provider-catalog";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ErrorClient } from "./errorClient";

export class ProviderCatalogService {
  /**
   * Get Supabase client - must be passed in since this service works in both client and server contexts
   *
   * Server usage:
   *   const supabase = await createClient(); // from @/lib/supabase/server
   *   const result = await ProviderCatalogService.getBestProviderForCountry(supabase, 12, "NL");
   *
   * Client usage:
   *   const supabase = createClient(); // from @/lib/supabase/client
   *   const result = await ProviderCatalogService.getBestProviderForCountry(supabase, 12, "NL");
   */
  private static getSupabase(client?: SupabaseClient): SupabaseClient {
    if (!client) {
      throw new Error("Supabase client must be provided to ProviderCatalogService methods");
    }
    return client;
  }

  /**
   * Get cached provider catalog from database
   * Returns null if cache is expired or missing
   */
  static async getCachedCatalog(
    supabase: SupabaseClient,
    blueprintIds?: number[]
  ): Promise<ProviderCatalogEntryI[] | null> {
    try {

      let query = supabase
        .from("provider_catalog")
        .select("*")
        .gt("expires_at", new Date().toISOString());

      if (blueprintIds && blueprintIds.length > 0) {
        query = query.in("blueprint_id", blueprintIds);
      }

      const { data, error } = await query.order("blueprint_id", {
        ascending: true,
      });

      if (error) {
        console.error("Error fetching provider catalog:", error);
        return null;
      }

      if (!data || data.length === 0) {
        console.log("No valid cache found for provider catalog");
        return null;
      }

      console.log(`✅ Cache hit! Found ${data.length} provider catalog entries`);
      return data as ProviderCatalogEntryI[];
    } catch (error) {
      console.error("Error in getCachedCatalog:", error);
      return null;
    }
  }

  /**
   * Get all providers for a specific blueprint
   */
  static async getProvidersForBlueprint(
    supabase: SupabaseClient,
    blueprintId: number
  ): Promise<ProviderCatalogEntryI[]> {
    try {

      const { data, error } = await supabase
        .from("provider_catalog")
        .select("*")
        .eq("blueprint_id", blueprintId)
        .gt("expires_at", new Date().toISOString())
        .order("cache_metadata->min_price", { ascending: true });

      if (error) {
        throw ErrorClient.handleError({
          error,
          service: "ProviderCatalog",
          action: "Get Providers for Blueprint",
        });
      }

      return data as ProviderCatalogEntryI[];
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "ProviderCatalog",
        action: "Get Providers for Blueprint",
      });
    }
  }

  /**
   * Get best provider for a blueprint and country
   * Selection criteria: Lowest total cost (product price + shipping cost)
   *
   * @param supabase - Supabase client instance
   * @param blueprintId - Printify blueprint ID
   * @param countryCode - 2-letter ISO country code (e.g., "US", "NL", "GB")
   * @returns Best provider with cost breakdown, or null if not found
   */
  static async getBestProviderForCountry(
    supabase: SupabaseClient,
    blueprintId: number,
    countryCode: string
  ): Promise<BestProviderResultI | null> {
    try {

      // Use the database function for efficient calculation
      const { data, error } = await supabase.rpc(
        "get_best_provider_for_country",
        {
          p_blueprint_id: blueprintId,
          p_country_code: countryCode.toUpperCase(),
        }
      );

      if (error) {
        console.error("Error getting best provider:", error);
        return null;
      }

      if (!data || data.length === 0) {
        console.log(
          `No provider found for blueprint ${blueprintId} in country ${countryCode}`
        );
        return null;
      }

      // Return the first result (cheapest)
      const bestProvider = data[0];
      console.log(
        `✅ Best provider for blueprint ${blueprintId} in ${countryCode}: ${bestProvider.provider_name} (Total: $${(bestProvider.total_cost / 100).toFixed(2)})`
      );

      return bestProvider as BestProviderResultI;
    } catch (error) {
      console.error("Error in getBestProviderForCountry:", error);
      return null;
    }
  }

  /**
   * Get summary of all blueprints with provider counts
   */
  static async getBlueprintSummary(
    supabase: SupabaseClient
  ): Promise<BlueprintProviderSummaryI[]> {
    try {

      const { data, error } = await supabase
        .from("provider_catalog")
        .select("blueprint_id, provider_id, provider_name, cache_metadata")
        .gt("expires_at", new Date().toISOString());

      if (error) {
        throw error;
      }

      // Group by blueprint
      const blueprintMap = new Map<number, any>();

      data.forEach((entry: any) => {
        if (!blueprintMap.has(entry.blueprint_id)) {
          blueprintMap.set(entry.blueprint_id, {
            blueprint_id: entry.blueprint_id,
            providers: [],
          });
        }

        blueprintMap.get(entry.blueprint_id).providers.push({
          provider_id: entry.provider_id,
          provider_name: entry.provider_name,
          variants_count: entry.cache_metadata.variants_count,
          min_price: entry.cache_metadata.min_price,
          colors_available: entry.cache_metadata.colors_available,
          sizes_available: entry.cache_metadata.sizes_available,
        });
      });

      return Array.from(blueprintMap.values()).map((item) => ({
        ...item,
        providers_count: item.providers.length,
      }));
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "ProviderCatalog",
        action: "Get Blueprint Summary",
      });
    }
  }

  /**
   * Trigger catalog refresh via edge function
   */
  static async refreshCatalog(): Promise<void> {
    try {
      const response = await fetch("/api/refresh-provider-catalog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to refresh catalog");
      }

      console.log("✅ Provider catalog refreshed successfully");
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "ProviderCatalog",
        action: "Refresh Catalog",
      });
    }
  }

  /**
   * Check if cache is valid for specific blueprints
   */
  static async hasCachedCatalog(
    supabase: SupabaseClient,
    blueprintIds: number[]
  ): Promise<boolean> {
    try {

      const { data, error } = await supabase.rpc("has_valid_catalog_cache", {
        p_blueprint_ids: blueprintIds,
      });

      if (error) {
        console.error("Error checking cache validity:", error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error("Error in hasCachedCatalog:", error);
      return false;
    }
  }

  /**
   * Get all providers with their cheapest product for a country
   * Useful for showing a comparison table
   */
  static async getProviderComparison(
    supabase: SupabaseClient,
    blueprintId: number,
    countryCode: string
  ): Promise<BestProviderResultI[]> {
    try {
      const providers = await this.getProvidersForBlueprint(supabase, blueprintId);

      const comparisons: BestProviderResultI[] = [];

      for (const provider of providers) {
        // Find shipping cost for this country
        // Note: countries is an array of strings, cost is at profile level
        let shippingCost = 0;

        for (const profile of provider.shipping_profiles) {
          // Check if this profile ships to the requested country
          if (profile.countries.includes(countryCode.toUpperCase())) {
            shippingCost = profile.first_item.cost;
            break;
          }
        }

        if (shippingCost > 0 || provider.shipping_profiles.length === 0) {
          const productPrice = provider.cache_metadata.min_price;
          comparisons.push({
            provider_id: provider.provider_id,
            provider_name: provider.provider_name,
            total_cost: productPrice + shippingCost,
            product_price: productPrice,
            shipping_cost: shippingCost,
          });
        }
      }

      // Sort by total cost (lowest first)
      return comparisons.sort((a, b) => a.total_cost - b.total_cost);
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "ProviderCatalog",
        action: "Get Provider Comparison",
      });
    }
  }

  /**
   * Get lowest prices per variant_id for a specific country
   * Returns a map of variant_id -> { provider_id, provider_name, variant_price, shipping_cost, total_cost }
   *
   * @param supabase - Supabase client instance
   * @param blueprintId - Printify blueprint ID
   * @param countryCode - 2-letter ISO country code (e.g., "US", "NL", "GB")
   * @returns Map of variant_id to cheapest pricing information
   */
  static async getLowestPricesPerVariant(
    supabase: SupabaseClient,
    blueprintId: number,
    countryCode: string
  ): Promise<
    Map<
      number,
      {
        variant_id: number;
        provider_id: number;
        provider_name: string;
        variant_price: number;
        shipping_cost: number;
        total_cost: number;
      }
    >
  > {
    try {
      const upperCountry = countryCode.toUpperCase();

      // Get all providers for this blueprint
      const { data: providers, error } = await supabase
        .from("provider_catalog")
        .select("*")
        .eq("blueprint_id", blueprintId)
        .gt("expires_at", new Date().toISOString());

      if (error) {
        console.error("Error fetching providers:", error);
        return new Map();
      }

      if (!providers || providers.length === 0) {
        console.log(`No providers found for blueprint ${blueprintId}`);
        return new Map();
      }

      // Map to track the cheapest option for each variant
      const variantPriceMap = new Map<
        number,
        {
          variant_id: number;
          provider_id: number;
          provider_name: string;
          variant_price: number;
          shipping_cost: number;
          total_cost: number;
        }
      >();

      for (const provider of providers) {
        // Find shipping cost for this country
        let shippingCost: number | null = null;

        for (const profile of provider.shipping_profiles) {
          if (profile.countries.includes(upperCountry)) {
            shippingCost = profile.first_item.cost;
            break;
          }
        }

        // Skip if this provider doesn't ship to the requested country
        if (shippingCost === null) {
          continue;
        }

        // Process all variants for this provider
        for (const variant of provider.variants_data) {
          if (!variant.is_enabled) {
            continue;
          }

          const variantPrice = variant.price;
          const totalCost = variantPrice + shippingCost;

          const existing = variantPriceMap.get(variant.id);

          // Update if this is cheaper or if it's the first entry for this variant
          if (!existing || totalCost < existing.total_cost) {
            variantPriceMap.set(variant.id, {
              variant_id: variant.id,
              provider_id: provider.provider_id,
              provider_name: provider.provider_name,
              variant_price: variantPrice,
              shipping_cost: shippingCost,
              total_cost: totalCost,
            });
          }
        }
      }

      console.log(
        `✅ Found lowest prices for ${variantPriceMap.size} variants in ${countryCode}`
      );

      return variantPriceMap;
    } catch (error) {
      console.error("Error in getLowestPricesPerVariant:", error);
      return new Map();
    }
  }
}
