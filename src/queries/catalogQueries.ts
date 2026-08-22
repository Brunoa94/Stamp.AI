/**
 * Catalog React Query Hooks (Final Simplified Version)
 * React Query hooks for fetching catalog data
 * Uses blueprint_id as primary key (not UUID)
 */

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { CatalogQueryService } from "@/services/catalogQueryService";
import type {
  CatalogProduct,
  CatalogProductWithSeo,
} from "@/services/catalogQueryService";

// Re-export types for convenience
export type { CatalogProduct, CatalogProductWithSeo };

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

/**
 * Hook to fetch all active catalog products with SEO data
 */
export function useCatalogProductsWithSeo(): UseQueryResult<CatalogProductWithSeo[]> {
  return useQuery({
    queryKey: ["catalog", "products", "withSeo"],
    queryFn: () => CatalogQueryService.getProductsWithSeo(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch the Product of the Month (includes SEO data)
 */
export function useProductOfMonth(): UseQueryResult<CatalogProductWithSeo | null> {
  return useQuery({
    queryKey: ["catalog", "productOfMonth"],
    queryFn: () => CatalogQueryService.getProductOfMonth(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch a single product with its SEO data
 */
export function useProductWithSeo(
  blueprintId: number | null | undefined
): UseQueryResult<CatalogProductWithSeo | null> {
  return useQuery({
    queryKey: ["catalog", "product", blueprintId, "seo"],
    queryFn: () => CatalogQueryService.getProductWithSeo(blueprintId as number),
    enabled: Boolean(blueprintId),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
