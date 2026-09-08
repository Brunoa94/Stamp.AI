/**
 * Test script to find optimal pillow placement settings
 * Run with: npx tsx scripts/test-pillow-placement.ts
 */

// Load env vars
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const PRINTIFY_API_TOKEN = process.env.PRINTIFY_API_TOKEN!;

interface PlacementParams {
  x: number;
  y: number;
  scale: number;
  angle: number;
}

async function getPrintAreaDimensions() {
  console.log("\n📐 Fetching print area dimensions from Printify API...\n");

  // First, get available print providers for blueprint 229
  const providersResponse = await fetch(
    "https://api.printify.com/v1/catalog/blueprints/229/print_providers.json",
    {
      headers: {
        Authorization: `Bearer ${PRINTIFY_API_TOKEN}`,
      },
    }
  );

  if (!providersResponse.ok) {
    console.error("Failed to fetch providers:", await providersResponse.text());
    return null;
  }

  const providers = await providersResponse.json();
  console.log("Available providers:", providers.map((p: any) => `${p.id}: ${p.title}`).join(", "));

  // Use the first available provider
  const providerId = providers[0]?.id;
  if (!providerId) {
    console.log("No providers found");
    return null;
  }

  console.log(`Using provider ${providerId}`);

  // Get variants for blueprint 229 (pillow)
  const response = await fetch(
    `https://api.printify.com/v1/catalog/blueprints/229/print_providers/${providerId}/variants.json`,
    {
      headers: {
        Authorization: `Bearer ${PRINTIFY_API_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    console.error("Failed to fetch variants:", await response.text());
    return null;
  }

  const data = await response.json();
  const variants = data.variants || [];

  if (variants.length === 0) {
    console.log("No variants found");
    return null;
  }

  // Get first variant's placeholders
  const firstVariant = variants[0];
  console.log("First variant:", firstVariant.title);
  console.log("Placeholders:", JSON.stringify(firstVariant.placeholders, null, 2));

  const frontPlaceholder = firstVariant.placeholders?.find(
    (p: any) => p.position === "front"
  );

  if (frontPlaceholder) {
    console.log(`\nFront print area: ${frontPlaceholder.width}x${frontPlaceholder.height}px`);
    return {
      width: frontPlaceholder.width,
      height: frontPlaceholder.height,
    };
  }

  return null;
}

function calculateOptimalScale(
  artworkWidth: number,
  artworkHeight: number,
  printAreaWidth: number,
  printAreaHeight: number,
  safeZone: { top: number; bottom: number; left: number; right: number }
) {
  const artworkAspect = artworkWidth / artworkHeight;
  const printAreaAspect = printAreaWidth / printAreaHeight;

  const safeWidth = 1 - safeZone.left - safeZone.right;
  const safeHeight = 1 - safeZone.top - safeZone.bottom;

  // Scale calculation:
  // scale = 1.0 means artwork width fills print area width
  // If artwork is 3000px and print area is 3900px:
  //   scale = 1.0 would make artwork appear at 3900px (stretched)
  //   scale = 3000/3900 = 0.77 would make artwork appear at 3000px (actual size)

  // For FILL (edge-to-edge), we want the artwork to cover the entire safe area
  // maxScaleByWidth = safeWidth (usually 0.9 with 5% margins)
  // maxScaleByHeight = safeHeight * (artworkAspect / printAreaAspect)

  const maxScaleByWidth = safeWidth;
  const maxScaleByHeight = (safeHeight * artworkAspect) / printAreaAspect;

  // Take the minimum to fit within bounds
  const fitScale = Math.min(maxScaleByWidth, maxScaleByHeight);

  // For FILL (cover), take the maximum to ensure full coverage
  const fillScale = Math.max(maxScaleByWidth, maxScaleByHeight);

  return {
    fitScale,
    fillScale,
    maxScaleByWidth,
    maxScaleByHeight,
  };
}

async function createTestProduct(
  scale: number,
  imageId: string,
  x: number = 0.5,
  y: number = 0.25
): Promise<{ mockupUrl?: string; error?: string }> {
  console.log(`\n🧪 Creating test product with scale: ${scale}, x: ${x}, y: ${y}`);

  const placement: PlacementParams = {
    x: x,
    y: y,
    scale: scale,
    angle: 0,
  };

  const response = await fetch(`${SUPABASE_URL}/functions/v1/create-custom-product`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      blueprint_id: 229,
      print_provider_id: 10, // MWW On Demand
      image_id: imageId,
      image_width: 3000,
      image_height: 3000,
      color: "White",
      size: '18" × 18"',
      placements: {
        front: placement,
      },
      title: `Pillow Test Scale ${scale}`,
    }),
  });

  const data = await response.json();
  console.log("Full response:", JSON.stringify(data, null, 2));

  if (!response.ok) {
    console.error("❌ API Error:", data);
    return { error: data.error || "Unknown error" };
  }

  console.log(`✅ Product created!`);
  console.log(`   Product ID: ${data.product_id || data.id}`);
  console.log(`   Mockup URL: ${data.mockup_url || data.images?.[0]?.src}`);
  console.log(`   Debug placement: ${JSON.stringify(data.debug?.placement || data.placement)}`);

  return { mockupUrl: data.mockup_url };
}

async function uploadTestImage(): Promise<string | null> {
  console.log("\n📤 Uploading test image to Printify...");

  // Create a simple test image URL (red square)
  const testImageUrl = "https://placehold.co/3000x3000/FF0000/FF0000.png";

  const response = await fetch("https://api.printify.com/v1/uploads/images.json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PRINTIFY_API_TOKEN}`,
    },
    body: JSON.stringify({
      file_name: "test-pillow-image.png",
      url: testImageUrl,
    }),
  });

  if (!response.ok) {
    console.error("Failed to upload image:", await response.text());
    return null;
  }

  const data = await response.json();
  console.log(`✅ Image uploaded: ${data.id}`);
  return data.id;
}

async function runTest() {
  console.log("🔧 Pillow Placement Test Script\n");
  console.log("=".repeat(60));

  console.log("\nEnvironment check:");
  console.log(`  SUPABASE_URL: ${SUPABASE_URL ? "✓ " + SUPABASE_URL : "✗"}`);
  console.log(`  SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? "✓ (set)" : "✗"}`);
  console.log(`  PRINTIFY_API_TOKEN: ${PRINTIFY_API_TOKEN ? "✓ (set)" : "✗"}`);

  // Step 1: Get actual print area dimensions from Printify
  const printArea = await getPrintAreaDimensions();

  if (!printArea) {
    console.log("\n❌ Could not get print area dimensions. Check Printify API token.");
    return;
  }

  // Step 2: Calculate optimal scale values
  const artworkWidth = 3000;
  const artworkHeight = 3000;

  console.log("\n" + "=".repeat(60));
  console.log("SCALE CALCULATIONS");
  console.log("=".repeat(60));

  console.log(`\nArtwork: ${artworkWidth}x${artworkHeight}px`);
  console.log(`Print area: ${printArea.width}x${printArea.height}px`);

  // Test with different safe zones
  const safeZones = [
    { name: "1%", zone: { top: 0.01, bottom: 0.01, left: 0.01, right: 0.01 } },
    { name: "3%", zone: { top: 0.03, bottom: 0.03, left: 0.03, right: 0.03 } },
    { name: "5%", zone: { top: 0.05, bottom: 0.05, left: 0.05, right: 0.05 } },
  ];

  for (const { name, zone } of safeZones) {
    const scales = calculateOptimalScale(
      artworkWidth,
      artworkHeight,
      printArea.width,
      printArea.height,
      zone
    );

    console.log(`\nWith ${name} safe zone:`);
    console.log(`  Max scale by width: ${scales.maxScaleByWidth.toFixed(3)}`);
    console.log(`  Max scale by height: ${scales.maxScaleByHeight.toFixed(3)}`);
    console.log(`  FIT scale (min): ${scales.fitScale.toFixed(3)}`);
    console.log(`  FILL scale (max): ${scales.fillScale.toFixed(3)}`);
  }

  // Step 3: Test actual product creation with different scales
  console.log("\n" + "=".repeat(60));
  console.log("CREATING TEST PRODUCTS");
  console.log("=".repeat(60));

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !PRINTIFY_API_TOKEN) {
    console.log("\n⚠️  Missing environment variables. Skipping API test.");
    return;
  }

  // Upload a test image first
  const imageId = await uploadTestImage();
  if (!imageId) {
    console.log("\n❌ Could not upload test image");
    return;
  }

  // Test auto-placement - don't provide placement, let server calculate optimal values
  console.log("\n📊 Testing SERVER auto-placement (no client placement provided)...\n");

  // Don't pass placements - let server use default scale of 0.48
  const response = await fetch(`${SUPABASE_URL}/functions/v1/create-custom-product`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      blueprint_id: 229,
      print_provider_id: 10,
      image_id: imageId,
      image_width: 3000,
      image_height: 3000,
      color: "White",
      size: '18" × 18"',
      // NO placements provided - server will auto-calculate
      title: `Pillow Auto-Placement Test`,
    }),
  });
  const data = await response.json();
  console.log("Response:", JSON.stringify(data, null, 2).slice(0, 500));
  console.log("\nMockup URL:", data.product?.images?.[0]?.src);

  console.log("\n" + "=".repeat(60));
  console.log("TEST COMPLETE");
  console.log("=".repeat(60));
  console.log("\n👆 Review the mockup URLs above to determine optimal scale.");
  console.log("   The design should fill the entire pillow with minimal/no white edges.");
}

// Run
runTest().catch(console.error);
