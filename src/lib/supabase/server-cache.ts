/**
 * Server-Side Data Cache Layer (Final Simplified Version)
 *
 * Provides cached data fetching functions using Next.js unstable_cache
 * Uses blueprint_id as primary key (not UUID)
 */

import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import type { CatalogProduct } from "@/types/catalog";

/**
 * Create a service role Supabase client (no cookies, no auth)
 * Safe to use inside unstable_cache
 */
function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Get all active catalog products with 30-minute cache
 */
export const getCachedProducts = unstable_cache(
  async (): Promise<CatalogProduct[]> => {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("catalog_products")
      .select("*")
      .eq("is_active", true)
      .order("display_title");

    if (error) {
      console.error("Error fetching cached products:", error);
      return [];
    }

    return data || [];
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
export interface ProductWithPricing extends CatalogProduct {
  totalPriceCents: number;
  availableColors?: string[];
}

/**
 * Get all products with their pricing with 30-minute cache
 */
export const getCachedProductsWithPricing = unstable_cache(
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

        const uniqueColors = [
          ...new Set(variants?.map((v) => v.color).filter(Boolean) || []),
        ];

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

    return productsWithPricing.filter((p) => p.totalPriceCents > 0);
  },
  ["products-with-pricing"],
  {
    revalidate: 1800, // 30 minutes
    tags: ["products"],
  }
);

/**
 * Get a product by blueprint ID with cached data
 */
export const getCachedProductByBlueprint = unstable_cache(
  async (blueprintId: number): Promise<CatalogProduct | null> => {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("catalog_products")
      .select("*")
      .eq("blueprint_id", blueprintId)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching cached product by blueprint:", error);
      return null;
    }

    return data;
  },
  ["catalog-product-blueprint"],
  {
    revalidate: 1800, // 30 minutes
    tags: ["products"],
  }
);

/**
 * Get product variants by blueprint ID with cached data
 */
export const getCachedProductVariants = unstable_cache(
  async (blueprintId: number) => {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("blueprint_id", blueprintId)
      .eq("is_available", true)
      .order("color")
      .order("size");

    if (error) {
      console.error("Error fetching cached variants:", error);
      return [];
    }

    return data || [];
  },
  ["catalog-variants"],
  {
    revalidate: 1800, // 30 minutes
    tags: ["products"],
  }
);
