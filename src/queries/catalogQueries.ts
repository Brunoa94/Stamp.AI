/**
 * Catalog React Query Hooks (Final Simplified Version)
 * React Query hooks for fetching catalog data
 * Uses blueprint_id as primary key (not UUID)
 */

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { CatalogQueryService } from "@/services/catalogQueryService";
import type {
  CatalogProduct,
  ProductVariant,
  VariantPrice,
} from "@/services/catalogQueryService";

// Re-export types for convenience
export type { CatalogProduct, ProductVariant, VariantPrice };

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
 * Hook to fetch a single product by blueprint_id
 */
export function useCatalogProduct(
  blueprintId: number | undefined
): UseQueryResult<CatalogProduct | null> {
  return useQuery({
    queryKey: ["catalog", "product", blueprintId],
    queryFn: () => CatalogQueryService.getProduct(blueprintId!),
    enabled: !!blueprintId,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch variant price for specific color+size
 */
export function useVariantPrice(
  blueprintId: number | undefined,
  color: string | undefined,
  size: string | undefined
): UseQueryResult<VariantPrice | null> {
  return useQuery({
    queryKey: ["catalog", "price", blueprintId, color, size],
    queryFn: () =>
      CatalogQueryService.getVariantPrice(blueprintId!, color!, size!),
    enabled: !!blueprintId && !!color && !!size,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch available colors for a product
 */
export function useProductColors(
  blueprintId: number | undefined
): UseQueryResult<string[]> {
  return useQuery({
    queryKey: ["catalog", "colors", blueprintId],
    queryFn: () => CatalogQueryService.getProductColors(blueprintId!),
    enabled: !!blueprintId,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch available sizes for a product + color
 */
export function useProductSizes(
  blueprintId: number | undefined,
  color: string | undefined
): UseQueryResult<string[]> {
  return useQuery({
    queryKey: ["catalog", "sizes", blueprintId, color],
    queryFn: () => CatalogQueryService.getProductSizes(blueprintId!, color!),
    enabled: !!blueprintId && !!color,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch all variants for a product
 */
export function useProductVariants(
  blueprintId: number | undefined
): UseQueryResult<ProductVariant[]> {
  return useQuery({
    queryKey: ["catalog", "variants", blueprintId],
    queryFn: () => CatalogQueryService.getProductVariants(blueprintId!),
    enabled: !!blueprintId,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to check if a product has available variants
 */
export function useProductAvailability(
  blueprintId: number | undefined
): UseQueryResult<boolean> {
  return useQuery({
    queryKey: ["catalog", "availability", blueprintId],
    queryFn: () => CatalogQueryService.isProductAvailable(blueprintId!),
    enabled: !!blueprintId,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to check if a specific size is available
 */
export function useSizeAvailability(
  blueprintId: number | undefined,
  size: string | undefined
): UseQueryResult<boolean> {
  return useQuery({
    queryKey: ["catalog", "size-available", blueprintId, size],
    queryFn: () => CatalogQueryService.hasSizeAvailable(blueprintId!, size!),
    enabled: !!blueprintId && !!size,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch shipping cost for a product
 */
export function useProductShipping(
  blueprintId: number | undefined
): UseQueryResult<number> {
  return useQuery({
    queryKey: ["catalog", "shipping", blueprintId],
    queryFn: () => CatalogQueryService.getProductShipping(blueprintId!),
    enabled: !!blueprintId,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch display price for a product
 */
export function useDisplayPrice(
  blueprintId: number | undefined
): UseQueryResult<number> {
  return useQuery({
    queryKey: ["catalog", "display-price", blueprintId],
    queryFn: () => CatalogQueryService.getDisplayPrice(blueprintId!),
    enabled: !!blueprintId,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
