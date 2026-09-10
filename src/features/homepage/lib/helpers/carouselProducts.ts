/**
 * Carousel Product Helpers
 *
 * Functions for transforming catalog products into carousel display data.
 */

import type { CarouselProductData } from "../types/carousel";
import type { ProductSeo } from "@/types/catalog";
import { resolveProductDescription } from "@/lib/seo/productDescription";
import { FEATURED_CAROUSEL_EXCLUDED_BLUEPRINTS } from "../constants/homepageContent";

interface CatalogProduct {
  blueprint_id: number;
  display_title: string;
  min_price_cents: number | null;
  shipping_cents: number | null;
  selling_price_cents: number | null;
  base_image_url: string | null;
  product_seo?: ProductSeo | null;
}

/**
 * Filter products to exclude specific blueprint IDs.
 */
export function filterCarouselProducts<T extends { blueprint_id: number }>(
  products: T[],
): T[] {
  return products.filter(
    (product) => !FEATURED_CAROUSEL_EXCLUDED_BLUEPRINTS.has(product.blueprint_id),
  );
}

/**
 * Map catalog products to carousel display format with calculated pricing.
 */
export function mapToCarouselProducts(
  products: CatalogProduct[],
): CarouselProductData[] {
  return products.map((product) => {
    const baseCents = product.min_price_cents || 0;
    const shippingCents = product.shipping_cents || 0;
    const totalCents =
      product.selling_price_cents ??
      (baseCents > 0 ? baseCents + shippingCents : 0);
    const price = totalCents > 0 ? totalCents / 100 : 0;

    return {
      blueprintId: product.blueprint_id,
      name: product.display_title,
      description: resolveProductDescription(product.product_seo),
      price,
      imageUrl: product.base_image_url ?? "",
      href: "/stamp",
    };
  });
}
