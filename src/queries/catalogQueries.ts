/**
 * Catalog React Query Hooks (Final Simplified Version)
 * React Query hooks for fetching catalog data
 * Uses blueprint_id as primary key (not UUID)
 */

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { CatalogQueryService } from "@/services/catalogQueryService";
import type { CatalogProduct } from "@/services/catalogQueryService";

// Re-export types for convenience
export type { CatalogProduct };

/**
 * Hook to fetch all active catalog products
 */
export function useCatalogProducts(): UseQueryResult<CatalogProduct[]> {
  return useQuery({
    queryKey: ["catalog", "products"],
    queryFn: () => CatalogQueryService.getProducts(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
