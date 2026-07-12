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
  // Admin overrides (editable)
  selling_price_cents: number | null;
  original_price_cents: number | null;
  is_on_sale: boolean;
  // Metadata
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
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
