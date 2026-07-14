import { z } from "zod";

// Variant option schema
export const VariantOptionSchema = z.object({
  color: z.string().optional(),
  size: z.string().optional(),
});

// Variant schema
export const VariantSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  price: z.number().int().nonnegative(), // in cents
  is_enabled: z.boolean(),
  options: VariantOptionSchema,
});

// Shipping profile schema
export const ShippingProfileSchema = z.object({
  variant_ids: z.array(z.number().int().positive()),
  first_item: z.object({
    cost: z.number().int().nonnegative(),
    currency: z.string().default("USD"),
  }),
  additional_items: z.object({
    cost: z.number().int().nonnegative(),
    currency: z.string().default("USD"),
  }),
  countries: z.array(z.string()), // Array of 2-letter ISO codes like ["US", "NL", "GB"]
});

// Cache metadata schema
export const CacheMetadataSchema = z.object({
  variants_count: z.number().int().nonnegative(),
  colors_available: z.array(z.string()),
  sizes_available: z.array(z.string()),
  min_price: z.number().int().nonnegative(),
  max_price: z.number().int().nonnegative(),
});

// Provider catalog entry schema
export const ProviderCatalogEntrySchema = z.object({
  id: z.string().uuid(),
  blueprint_id: z.number().int().positive(),
  provider_id: z.number().int().positive(),
  provider_name: z.string(),
  provider_location: z.string().nullable(),
  variants_data: z.array(VariantSchema),
  shipping_profiles: z.array(ShippingProfileSchema),
  cache_metadata: CacheMetadataSchema,
  fetched_at: z.string().datetime(),
  expires_at: z.string().datetime(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Blueprint provider summary schema
export const BlueprintProviderSummarySchema = z.object({
  provider_id: z.number().int().positive(),
  provider_name: z.string(),
  variants_count: z.number().int().nonnegative(),
  min_price: z.number().int().nonnegative(),
  colors_available: z.array(z.string()),
  sizes_available: z.array(z.string()),
});

// Best provider result schema
export const BestProviderResultSchema = z.object({
  provider_id: z.number().int().positive(),
  provider_name: z.string(),
  total_cost: z.number().int().nonnegative(),
  product_price: z.number().int().nonnegative(),
  shipping_cost: z.number().int().nonnegative(),
});

// API Response schemas
export const FetchProviderCatalogResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(ProviderCatalogEntrySchema).optional(),
  summary: z.object({
    blueprints_processed: z.number().int().nonnegative(),
    providers_found: z.number().int().nonnegative(),
    entries_cached: z.number().int().nonnegative(),
    cache_duration_hours: z.number().positive(),
    expires_at: z.string().datetime(),
  }).optional(),
  error: z.string().optional(),
});

export const GetProviderCatalogResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(ProviderCatalogEntrySchema).optional(),
  count: z.number().int().nonnegative().optional(),
  cache_miss: z.boolean().optional(),
  error: z.string().optional(),
});

// Curated blueprint schema
export const ProductCategorySchema = z.enum(['tshirt', 'hoodie', 'totebag', 'poster', 'mug']);

export const CuratedBlueprintSchema = z.object({
  id: z.number().int().positive(),
  category: ProductCategorySchema,
  title: z.string(),
  description: z.string().optional(),
});

// Export types inferred from schemas
export type VariantOption = z.infer<typeof VariantOptionSchema>;
export type Variant = z.infer<typeof VariantSchema>;
export type ShippingProfile = z.infer<typeof ShippingProfileSchema>;
export type CacheMetadata = z.infer<typeof CacheMetadataSchema>;
export type ProviderCatalogEntry = z.infer<typeof ProviderCatalogEntrySchema>;
export type BlueprintProviderSummary = z.infer<typeof BlueprintProviderSummarySchema>;
export type BestProviderResult = z.infer<typeof BestProviderResultSchema>;
export type FetchProviderCatalogResponse = z.infer<typeof FetchProviderCatalogResponseSchema>;
export type GetProviderCatalogResponse = z.infer<typeof GetProviderCatalogResponseSchema>;
export type ProductCategory = z.infer<typeof ProductCategorySchema>;
export type CuratedBlueprint = z.infer<typeof CuratedBlueprintSchema>;
