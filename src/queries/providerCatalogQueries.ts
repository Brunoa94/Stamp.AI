import { useQuery } from "@tanstack/react-query";
import { ProviderCatalogService } from "@/services/providerCatalogService";
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
      return await ProviderCatalogService.getBestProviderForCountry(
        supabase,
        blueprintId,
        countryCode
      );
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
        const best = await ProviderCatalogService.getBestProviderForCountry(
          supabase,
          blueprintId,
          countryCode
        );
        if (best) {
          results.set(blueprintId, best);
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
      return await ProviderCatalogService.getLowestPricesPerVariant(
        supabase,
        blueprintId,
        countryCode
      );
    },
    enabled: !!blueprintId && !!countryCode,
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
  });
}
