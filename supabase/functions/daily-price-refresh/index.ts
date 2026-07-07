/**
 * Daily Price Refresh Job
 * Runs at 2:00 AM UTC
 * Updates prices and availability for ALL active products
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireServiceRoleOrCron } from "../_shared/authGuard.ts";

interface ProductToUpdate {
  product_id: string;
  blueprint_id: number;
  name: string;
  last_synced: string | null;
  hours_since_sync: number | null;
}

Deno.serve(async (req) => {
  try {
    requireServiceRoleOrCron(req);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get(
      "SUPABASE_SERVICE_ROLE_KEY"
    )!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log("🔄 Starting daily price refresh...");

    // Get all products needing updates
    const { data: productsToUpdate, error: fetchError } = await supabase.rpc(
      "get_products_for_daily_price_update"
    );

    if (fetchError) {
      throw new Error(`Failed to fetch products: ${fetchError.message}`);
    }

    const products = productsToUpdate as ProductToUpdate[];
    console.log(`📦 Found ${products.length} products to update`);

    const results = {
      total: products.length,
      updated: 0,
      failed: 0,
      discontinued: 0,
      priceChanges: [] as Array<{
        blueprint_id: number;
        name: string;
        changes: number;
      }>,
      errors: [] as Array<{ blueprint_id: number; error: string }>,
    };

    // Process each product
    for (const product of products) {
      try {
        console.log(
          `Syncing blueprint ${product.blueprint_id} (${product.name})...`
        );

        // Call sync-catalog for this specific product
        const syncResponse = await fetch(
          `${SUPABASE_URL}/functions/v1/sync-catalog`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              blueprintIds: [product.blueprint_id],
              countries: ["NL", "US", "GB", "DE", "FR"],
              forceUpdate: true,
            }),
          }
        );

        const syncResult = await syncResponse.json();

        if (syncResult.success && syncResult.errors.length === 0) {
          results.updated++;
          console.log(`✅ Blueprint ${product.blueprint_id} updated`);
        } else if (
          syncResult.errors?.some(
            (e: { error: string }) =>
              e.error.includes("not found") ||
              e.error.includes("404") ||
              e.error.includes("does not exist")
          )
        ) {
          // Blueprint no longer exists in Printify
          console.log(
            `❌ Blueprint ${product.blueprint_id} discontinued (not found in Printify)`
          );

          await supabase.rpc("update_product_stock_status", {
            p_product_id: product.product_id,
            p_new_status: "discontinued",
            p_reason: "blueprint_removed",
            p_error_message: "Blueprint no longer available in Printify catalog",
          });

          results.discontinued++;
        } else {
          // Other error
          const errorMsg =
            syncResult.errors?.[0]?.error || "Unknown sync error";
          console.error(`❌ Blueprint ${product.blueprint_id} failed:`, errorMsg);

          results.failed++;
          results.errors.push({
            blueprint_id: product.blueprint_id,
            error: errorMsg,
          });

          // Mark as temporarily unavailable
          await supabase.rpc("update_product_stock_status", {
            p_product_id: product.product_id,
            p_new_status: "temporarily_unavailable",
            p_reason: "sync_failed",
            p_error_message: errorMsg,
          });
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(
          `❌ Failed to update product ${product.blueprint_id}:`,
          errorMsg
        );

        results.failed++;
        results.errors.push({
          blueprint_id: product.blueprint_id,
          error: errorMsg,
        });
      }
    }

    console.log(`✅ Price refresh complete:`, results);

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
    console.error("Daily price refresh failed:", error);

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
