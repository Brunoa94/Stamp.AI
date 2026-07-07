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

function extractFirstImageUrl(images: unknown): string | null {
  if (!Array.isArray(images)) return null;

  for (const image of images) {
    if (typeof image === "string" && image.length > 0) {
      return image;
    }

    if (
      image &&
      typeof image === "object" &&
      typeof (image as Record<string, unknown>).src === "string"
    ) {
      return (image as Record<string, string>).src;
    }
  }

  return null;
}

Deno.serve(async (req) => {
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
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get(
      "SUPABASE_SERVICE_ROLE_KEY",
    )!;
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
      },
    );

    if (!blueprintsResponse.ok) {
      throw new Error(
        `Failed to fetch blueprints: ${blueprintsResponse.statusText}`,
      );
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

        // The list endpoint often does not include a usable image set,
        // so fetch per-blueprint details to reliably extract a base image URL.
        let baseImageUrl: string | null = extractFirstImageUrl(
          blueprint.images,
        );
        try {
          const blueprintDetailResponse = await fetch(
            `${PRINTIFY_API_BASE}/catalog/blueprints/${blueprint.id}.json`,
            {
              headers: { Authorization: `Bearer ${PRINTIFY_API_TOKEN}` },
            },
          );

          if (blueprintDetailResponse.ok) {
            const blueprintDetail = await blueprintDetailResponse.json();
            baseImageUrl = extractFirstImageUrl(blueprintDetail?.images) ||
              baseImageUrl;
          }
        } catch (imageError) {
          console.warn(
            `Could not fetch blueprint image for ${blueprint.id}:`,
            imageError,
          );
        }

        // Upsert product to catalog_products
        const { data: product, error: productError } = await supabase
          .from("catalog_products")
          .upsert(
            {
              blueprint_id: blueprint.id,
              name: blueprint.title,
              description: blueprint.description,
              base_image_url: baseImageUrl,
              is_active: true,
            },
            {
              onConflict: "blueprint_id",
            },
          )
          .select()
          .single();

        if (productError) {
          throw new Error(`Failed to upsert product: ${productError.message}`);
        }

        result.productsCreated++;

        // Fetch print providers for this blueprint
        const providersResponse = await fetch(
          `${PRINTIFY_API_BASE}/catalog/blueprints/${blueprint.id}/print_providers.json`,
          {
            headers: { Authorization: `Bearer ${PRINTIFY_API_TOKEN}` },
          },
        );

        if (!providersResponse.ok) {
          console.warn(`No providers for blueprint ${blueprint.id}`);
          continue;
        }

        const providers = await providersResponse.json();

        // CREATE ONE TEMPORARY PRODUCT PER BLUEPRINT TO EXTRACT COSTS
        // This is done ONCE per blueprint, then costs are reused for all providers
        let blueprintVariantCosts: Map<number, number> = new Map();

        if (providers.length > 0) {
          const firstProvider = providers[0];

          // Fetch variants for this blueprint from the first provider
          const variantsResponse = await fetch(
            `${PRINTIFY_API_BASE}/catalog/blueprints/${blueprint.id}/print_providers/${firstProvider.id}/variants.json`,
            {
              headers: { Authorization: `Bearer ${PRINTIFY_API_TOKEN}` },
            },
          );

          if (variantsResponse.ok) {
            const variantsData = await variantsResponse.json();
            const variants = variantsData.variants || [];

            // Upsert variants to database
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
                  },
                );

              if (!variantError) {
                result.variantsCreated++;
              }
            }

            // NOW CREATE TEMPORARY PRODUCT TO EXTRACT COSTS
            try {
              console.log(`Extracting costs for blueprint ${blueprint.id}...`);

              // Upload a minimal 1x1 transparent PNG
              const minimalPNG =
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

              const uploadResponse = await fetch(
                `${PRINTIFY_API_BASE}/uploads/images.json`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${PRINTIFY_API_TOKEN}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    file_name: "temp_sync.png",
                    contents: minimalPNG,
                  }),
                },
              );

              if (uploadResponse.ok) {
                const uploadedImage = await uploadResponse.json();

                // Get first placeholder position from first variant
                const firstPlaceholder = variants[0]?.placeholders?.[0];
                if (!firstPlaceholder) {
                  console.warn(
                    `No placeholders found for blueprint ${blueprint.id}`,
                  );
                } else {
                  // Create temp product
                  const tempProduct = {
                    title: `TEMP_${blueprint.id}_${Date.now()}`,
                    description: "Temporary cost extraction",
                    blueprint_id: blueprint.id,
                    print_provider_id: firstProvider.id,
                    variants: variants.map((v: any) => ({
                      id: v.id,
                      price: 9999,
                      is_enabled: true,
                    })),
                    print_areas: [
                      {
                        variant_ids: variants.map((v: any) => v.id),
                        placeholders: [
                          {
                            position: firstPlaceholder.position,
                            images: [
                              {
                                id: uploadedImage.id,
                                x: 0.5,
                                y: 0.5,
                                scale: 1,
                                angle: 0,
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  };

                  const createResponse = await fetch(
                    `${PRINTIFY_API_BASE}/shops/${PRINTIFY_SHOP_ID}/products.json`,
                    {
                      method: "POST",
                      headers: {
                        Authorization: `Bearer ${PRINTIFY_API_TOKEN}`,
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(tempProduct),
                    },
                  );

                  if (createResponse.ok) {
                    const createdProduct = await createResponse.json();
                    let tempProductId: string | null = null;

                    try {
                      tempProductId = createdProduct.id;
                      console.log(
                        `✓ Created temp product ${tempProductId}, extracting costs from ${createdProduct.variants?.length} variants`,
                      );

                      // Extract costs
                      for (const variant of createdProduct.variants || []) {
                        if (variant.cost) {
                          blueprintVariantCosts.set(variant.id, variant.cost);
                        }
                      }

                      console.log(
                        `✓ Extracted ${blueprintVariantCosts.size} variant costs`,
                      );
                    } finally {
                      // CRITICAL: Always delete temp product, even if cost extraction fails
                      if (tempProductId) {
                        try {
                          const deleteResponse = await fetch(
                            `${PRINTIFY_API_BASE}/shops/${PRINTIFY_SHOP_ID}/products/${tempProductId}.json`,
                            {
                              method: "DELETE",
                              headers: {
                                Authorization: `Bearer ${PRINTIFY_API_TOKEN}`,
                              },
                            },
                          );

                          if (deleteResponse.ok) {
                            console.log(`✓ Deleted temp product ${tempProductId}`);
                          } else {
                            console.error(
                              `⚠️ Failed to delete temp product ${tempProductId}: ${deleteResponse.status}`,
                            );
                          }
                        } catch (deleteError) {
                          console.error(
                            `⚠️ Error deleting temp product ${tempProductId}:`,
                            deleteError,
                          );
                        }
                      }
                    }
                  } else {
                    const errorText = await createResponse.text();
                    console.error(
                      `Failed to create temp product: ${createResponse.status} ${errorText}`,
                    );
                  }
                }
              } else {
                console.warn(`Failed to upload placeholder image`);
              }
            } catch (costError) {
              console.error(
                `Error extracting costs for blueprint ${blueprint.id}:`,
                costError,
              );
            }
          }
        }

        // Now handle providers and pricing
        for (const provider of providers) {
          // Upsert provider
          const description = provider.location
            ? `${provider.location.city || ""}, ${
              provider.location.country || ""
            }`.trim()
            : provider.title;

          await supabase.from("print_providers").upsert(
            {
              id: provider.id,
              name: provider.title,
              description: description || null,
              is_active: true,
            },
            {
              onConflict: "id",
            },
          );

          // Fetch variants with pricing for this provider
          const variantsResponse = await fetch(
            `${PRINTIFY_API_BASE}/catalog/blueprints/${blueprint.id}/print_providers/${provider.id}/variants.json`,
            {
              headers: { Authorization: `Bearer ${PRINTIFY_API_TOKEN}` },
            },
          );

          if (!variantsResponse.ok) {
            console.warn(
              `No variants for blueprint ${blueprint.id}, provider ${provider.id}`,
            );
            continue;
          }

          const variantsData = await variantsResponse.json();
          const providerVariants = variantsData.variants || [];

          // USE COSTS EXTRACTED FROM BLUEPRINT-LEVEL TEMP PRODUCT
          // (We created ONE temp product per blueprint, now reuse those costs for all providers)
          const minVariantCost = blueprintVariantCosts.size > 0
            ? Math.min(...Array.from(blueprintVariantCosts.values()))
            : 0;

          // SKIP THIS PROVIDER if we couldn't extract costs
          if (minVariantCost === 0) {
            console.warn(
              `Skipping provider ${provider.id} for blueprint ${blueprint.id} - no cost data extracted`,
            );
            continue;
          }

          // Fetch shipping info
          const shippingResponse = await fetch(
            `${PRINTIFY_API_BASE}/catalog/blueprints/${blueprint.id}/print_providers/${provider.id}/shipping.json`,
            {
              headers: { Authorization: `Bearer ${PRINTIFY_API_TOKEN}` },
            },
          );

          if (!shippingResponse.ok) {
            console.warn(
              `No shipping info for blueprint ${blueprint.id}, provider ${provider.id}`,
            );
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

            // Upsert provider availability with CORRECT prices
            // NOTE: Printify API returns costs already in cents, so no need to multiply by 100
            await supabase
              .from("product_provider_availability")
              .upsert(
                {
                  product_id: product.id,
                  print_provider_id: provider.id,
                  country_code: country,
                  currency_code: profile.first_item.currency,
                  base_price_cents: Math.round(minVariantCost), // Printify returns cents
                  shipping_cost_cents: Math.round(profile.first_item.cost), // Printify returns cents
                  production_time_days: shippingInfo.handling_time?.value ||
                    null,
                  is_available: true,
                  is_in_stock: true,
                  stock_status: 'available',
                  last_synced_at: new Date().toISOString(),
                  last_stock_check: new Date().toISOString(),
                },
                {
                  onConflict: "product_id,print_provider_id,country_code",
                },
              );

            // Get variants from database
            const { data: dbVariants } = await supabase
              .from("product_variants")
              .select("id,printify_variant_id")
              .eq("product_id", product.id);

            // Upsert variant pricing with costs extracted from blueprint temp product
            for (const dbVariant of dbVariants || []) {
              const hasShipping = profile.variant_ids?.includes(
                dbVariant.printify_variant_id,
              );

              if (hasShipping) {
                // Get the cost from blueprint-level extraction
                const variantCost = blueprintVariantCosts.get(dbVariant.printify_variant_id);

                if (variantCost !== undefined && variantCost > 0) {
                  // NOTE: Printify API returns costs already in cents
                  await supabase
                    .from("variant_pricing")
                    .upsert(
                      {
                        variant_id: dbVariant.id,
                        print_provider_id: provider.id,
                        country_code: country,
                        price_cents: Math.round(variantCost), // Printify returns cents
                        cost_cents: Math.round(variantCost), // Printify returns cents
                        is_available: true,
                        last_synced_at: new Date().toISOString(),
                      },
                      {
                        onConflict: "variant_id,print_provider_id,country_code",
                      },
                    );

                  result.pricingRecordsCreated++;
                }
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
      },
    );
  }
});
