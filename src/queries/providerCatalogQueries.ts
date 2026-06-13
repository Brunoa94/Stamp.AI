import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { BestProviderResultI } from "../../supabase/types/provider-catalog";

/**
 * Fetch the best (cheapest) provider for a specific blueprint and country
 * @param blueprintId - Printify blueprint ID
 * @param countryCode - 2-letter ISO country code (e.g., "US", "NL", "GB")
 */
export function useBestProvider(
  blueprintId: number | undefined,
  countryCode: string
) {
  const supabase = createClient();

  return useQuery<BestProviderResultI | null, Error>({
    queryKey: ["provider-catalog", "best", blueprintId, countryCode],
    queryFn: async () => {
      if (!blueprintId) {
        return null;
      }

      // Call database function directly
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
        return null;
      }

      return data[0] as BestProviderResultI;
    },
    enabled: !!blueprintId && !!countryCode,
    staleTime: 1000 * 60 * 30, // 30 minutes (data is cached in DB for 36 hours)
    retry: 2,
  });
}

/**
 * Fetch cheapest prices for multiple blueprints at once
 * Returns a map of blueprint_id -> best provider data
 */
export function useBestProvidersForBlueprints(
  blueprintIds: number[],
  countryCode: string
) {
  const supabase = createClient();

  return useQuery<Map<number, BestProviderResultI>, Error>({
    queryKey: ["provider-catalog", "best-multiple", blueprintIds, countryCode],
    queryFn: async () => {
      const results = new Map<number, BestProviderResultI>();

      // Fetch all in parallel
      const promises = blueprintIds.map(async (blueprintId) => {
        // Call database function directly
        const { data, error } = await supabase.rpc(
          "get_best_provider_for_country",
          {
            p_blueprint_id: blueprintId,
            p_country_code: countryCode.toUpperCase(),
          }
        );

        if (!error && data && data.length > 0) {
          results.set(blueprintId, data[0] as BestProviderResultI);
        }
      });

      await Promise.all(promises);
      return results;
    },
    enabled: blueprintIds.length > 0 && !!countryCode,
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
  });
}

/**
 * Fetch lowest prices per variant for a blueprint and country
 */
export function useLowestVariantPrices(
  blueprintId: number | undefined,
  countryCode: string
) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["provider-catalog", "variants", blueprintId, countryCode],
    queryFn: async () => {
      if (!blueprintId) {
        return new Map();
      }

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

      return variantPriceMap;
    },
    enabled: !!blueprintId && !!countryCode,
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
  });
}
