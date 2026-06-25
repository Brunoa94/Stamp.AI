/**
 * Stock Availability Check Job
 * Runs at 9:00 AM UTC
 * Lightweight check of blueprint existence (no price sync)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface Product {
  id: string;
  blueprint_id: number;
  name: string;
  availability_status: string;
}

Deno.serve(async (req) => {
  try {
    const PRINTIFY_API_TOKEN = Deno.env.get("PRINTIFY_API_TOKEN")!;
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get(
      "SUPABASE_SERVICE_ROLE_KEY"
    )!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log("📊 Starting stock availability check...");

    // Get all active products
    const { data: products, error: fetchError } = await supabase
      .from("catalog_products")
      .select("id, blueprint_id, name, availability_status")
      .eq("is_active", true);

    if (fetchError) {
      throw new Error(`Failed to fetch products: ${fetchError.message}`);
    }

    console.log(`📦 Checking ${products.length} products...`);

    const results = {
      total: products.length,
      available: 0,
      unavailable: 0,
      errors: 0,
      statusChanges: [] as Array<{
        blueprint_id: number;
        name: string;
        from: string;
        to: string;
      }>,
    };

    for (const product of products as Product[]) {
      try {
        // Quick check: Does blueprint still exist?
        const response = await fetch(
          `https://api.printify.com/v1/catalog/blueprints/${product.blueprint_id}.json`,
          {
            headers: { Authorization: `Bearer ${PRINTIFY_API_TOKEN}` },
          }
        );

        if (response.ok) {
          results.available++;

          // If it was previously unavailable, restore it
          if (
            product.availability_status === "out_of_stock" ||
            product.availability_status === "discontinued" ||
            product.availability_status === "temporarily_unavailable"
          ) {
            console.log(
              `✅ Blueprint ${product.blueprint_id} restored (was ${product.availability_status})`
            );

            await supabase.rpc("update_product_stock_status", {
              p_product_id: product.id,
              p_new_status: "in_stock",
              p_reason: "restored",
              p_error_message: null,
            });

            results.statusChanges.push({
              blueprint_id: product.blueprint_id,
              name: product.name,
              from: product.availability_status,
              to: "in_stock",
            });
          } else {
            // Just update the check timestamp
            await supabase
              .from("catalog_products")
              .update({ last_availability_check: new Date().toISOString() })
              .eq("id", product.id);
          }
        } else if (response.status === 404) {
          results.unavailable++;

          // Blueprint no longer exists
          if (product.availability_status !== "discontinued") {
            console.log(
              `❌ Blueprint ${product.blueprint_id} discontinued (404 from Printify)`
            );

            await supabase.rpc("update_product_stock_status", {
              p_product_id: product.id,
              p_new_status: "discontinued",
              p_reason: "blueprint_removed",
              p_error_message: "Blueprint not found in Printify catalog (404)",
            });

            results.statusChanges.push({
              blueprint_id: product.blueprint_id,
              name: product.name,
              from: product.availability_status,
              to: "discontinued",
            });
          }
        } else {
          // API error (not 404)
          results.errors++;
          console.error(
            `⚠️ Error checking blueprint ${product.blueprint_id}: ${response.status}`
          );

          // Don't mark as discontinued on API errors
          await supabase.rpc("update_product_stock_status", {
            p_product_id: product.id,
            p_new_status: "temporarily_unavailable",
            p_reason: "api_error",
            p_error_message: `API returned status ${response.status}`,
          });
        }
      } catch (error) {
        results.errors++;
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(
          `❌ Error checking blueprint ${product.blueprint_id}:`,
          errorMsg
        );

        // Mark as temporarily unavailable on errors
        await supabase.rpc("update_product_stock_status", {
          p_product_id: product.id,
          p_new_status: "temporarily_unavailable",
          p_reason: "check_failed",
          p_error_message: errorMsg,
        });
      }
    }

    console.log("✅ Stock check complete:", results);

    // Log summary of status changes
    if (results.statusChanges.length > 0) {
      console.log("\n📋 Status changes:");
      results.statusChanges.forEach((change) => {
        console.log(
          `  Blueprint ${change.blueprint_id} (${change.name}): ${change.from} → ${change.to}`
        );
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        results,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Stock availability check failed:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
