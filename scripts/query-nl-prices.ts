/**
 * Query Best Prices for Netherlands (NL)
 *
 * Usage:
 *   npx tsx scripts/query-nl-prices.ts
 */

import { ProviderCatalogService } from "../src/services/providerCatalogService";

const blueprints = [
  { id: 12, name: "Bella+Canvas 3001 T-Shirt" },
  { id: 6, name: "Gildan 5000 T-Shirt" },
  { id: 145, name: "Heavy Blend Hoodie" },
  { id: 157, name: "Tote Bag" },
  { id: 553, name: "11oz Mug" },
];

async function main() {
  console.log("=== Cheapest Providers for Netherlands (NL) ===\n");

  for (const blueprint of blueprints) {
    try {
      const best = await ProviderCatalogService.getBestProviderForCountry(
        blueprint.id,
        "NL",
      );

      if (!best) {
        console.log(`❌ ${blueprint.name}: No provider ships to NL\n`);
        continue;
      }

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
      const comparison = await ProviderCatalogService.getProviderComparison(
        blueprint.id,
        "NL",
      );

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
