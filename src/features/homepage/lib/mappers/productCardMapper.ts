/**
 * Product Card Mapper
 * Maps ProductWithPricing data to ProductCard props format
 */

import type { ProductWithPricing } from "@/lib/supabase/server-cache";
import { resolveProductDescription } from "@/lib/seo/productDescription";
import { getDisplayTitle } from "../constants/productDisplayTitles";

export interface ProductCardData {
  blueprintId: number;
  name: string;
  description: string | null;
  price: number;
  originalPrice?: number;
  isOnSale: boolean;
  discountPercent?: number; // e.g., 20 for 20% off
  specs: string;
  label: string;
  imageUrl: string;
  href: string;
  availableColors: string[];
}

function mapProductToCard(product: ProductWithPricing): ProductCardData {
  // Use display_title from database or fallback to mapped title
  const displayTitle = getDisplayTitle(
    product.blueprint_id,
    product.display_title
  );

  return {
    blueprintId: product.blueprint_id,
    name: displayTitle,
    description: resolveProductDescription(product.product_seo),
    price: product.selling_price_cents
      ? product.selling_price_cents / 100
      : product.totalPriceCents > 0
        ? product.totalPriceCents / 100
        : 0,
    originalPrice: product.original_price_cents
      ? product.original_price_cents / 100
      : undefined,
    isOnSale: product.is_on_sale || false,
    discountPercent: product.discount_percent ?? undefined,
    specs: "", // No specs for featured products
    label: displayTitle.replace(/\s+/g, "_").toUpperCase(),
    imageUrl: product.base_image_url || "",
    href: "/stamp",
    availableColors: product.availableColors || [],
  };
}

export function mapProductsToCards(
  products: ProductWithPricing[]
): ProductCardData[] {
  return products.map(mapProductToCard);
}
