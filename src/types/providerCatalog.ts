/**
 * Provider Catalog type definitions
 * Types for the provider_catalog system
 */

/**
 * Represents a single entry in the provider_catalog table
 * Contains blueprint, provider, variants, shipping, and cache metadata
 */
export interface ProviderCatalogEntryType {
  id: string;
  blueprint_id: number;
  provider_id: number;
  provider_name: string;
  provider_location: string;
  variants_data: Array<{
    id: number;
    title: string;
    price: number;
    is_enabled: boolean;
    options: {
      color?: string;
      size?: string;
    };
  }>;
  shipping_profiles: Array<{
    variant_ids: number[];
    first_item: { cost: number };
    additional_items: { cost: number };
    countries: string[];
  }>;
  cache_metadata: {
    variants_count: number;
    colors_available: string[];
    sizes_available: string[];
    min_price: number;
    max_price: number;
  };
  fetched_at: string;
  expires_at: string;
  // Blueprint metadata (added in migration)
  blueprint_title?: string;
  blueprint_brand?: string;
  blueprint_model?: string;
  blueprint_images?: string[];
  blueprint_print_areas?: Array<{
    position: string;
    width: number;
    height: number;
  }>;
}

/**
 * Represents a blueprint with its best (cheapest) provider for a specific country
 * Used for selecting optimal blueprint/provider combinations
 */
export interface BlueprintWithBestProviderType {
  blueprintId: number;
  providerId: number;
  providerName: string;
  title: string;
  brand: string;
  model: string;
  images: string[];
  printAreas: Array<{ position: string; width: number; height: number }>;
  minPrice: number;
  shippingCost: number;
  totalCost: number;
  colorsAvailable: string[];
  sizesAvailable: string[];
  variantsCount: number;
}
