/**
 * Catalog Types
 * Types for the catalog-first product architecture
 */

// ============================================
// DATABASE TYPES (matching Supabase schema)
// ============================================

export interface CatalogProduct {
  id: string;
  blueprint_id: number;
  name: string;
  description: string | null;
  category_id: string | null;
  base_image_url: string | null;
  is_active: boolean;
  availability_status?: 'in_stock' | 'out_of_stock' | 'discontinued' | 'temporarily_unavailable';
  last_availability_check?: string;
  stock_check_error?: string | null;
  printify_blueprint_exists?: boolean;
  display_title?: string | null;
  selling_price_cents?: number | null;
  original_price_cents?: number | null;
  is_on_sale?: boolean;
  is_featured?: boolean;
  created_at: string;
  updated_at: string;
}

export interface PrintProvider {
  id: number;
  name: string;
  description: string | null;
  supported_countries: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductProviderAvailability {
  id: string;
  product_id: string;
  print_provider_id: number;
  country_code: string;
  currency_code: string;
  base_price_cents: number;
  shipping_cost_cents: number;
  production_time_days: number | null;
  is_available: boolean;
  is_in_stock?: boolean;
  stock_status?: 'available' | 'low_stock' | 'out_of_stock' | 'discontinued';
  last_stock_check?: string;
  next_restock_date?: string;
  last_synced_at: string;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  printify_variant_id: number;
  color: string | null;
  size: string | null;
  sku: string | null;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface VariantPricing {
  id: string;
  variant_id: string;
  print_provider_id: number;
  country_code: string;
  price_cents: number;
  cost_cents: number;
  is_available: boolean;
  last_synced_at: string;
  created_at: string;
}

export interface UserCustomDesign {
  id: string;
  user_id: string;
  product_id: string;
  variant_id: string | null;
  provider_id: number;
  country_code: string;
  design_image_url: string;
  printify_product_id: string | null;
  printify_image_id: string | null;
  status: 'draft' | 'created' | 'ordered' | 'fulfilled';
  created_at: string;
  updated_at: string;
}

// ============================================
// API TYPES (for queries and responses)
// ============================================

export interface ProviderWithPricing {
  id: number;
  name: string;
  description: string | null;
  basePriceCents: number;
  currencyCode: string;
  shippingCostCents: number;
  productionTimeDays: number | null;
  totalCostCents: number; // Base price + shipping cost
}

export interface VariantPrice {
  variantId: string;
  color: string | null;
  size: string | null;
  title: string;
  priceCents: number;
  costCents: number;
  currencyCode: string;
}

export interface CheapestProvider {
  providerName: string;
  priceCents: number;
  shippingCostCents: number;
  totalCents: number;
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

export interface PrintifyProvider {
  id: number;
  title: string;
  location: {
    address1: string;
    address2: string | null;
    city: string;
    country: string;
    region: string;
    zip: string;
  };
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
  pricingRecordsCreated: number;
  errors: Array<{
    blueprintId: number;
    error: string;
  }>;
}

export interface SyncOptions {
  countries: string[];
  blueprintIds?: number[]; // If specified, only sync these blueprints
  forceUpdate?: boolean; // Force update even if recently synced
}
