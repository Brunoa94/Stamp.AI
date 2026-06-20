import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, handleError } from "../_shared/errors.ts";
import { createServiceClient } from "../_shared/supabase.ts";

const PRINTIFY_API_TOKEN = Deno.env.get("PRINTIFY_API_TOKEN");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// Curated blueprint IDs: T-shirts, Hoodies, Tote Bags, Mugs
const CURATED_BLUEPRINT_IDS = [
  12, // Unisex Jersey Short Sleeve Tee (Bella+Canvas 3001)
  6, // Unisex Heavy Cotton Tee (Gildan 5000)
  145, // Unisex Heavy Blend Hoodie
  157, // Tote Bag
  553, // White Glossy Mug (11oz)
];

const CACHE_TTL_HOURS = 36; // 36 hours cache duration
const RATE_LIMIT_DELAY_MS = 600; // 100 requests/min (600ms between calls)

interface RateLimiter {
  lastCallTime: number;
  delay: number;
}

const rateLimiter: RateLimiter = {
  lastCallTime: 0,
  delay: RATE_LIMIT_DELAY_MS,
};

/**
 * Wait for rate limit to avoid hitting Printify's 100 req/min limit
 */
async function waitForRateLimit() {
  const now = Date.now();
  const timeSinceLastCall = now - rateLimiter.lastCallTime;

  if (timeSinceLastCall < rateLimiter.delay) {
    await new Promise((resolve) =>
      setTimeout(resolve, rateLimiter.delay - timeSinceLastCall)
    );
  }

  rateLimiter.lastCallTime = Date.now();
}

/**
 * Fetch data from Printify API with rate limiting
 */
async function fetchWithRateLimit<T>(url: string): Promise<T | null> {
  await waitForRateLimit();

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${PRINTIFY_API_TOKEN}` },
    });

    if (!response.ok) {
      console.error(`API error for ${url}: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    return null;
  }
}

/**
 * Fetch blueprint metadata (title, brand, model, images, print areas)
 */
async function fetchBlueprintMetadata(
  blueprintId: number
): Promise<any | null> {
  const url =
    `https://api.printify.com/v1/catalog/blueprints/${blueprintId}.json`;
  return await fetchWithRateLimit(url);
}

/**
 * Fetch providers for a specific blueprint
 */
async function fetchProvidersForBlueprint(
  blueprintId: number
): Promise<any[]> {
  const url =
    `https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers.json`;
  const providers = await fetchWithRateLimit<any[]>(url);
  return providers || [];
}

/**
 * Fetch variants for a blueprint + provider combination
 */
async function fetchVariantsForProvider(
  blueprintId: number,
  providerId: number
): Promise<any | null> {
  const url =
    `https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers/${providerId}/variants.json`;
  return await fetchWithRateLimit(url);
}

/**
 * Fetch shipping profiles for a blueprint + provider combination
 */
async function fetchShippingForProvider(
  blueprintId: number,
  providerId: number
): Promise<any | null> {
  const url =
    `https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers/${providerId}/shipping.json`;
  return await fetchWithRateLimit(url);
}

/**
 * Extract cache metadata from variants
 */
function extractCacheMetadata(variants: any[]): any {
  const colorsSet = new Set<string>();
  const sizesSet = new Set<string>();
  let minPrice = Infinity;
  let maxPrice = -Infinity;

  variants.forEach((v) => {
    // Extract color and size from options (options is an OBJECT, not an array)
    if (v.options) {
      if (v.options.color) colorsSet.add(v.options.color);
      if (v.options.size) sizesSet.add(v.options.size);
    }

    // Track min/max prices
    if (v.price && typeof v.price === "number") {
      minPrice = Math.min(minPrice, v.price);
      maxPrice = Math.max(maxPrice, v.price);
    }
  });

  return {
    variants_count: variants.length,
    colors_available: Array.from(colorsSet).sort(),
    sizes_available: Array.from(sizesSet).sort(),
    min_price: minPrice === Infinity ? 0 : minPrice,
    max_price: maxPrice === -Infinity ? 0 : maxPrice,
  };
}

/**
 * Transform variant data to simpler format
 */
function transformVariants(variants: any[]): any[] {
  return variants.map((v) => {
    // Options is already an object with color/size properties
    return {
      id: v.id,
      title: v.title,
      price: v.price || 0,
      is_enabled: v.is_enabled ?? true,
      options: {
        ...(v.options?.color && { color: v.options.color }),
        ...(v.options?.size && { size: v.options.size }),
      },
    };
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    console.log("=== FETCH PROVIDER CATALOG ===");
    console.log(`Processing ${CURATED_BLUEPRINT_IDS.length} blueprints`);

    if (!PRINTIFY_API_TOKEN) {
      throw ErrorCodes.CONFIGURATION_ERROR("PRINTIFY_API_TOKEN not configured");
    }

    const supabase = createServiceClient();

    const catalogEntries = [];
    let totalProviders = 0;

    // Cache blueprint metadata to avoid fetching multiple times per blueprint
    const blueprintMetadataCache = new Map<number, any>();

    // Process each curated blueprint
    for (const blueprintId of CURATED_BLUEPRINT_IDS) {
      console.log(`\nProcessing blueprint ${blueprintId}...`);

      // Fetch blueprint metadata once per blueprint
      const blueprintMetadata = await fetchBlueprintMetadata(blueprintId);
      if (blueprintMetadata) {
        blueprintMetadataCache.set(blueprintId, blueprintMetadata);
        console.log(`  ✓ Fetched blueprint metadata: ${blueprintMetadata.title || blueprintId}`);
      }

      // Fetch providers for this blueprint
      const providers = await fetchProvidersForBlueprint(blueprintId);

      if (providers.length === 0) {
        console.log(`  No providers found`);
        continue;
      }

      console.log(`  Found ${providers.length} providers`);
      totalProviders += providers.length;

      // Process each provider
      for (const provider of providers) {
        console.log(
          `    Processing provider ${provider.id} (${provider.title})...`
        );

        // Fetch variants
        const variantsData = await fetchVariantsForProvider(
          blueprintId,
          provider.id
        );

        if (
          !variantsData || !variantsData.variants ||
          variantsData.variants.length === 0
        ) {
          console.log(`      No variants available, skipping`);
          continue;
        }

        // Fetch shipping
        const shippingData = await fetchShippingForProvider(
          blueprintId,
          provider.id
        );

        // Transform and extract metadata
        const transformedVariants = transformVariants(variantsData.variants);
        const metadata = extractCacheMetadata(variantsData.variants);
        const expiresAt = new Date(
          Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000
        ).toISOString();

        // Get cached blueprint metadata
        const bpMetadata = blueprintMetadataCache.get(blueprintId);

        catalogEntries.push({
          blueprint_id: blueprintId,
          provider_id: provider.id,
          provider_name: provider.title,
          provider_location: provider.location?.country || "Unknown",
          variants_data: transformedVariants,
          shipping_profiles: shippingData?.profiles || [],
          cache_metadata: metadata,
          fetched_at: new Date().toISOString(),
          expires_at: expiresAt,
          // Add blueprint metadata columns
          blueprint_title: bpMetadata?.title || null,
          blueprint_brand: bpMetadata?.brand || null,
          blueprint_model: bpMetadata?.model || null,
          blueprint_images: bpMetadata?.images || [],
          blueprint_print_areas: bpMetadata?.print_areas || [],
        });

        console.log(`      ✓ Cached ${metadata.variants_count} variants`);
      }
    }

    console.log(`\n=== SAVING TO DATABASE ===`);
    console.log(`Total entries to save: ${catalogEntries.length}`);

    if (catalogEntries.length === 0) {
      console.log("No entries to save");
      return new Response(
        JSON.stringify({
          success: false,
          error: "No catalog data found",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    // Atomic update: delete old entries for these blueprints, insert new
    const { error: deleteError } = await supabase
      .from("provider_catalog")
      .delete()
      .in("blueprint_id", CURATED_BLUEPRINT_IDS);

    if (deleteError) {
      console.error("Error deleting old cache:", deleteError);
      throw ErrorCodes.DATABASE_ERROR(deleteError.message);
    }

    // Insert new entries
    const { error: insertError } = await supabase
      .from("provider_catalog")
      .insert(catalogEntries);

    if (insertError) {
      console.error("Error inserting catalog:", insertError);
      throw ErrorCodes.DATABASE_ERROR(insertError.message);
    }

    console.log(
      `✅ Successfully cached ${catalogEntries.length} provider-blueprint combinations`
    );
    console.log(`Cache expires in ${CACHE_TTL_HOURS} hours`);

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          blueprints_processed: CURATED_BLUEPRINT_IDS.length,
          providers_found: totalProviders,
          entries_cached: catalogEntries.length,
          cache_duration_hours: CACHE_TTL_HOURS,
          expires_at: catalogEntries[0]?.expires_at,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching provider catalog:", error);
    return handleError(error, corsHeaders);
  }
});
