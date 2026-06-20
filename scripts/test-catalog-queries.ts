/**
 * Test Catalog Queries
 * Verifies the catalog query service works correctly
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://tgccxydchvujhrqyzqao.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnY2N4eWRjaHZ1amhycXl6cWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyOTQ0ODMsImV4cCI6MjA5Njg3MDQ4M30.52GltDCy4oO6DH9Rw4MmqM_e_Z5tfmnyC9bgRGjbQMY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testCatalogQueries() {
  console.log("🧪 Testing Catalog Query Service...\n");

  try {
    // Test 1: Get all products
    console.log("1️⃣  Fetching catalog products...");
    const { data: products, error: productsError } = await supabase
      .from("catalog_products")
      .select("*")
      .eq("is_active", true);

    if (productsError) throw productsError;
    console.log(`   ✅ Found ${products.length} products`);
    if (products.length > 0) {
      console.log(`   📦 Product: ${products[0].name} (Blueprint ${products[0].blueprint_id})\n`);
    }

    if (products.length === 0) {
      console.log("   ❌ No products found. Run sync first!\n");
      return;
    }

    const product = products[0];

    // Test 2: Get variants
    console.log("2️⃣  Fetching product variants...");
    const { data: variants, error: variantsError } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", product.id)
      .limit(10);

    if (variantsError) throw variantsError;
    console.log(`   ✅ Found ${variants.length} variants`);
    console.log(`   🎨 Sample variants:`,);
    variants.slice(0, 3).forEach((v: any) => {
      console.log(`      - ${v.color} / ${v.size}`);
    });
    console.log();

    // Test 3: Get providers for US
    console.log("3️⃣  Fetching providers for US...");
    const { data: providers, error: providersError } = await supabase
      .from("product_provider_availability")
      .select(`
        print_provider_id,
        base_price_cents,
        currency_code,
        print_providers (
          name
        )
      `)
      .eq("product_id", product.id)
      .eq("country_code", "US")
      .eq("is_available", true);

    if (providersError) throw providersError;
    console.log(`   ✅ Found ${providers.length} providers for US`);
    providers.forEach((p: any) => {
      console.log(`      - ${p.print_providers.name}: $${(p.base_price_cents / 100).toFixed(2)} ${p.currency_code}`);
    });
    console.log();

    // Test 4: Get variant pricing
    if (variants.length > 0 && providers.length > 0) {
      console.log("4️⃣  Fetching variant pricing...");
      const variant = variants[0];
      const provider = providers[0];

      const { data: pricing, error: pricingError } = await supabase
        .from("variant_pricing")
        .select("*")
        .eq("variant_id", variant.id)
        .eq("print_provider_id", provider.print_provider_id)
        .eq("country_code", "US")
        .single();

      if (pricingError) {
        console.log(`   ⚠️  No pricing found for ${variant.color}/${variant.size}`);
      } else {
        console.log(`   ✅ Price for ${variant.color}/${variant.size}:`);
        console.log(`      $${(pricing.price_cents / 100).toFixed(2)} ${pricing.currency_code || 'USD'}\n`);
      }
    }

    // Test 5: Test RPC function
    console.log("5️⃣  Testing RPC function (get_providers_for_product)...");
    const { data: rpcProviders, error: rpcError } = await supabase.rpc(
      "get_providers_for_product",
      {
        p_product_id: product.id,
        p_country_code: "US",
      }
    );

    if (rpcError) throw rpcError;
    console.log(`   ✅ RPC returned ${rpcProviders.length} providers`);
    console.log();

    // Test 6: Get colors
    console.log("6️⃣  Fetching available colors...");
    const { data: colorData, error: colorsError } = await supabase
      .from("product_variants")
      .select("color")
      .eq("product_id", product.id)
      .not("color", "is", null);

    if (colorsError) throw colorsError;
    const colors = [...new Set(colorData.map((v: any) => v.color))];
    console.log(`   ✅ Found ${colors.length} colors`);
    console.log(`   🎨 Colors: ${colors.slice(0, 5).join(", ")}${colors.length > 5 ? "..." : ""}\n`);

    // Test 7: Get sizes for a color
    if (colors.length > 0) {
      console.log(`7️⃣  Fetching sizes for color "${colors[0]}"...`);
      const { data: sizeData, error: sizesError } = await supabase
        .from("product_variants")
        .select("size")
        .eq("product_id", product.id)
        .eq("color", colors[0])
        .not("size", "is", null);

      if (sizesError) throw sizesError;
      const sizes = sizeData.map((v: any) => v.size);
      console.log(`   ✅ Found ${sizes.length} sizes: ${sizes.join(", ")}\n`);
    }

    console.log("✅ All tests passed!\n");
    console.log("📊 Summary:");
    console.log(`   Products: ${products.length}`);
    console.log(`   Variants: ${variants.length}+`);
    console.log(`   Providers: ${providers.length}`);
    console.log(`   Colors: ${colors.length}`);
    console.log("\n🎉 Catalog system is working correctly!");

  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testCatalogQueries();
