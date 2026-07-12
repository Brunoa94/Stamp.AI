/**
 * Sync Catalog Edge Function (Final Simplified Version)
 *
 * Syncs Printify catalog using Printify Choice (provider 99)
 * Uses blueprint_id as primary key
 *
 * IMPORTANT: Does NOT overwrite admin-editable fields:
 * - display_title (preserved once set)
 * - is_active (admin controlled)
 * - selling_price_cents, original_price_cents, is_on_sale (admin overrides)
 *
 * Usage:
 * POST /sync-catalog
 * {
 *   "blueprintIds": [12, 145] // Optional: only sync specific blueprints
 * }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PRINTIFY_API_BASE = "https://api.printify.com/v1";
const PRINTIFY_CHOICE_PROVIDER_ID = 99;

interface SyncOptions {
  blueprintIds?: number[];
}

interface SyncResult {
  success: boolean;
  productsCreated: number;
  productsUpdated: number;
  variantsCreated: number;
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
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const PRINTIFY_API_TOKEN = Deno.env.get("PRINTIFY_API_TOKEN")!;
    const PRINTIFY_SHOP_ID = Deno.env.get("PRINTIFY_SHOP_ID")!;

    // Parse request body
    let options: SyncOptions = {};
    try {
      options = await req.json();
    } catch {
      // Empty body is OK
    }
    const { blueprintIds } = options;

    console.log(`Starting catalog sync (Printify Choice only)`);

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const result: SyncResult = {
      success: false,
      productsCreated: 0,
      productsUpdated: 0,
      variantsCreated: 0,
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

        // Fetch blueprint details for image
        let baseImageUrl: string | null = extractFirstImageUrl(blueprint.images);
        try {
          const blueprintDetailResponse = await fetch(
            `${PRINTIFY_API_BASE}/catalog/blueprints/${blueprint.id}.json`,
            {
              headers: { Authorization: `Bearer ${PRINTIFY_API_TOKEN}` },
            }
          );

          if (blueprintDetailResponse.ok) {
            const blueprintDetail = await blueprintDetailResponse.json();
            baseImageUrl = extractFirstImageUrl(blueprintDetail?.images) || baseImageUrl;
          }
        } catch (imageError) {
          console.warn(`Could not fetch blueprint image for ${blueprint.id}:`, imageError);
        }

        // Fetch shipping info for NL
        let shippingCents = 0;

        try {
          const shippingResponse = await fetch(
            `${PRINTIFY_API_BASE}/catalog/blueprints/${blueprint.id}/print_providers/${PRINTIFY_CHOICE_PROVIDER_ID}/shipping.json`,
            {
              headers: { Authorization: `Bearer ${PRINTIFY_API_TOKEN}` },
            }
          );

          if (shippingResponse.ok) {
            const shippingInfo = await shippingResponse.json();
            const nlProfile = shippingInfo.profiles?.find((p: any) => p.countries?.includes("NL"));
            const profile = nlProfile || shippingInfo.profiles?.[0];

            if (profile?.first_item) {
              shippingCents = Math.round(profile.first_item.cost);
            }
          }
        } catch (shippingError) {
          console.warn(`Could not fetch shipping for blueprint ${blueprint.id}:`, shippingError);
        }

        // Check if product exists
        const { data: existingProduct } = await supabase
          .from("catalog_products")
          .select("blueprint_id")
          .eq("blueprint_id", blueprint.id)
          .single();

        if (existingProduct) {
          // Update existing product - PRESERVE editable fields
          const { error: updateError } = await supabase
            .from("catalog_products")
            .update({
              base_image_url: baseImageUrl,
              shipping_cents: shippingCents,
              last_synced_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("blueprint_id", blueprint.id);

          if (updateError) {
            throw new Error(`Failed to update product: ${updateError.message}`);
          }
          result.productsUpdated++;
          console.log(`✓ Updated product ${blueprint.id} (preserved editable fields)`);
        } else {
          // Create new product
          const { error: insertError } = await supabase
            .from("catalog_products")
            .insert({
              blueprint_id: blueprint.id,
              display_title: blueprint.title,
              base_image_url: baseImageUrl,
              shipping_cents: shippingCents,
              is_active: false, // New products start inactive until admin enables
              last_synced_at: new Date().toISOString(),
            });

          if (insertError) {
            throw new Error(`Failed to insert product: ${insertError.message}`);
          }
          result.productsCreated++;
          console.log(`✓ Created new product ${blueprint.id}`);
        }

        // Fetch variants from Printify Choice
        const variantsResponse = await fetch(
          `${PRINTIFY_API_BASE}/catalog/blueprints/${blueprint.id}/print_providers/${PRINTIFY_CHOICE_PROVIDER_ID}/variants.json`,
          {
            headers: { Authorization: `Bearer ${PRINTIFY_API_TOKEN}` },
          }
        );

        if (!variantsResponse.ok) {
          console.warn(`No Printify Choice variants for blueprint ${blueprint.id}`);
          continue;
        }

        const variantsData = await variantsResponse.json();
        const variants = variantsData.variants || [];

        // Extract costs by creating a temporary product
        let variantCosts: Map<number, number> = new Map();

        if (variants.length > 0) {
          try {
            console.log(`Extracting costs for blueprint ${blueprint.id}...`);

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
              }
            );

            if (uploadResponse.ok) {
              const uploadedImage = await uploadResponse.json();
              const firstPlaceholder = variants[0]?.placeholders?.[0];

              if (firstPlaceholder) {
                const tempProduct = {
                  title: `TEMP_${blueprint.id}_${Date.now()}`,
                  description: "Temporary cost extraction",
                  blueprint_id: blueprint.id,
                  print_provider_id: PRINTIFY_CHOICE_PROVIDER_ID,
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
                  }
                );

                if (createResponse.ok) {
                  const createdProduct = await createResponse.json();
                  let tempProductId: string | null = null;

                  try {
                    tempProductId = createdProduct.id;
                    console.log(`✓ Created temp product ${tempProductId}`);

                    for (const variant of createdProduct.variants || []) {
                      if (variant.cost) {
                        variantCosts.set(variant.id, variant.cost);
                      }
                    }

                    console.log(`✓ Extracted ${variantCosts.size} variant costs`);
                  } finally {
                    if (tempProductId) {
                      try {
                        await fetch(
                          `${PRINTIFY_API_BASE}/shops/${PRINTIFY_SHOP_ID}/products/${tempProductId}.json`,
                          {
                            method: "DELETE",
                            headers: { Authorization: `Bearer ${PRINTIFY_API_TOKEN}` },
                          }
                        );
                        console.log(`✓ Deleted temp product ${tempProductId}`);
                      } catch (deleteError) {
                        console.error(`⚠️ Error deleting temp product:`, deleteError);
                      }
                    }
                  }
                }
              }
            }
          } catch (costError) {
            console.error(`Error extracting costs for blueprint ${blueprint.id}:`, costError);
          }
        }

        // Upsert variants
        for (const variant of variants) {
          const variantCost = variantCosts.get(variant.id) || 0;

          const { error: variantError } = await supabase
            .from("product_variants")
            .upsert(
              {
                blueprint_id: blueprint.id,
                printify_variant_id: variant.id,
                color: variant.options?.color || null,
                size: variant.options?.size || null,
                price_cents: Math.round(variantCost),
                is_available: variantCost > 0,
                updated_at: new Date().toISOString(),
              },
              {
                onConflict: "blueprint_id,printify_variant_id",
              }
            );

          if (!variantError) {
            result.variantsCreated++;
          }
        }

        // Update min_price_cents on product
        const { data: minPriceData } = await supabase
          .from("product_variants")
          .select("price_cents")
          .eq("blueprint_id", blueprint.id)
          .eq("is_available", true)
          .gt("price_cents", 0)
          .order("price_cents", { ascending: true })
          .limit(1)
          .single();

        if (minPriceData) {
          await supabase
            .from("catalog_products")
            .update({ min_price_cents: minPriceData.price_cents })
            .eq("blueprint_id", blueprint.id);
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
