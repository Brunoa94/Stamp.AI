/**
 * Catalog Types (Final Simplified Version)
 * Types for the simplified catalog architecture using Printify Choice
 * Primary key is blueprint_id (not UUID)
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

// ============================================
// API TYPES (for queries and responses)
// ============================================

export interface VariantPrice {
  printifyVariantId: number;
  color: string | null;
  size: string | null;
  priceCents: number;
}

export interface ProductWithPricing {
  product: CatalogProduct;
  variants: ProductVariant[];
  shippingCents: number;
  totalPriceCents: number;
}

// ============================================
// PRINTIFY API TYPES
// ============================================

export interface PrintifyBlueprint {
  id: number;
  title: string;
  description: string;
  brand: string;
  model: string;
  images: Array<{
    src: string;
    variant_ids: number[];
    position: string;
  }>;
}

export interface PrintifyVariant {
  id: number;
  title: string;
  options: {
    color?: string;
    size?: string;
  };
  placeholders: Array<{
    position: string;
    height: number;
    width: number;
  }>;
}

export interface PrintifyShippingInfo {
  handling_time: {
    value: number;
    unit: string;
  };
  profiles: Array<{
    variant_ids: number[];
    first_item: {
      cost: number;
      currency: string;
    };
    additional_items: {
      cost: number;
      currency: string;
    };
    countries: string[];
  }>;
}

// ============================================
// SYNC SERVICE TYPES
// ============================================

export interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
  currentBlueprint: string | null;
}

export interface SyncResult {
  success: boolean;
  productsCreated: number;
  variantsCreated: number;
  errors: Array<{
    blueprintId: number;
    error: string;
  }>;
}

export interface SyncOptions {
  blueprintIds?: number[]; // If specified, only sync these blueprints
  forceUpdate?: boolean; // Force update even if recently synced
}
