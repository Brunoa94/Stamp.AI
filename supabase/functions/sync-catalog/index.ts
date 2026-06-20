/**
 * Sync Catalog Edge Function
 * Syncs Printify catalog to local database for immediate price lookups
 *
 * Usage:
 * POST /sync-catalog
 * {
 *   "countries": ["US", "GB", "FR", "DE"],
 *   "blueprintIds": [12, 145], // Optional: only sync specific blueprints
 *   "forceUpdate": false // Optional: force update even if recently synced
 * }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PRINTIFY_API_BASE = "https://api.printify.com/v1";

interface SyncOptions {
  countries: string[];
  blueprintIds?: number[];
  forceUpdate?: boolean;
}

interface SyncResult {
  success: boolean;
  productsCreated: number;
  variantsCreated: number;
  pricingRecordsCreated: number;
  errors: Array<{
    blueprintId: number;
    error: string;
  }>;
}

serve(async (req) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  try {
    // Get environment variables
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const PRINTIFY_API_TOKEN = Deno.env.get("PRINTIFY_API_TOKEN")!;
    const PRINTIFY_SHOP_ID = Deno.env.get("PRINTIFY_SHOP_ID")!;

    // Parse request body
    const { countries = ["US", "GB", "FR", "DE"], blueprintIds, forceUpdate } =
      (await req.json()) as SyncOptions;

    console.log(`Starting catalog sync for countries: ${countries.join(", ")}`);

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const result: SyncResult = {
      success: false,
      productsCreated: 0,
      variantsCreated: 0,
      pricingRecordsCreated: 0,
      errors: [],
    };

    // 1. Fetch all blueprints from Printify
    console.log("Fetching blueprints from Printify...");
    const blueprintsResponse = await fetch(
      `${PRINTIFY_API_BASE}/catalog/blueprints.json`,
      {
        headers: { Authorization: `Bearer ${PRINTIFY_API_TOKEN}` },
      }
    );

    if (!blueprintsResponse.ok) {
      throw new Error(`Failed to fetch blueprints: ${blueprintsResponse.statusText}`);
    }

    const blueprints = await blueprintsResponse.json();
    console.log(`Found ${blueprints.length} blueprints`);

    // Filter blueprints if specific IDs provided
    const blueprintsToSync = blueprintIds
      ? blueprints.filter((b: any) => blueprintIds.includes(b.id))
      : blueprints;

    console.log(`Syncing ${blueprintsToSync.length} blueprints`);

    // 2. Sync each blueprint
    for (const blueprint of blueprintsToSync) {
      try {
        console.log(`Syncing blueprint ${blueprint.id}: ${blueprint.title}`);

        // Upsert product to catalog_products
        const { data: product, error: productError } = await supabase
          .from("catalog_products")
          .upsert(
            {
              blueprint_id: blueprint.id,
              name: blueprint.title,
              description: blueprint.description,
              base_image_url: blueprint.images?.[0]?.src || null,
              is_active: true,
            },
            {
              onConflict: "blueprint_id",
            }
          )
          .select()
          .single();

        if (productError) {
          throw new Error(`Failed to upsert product: ${productError.message}`);
        }

        result.productsCreated++;

        // Fetch blueprint details with variants
        const blueprintResponse = await fetch(
          `${PRINTIFY_API_BASE}/catalog/blueprints/${blueprint.id}.json`,
          {
            headers: { Authorization: `Bearer ${PRINTIFY_API_TOKEN}` },
          }
        );

        if (!blueprintResponse.ok) {
          throw new Error(`Failed to fetch blueprint details: ${blueprintResponse.statusText}`);
        }

        const blueprintDetails = await blueprintResponse.json();
        const variants = blueprintDetails.variants || [];

        // Upsert variants
        for (const variant of variants) {
          const { error: variantError } = await supabase
            .from("product_variants")
            .upsert(
              {
                product_id: product.id,
                printify_variant_id: variant.id,
                color: variant.options?.color || null,
                size: variant.options?.size || null,
                title: variant.title,
              },
              {
                onConflict: "product_id,printify_variant_id",
              }
            );

          if (!variantError) {
            result.variantsCreated++;
          }
        }

        // Fetch print providers for this blueprint
        const providersResponse = await fetch(
          `${PRINTIFY_API_BASE}/catalog/blueprints/${blueprint.id}/print_providers.json`,
          {
            headers: { Authorization: `Bearer ${PRINTIFY_API_TOKEN}` },
          }
        );

        if (!providersResponse.ok) {
          console.warn(`No providers for blueprint ${blueprint.id}`);
          continue;
        }

        const providers = await providersResponse.json();

        // For each provider and country, fetch pricing
        for (const provider of providers) {
          // Upsert provider
          await supabase.from("print_providers").upsert(
            {
              id: provider.id,
              name: provider.title,
              description: `${provider.location.city}, ${provider.location.country}`,
              is_active: true,
            },
            {
              onConflict: "id",
            }
          );

          // Fetch shipping info
          const shippingResponse = await fetch(
            `${PRINTIFY_API_BASE}/catalog/blueprints/${blueprint.id}/print_providers/${provider.id}/shipping.json`,
            {
              headers: { Authorization: `Bearer ${PRINTIFY_API_TOKEN}` },
            }
          );

          if (!shippingResponse.ok) {
            console.warn(`No shipping info for blueprint ${blueprint.id}, provider ${provider.id}`);
            continue;
          }

          const shippingInfo = await shippingResponse.json();

          // For each country, create availability and pricing records
          for (const country of countries) {
            const profile = shippingInfo.profiles?.find((p: any) =>
              p.countries.includes(country)
            );

            if (!profile) {
              continue; // No shipping to this country
            }

            // Upsert provider availability
            await supabase
              .from("product_provider_availability")
              .upsert(
                {
                  product_id: product.id,
                  print_provider_id: provider.id,
                  country_code: country,
                  currency_code: profile.first_item.currency,
                  base_price_cents: Math.round(profile.first_item.cost * 100),
                  shipping_cost_cents: Math.round(profile.first_item.cost * 100),
                  production_time_days: shippingInfo.handling_time?.value || null,
                  is_available: true,
                  last_synced_at: new Date().toISOString(),
                },
                {
                  onConflict: "product_id,print_provider_id,country_code",
                }
              );

            // Get variants from database
            const { data: dbVariants } = await supabase
              .from("product_variants")
              .select("id,printify_variant_id")
              .eq("product_id", product.id);

            // Upsert variant pricing
            for (const dbVariant of dbVariants || []) {
              const hasShipping = profile.variant_ids?.includes(
                dbVariant.printify_variant_id
              );

              if (hasShipping) {
                await supabase
                  .from("variant_pricing")
                  .upsert(
                    {
                      variant_id: dbVariant.id,
                      print_provider_id: provider.id,
                      country_code: country,
                      price_cents: Math.round(profile.first_item.cost * 100),
                      cost_cents: Math.round(profile.first_item.cost * 100),
                      is_available: true,
                      last_synced_at: new Date().toISOString(),
                    },
                    {
                      onConflict: "variant_id,print_provider_id,country_code",
                    }
                  );

                result.pricingRecordsCreated++;
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error syncing blueprint ${blueprint.id}:`, error);
        result.errors.push({
          blueprintId: blueprint.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    result.success = result.errors.length === 0;

    console.log("Catalog sync completed:", result);

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Fatal error during catalog sync:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
