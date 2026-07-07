/**
 * Catalog React Query Hooks
 * React Query hooks for fetching catalog data with caching and state management
 */

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { CatalogQueryService } from "@/services/catalogQueryService";
import type {
  CatalogProduct,
  ProviderWithPricing,
  VariantPrice,
  CheapestProvider,
} from "@/types/catalog";

/**
 * Hook to fetch all catalog products
 */
export function useCatalogProducts(
  category?: string
): UseQueryResult<CatalogProduct[]> {
  return useQuery({
    queryKey: ["catalog", "products", category],
    queryFn: () => CatalogQueryService.getProducts(category),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch a single product
 */
export function useCatalogProduct(
  productId: string | undefined
): UseQueryResult<CatalogProduct | null> {
  return useQuery({
    queryKey: ["catalog", "product", productId],
    queryFn: () => CatalogQueryService.getProduct(productId!),
    enabled: !!productId,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch a product by blueprint ID
 */
export function useCatalogProductByBlueprint(
  blueprintId: number | undefined
): UseQueryResult<CatalogProduct | null> {
  return useQuery({
    queryKey: ["catalog", "product", "blueprint", blueprintId],
    queryFn: () => CatalogQueryService.getProductByBlueprint(blueprintId!),
    enabled: !!blueprintId,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch providers for a product in user's country
 * Returns providers sorted by price (cheapest first)
 */
export function useProductProviders(
  productId: string | undefined,
  countryCode: string
): UseQueryResult<ProviderWithPricing[]> {
  return useQuery({
    queryKey: ["catalog", "providers", productId, countryCode],
    queryFn: () =>
      CatalogQueryService.getProvidersForProduct(productId!, countryCode),
    enabled: !!productId && !!countryCode,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch variant price immediately
 * No API call to Printify - reads from database
 */
export function useVariantPrice(
  productId: string | undefined,
  color: string | undefined,
  size: string | undefined,
  providerId: number | undefined,
  countryCode: string
): UseQueryResult<VariantPrice | null> {
  return useQuery({
    queryKey: [
      "catalog",
      "price",
      productId,
      color,
      size,
      providerId,
      countryCode,
    ],
    queryFn: () =>
      CatalogQueryService.getVariantPrice(
        productId!,
        color!,
        size!,
        providerId!,
        countryCode
      ),
    enabled: !!productId && !!color && !!size && !!providerId && !!countryCode,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch available colors for a product
 */
export function useProductColors(
  productId: string | undefined
): UseQueryResult<string[]> {
  return useQuery({
    queryKey: ["catalog", "colors", productId],
    queryFn: () => CatalogQueryService.getProductColors(productId!),
    enabled: !!productId,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch available sizes for a product + color
 */
export function useProductSizes(
  productId: string | undefined,
  color: string | undefined
): UseQueryResult<string[]> {
  return useQuery({
    queryKey: ["catalog", "sizes", productId, color],
    queryFn: () => CatalogQueryService.getProductSizes(productId!, color!),
    enabled: !!productId && !!color,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch all variants for a product
 */
export function useProductVariants(productId: string | undefined) {
  return useQuery({
    queryKey: ["catalog", "variants", productId],
    queryFn: () => CatalogQueryService.getProductVariants(productId!),
    enabled: !!productId,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch the cheapest provider for a specific variant
 */
export function useCheapestProvider(
  productId: string | undefined,
  color: string | undefined,
  size: string | undefined,
  countryCode: string
): UseQueryResult<CheapestProvider | null> {
  return useQuery({
    queryKey: ["catalog", "cheapest", productId, color, size, countryCode],
    queryFn: () =>
      CatalogQueryService.getCheapestProvider(
        productId!,
        color!,
        size!,
        countryCode
      ),
    enabled: !!productId && !!color && !!size && !!countryCode,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to check if a product is available in a country
 */
export function useProductAvailability(
  productId: string | undefined,
  countryCode: string
): UseQueryResult<boolean> {
  return useQuery({
    queryKey: ["catalog", "availability", productId, countryCode],
    queryFn: () =>
      CatalogQueryService.isProductAvailableInCountry(productId!, countryCode),
    enabled: !!productId && !!countryCode,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch variant by ID with pricing
 */
export function useVariantById(
  variantId: string | undefined,
  providerId: number | undefined,
  countryCode: string
): UseQueryResult<VariantPrice | null> {
  return useQuery({
    queryKey: ["catalog", "variant", variantId, providerId, countryCode],
    queryFn: () =>
      CatalogQueryService.getVariantById(variantId!, providerId!, countryCode),
    enabled: !!variantId && !!providerId && !!countryCode,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
