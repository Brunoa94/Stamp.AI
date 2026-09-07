/**
 * Server-Side Data Cache Layer (Final Simplified Version)
 *
 * Provides cached data fetching functions using Next.js unstable_cache
 * Uses blueprint_id as primary key (not UUID)
 */

import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import type { CatalogProductWithSeo } from "@/types/catalog";

/**
 * Create a service role Supabase client (no cookies, no auth)
 * Safe to use inside unstable_cache
 */
function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.error("[server-cache] NEXT_PUBLIC_SUPABASE_URL is not set");
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
  }

  if (!supabaseServiceKey) {
    console.error("[server-cache] SUPABASE_SERVICE_ROLE_KEY is not set");
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Get all active catalog products (with SEO data) with 30-minute cache
 */
const getCachedProducts = unstable_cache(
  async (): Promise<CatalogProductWithSeo[]> => {
    try {
      const supabase = createServiceClient();

      const { data, error } = await supabase
        .from("catalog_products")
        .select("*, product_seo(*)")
        .eq("is_active", true)
        .order("display_title");

      if (error) {
        console.error("[server-cache] Error fetching catalog_products:", error.message, error.details);
        return [];
      }

      console.log(`[server-cache] Fetched ${data?.length ?? 0} catalog products`);
      return data || [];
    } catch (err) {
      console.error("[server-cache] Exception in getCachedProducts:", err);
      return [];
    }
  },
  ["catalog-products"],
  {
    revalidate: 1800, // 30 minutes
    tags: ["products"],
  }
);

/**
 * Product with pricing information
 */
export interface ProductWithPricing extends CatalogProductWithSeo {
  totalPriceCents: number;
  availableColors?: string[];
}

/**
 * Get ALL active products with their pricing with 30-minute cache,
 * including products whose variants have no synced price
 * (totalPriceCents = 0). Consumers that show those products must
 * render a fallback price, like the stamp flow does.
 */
export const getCachedAllProductsWithPricing = unstable_cache(
  async (): Promise<ProductWithPricing[]> => {
    const products = await getCachedProducts();
    const supabase = createServiceClient();

    const productsWithPricing = await Promise.all(
      products.map(async (product) => {
        // Get unique colors and min price from variants
        const { data: variants } = await supabase
          .from("product_variants")
          .select("color, price_cents")
          .eq("blueprint_id", product.blueprint_id)
          .eq("is_available", true);

        // Filter out non-displayable colors (Default = single variant, null = no color)
        const displayableColors = variants
          ?.map((v) => v.color)
          .filter((c): c is string => Boolean(c) && c !== "Default") || [];
        const uniqueColors = [...new Set(displayableColors)];

        // Use selling price override if set, otherwise the cheapest
        // available variant price plus shipping. Products with no real
        // variant price (min_price_cents === 0) resolve to 0 and are
        // filtered out below instead of showing a shipping-only price.
        const baseCents = product.min_price_cents || 0;
        const totalPriceCents =
          product.selling_price_cents ??
          (baseCents > 0 ? baseCents + (product.shipping_cents || 0) : 0);

        return {
          ...product,
          totalPriceCents,
          availableColors: uniqueColors,
        };
      })
    );

    return productsWithPricing;
  },
  ["all-products-with-pricing"],
  {
    revalidate: 1800, // 30 minutes
    tags: ["products"],
  }
);

/**
 * Get products with real pricing only. Products with no variant price
 * (min_price_cents === 0) are filtered out instead of showing a
 * shipping-only or fallback price — used by surfaces that must not
 * display synthetic prices (homepage grid, SEO schemas).
 */
export async function getCachedProductsWithPricing(): Promise<
  ProductWithPricing[]
> {
  const products = await getCachedAllProductsWithPricing();
  return products.filter((p) => p.totalPriceCents > 0);
}

