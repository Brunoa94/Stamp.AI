#!/usr/bin/env node
/**
 * Generate Catalog-Ready Lifestyle Photos from Product Mockups
 *
 * This script:
 * 1. Takes an image path and blueprint/product ID as input
 * 2. Uploads the image to Printify and creates a custom product to get mockups
 * 3. Passes the mockups to Gemini to generate catalog-ready lifestyle photos
 *
 * Usage:
 *   node scripts/generate-catalog-photos.mjs <image-path> <blueprint-id> [--provider <id>] [--color <color>] [--output <dir>]
 *
 * Examples:
 *   node scripts/generate-catalog-photos.mjs ./my-design.png 145
 *   node scripts/generate-catalog-photos.mjs ./my-design.png 145 --color black --output ./catalog-photos
 *
 * Environment variables required:
 *   - GOOGLE_GEMINI_API_KEY
 *   - PRINTIFY_API_TOKEN (or NEXT_PUBLIC_PRINTIFY_API_TOKEN)
 *   - PRINTIFY_SHOP_ID (or NEXT_PUBLIC_PRINTIFY_SHOP_ID)
 */

// Load environment variables from .env and .env.local files
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

/*
 */

import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ============================================================================
// Print Placement Configuration (from supabase/functions/_shared/printPlacement.ts)
// ============================================================================

const MIN_SCALE = 0.1;
const ADDITIONAL_SAFETY_MARGIN = 0.02;
const MAX_ITERATIONS = 8;

// Product configurations indexed by blueprint ID (matches server-side config)
const PRODUCT_CONFIGS = {
  // T-Shirts
  145: { safeZone: { top: 0.05, bottom: 0.03, left: 0.03, right: 0.03 }, minDpi: 150, anchorY: 0.45, name: 'Unisex Softstyle T-Shirt' },
  5: { safeZone: { top: 0.05, bottom: 0.03, left: 0.03, right: 0.03 }, minDpi: 150, anchorY: 0.45, name: 'Unisex Cotton Crew Tee' },
  6: { safeZone: { top: 0.05, bottom: 0.03, left: 0.03, right: 0.03 }, minDpi: 150, anchorY: 0.45, name: 'Unisex Heavy Cotton Tee' },
  157: { safeZone: { top: 0.05, bottom: 0.03, left: 0.03, right: 0.03 }, minDpi: 150, anchorY: 0.45, name: 'Kids Heavy Cotton Tee' },
  // Hoodies
  77: { safeZone: { top: 0.08, bottom: 0.05, left: 0.05, right: 0.05 }, minDpi: 150, anchorY: 0.42, name: 'Unisex Heavy Blend Hoodie' },
  1525: { safeZone: { top: 0.08, bottom: 0.05, left: 0.05, right: 0.05 }, minDpi: 150, anchorY: 0.42, name: 'Unisex Heavy Blend Hoodie' },
  49: { safeZone: { top: 0.05, bottom: 0.03, left: 0.03, right: 0.03 }, minDpi: 150, anchorY: 0.45, name: 'Crewneck Sweatshirt' },
  // Tote bags
  553: { safeZone: { top: 0.03, bottom: 0.03, left: 0.03, right: 0.03 }, minDpi: 150, anchorY: 0.5, name: 'Cotton Tote Bag' },
  // AOP Tote Bag (all-over print, very tall 2175x4350 print area wraps front+back)
  // Front panel is TOP HALF (0 to 0.5), anchorY: 0.22 centers on front panel
  // NOTE: For catalog photos, using larger scale (1.2) than server-side (0.85) for better visibility
  1389: { safeZone: { top: 0.03, bottom: 0.03, left: 0.03, right: 0.03 }, minDpi: 150, anchorY: 0.22, maxScale: 1.2, scaleOnly: true, name: 'AOP Tote Bag' },
  // Mugs
  441: { safeZone: { top: 0.05, bottom: 0.05, left: 0.15, right: 0.15 }, minDpi: 150, anchorY: 0.5, name: 'Ceramic Mug EU' },
  468: { safeZone: { top: 0.05, bottom: 0.05, left: 0.15, right: 0.15 }, minDpi: 150, anchorY: 0.5, name: 'White Glossy Mug' },
  // Canvas
  658: { safeZone: { top: 0.03, bottom: 0.03, left: 0.03, right: 0.03 }, minDpi: 150, anchorY: 0.5, name: 'Matte Canvas' },
  // Socks
  462: { safeZone: { top: 0.03, bottom: 0.03, left: 0.03, right: 0.03 }, minDpi: 150, anchorY: 0.5, name: 'Cushioned Crew Socks' },
  // Notebooks
  475: { safeZone: { top: 0.03, bottom: 0.03, left: 0.03, right: 0.03 }, minDpi: 150, anchorY: 0.5, name: 'Spiral Journal EU' },
  // Pillows
  229: { safeZone: { top: 0.03, bottom: 0.03, left: 0.03, right: 0.03 }, minDpi: 150, anchorY: 0.5, name: 'Pillowcase' },
};

const DEFAULT_CONFIG = {
  safeZone: { top: 0.03, bottom: 0.03, left: 0.03, right: 0.03 },
  minDpi: 150,
  anchorY: 0.5,
  name: 'Unknown Product',
};

function getProductConfig(blueprintId) {
  return PRODUCT_CONFIGS[blueprintId] || DEFAULT_CONFIG;
}

/**
 * Calculate optimal scale to fit artwork within safe zone
 */
function calculateOptimalScale(artwork, printArea, safeZone, maxScaleLimit) {
  const artworkAspect = artwork.width / artwork.height;
  const printAreaAspect = printArea.width / printArea.height;

  const safeWidth = 1 - safeZone.left - safeZone.right;
  const safeHeight = 1 - safeZone.top - safeZone.bottom;

  const maxScaleByWidth = safeWidth;
  const maxScaleByHeight = (safeHeight * artworkAspect) / printAreaAspect;

  let optimalScale = Math.min(maxScaleByWidth, maxScaleByHeight);

  // Apply maxScale limit if configured
  if (maxScaleLimit !== undefined) {
    optimalScale = Math.min(optimalScale, maxScaleLimit);
  }

  return Math.max(MIN_SCALE, optimalScale);
}

/**
 * Calculate artwork height in print area units
 */
function calculateArtworkHeight(artwork, printArea, scale) {
  const artworkAspect = artwork.width / artwork.height;
  const printAreaAspect = printArea.width / printArea.height;
  return (scale / artworkAspect) * printAreaAspect;
}

/**
 * Calculate centered position accounting for artwork size
 */
function calculateCenteredPosition(safeZone, artworkHeight, anchorY) {
  const centerX = (safeZone.left + (1 - safeZone.right)) / 2;

  const halfHeight = artworkHeight / 2;
  const minY = safeZone.top + halfHeight;
  const maxY = (1 - safeZone.bottom) - halfHeight;

  let centerY;
  if (minY > maxY) {
    centerY = (safeZone.top + (1 - safeZone.bottom)) / 2;
  } else if (anchorY !== undefined) {
    centerY = Math.max(minY, Math.min(maxY, anchorY));
  } else {
    centerY = (minY + maxY) / 2;
  }

  return { x: centerX, y: centerY };
}

/**
 * Calculate placement for given artwork and print area
 * This matches the server-side placement calculation
 */
function calculatePlacement(artworkWidth, artworkHeight, printAreaWidth, printAreaHeight, blueprintId) {
  const config = getProductConfig(blueprintId);
  const artwork = { width: artworkWidth, height: artworkHeight };
  const printArea = { width: printAreaWidth, height: printAreaHeight };

  // Calculate optimal scale (respecting maxScale if configured)
  let scale = calculateOptimalScale(artwork, printArea, config.safeZone, config.maxScale);

  // Iterate with safety margin adjustments if needed
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    if (i > 0) {
      scale *= (1 - ADDITIONAL_SAFETY_MARGIN);
      scale = Math.max(MIN_SCALE, scale);
    }

    const artworkHeightCalc = calculateArtworkHeight(artwork, printArea, scale);
    const { x, y } = calculateCenteredPosition(config.safeZone, artworkHeightCalc, config.anchorY);

    // Simple safe zone check
    const halfWidth = scale / 2;
    const halfHeight = artworkHeightCalc / 2;
    const left = x - halfWidth;
    const right = x + halfWidth;
    const top = y - halfHeight;
    const bottom = y + halfHeight;

    if (left >= config.safeZone.left && right <= (1 - config.safeZone.right) &&
        top >= config.safeZone.top && bottom <= (1 - config.safeZone.bottom)) {
      return { x, y, scale, angle: 0, config };
    }
  }

  // Fallback - use final calculated values
  const finalArtworkHeight = calculateArtworkHeight(artwork, printArea, scale);
  const { x, y } = calculateCenteredPosition(config.safeZone, finalArtworkHeight, config.anchorY);
  return { x, y, scale, angle: 0, config };
}

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_PRINT_PROVIDER_ID = 99; // Default print provider
const DEFAULT_OUTPUT_DIR = 'images-generated/catalog-photos';

// Random environment prompts for lifestyle photos
// These create catalog-ready images without faces
const ENVIRONMENT_PROMPTS = [
  {
    id: 'coffee-shop',
    prompt: 'Product photographed on a rustic wooden table in a cozy coffee shop, warm ambient lighting, shallow depth of field, steam from coffee cup visible nearby, soft bokeh background with blurred cafe elements',
  },
  {
    id: 'outdoor-nature',
    prompt: 'Product laid flat on natural grass in a sunny park, dappled sunlight filtering through trees, soft shadows, picnic blanket corner visible, natural outdoor photography style',
  },
  {
    id: 'minimalist-studio',
    prompt: 'Product on a clean white marble surface, soft studio lighting from the left, subtle shadow, minimalist composition with a small potted succulent in the corner, professional product photography',
  },
  {
    id: 'urban-concrete',
    prompt: 'Product placed on weathered concrete steps, urban street style, natural daylight, slight industrial aesthetic, graffiti wall blurred in background, street fashion photography',
  },
  {
    id: 'beach-coastal',
    prompt: 'Product on light driftwood, sandy beach setting, soft coastal morning light, ocean waves blurred in the distance, seashells scattered nearby, relaxed vacation vibes',
  },
  {
    id: 'home-lifestyle',
    prompt: 'Product draped over a comfortable linen sofa armrest, cozy home interior, warm afternoon light through curtains, houseplants visible, lifestyle home photography',
  },
  {
    id: 'gym-fitness',
    prompt: 'Product folded neatly on a gym bench, fitness equipment blurred in background, energetic lighting, water bottle and towel nearby, athletic lifestyle photography',
  },
  {
    id: 'workspace-desk',
    prompt: 'Product on a modern wooden desk, creative workspace setting, laptop and notebook visible at edges, warm desk lamp lighting, productive professional environment',
  },
  {
    id: 'travel-suitcase',
    prompt: 'Product partially folded in an open vintage suitcase, travel essentials nearby (passport, sunglasses), hotel room or airport lounge background blurred, wanderlust aesthetic',
  },
  {
    id: 'seasonal-autumn',
    prompt: 'Product on a rustic wooden bench, autumn leaves scattered around, golden hour lighting, warm fall colors, pumpkin or apple in soft focus background, seasonal catalog style',
  },
];

// ============================================================================
// Utility Functions
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length < 2 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node scripts/generate-catalog-photos.mjs <image-path> <blueprint-id> [options]

Arguments:
  image-path      Path to the design image (PNG, JPG, etc.)
  blueprint-id    Printify blueprint ID (e.g., 145 for Unisex Staple T-Shirt)

Options:
  --provider <id>       Print provider ID (default: 99)
  --color <color>       Product color (default: white)
  --output <dir>        Output directory for catalog photos (default: ${DEFAULT_OUTPUT_DIR})
  --mockups-dir <dir>   Directory to save Printify mockups (default: images-generated/mockups)
  --count <n>           Number of catalog photos to generate (default: 3)
  --env <environments>  Comma-separated list of environments (default: random)
  --list-envs           List all available environments
  --help, -h            Show this help message

Available Environments:
  coffee-shop, outdoor-nature, minimalist-studio, urban-concrete, beach-coastal,
  home-lifestyle, gym-fitness, workspace-desk, travel-suitcase, seasonal-autumn

Environment Variables:
  GOOGLE_GEMINI_API_KEY     Required for Gemini image generation
  PRINTIFY_API_TOKEN        Required for Printify API
  PRINTIFY_SHOP_ID          Required for Printify shop

Examples:
  node scripts/generate-catalog-photos.mjs ./design.png 145
  node scripts/generate-catalog-photos.mjs ./design.png 145 --color white --count 5
  node scripts/generate-catalog-photos.mjs ./design.png 145 --env coffee-shop,gym-fitness
  node scripts/generate-catalog-photos.mjs ./design.png 145 --mockups-dir ./my-mockups
`);
    process.exit(0);
  }

  // Handle --list-envs
  if (args.includes('--list-envs')) {
    console.log('\nAvailable environments:\n');
    ENVIRONMENT_PROMPTS.forEach(env => {
      console.log(`  ${env.id}`);
      console.log(`    ${env.prompt.substring(0, 80)}...`);
      console.log('');
    });
    process.exit(0);
  }

  const imagePath = args[0];
  const blueprintId = parseInt(args[1], 10);

  // Parse optional flags
  let providerId = DEFAULT_PRINT_PROVIDER_ID;
  let color = 'white';
  let outputDir = DEFAULT_OUTPUT_DIR;
  let mockupsDir = 'images-generated/mockups';
  let count = 3;
  let environments = []; // Empty means random
  let position = 'front'; // Print position: front or back
  let scaleOverride = null; // Optional scale override

  for (let i = 2; i < args.length; i++) {
    if (args[i] === '--provider' && args[i + 1]) {
      providerId = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--color' && args[i + 1]) {
      color = args[i + 1];
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      outputDir = args[i + 1];
      i++;
    } else if (args[i] === '--mockups-dir' && args[i + 1]) {
      mockupsDir = args[i + 1];
      i++;
    } else if (args[i] === '--count' && args[i + 1]) {
      count = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--env' && args[i + 1]) {
      environments = args[i + 1].split(',').map(e => e.trim());
      i++;
    } else if (args[i] === '--position' && args[i + 1]) {
      position = args[i + 1].toLowerCase();
      i++;
    } else if (args[i] === '--scale' && args[i + 1]) {
      scaleOverride = parseFloat(args[i + 1]);
      i++;
    }
  }

  if (isNaN(blueprintId)) {
    console.error('Error: blueprint-id must be a number');
    process.exit(1);
  }

  if (!fs.existsSync(imagePath)) {
    console.error(`Error: Image file not found: ${imagePath}`);
    process.exit(1);
  }

  // Validate environment names if specified
  if (environments.length > 0) {
    const validEnvIds = ENVIRONMENT_PROMPTS.map(e => e.id);
    const invalidEnvs = environments.filter(e => !validEnvIds.includes(e));
    if (invalidEnvs.length > 0) {
      console.error(`Error: Invalid environment(s): ${invalidEnvs.join(', ')}`);
      console.error(`Valid environments: ${validEnvIds.join(', ')}`);
      process.exit(1);
    }
  }

  // Validate position
  if (!['front', 'back'].includes(position)) {
    console.error(`Error: Invalid position "${position}". Must be "front" or "back"`);
    process.exit(1);
  }

  return { imagePath, blueprintId, providerId, color, outputDir, mockupsDir, count, environments, position, scaleOverride };
}

function validateEnv() {
  const geminiKey = process.env.GOOGLE_GEMINI_API_KEY; // Not required for now (Gemini commented out)
  const printifyToken = process.env.PRINTIFY_API_TOKEN || process.env.NEXT_PUBLIC_PRINTIFY_API_TOKEN;
  const printifyShopId = process.env.PRINTIFY_SHOP_ID || process.env.NEXT_PUBLIC_PRINTIFY_SHOP_ID;

  const missing = [];
  // if (!geminiKey) missing.push('GOOGLE_GEMINI_API_KEY'); // Commented out for now
  if (!printifyToken) missing.push('PRINTIFY_API_TOKEN');
  if (!printifyShopId) missing.push('PRINTIFY_SHOP_ID');

  if (missing.length > 0) {
    console.error(`Error: Missing required environment variables: ${missing.join(', ')}`);
    console.error('Please set these in your .env file or environment');
    process.exit(1);
  }

  return { geminiKey, printifyToken, printifyShopId };
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  return mimeTypes[ext] || 'image/png';
}

function getEnvironments(specifiedEnvs, count) {
  if (specifiedEnvs && specifiedEnvs.length > 0) {
    // Return the specified environments
    return ENVIRONMENT_PROMPTS.filter(env => specifiedEnvs.includes(env.id));
  }
  // Shuffle and pick random environments
  const shuffled = [...ENVIRONMENT_PROMPTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, ENVIRONMENT_PROMPTS.length));
}

// ============================================================================
// Image Processing Functions
// ============================================================================

async function removeBackground(imageBuffer, mimeType) {
  console.log('   Removing background...');

  const { removeBackground } = await import('@imgly/background-removal-node');

  const sourceBlob = new Blob([imageBuffer], { type: mimeType });

  const processedBlob = await removeBackground(sourceBlob, {
    model: 'medium',
    output: { format: 'image/png', quality: 1 },
  });

  const processedBuffer = Buffer.from(await processedBlob.arrayBuffer());
  console.log(`   Background removed (${Math.round(processedBuffer.length / 1024)}kb)`);

  return processedBuffer;
}

// ============================================================================
// Printify API Functions
// ============================================================================

async function uploadImageToPrintify(imagePath, token) {
  console.log('\n1. Processing and uploading image to Printify...');

  const imageBuffer = fs.readFileSync(imagePath);
  const mimeType = getMimeType(imagePath);

  // Remove background before uploading
  const processedBuffer = await removeBackground(imageBuffer, mimeType);

  const base64Image = processedBuffer.toString('base64');
  const fileName = path.basename(imagePath).replace(/\.[^.]+$/, '.png'); // Always save as PNG after bg removal

  const response = await fetch('https://api.printify.com/v1/uploads/images.json', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file_name: fileName,
      contents: base64Image,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to upload image: ${JSON.stringify(data)}`);
  }

  console.log(`   Image uploaded: ${data.id} (${data.width}x${data.height})`);
  return data;
}

async function getBlueprintVariants(blueprintId, providerId, token) {
  console.log(`\n2. Fetching variants for blueprint ${blueprintId}...`);

  const response = await fetch(
    `https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers/${providerId}/variants.json`,
    {
      headers: { 'Authorization': `Bearer ${token}` },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to fetch variants: ${JSON.stringify(data)}`);
  }

  console.log(`   Found ${data.variants?.length || 0} variants`);
  return data.variants || [];
}

async function createCustomProduct(options) {
  const { blueprintId, providerId, imageId, color, shopId, token, imageWidth, imageHeight, position = 'front', scaleOverride = null } = options;

  console.log(`\n3. Creating custom product (color: ${color}, position: ${position})...`);

  // First get variants to find the right one
  const variants = await getBlueprintVariants(blueprintId, providerId, token);

  // Filter variants by color
  const colorVariants = variants.filter(v => {
    const title = (v.title || '').toLowerCase();
    return title.includes(color.toLowerCase());
  });

  if (colorVariants.length === 0) {
    console.warn(`   Warning: No variants found for color "${color}", using first available`);
  }

  const selectedVariants = colorVariants.length > 0
    ? colorVariants.slice(0, 10).map(v => v.id)
    : variants.slice(0, 10).map(v => v.id);

  // Get print area dimensions from first variant for the specified position
  const firstVariant = variants[0];
  const placeholder = firstVariant?.placeholders?.find(p => p.position === position) ||
                      firstVariant?.placeholders?.find(p => p.position === 'front');
  const printAreaWidth = placeholder?.width || 3500;
  const printAreaHeight = placeholder?.height || 4000;

  // Calculate placement using the same algorithm as server-side
  const placement = calculatePlacement(
    imageWidth,
    imageHeight,
    printAreaWidth,
    printAreaHeight,
    blueprintId
  );

  // Apply scale override if provided
  const finalScale = scaleOverride !== null ? scaleOverride : placement.scale;

  console.log(`   Using config: ${placement.config.name}`);
  console.log(`   Print position: ${position}`);
  console.log(`   Print area: ${printAreaWidth}x${printAreaHeight}`);
  console.log(`   Artwork: ${imageWidth}x${imageHeight}`);
  console.log(`   Placement: x=${placement.x.toFixed(3)}, y=${placement.y.toFixed(3)}, scale=${finalScale.toFixed(3)}${scaleOverride !== null ? ' (override)' : ''}`);

  const productPayload = {
    title: `Catalog Photo Product ${Date.now()}`,
    description: 'Generated for catalog photo creation',
    blueprint_id: blueprintId,
    print_provider_id: providerId,
    variants: selectedVariants.map(id => ({
      id,
      price: 100,
      is_enabled: true,
    })),
    print_areas: [
      {
        variant_ids: selectedVariants,
        placeholders: [
          {
            position: position,
            images: [{
              id: imageId,
              x: placement.x,
              y: placement.y,
              scale: finalScale,
              angle: placement.angle,
            }],
          },
        ],
      },
    ],
  };

  const response = await fetch(
    `https://api.printify.com/v1/shops/${shopId}/products.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productPayload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to create product: ${JSON.stringify(data)}`);
  }

  console.log(`   Product created: ${data.id}`);
  console.log(`   Mockup images: ${data.images?.length || 0}`);

  return data;
}

async function deleteProduct(productId, shopId, token) {
  console.log(`\n   Cleaning up: deleting product ${productId}...`);

  try {
    await fetch(
      `https://api.printify.com/v1/shops/${shopId}/products/${productId}.json`,
      {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );
    console.log('   Product deleted');
  } catch (error) {
    console.warn(`   Warning: Could not delete product: ${error.message}`);
  }
}

// ============================================================================
// Gemini Image Generation
// ============================================================================

async function downloadImage(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer);
}

function generateSessionId() {
  // Generate a unique session ID: timestamp + random string
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
}

async function savePrintifyMockups(mockupImages, mockupsDir, blueprintId, color, imageBaseName, sessionId) {
  // Create a subfolder with session ID for carousel linking
  const subfolderName = `${imageBaseName.replace(/\.[^.]+$/, '')}_${sessionId}`;
  const fullMockupsDir = path.join(mockupsDir, subfolderName);

  console.log(`\n   Session ID: ${sessionId}`);
  console.log(`   Saving ${mockupImages.length} Printify mockups to ${fullMockupsDir}...`);

  fs.mkdirSync(fullMockupsDir, { recursive: true });

  const savedMockups = [];

  for (let i = 0; i < mockupImages.length; i++) {
    const img = mockupImages[i];
    if (!img.src) continue;

    try {
      const buffer = await downloadImage(img.src);
      const position = img.position || `view${i + 1}`;
      // Include session ID in filename for carousel linking
      const filename = `${sessionId}_mockup_${String(i + 1).padStart(2, '0')}_${position}.png`;
      const filepath = path.join(fullMockupsDir, filename);

      fs.writeFileSync(filepath, buffer);
      const sizeKb = Math.round(buffer.length / 1024);
      console.log(`   Saved: ${filename} (${sizeKb}kb)`);

      savedMockups.push({
        id: `${sessionId}_mockup_${String(i + 1).padStart(2, '0')}`,
        session_id: sessionId,
        type: 'mockup',
        index: i + 1,
        filename,
        filepath,
        position,
        url: img.src,
        size_kb: sizeKb,
      });
    } catch (error) {
      console.warn(`   Warning: Failed to save mockup ${i + 1}: ${error.message}`);
    }
  }

  // Save carousel manifest with all linked images
  const manifestPath = path.join(fullMockupsDir, `carousel_manifest.json`);
  fs.writeFileSync(manifestPath, JSON.stringify({
    session_id: sessionId,
    source_image: imageBaseName,
    blueprint_id: blueprintId,
    color: color,
    generated_at: new Date().toISOString(),
    total_images: savedMockups.length,
    carousel_images: savedMockups.map(m => ({
      id: m.id,
      type: m.type,
      index: m.index,
      filename: m.filename,
      position: m.position,
    })),
    // Placeholder for lifestyle photos to be added later
    lifestyle_photos: [],
  }, null, 2));

  console.log(`   Carousel manifest saved: ${fullMockupsDir}/carousel_manifest.json`);

  return { mockups: savedMockups, sessionId, outputDir: fullMockupsDir };
}

async function generateCatalogPhoto(mockupImageUrl, environment, genAI, attempt = 1) {
  console.log(`   Generating "${environment.id}" lifestyle photo...`);

  try {
    // Download the mockup image
    const mockupBuffer = await downloadImage(mockupImageUrl);
    const mockupBase64 = mockupBuffer.toString('base64');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

    const prompt = `Transform this product mockup into a professional catalog-ready lifestyle photograph.

CRITICAL REQUIREMENTS:
- NO faces or identifiable people in the image
- Show the product prominently but in a natural lifestyle context
- Professional catalog/e-commerce quality photography
- The product should be the clear focus of the image
- If showing a person wearing the product, show only body/torso, NEVER the face (crop above shoulders or use creative angles)

ENVIRONMENT STYLE:
${environment.prompt}

TECHNICAL REQUIREMENTS:
- High resolution, sharp focus on the product
- Natural, appealing lighting that matches the environment
- Professional color grading suitable for e-commerce
- Clean composition with the product as the hero
- Realistic, photographic style (not illustrated)

Generate a single, high-quality lifestyle product photograph.`;

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: mockupBase64,
            },
          },
          { text: prompt },
        ],
      }],
      generationConfig: { responseModalities: ['image', 'text'] },
    });

    const parts = result.response.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find(p => p.inlineData)?.inlineData;

    if (!imagePart?.data) {
      throw new Error('No image generated');
    }

    console.log(`   Generated successfully`);
    return {
      id: environment.id,
      data: imagePart.data,
      mimeType: imagePart.mimeType || 'image/png',
    };

  } catch (error) {
    if (attempt < 3) {
      console.log(`   Retry ${attempt + 1}/3 for ${environment.id}...`);
      await new Promise(r => setTimeout(r, 2000 * attempt));
      return generateCatalogPhoto(mockupImageUrl, environment, genAI, attempt + 1);
    }
    console.error(`   Failed to generate ${environment.id}: ${error.message}`);
    return null;
  }
}

// ============================================================================
// Main Script
// ============================================================================

async function main() {
  console.log('=== Generate Catalog Photos from Product Mockups ===\n');

  // Parse arguments and validate environment
  const { imagePath, blueprintId, providerId, color, outputDir, mockupsDir, count, environments, position, scaleOverride } = parseArgs();
  const { printifyToken, printifyShopId } = validateEnv();

  // Generate a unique session ID for carousel linking
  const sessionId = generateSessionId();

  console.log(`Session ID: ${sessionId}`);
  console.log(`Image: ${imagePath}`);
  console.log(`Blueprint: ${blueprintId}`);
  console.log(`Provider: ${providerId}`);
  console.log(`Color: ${color}`);
  console.log(`Position: ${position}`);
  if (scaleOverride !== null) console.log(`Scale override: ${scaleOverride}`);
  console.log(`Output (mockups): ${mockupsDir}`);

  // Create output directory
  fs.mkdirSync(mockupsDir, { recursive: true });

  let productId = null;

  try {
    // Step 1: Upload image to Printify
    const uploadedImage = await uploadImageToPrintify(imagePath, printifyToken);

    // Step 2: Create custom product to get mockups
    const product = await createCustomProduct({
      blueprintId,
      providerId,
      imageId: uploadedImage.id,
      color,
      shopId: printifyShopId,
      token: printifyToken,
      imageWidth: uploadedImage.width,
      imageHeight: uploadedImage.height,
      position,
      scaleOverride,
    });
    productId = product.id;

    // Get the first mockup image (front view)
    const mockupImages = product.images || [];
    if (mockupImages.length === 0) {
      throw new Error('No mockup images generated');
    }

    // Step 3: Save all Printify mockups to the mockups folder (subfolder named after image)
    const imageBaseName = path.basename(imagePath);
    console.log('\n4. Saving Printify mockups...');
    const { mockups: savedMockups, outputDir: mockupsOutputDir } = await savePrintifyMockups(
      mockupImages, mockupsDir, blueprintId, color, imageBaseName, sessionId
    );

    console.log(`\n=== DONE ===`);
    console.log(`Session ID: ${sessionId}`);
    console.log(`Generated ${savedMockups.length} mockups in ${mockupsOutputDir}`);
    console.log(`\nTo generate lifestyle photos, run:`);
    console.log(`  node scripts/test-gemini-lifestyle.mjs "${mockupsOutputDir}/<mockup-file>" "<prompt>" --session ${sessionId}`);

    // TODO: Gemini catalog photo generation (commented out for now)
    /*
    // Find front view mockup, or use first available
    let mockupUrl = mockupImages.find(img =>
      img.position === 'front' || img.src?.includes('camera_label=front')
    )?.src || mockupImages[0].src;

    // Ensure we have a valid URL
    if (!mockupUrl) {
      throw new Error('No valid mockup URL found');
    }

    console.log(`\n5. Using mockup for Gemini: ${mockupUrl.substring(0, 80)}...`);

    // Step 4: Generate catalog photos with Gemini
    const selectedEnvironments = getEnvironments(environments, count);
    console.log(`\n6. Generating ${selectedEnvironments.length} catalog lifestyle photos with Gemini...\n`);

    const results = [];

    for (const env of selectedEnvironments) {
      const result = await generateCatalogPhoto(mockupUrl, env, genAI);
      if (result) {
        results.push(result);
      }
      // Rate limiting
      await new Promise(r => setTimeout(r, 1000));
    }

    // Step 5: Save generated catalog images
    console.log(`\n7. Saving ${results.length} generated catalog photos...\n`);

    const timestamp = Date.now();
    const manifest = {
      source_image: path.basename(imagePath),
      blueprint_id: blueprintId,
      color: color,
      generated_at: new Date().toISOString(),
      photos: [],
    };

    for (const result of results) {
      const ext = result.mimeType.includes('jpeg') ? 'jpg' : 'png';
      const filename = `catalog_${timestamp}_${result.id}.${ext}`;
      const filepath = path.join(outputDir, filename);

      fs.writeFileSync(filepath, Buffer.from(result.data, 'base64'));

      const sizeKb = Math.round(Buffer.from(result.data, 'base64').length / 1024);
      console.log(`   Saved: ${filename} (${sizeKb}kb)`);

      manifest.photos.push({
        filename,
        environment: result.id,
        size_kb: sizeKb,
      });
    }

    // Save manifest
    const manifestPath = path.join(outputDir, `manifest_${timestamp}.json`);
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`   Manifest: manifest_${timestamp}.json`);

    console.log(`\n=== DONE ===`);
    console.log(`Generated ${results.length} catalog photos in ${outputDir}`);
    */

  } catch (error) {
    console.error(`\nError: ${error.message}`);
    process.exit(1);
  } finally {
    // Cleanup: delete the temporary product
    if (productId) {
      await deleteProduct(productId, printifyShopId, printifyToken);
    }
  }
}

main().catch(console.error);
