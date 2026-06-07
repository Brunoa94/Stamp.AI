/**
 * Test script for getLowestPricesPerVariant function
 *
 * Usage: npx tsx scripts/test-variant-prices.ts
 */

import { ProviderCatalogService } from "../src/services/providerCatalogService";
import { createClient } from "@supabase/supabase-js";

async function testVariantPrices() {
  console.log("=== Testing getLowestPricesPerVariant ===\n");

  const blueprintId = 12; // Bella+Canvas 3001 T-Shirt
  const countryCode = "NL"; // Netherlands

  console.log(`Blueprint ID: ${blueprintId}`);
  console.log(`Country: ${countryCode}\n`);

  // Create Supabase client for server-side use
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Missing Supabase credentials. Check your .env.local file.");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const variantPrices = await ProviderCatalogService.getLowestPricesPerVariant(
      supabase,
      blueprintId,
      countryCode
    );

    console.log(`✅ Found lowest prices for ${variantPrices.size} variants\n`);

    if (variantPrices.size === 0) {
      console.log("⚠️ No variants found. Make sure the database is populated.");
      return;
    }

    // Show first 10 variants as sample
    let count = 0;
    variantPrices.forEach((price, variantId) => {
      if (count < 10) {
        console.log(`Variant ${variantId}:`);
        console.log(`  Provider: ${price.provider_name} (ID: ${price.provider_id})`);
        console.log(`  Variant Price: $${(price.variant_price / 100).toFixed(2)}`);
        console.log(`  Shipping Cost: $${(price.shipping_cost / 100).toFixed(2)}`);
        console.log(`  Total Cost: $${(price.total_cost / 100).toFixed(2)}`);
        console.log("");
        count++;
      }
    });

    if (variantPrices.size > 10) {
      console.log(`... and ${variantPrices.size - 10} more variants\n`);
    }

    // Show price range statistics
    const prices = Array.from(variantPrices.values());
    const minTotal = Math.min(...prices.map(p => p.total_cost));
    const maxTotal = Math.max(...prices.map(p => p.total_cost));
    const avgTotal = prices.reduce((sum, p) => sum + p.total_cost, 0) / prices.length;

    console.log("=== Price Statistics ===");
    console.log(`Cheapest total: $${(minTotal / 100).toFixed(2)}`);
    console.log(`Most expensive: $${(maxTotal / 100).toFixed(2)}`);
    console.log(`Average total: $${(avgTotal / 100).toFixed(2)}`);

    // Show provider distribution
    const providerCounts = new Map<string, number>();
    prices.forEach(p => {
      providerCounts.set(p.provider_name, (providerCounts.get(p.provider_name) || 0) + 1);
    });

    console.log("\n=== Provider Distribution (Winning Bids) ===");
    Array.from(providerCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([provider, count]) => {
        const percentage = ((count / variantPrices.size) * 100).toFixed(1);
        console.log(`${provider}: ${count} variants (${percentage}%)`);
      });

  } catch (error) {
    console.error("❌ Error:", error);
    if (error instanceof Error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }
  }
}

testVariantPrices();
