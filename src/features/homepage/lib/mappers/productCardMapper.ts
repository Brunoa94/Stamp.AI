/**
 * Product Card Mapper
 * Maps ProductWithPricing data to ProductCard props format
 */

import type { ProductWithPricing } from "@/lib/supabase/server-cache";
import { getDisplayTitle } from "../constants/productDisplayTitles";

export interface ProductCardData {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  isOnSale: boolean;
  specs: string;
  label: string;
  imageUrl: string;
  href: string;
  availabilityStatus?:
    | "in_stock"
    | "out_of_stock"
    | "discontinued"
    | "temporarily_unavailable";
  availableColors: string[];
}

export function mapProductToCard(product: ProductWithPricing): ProductCardData {
  // Use display_title from database or fallback to mapped title
  const displayTitle =
    product.display_title ||
    getDisplayTitle(product.blueprint_id, product.name);

  return {
    id: product.id,
    name: displayTitle,
    price: product.selling_price_cents
      ? product.selling_price_cents / 100
      : product.totalPriceCents > 0
        ? product.totalPriceCents / 100
        : 0,
    originalPrice: product.original_price_cents
      ? product.original_price_cents / 100
      : undefined,
    isOnSale: product.is_on_sale || false,
    specs: "", // No specs for featured products
    label: displayTitle.replace(/\s+/g, "_").toUpperCase(),
    imageUrl: product.base_image_url || "",
    href: product.cheapestProvider
      ? `/create?blueprint_id=${product.blueprint_id}&print_provider_id=${product.cheapestProvider.id}`
      : "/stamp",
    availabilityStatus: product.availability_status,
    availableColors: product.availableColors || [],
  };
}

export function mapProductsToCards(
  products: ProductWithPricing[],
): ProductCardData[] {
  return products.map(mapProductToCard);
}
