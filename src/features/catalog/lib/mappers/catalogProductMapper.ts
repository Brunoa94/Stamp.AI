/**
 * Catalog Product Mapper
 * Maps ProductWithPricing (server cache) to the display shape used by
 * the /catalog page, resolving SEO copy and the Printify photo gallery.
 */

import type { ProductWithPricing } from "@/lib/supabase/server-cache";
import {
  resolveProductDescription,
  extractProductSpecs,
} from "@/lib/seo/productDescription";
import { detectProductCategory } from "@/features/stamp/lib/helpers/productCategoryDetector";
import { getDisplayTitle } from "@/features/homepage/lib/constants/productDisplayTitles";
import type { CatalogDisplayProductType } from "../types/catalogPageTypes";

/**
 * Resolve the product photo gallery: the full Printify image list when
 * synced, otherwise fall back to the single base image.
 */
function resolveImageUrls(product: ProductWithPricing): string[] {
  if (product.image_urls && product.image_urls.length > 0) {
    return product.image_urls;
  }

  return product.base_image_url ? [product.base_image_url] : [];
}

function mapProductToCatalogDisplay(
  product: ProductWithPricing
): CatalogDisplayProductType {
  return {
    blueprintId: product.blueprint_id,
    name: getDisplayTitle(product.blueprint_id, product.display_title),
    category: detectProductCategory(product.display_title),
    description: resolveProductDescription(product.product_seo),
    specs: extractProductSpecs(product.product_seo),
    price: product.selling_price_cents
      ? product.selling_price_cents / 100
      : product.totalPriceCents / 100,
    originalPrice: product.original_price_cents
      ? product.original_price_cents / 100
      : undefined,
    isOnSale: product.is_on_sale || false,
    discountPercent: product.discount_percent ?? undefined,
    imageUrls: resolveImageUrls(product),
    availableColors: product.availableColors || [],
  };
}

export function mapProductsToCatalogDisplay(
  products: ProductWithPricing[]
): CatalogDisplayProductType[] {
  return products.map(mapProductToCatalogDisplay);
}
