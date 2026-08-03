/**
 * Script to test print placement by calling Printify API directly
 * Run with: npx tsx scripts/test-print-placement.ts
 */

import fs from "fs";
import path from "path";

// Load env vars from .env.local
function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        const value = valueParts.join("=").replace(/^["']|["']$/g, "");
        process.env[key] = value;
      }
    }
  }
}

interface TestConfig {
  y: number;
  scale: number;
}

const DEV_PRINTIFY_IMAGE_ID = "6a6f9eab785dbd460c374d04";

// Products to test
const PRODUCTS = {
  TSHIRT: { blueprintId: 145, providerId: 99, name: "Unisex Softstyle T-Shirt" },
  HOODIE: { blueprintId: 157, providerId: 0, name: "Unisex Premium Hoodie" },
  MUG: { blueprintId: 49, providerId: 0, name: "White Glossy Mug" },
};

async function getProviders(blueprintId: number): Promise<any[]> {
  const token = process.env.PRINTIFY_API_TOKEN;
  console.log(`   Token present: ${!!token}`);
  const response = await fetch(
    `https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers.json`,
    {
      headers: { 'Authorization': `Bearer ${token}` },
    }
  );
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

async function getVariants(blueprintId: number, providerId: number): Promise<number[]> {
  const token = process.env.PRINTIFY_API_TOKEN;

  const response = await fetch(
    `https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers/${providerId}/variants.json`,
    {
      headers: { 'Authorization': `Bearer ${token}` },
    }
  );

  const data = await response.json();
  const variants = data.variants || [];

  if (variants.length === 0) {
    console.error("   No variants found!");
    return [];
  }

  // Try to find a dark color with M size
  const preferred = variants.filter((v: any) => {
    const title = v.title?.toLowerCase() || '';
    const hasM = title.includes(' m ') || title.includes(' m/') || title.endsWith(' m');
    const isDark = title.includes('navy') || title.includes('black') || title.includes('dark');
    return hasM && isDark;
  });

  if (preferred.length > 0) {
    console.log(`   Found preferred variant: ${preferred[0].title}`);
    return [preferred[0].id];
  }

  // Fallback to first variant
  console.log(`   Using first variant: ${variants[0].title}`);
  return [variants[0].id];
}

interface ProductConfig {
  blueprintId: number;
  providerId: number;
  name: string;
}

async function createTestProduct(config: TestConfig, product: ProductConfig): Promise<{ mockupUrl: string | null; productId: string | null }> {
  const token = process.env.PRINTIFY_API_TOKEN;
  const shopId = process.env.PRINTIFY_SHOP_ID;

  if (!token || !shopId) {
    console.error("❌ Missing PRINTIFY_API_TOKEN or PRINTIFY_SHOP_ID");
    return { mockupUrl: null, productId: null };
  }

  console.log(`\n🧪 Testing ${product.name}: x=0.5, y=${config.y}, scale=${config.scale}`);

  const variantIds = await getVariants(product.blueprintId, product.providerId);
  console.log(`   Using variant IDs: ${variantIds.join(', ')}`);

  const productPayload = {
    title: `Test ${product.name} y=${config.y} scale=${config.scale} - ${Date.now()}`,
    description: "Test product for print placement",
    blueprint_id: product.blueprintId,
    print_provider_id: product.providerId,
    variants: variantIds.map((id: number) => ({
      id,
      price: 50,
      is_enabled: true,
    })),
    print_areas: [
      {
        variant_ids: variantIds,
        placeholders: [
          {
            position: "front",
            images: [
              {
                id: DEV_PRINTIFY_IMAGE_ID,
                x: 0.5,
                y: config.y,
                scale: config.scale,
                angle: 0,
              },
            ],
          },
        ],
      },
    ],
  };

  console.log(`   Payload:`, JSON.stringify(productPayload.print_areas[0].placeholders[0].images[0]));

  const response = await fetch(
    `https://api.printify.com/v1/shops/${shopId}/products.json`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productPayload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("❌ Failed to create product:", JSON.stringify(data, null, 2));
    return { mockupUrl: null, productId: null };
  }

  const mockupUrl = data.images?.[0]?.src;
  console.log("✅ Product created:", data.id);
  console.log("🖼️ Mockup URL:", mockupUrl);

  return { mockupUrl, productId: data.id };
}

async function downloadAndAnalyze(url: string, config: TestConfig): Promise<void> {
  const filename = `/tmp/mockup_y${config.y}_scale${config.scale}.jpg`;

  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(filename, Buffer.from(buffer));

  console.log(`   Saved to: ${filename}`);
}

async function main() {
  loadEnv();

  console.log("🚀 Printify Direct API Test Script");
  console.log("===================================");
  console.log("Testing T-shirt with y=0.5, scale=1.0\n");

  // Test T-shirt (blueprint 145, provider 99)
  const tshirtProduct = PRODUCTS.TSHIRT;
  const config: TestConfig = { y: 0.5, scale: 1.0 };

  const { mockupUrl, productId } = await createTestProduct(config, tshirtProduct);

  if (mockupUrl && productId) {
    // Get front view
    const frontUrl = mockupUrl.replace(/camera_label=[^&]+/, 'camera_label=front');
    console.log(`   Front URL: ${frontUrl}`);

    const response = await fetch(frontUrl);
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(`/tmp/tshirt_y${config.y}_scale${config.scale}.jpg`, Buffer.from(buffer));
    console.log(`   Saved to: /tmp/tshirt_y${config.y}_scale${config.scale}.jpg`);
  }

  console.log("\n✅ Done! Check the images in /tmp/ to see the results.");
}

main().catch(console.error);
