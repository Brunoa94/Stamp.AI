/**
 * Query Best Prices for Netherlands (NL)
 *
 * Usage:
 *   npx tsx scripts/query-nl-prices.ts
 */

import { createClient } from "@supabase/supabase-js";
import type { BestProviderResultI } from "../supabase/types/provider-catalog";

const blueprints = [
  { id: 12, name: "Bella+Canvas 3001 T-Shirt" },
  { id: 6, name: "Gildan 5000 T-Shirt" },
  { id: 145, name: "Heavy Blend Hoodie" },
  { id: 157, name: "Tote Bag" },
  { id: 553, name: "11oz Mug" },
];

async function main() {
  // Create Supabase client for server-side use
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Missing Supabase credentials. Check your .env.local file.");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  console.log("=== Cheapest Providers for Netherlands (NL) ===\n");

  for (const blueprint of blueprints) {
    try {
      // Call database function directly
      const { data, error } = await supabase.rpc(
        "get_best_provider_for_country",
        {
          p_blueprint_id: blueprint.id,
          p_country_code: "NL",
        }
      );

      if (error || !data || data.length === 0) {
        console.log(`❌ ${blueprint.name}: No provider ships to NL\n`);
        continue;
      }

      const best = data[0] as BestProviderResultI;

      console.log(`✅ ${blueprint.name}:`);
      console.log(
        `   Provider: ${best.provider_name} (ID: ${best.provider_id})`,
      );
      console.log(
        `   Product Price: $${(best.product_price / 100).toFixed(2)}`,
      );
      console.log(
        `   Shipping Cost: $${(best.shipping_cost / 100).toFixed(2)}`,
      );
      console.log(
        `   Total Cost: $${(best.total_cost / 100).toFixed(2)}`,
      );
      console.log("");
    } catch (error) {
      console.error(`❌ Error for ${blueprint.name}:`, error);
      console.log("");
    }
  }

  console.log("\n=== Full Provider Comparison (All Providers for Each Product) ===\n");

  for (const blueprint of blueprints) {
    try {
      // Get all providers for this blueprint
      const { data: providers, error: fetchError } = await supabase
        .from("provider_catalog")
        .select("*")
        .eq("blueprint_id", blueprint.id)
        .gt("expires_at", new Date().toISOString())
        .order("cache_metadata->min_price", { ascending: true });

      if (fetchError || !providers || providers.length === 0) {
        console.log(`${blueprint.name}: No providers ship to NL\n`);
        continue;
      }

      const comparison: BestProviderResultI[] = [];

      for (const provider of providers) {
        // Find shipping cost for NL
        let shippingCost = 0;

        for (const profile of provider.shipping_profiles) {
          if (profile.countries.includes("NL")) {
            shippingCost = profile.first_item.cost;
            break;
          }
        }

        if (shippingCost > 0 || provider.shipping_profiles.length === 0) {
          const productPrice = provider.cache_metadata.min_price;
          comparison.push({
            provider_id: provider.provider_id,
            provider_name: provider.provider_name,
            total_cost: productPrice + shippingCost,
            product_price: productPrice,
            shipping_cost: shippingCost,
          });
        }
      }

      // Sort by total cost (lowest first)
      comparison.sort((a, b) => a.total_cost - b.total_cost);

      if (comparison.length === 0) {
        console.log(`${blueprint.name}: No providers ship to NL\n`);
        continue;
      }

      console.log(`${blueprint.name} (${comparison.length} providers):`);

      comparison.forEach((provider, index) => {
        const marker = index === 0 ? "🏆" : `   ${index + 1}.`;
        console.log(
          `${marker} ${provider.provider_name} - Total: $${(provider.total_cost / 100).toFixed(2)} (Product: $${(provider.product_price / 100).toFixed(2)} + Shipping: $${(provider.shipping_cost / 100).toFixed(2)})`,
        );
      });

      console.log("");
    } catch (error) {
      console.error(`Error comparing providers for ${blueprint.name}:`, error);
      console.log("");
    }
  }
}

main().catch(console.error);
