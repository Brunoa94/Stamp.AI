/**
 * Product Card Mapper
 * Maps ProductWithPricing data to ProductCard props format
 */

import type { ProductWithPricing } from "@/lib/supabase/server-cache";
import { resolveProductDescription } from "@/lib/seo/productDescription";
import { resolveDisplayPrice } from "@/lib/pricing";
import { getListingColors } from "@/shared/helpers/productCategoryDetector";
import { localizeColorLabels, localizeProductText } from "@/shared/helpers/localizeProduct";
import type { ProductSeo } from "@/shared/types/catalog";
import type { ProductTextT } from "@/shared/types/productText";

export interface ProductCardData {
  blueprintId: number;
  /** English title, for logic; render `displayName` */
  name: string;
  /** Title in the visitor's language */
  displayName: string;
  /** In the visitor's language (display-only) */
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
  /** English colour name → label in the visitor's language */
  colorLabels: Record<string, string>;
}

type ProductTextSourceT = {
  blueprint_id: number;
  display_title: string;
  product_seo: Pick<ProductSeo, "meta_description" | "printify_description"> | null;
};

/** The title and description shown for a product, in the visitor's language */
export function mapProductOfMonth(
  product: ProductTextSourceT,
  text: ProductTextT | null
): { displayName: string; description: string | null } {
  const localized = localizeProductText(text, product.blueprint_id, {
    title: product.display_title,
    description: resolveProductDescription(product.product_seo),
    specs: [],
  });

  return { displayName: localized.title, description: localized.description };
}

function mapProductToCard(
  product: ProductWithPricing,
  text: ProductTextT | null
): ProductCardData {
  const { displayName, description } = mapProductOfMonth(product, text);
  const availableColors = getListingColors(product.display_title, product.availableColors || []);

  return {
    blueprintId: product.blueprint_id,
    name: product.display_title,
    displayName,
    description,
    price: resolveDisplayPrice(product, { useFallback: false }),
    originalPrice: product.original_price_cents
      ? product.original_price_cents / 100
      : undefined,
    isOnSale: product.is_on_sale || false,
    discountPercent: product.discount_percent ?? undefined,
    specs: "", // No specs for featured products
    label: product.display_title.replace(/\s+/g, "_").toUpperCase(),
    imageUrl: product.base_image_url || "",
    href: "/stamp",
    availableColors,
    colorLabels: localizeColorLabels(text, availableColors),
  };
}

/** Translated for display after the (English) cache; logic fields stay English */
export function mapProductsToCards(
  products: ProductWithPricing[],
  text: ProductTextT | null
): ProductCardData[] {
  return products.map((product) => mapProductToCard(product, text));
}
