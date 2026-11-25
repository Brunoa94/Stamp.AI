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
import { resolveDisplayPrice } from "@/lib/pricing";
import {
  detectProductCategory,
  getListingColors,
} from "@/shared/helpers/productCategoryDetector";
import { localizeColorLabels, localizeProductText } from "@/shared/helpers/localizeProduct";
import type { ProductTextT } from "@/shared/types/productText";
import type { CatalogDisplayProductT } from "../types/catalogPageTypes";

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
  product: ProductWithPricing,
  text: ProductTextT | null
): CatalogDisplayProductT {
  const localized = localizeProductText(text, product.blueprint_id, {
    title: product.display_title,
    description: resolveProductDescription(product.product_seo),
    specs: extractProductSpecs(product.product_seo),
  });
  const availableColors = getListingColors(product.display_title, product.availableColors || []);

  return {
    blueprintId: product.blueprint_id,
    name: product.display_title,
    displayName: localized.title,
    category: detectProductCategory(product.display_title),
    description: localized.description,
    specs: localized.specs,
    price: resolveDisplayPrice(product),
    originalPrice: product.original_price_cents
      ? product.original_price_cents / 100
      : undefined,
    isOnSale: product.is_on_sale || false,
    discountPercent: product.discount_percent ?? undefined,
    imageUrls: resolveImageUrls(product),
    availableColors,
    colorLabels: localizeColorLabels(text, availableColors),
  };
}

/**
 * Translated for display after the (English) server cache with the visitor's
 * product text (`productTextFor(locale)`, null for English); logic fields stay English.
 */
export function mapProductsToCatalogDisplay(
  products: ProductWithPricing[],
  text: ProductTextT | null
): CatalogDisplayProductT[] {
  return products.map((product) => mapProductToCatalogDisplay(product, text));
}
