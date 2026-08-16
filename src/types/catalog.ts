/**
 * Catalog Types (Final Simplified Version)
 * Types for the simplified catalog architecture using Printify Choice.
 * Primary key is blueprint_id (not UUID); single provider (99), no
 * multi-provider / multi-country / separate pricing tables.
 */

// ============================================
// DATABASE TYPES (matching Supabase schema)
// ============================================

export interface CatalogProduct {
  blueprint_id: number;
  display_title: string;
  base_image_url: string | null;
  min_price_cents: number;
  shipping_cents: number;
  is_active: boolean;
  print_provider_id: number; // Printify print provider ID (default 99)
  // Admin overrides (editable)
  selling_price_cents: number | null;
  original_price_cents: number | null;
  is_on_sale: boolean;
  discount_percent: number | null; // e.g., 20 for 20% off
  is_product_of_month: boolean;
  // Metadata
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductSeo {
  blueprint_id: number;
  printify_description: string | null; // Raw description from Printify (may contain HTML)
  meta_title: string | null; // Custom SEO title (falls back to display_title)
  meta_description: string | null; // Custom meta description (falls back to printify_description)
  meta_keywords: string[] | null;
  created_at: string;
  updated_at: string;
}

/** catalog_products row with its embedded product_seo relation (one-to-one) */
export interface CatalogProductWithSeo extends CatalogProduct {
  product_seo: ProductSeo | null;
}

export interface ProductVariant {
  blueprint_id: number;
  printify_variant_id: number;
  color: string | null;
  size: string | null;
  price_cents: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}
