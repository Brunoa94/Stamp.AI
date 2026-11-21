import { extractProductSpecs, resolveProductDescription } from "@/lib/seo/productDescription";
import { localizeProductText } from "@/shared/helpers/localizeProduct";
import type { CatalogProductWithSeo } from "@/shared/types/catalog";
import type { ProductTextT } from "@/shared/types/productText";
import { FALLBACK_PRODUCT_PRICE_CENTS } from "../constants/productPricing";
import type { CatalogProductMappedT } from "../types/stampTypes";

const FALLBACK_PRICE = FALLBACK_PRODUCT_PRICE_CENTS / 100;

function mapStampProduct(product: CatalogProductWithSeo, text: ProductTextT | null): CatalogProductMappedT {
  // Price comes from the product's precomputed min_price_cents (cheapest
  // available Printify Choice variant) plus shipping, unless an admin
  // selling-price override is set.
  const baseCents = product.min_price_cents || 0;
  const shippingCents = product.shipping_cents || 0;
  const totalCents = product.selling_price_cents ?? (baseCents > 0 ? baseCents + shippingCents : 0);
  const description = resolveProductDescription(product.product_seo);
  const localized = localizeProductText(text, product.blueprint_id, {
    title: product.display_title,
    description,
    specs: extractProductSpecs(product.product_seo),
  });

  return {
    blueprintId: product.blueprint_id,
    name: product.display_title,
    displayName: localized.title,
    description,
    specs: localized.specs,
    imageUrl: product.base_image_url ?? "",
    printProviderId: product.print_provider_id,
    price: totalCents > 0 ? totalCents / 100 : FALLBACK_PRICE,
    providerName: product.print_provider_id === 99 ? "Printify Choice" : "Print Provider",
  };
}

/** The product step's cards: English fields for the store and analytics, display fields translated */
export function mapStampProducts(products: CatalogProductWithSeo[], text: ProductTextT | null): CatalogProductMappedT[] {
  return products.map((product) => mapStampProduct(product, text));
}
