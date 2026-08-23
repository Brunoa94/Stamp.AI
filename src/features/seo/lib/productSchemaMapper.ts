/**
 * Product Schema Mapper
 * Maps catalog products (with SEO data) to the ProductData shape
 * consumed by productSchema for schema.org structured data.
 */

import type { ProductWithPricing } from "@/lib/supabase/server-cache";
import { resolveProductDescription } from "@/lib/seo/productDescription";
import { SITE_URL } from "../config/site";
import type { ProductData } from "../schemas/types";

/**
 * Map a catalog product to structured-data input. Falls back to the
 * provided description when the product has no SEO description, since
 * schema.org Product requires one.
 */
export function mapProductToSchemaData(
  product: ProductWithPricing,
  fallbackDescription: string
): ProductData {
  const description =
    resolveProductDescription(product.product_seo) ?? fallbackDescription;

  const priceCents =
    product.selling_price_cents ?? product.totalPriceCents;

  return {
    name: product.display_title,
    description,
    image: product.base_image_url ?? "",
    price: priceCents > 0 ? priceCents / 100 : undefined,
    priceCurrency: "EUR",
    availability: "InStock",
    url: `${SITE_URL}/stamp`,
  };
}

export function mapProductsToSchemaData(
  products: ProductWithPricing[],
  fallbackDescription: string
): ProductData[] {
  return products.map((product) =>
    mapProductToSchemaData(product, fallbackDescription)
  );
}
