// Provider Catalog Type Definitions
// Auto-generated types for Printify provider catalog caching system

export interface VariantOptionI {
  color?: string;
  size?: string;
}

export interface VariantI {
  id: number;
  title: string;
  price: number; // in cents
  is_enabled: boolean;
  options: VariantOptionI;
}

export interface ShippingProfileI {
  variant_ids: number[];
  first_item: {
    cost: number; // in cents
    currency: string;
  };
  additional_items: {
    cost: number; // in cents
    currency: string;
  };
  countries: string[]; // Array of 2-letter ISO country codes (e.g., ["US", "NL", "GB"])
  // Note: cost is the same for all countries in this profile
}

export interface CacheMetadataI {
  variants_count: number;
  colors_available: string[];
  sizes_available: string[];
  min_price: number; // in cents
  max_price: number; // in cents
}

export interface ProviderCatalogEntryI {
  id: string; // UUID
  blueprint_id: number;
  provider_id: number;
  provider_name: string;
  provider_location: string | null;
  variants_data: VariantI[];
  shipping_profiles: ShippingProfileI[];
  cache_metadata: CacheMetadataI;
  fetched_at: string; // ISO timestamp
  expires_at: string; // ISO timestamp
  created_at?: string;
  updated_at?: string;
}

export interface BlueprintProviderSummaryI {
  provider_id: number;
  provider_name: string;
  variants_count: number;
  min_price: number; // in cents
  colors_available: string[];
  sizes_available: string[];
}

export interface BestProviderResultI {
  provider_id: number;
  provider_name: string;
  total_cost: number; // in cents
  product_price: number; // in cents
  shipping_cost: number; // in cents
}

export interface FetchProviderCatalogResponseI {
  success: boolean;
  data?: ProviderCatalogEntryI[];
  summary?: {
    blueprints_processed: number;
    providers_found: number;
    entries_cached: number;
    cache_duration_hours: number;
    expires_at: string;
  };
  error?: string;
}

export interface GetProviderCatalogResponseI {
  success: boolean;
  data?: ProviderCatalogEntryI[];
  count?: number;
  cache_miss?: boolean;
  error?: string;
}

// Blueprint category types for curated lists
export type ProductCategory = 'tshirt' | 'hoodie' | 'totebag' | 'poster' | 'mug';

export interface CuratedBlueprintI {
  id: number;
  category: ProductCategory;
  title: string;
  description?: string;
}
