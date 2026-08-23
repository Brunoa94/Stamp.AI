#!/usr/bin/env node
/**
 * Create Printify Products from Gemini-Generated Images
 *
 * This script:
 * 1. Scans the mockups folder for gemini-generated images
 * 2. Creates Printify products using the specified blueprint
 * 3. Saves the product mockup images to an output folder
 *
 * Uses the same product configurations and placement algorithms as the main app.
 *
 * Usage:
 *   node scripts/create-printify-products.mjs --product <product-type> [options]
 *
 * Examples:
 *   node scripts/create-printify-products.mjs --product tshirt
 *   node scripts/create-printify-products.mjs --product hoodie --color black
 *   node scripts/create-printify-products.mjs --product mug --folders bride-party,couple
 *   node scripts/create-printify-products.mjs --list-products
 *
 * Environment variables required:
 *   - PRINTIFY_API_TOKEN (or NEXT_PUBLIC_PRINTIFY_API_TOKEN)
 *   - PRINTIFY_SHOP_ID (or NEXT_PUBLIC_PRINTIFY_SHOP_ID)
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

import fs from 'fs';
import path from 'path';

// ============================================================================
// Product Configurations (matching src/lib/printPlacement/config.ts)
// ============================================================================

/**
 * Product catalog with blueprint IDs and their print providers.
 * Based on the project's active catalog_products.
 *
 * Print provider mapping:
 * - 99: Printify Choice (default, auto-selects cheapest)
 * - 10: MWW On Demand (for AOP products like tote-aop)
 * - 26: Dimona Tee EU (for socks)
 */
const PRODUCTS = {
  // T-Shirts (provider 99 - Printify Choice)
  'tshirt': {
    name: 'Unisex Softstyle T-Shirt (Gildan 64000)',
    blueprintId: 145,
    providerId: 99,
    description: 'Classic unisex t-shirt, soft cotton blend',
    positions: ['front', 'back'],
  },
  'tshirt-cotton': {
    name: 'Unisex Cotton Crew Tee (Next Level)',
    blueprintId: 5,
    providerId: 99,
    description: 'Premium cotton crew neck',
    positions: ['front', 'back'],
  },
  'tshirt-heavy': {
    name: 'Unisex Heavy Cotton Tee (Gildan 5000)',
    blueprintId: 6,
    providerId: 99,
    description: 'Heavy-weight cotton tee with sleeve prints',
    positions: ['front', 'back', 'left_sleeve', 'right_sleeve'],
  },
  'tshirt-kids': {
    name: 'Kids Heavy Cotton Tee',
    blueprintId: 157,
    providerId: 99,
    description: 'Kids cotton t-shirt',
    positions: ['front', 'back'],
  },
  // Hoodies (provider 99 - Printify Choice)
  'hoodie': {
    name: 'Unisex Heavy Blend Hoodie (Gildan)',
    blueprintId: 77,
    providerId: 99,
    description: 'Classic hoodie with front pouch',
    positions: ['front', 'back', 'left_sleeve', 'right_sleeve'],
  },
  'hoodie-alt': {
    name: 'Unisex Heavy Blend Hoodie (Gildan 18500)',
    blueprintId: 1525,
    providerId: 99,
    description: 'Alternative hoodie style',
    positions: ['front', 'back'],
  },
  'sweatshirt': {
    name: 'Unisex Heavy Blend Crewneck Sweatshirt',
    blueprintId: 49,
    providerId: 99,
    description: 'Crew neck sweatshirt',
    positions: ['front', 'back', 'left_sleeve', 'right_sleeve'],
  },
  // Tote Bags
  'tote-aop': {
    name: 'AOP Tote Bag',
    blueprintId: 1389,
    providerId: 10, // MWW On Demand - required for AOP
    description: 'All-over print tote bag',
    positions: ['front'],
  },
  // Mugs (provider 30 - OPT OnDemand)
  'mug': {
    name: 'Ceramic Mug EU',
    blueprintId: 441,
    providerId: 30, // OPT OnDemand - required for this blueprint
    description: 'Ceramic mug (EU shipping)',
    positions: ['front'],
  },
  'mug-glossy': {
    name: 'White Glossy Mug',
    blueprintId: 468,
    providerId: 30, // OPT OnDemand
    description: 'Glossy white ceramic mug',
    positions: ['front'],
  },
  // Canvas (provider 99 - Printify Choice)
  'canvas': {
    name: 'Matte Canvas',
    blueprintId: 658,
    providerId: 99,
    description: 'Matte canvas print',
    positions: ['front'],
  },
  // Socks (provider 26 - Dimona Tee EU)
  'socks': {
    name: 'Sublimation Crew Socks EU',
    blueprintId: 496,
    providerId: 26,
    description: 'All-over print crew socks',
    positions: ['left_leg', 'right_leg'],
  },
  // Notebooks (provider 30 - OPT OnDemand)
  'notebook': {
    name: 'Spiral Journal EU',
    blueprintId: 475,
    providerId: 30, // OPT OnDemand - required for this blueprint
    description: 'Spiral-bound notebook',
    positions: ['front'],
  },
  // Pillows (provider 99 - Printify Choice)
  'pillow': {
    name: 'Spun Polyester Square Pillowcase',
    blueprintId: 229,
    providerId: 99,
    description: 'Decorative pillow case',
    positions: ['front'],
  },
};

// ============================================================================
// Product Placement Configs (from src/lib/printPlacement/config.ts and
// supabase/functions/_shared/printPlacement.ts)
// ============================================================================

// Safe zone definitions
const TSHIRT_SAFE_ZONE = { top: 0.05, bottom: 0.03, left: 0.03, right: 0.03 };
const HOODIE_SAFE_ZONE = { top: 0.08, bottom: 0.05, left: 0.05, right: 0.05 };
const MUG_SAFE_ZONE = { top: 0.05, bottom: 0.05, left: 0.15, right: 0.15 };
const DEFAULT_SAFE_ZONE = { top: 0.03, bottom: 0.03, left: 0.03, right: 0.03 };

// Product configurations indexed by blueprint ID (matching the project's configs)
const PRODUCT_CONFIGS = {
  // T-Shirts - slightly higher anchor for chest placement
  145: { safeZone: TSHIRT_SAFE_ZONE, minDpi: 150, anchorY: 0.45 },
  5: { safeZone: TSHIRT_SAFE_ZONE, minDpi: 150, anchorY: 0.45 },
  6: { safeZone: TSHIRT_SAFE_ZONE, minDpi: 150, anchorY: 0.45 },
  157: { safeZone: TSHIRT_SAFE_ZONE, minDpi: 150, anchorY: 0.45 },
  // Hoodies - more margin due to hood attachment
  77: { safeZone: HOODIE_SAFE_ZONE, minDpi: 150, anchorY: 0.42 },
  1525: { safeZone: HOODIE_SAFE_ZONE, minDpi: 150, anchorY: 0.42 },
  49: { safeZone: TSHIRT_SAFE_ZONE, minDpi: 150, anchorY: 0.45 },
  // AOP Tote Bag - tall print area (2175x4350) wraps front+back
  // Front panel is TOP HALF (0 to 0.5), anchorY: 0.22 centers on front panel
  // scaleOnly: true - forces centered placement
  // maxScale: 0.85 server-side (prevents too-large prints)
  1389: { safeZone: DEFAULT_SAFE_ZONE, minDpi: 150, anchorY: 0.22, maxScale: 0.85, scaleOnly: true },
  // Mugs - wrap-around print with handle margins
  441: { safeZone: MUG_SAFE_ZONE, minDpi: 150, anchorY: 0.5 },
  468: { safeZone: MUG_SAFE_ZONE, minDpi: 150, anchorY: 0.5 },
  // Canvas - full bleed
  658: { safeZone: DEFAULT_SAFE_ZONE, minDpi: 150, anchorY: 0.5 },
  // Socks - all-over print (uses special leg placements)
  496: { safeZone: DEFAULT_SAFE_ZONE, minDpi: 150, anchorY: 0.5 },
  462: { safeZone: DEFAULT_SAFE_ZONE, minDpi: 150, anchorY: 0.5 },
  // Notebooks - cover print
  475: { safeZone: DEFAULT_SAFE_ZONE, minDpi: 150, anchorY: 0.5 },
  // Pillows - all-over print
  229: { safeZone: DEFAULT_SAFE_ZONE, minDpi: 150, anchorY: 0.5 },
};

/**
 * Sock leg placement presets (from src/lib/printPlacement/config.ts)
 * Calibrated against blueprint 496 / provider 26 mockups
 */
const SOCK_LEG_PLACEMENTS = {
  left_leg: { x: 0.58, y: 0.35, scale: 0.6, angle: 0 },
  right_leg: { x: 0.5, y: 0.35, scale: 0.6, angle: 0 },
};

const DEFAULT_CONFIG = {
  safeZone: DEFAULT_SAFE_ZONE,
  minDpi: 150,
  anchorY: 0.5,
};

// Constants matching the project's values
const MIN_SCALE = 0.1;
const ADDITIONAL_SAFETY_MARGIN = 0.02;
const MAX_ITERATIONS = 8;
const MOCKUPS_DIR = 'images-generated/mockups';
const OUTPUT_DIR = 'images-generated/printify-products';

// ============================================================================
// Placement Calculation Functions
// ============================================================================

function getProductConfig(blueprintId) {
  return PRODUCT_CONFIGS[blueprintId] || DEFAULT_CONFIG;
}

function calculateOptimalScale(artwork, printArea, safeZone, maxScaleLimit) {
  const artworkAspect = artwork.width / artwork.height;
  const printAreaAspect = printArea.width / printArea.height;

  const safeWidth = 1 - safeZone.left - safeZone.right;
  const safeHeight = 1 - safeZone.top - safeZone.bottom;

  const maxScaleByWidth = safeWidth;
  const maxScaleByHeight = (safeHeight * artworkAspect) / printAreaAspect;

  let optimalScale = Math.min(maxScaleByWidth, maxScaleByHeight);

  if (maxScaleLimit !== undefined) {
    optimalScale = Math.min(optimalScale, maxScaleLimit);
  }

  return Math.max(MIN_SCALE, optimalScale);
}

function calculateArtworkHeight(artwork, printArea, scale) {
  const artworkAspect = artwork.width / artwork.height;
  const printAreaAspect = printArea.width / printArea.height;
  return (scale / artworkAspect) * printAreaAspect;
}

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
 * Uses the same algorithm as supabase/functions/_shared/printPlacement.ts
 */
function calculatePlacement(artworkWidth, artworkHeight, printAreaWidth, printAreaHeight, blueprintId, position = 'front') {
  // Special handling for sock leg placements
  if (position === 'left_leg' || position === 'right_leg') {
    return { ...SOCK_LEG_PLACEMENTS[position], config: getProductConfig(blueprintId) };
  }

  const config = getProductConfig(blueprintId);
  const artwork = { width: artworkWidth, height: artworkHeight };
  const printArea = { width: printAreaWidth, height: printAreaHeight };

  let scale = calculateOptimalScale(artwork, printArea, config.safeZone, config.maxScale);

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    if (i > 0) {
      scale *= (1 - ADDITIONAL_SAFETY_MARGIN);
      scale = Math.max(MIN_SCALE, scale);
    }

    const artworkHeightCalc = calculateArtworkHeight(artwork, printArea, scale);
    const { x, y } = calculateCenteredPosition(config.safeZone, artworkHeightCalc, config.anchorY);

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

  const finalArtworkHeight = calculateArtworkHeight(artwork, printArea, scale);
  const { x, y } = calculateCenteredPosition(config.safeZone, finalArtworkHeight, config.anchorY);
  return { x, y, scale, angle: 0, config };
}

// ============================================================================
// Utility Functions
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);

  // Handle --list-products
  if (args.includes('--list-products') || args.includes('-l')) {
    console.log('\nAvailable product types:\n');
    console.log('  Product Key         Blueprint   Provider   Positions');
    console.log('  ' + '-'.repeat(70));
    Object.entries(PRODUCTS).forEach(([key, product]) => {
      const positions = product.positions.join(', ');
      console.log(`  ${key.padEnd(20)} ${String(product.blueprintId).padEnd(11)} ${String(product.providerId).padEnd(10)} ${positions}`);
    });
    console.log('\n  Provider IDs: 99=Printify Choice, 10=MWW On Demand, 26=Dimona Tee EU\n');
    console.log('Usage: node scripts/create-printify-products.mjs --product <product-key>\n');
    process.exit(0);
  }

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node scripts/create-printify-products.mjs --product <product-type> [options]

Required:
  --product, -p <type>    Product type to create (use --list-products to see options)

Options:
  --color <color>         Product color (default: white)
  --folders <list>        Comma-separated list of folder names to process (default: all)
  --output <dir>          Output directory for product mockups (default: ${OUTPUT_DIR})
  --provider <id>         Print provider ID (default: 99)
  --position <pos>        Print position: front or back (default: front)
  --dry-run               Show what would be created without actually creating
  --keep-products         Don't delete products after getting mockups
  --list-products, -l     List all available product types
  --help, -h              Show this help message

Examples:
  node scripts/create-printify-products.mjs --product tshirt
  node scripts/create-printify-products.mjs --product hoodie --color black
  node scripts/create-printify-products.mjs --product mug --folders bride-party,couple
  node scripts/create-printify-products.mjs -p tshirt --dry-run

Environment Variables:
  PRINTIFY_API_TOKEN      Required for Printify API
  PRINTIFY_SHOP_ID        Required for Printify shop
`);
    process.exit(0);
  }

  // Parse required product argument
  let productKey = null;
  let color = 'white';
  let folders = [];
  let outputDir = OUTPUT_DIR;
  let position = null; // Will use product's default position
  let dryRun = false;
  let keepProducts = false;
  let scaleOverride = null; // Optional scale override
  let skipBgRemoval = false; // Skip background removal

  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--product' || args[i] === '-p') && args[i + 1]) {
      productKey = args[i + 1].toLowerCase();
      i++;
    } else if (args[i] === '--color' && args[i + 1]) {
      color = args[i + 1];
      i++;
    } else if (args[i] === '--folders' && args[i + 1]) {
      folders = args[i + 1].split(',').map(f => f.trim());
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      outputDir = args[i + 1];
      i++;
    } else if (args[i] === '--position' && args[i + 1]) {
      position = args[i + 1].toLowerCase();
      i++;
    } else if (args[i] === '--scale' && args[i + 1]) {
      scaleOverride = parseFloat(args[i + 1]);
      i++;
    } else if (args[i] === '--dry-run') {
      dryRun = true;
    } else if (args[i] === '--keep-products') {
      keepProducts = true;
    } else if (args[i] === '--no-bg-removal') {
      skipBgRemoval = true;
    }
  }

  if (!productKey) {
    console.error('Error: --product is required. Use --list-products to see available options.');
    process.exit(1);
  }

  if (!PRODUCTS[productKey]) {
    console.error(`Error: Unknown product type "${productKey}". Use --list-products to see available options.`);
    process.exit(1);
  }

  const product = PRODUCTS[productKey];

  // Use product's default position if not specified
  if (!position) {
    position = product.positions[0];
  }

  // Validate position against product's available positions
  if (!product.positions.includes(position)) {
    console.error(`Error: Invalid position "${position}" for ${productKey}.`);
    console.error(`Available positions: ${product.positions.join(', ')}`);
    process.exit(1);
  }

  return {
    product,
    productKey,
    color,
    folders,
    outputDir,
    position,
    dryRun,
    keepProducts,
    scaleOverride,
    skipBgRemoval,
  };
}

function validateEnv() {
  const printifyToken = process.env.PRINTIFY_API_TOKEN || process.env.NEXT_PUBLIC_PRINTIFY_API_TOKEN;
  const printifyShopId = process.env.PRINTIFY_SHOP_ID || process.env.NEXT_PUBLIC_PRINTIFY_SHOP_ID;

  const missing = [];
  if (!printifyToken) missing.push('PRINTIFY_API_TOKEN');
  if (!printifyShopId) missing.push('PRINTIFY_SHOP_ID');

  if (missing.length > 0) {
    console.error(`Error: Missing required environment variables: ${missing.join(', ')}`);
    console.error('Please set these in your .env or .env.local file');
    process.exit(1);
  }

  return { printifyToken, printifyShopId };
}

function findGeminiImages(mockupsDir, folderFilter) {
  const images = [];

  if (!fs.existsSync(mockupsDir)) {
    console.error(`Error: Mockups directory not found: ${mockupsDir}`);
    process.exit(1);
  }

  const folders = fs.readdirSync(mockupsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const foldersToProcess = folderFilter.length > 0
    ? folders.filter(f => folderFilter.includes(f))
    : folders;

  for (const folder of foldersToProcess) {
    const folderPath = path.join(mockupsDir, folder);
    const files = fs.readdirSync(folderPath);

    // Look for gemini-generated images
    const geminiFile = files.find(f =>
      f.startsWith('gemini-generated') &&
      (f.endsWith('.png') || f.endsWith('.jpeg') || f.endsWith('.jpg'))
    );

    if (geminiFile) {
      images.push({
        folder,
        filename: geminiFile,
        filepath: path.join(folderPath, geminiFile),
      });
    }
  }

  return images;
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

// ============================================================================
// Image Processing Functions
// ============================================================================

async function removeBackground(imageBuffer, mimeType) {
  console.log('      Removing background...');

  const { removeBackground } = await import('@imgly/background-removal-node');

  const sourceBlob = new Blob([imageBuffer], { type: mimeType });

  const processedBlob = await removeBackground(sourceBlob, {
    model: 'medium',
    output: { format: 'image/png', quality: 1 },
  });

  const processedBuffer = Buffer.from(await processedBlob.arrayBuffer());
  console.log(`      Background removed (${Math.round(processedBuffer.length / 1024)}kb)`);

  return processedBuffer;
}

// ============================================================================
// Printify API Functions
// ============================================================================

async function uploadImageToPrintify(imagePath, token, skipBgRemoval = false) {
  console.log('      Uploading to Printify...');

  const imageBuffer = fs.readFileSync(imagePath);
  const mimeType = getMimeType(imagePath);

  let processedBuffer;
  let fileName;

  if (skipBgRemoval) {
    console.log('      Skipping background removal...');
    processedBuffer = imageBuffer;
    fileName = path.basename(imagePath);
  } else {
    // Remove background before uploading
    processedBuffer = await removeBackground(imageBuffer, mimeType);
    fileName = path.basename(imagePath).replace(/\.[^.]+$/, '.png');
  }

  const base64Image = processedBuffer.toString('base64');

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

  console.log(`      Uploaded: ${data.id} (${data.width}x${data.height})`);
  return data;
}

async function getBlueprintVariants(blueprintId, providerId, token) {
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

  return data.variants || [];
}

async function createCustomProduct(options) {
  const { blueprintId, providerId, imageId, color, shopId, token, imageWidth, imageHeight, positions, designName, scaleOverride = null } = options;

  // Get variants
  const variants = await getBlueprintVariants(blueprintId, providerId, token);

  // Filter variants by color
  const colorVariants = variants.filter(v => {
    const title = (v.title || '').toLowerCase();
    return title.includes(color.toLowerCase());
  });

  if (colorVariants.length === 0) {
    console.warn(`      Warning: No variants found for color "${color}", using first available`);
  }

  const selectedVariants = colorVariants.length > 0
    ? colorVariants.slice(0, 10).map(v => v.id)
    : variants.slice(0, 10).map(v => v.id);

  // Build placeholders for all positions
  const placeholders = [];
  const firstVariant = variants[0];

  for (const position of positions) {
    // Get print area dimensions for this position
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
      blueprintId,
      position
    );

    // Apply scale override if provided
    const finalScale = scaleOverride !== null ? scaleOverride : placement.scale;

    console.log(`      ${position}: x=${placement.x.toFixed(3)}, y=${placement.y.toFixed(3)}, scale=${finalScale.toFixed(3)}${scaleOverride !== null ? ' (override)' : ''}`);

    placeholders.push({
      position: position,
      images: [{
        id: imageId,
        x: placement.x,
        y: placement.y,
        scale: finalScale,
        angle: placement.angle,
      }],
    });
  }

  const productPayload = {
    title: `${designName} - Product ${Date.now()}`,
    description: 'Generated from Gemini design',
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
        placeholders: placeholders,
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

  console.log(`      Product created: ${data.id} (${data.images?.length || 0} mockups)`);
  return data;
}

async function deleteProduct(productId, shopId, token) {
  try {
    await fetch(
      `https://api.printify.com/v1/shops/${shopId}/products/${productId}.json`,
      {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );
  } catch (error) {
    console.warn(`      Warning: Could not delete product: ${error.message}`);
  }
}

async function downloadImage(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer);
}

async function saveMockupImages(mockupImages, outputDir, designName, productKey, blueprintId, color) {
  const designDir = path.join(outputDir, designName);
  fs.mkdirSync(designDir, { recursive: true });

  const savedImages = [];

  for (let i = 0; i < mockupImages.length; i++) {
    const img = mockupImages[i];
    if (!img.src) continue;

    try {
      const buffer = await downloadImage(img.src);
      const position = img.position || `view${i + 1}`;
      const filename = `${productKey}_${blueprintId}_${color}_${position}_${i + 1}.png`;
      const filepath = path.join(designDir, filename);

      fs.writeFileSync(filepath, buffer);
      const sizeKb = Math.round(buffer.length / 1024);

      savedImages.push({
        filename,
        filepath,
        position,
        sizeKb,
      });
    } catch (error) {
      console.warn(`      Warning: Failed to save mockup ${i + 1}: ${error.message}`);
    }
  }

  // Save manifest
  const manifestPath = path.join(designDir, `${productKey}_manifest.json`);
  const existingManifest = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
    : { design: designName, products: [] };

  existingManifest.products.push({
    product_key: productKey,
    blueprint_id: blueprintId,
    color: color,
    created_at: new Date().toISOString(),
    images: savedImages.map(img => ({
      filename: img.filename,
      position: img.position,
      size_kb: img.sizeKb,
    })),
  });

  fs.writeFileSync(manifestPath, JSON.stringify(existingManifest, null, 2));

  return savedImages;
}

// ============================================================================
// Main Script
// ============================================================================

async function main() {
  console.log('=== Create Printify Products from Gemini Images ===\n');

  const options = parseArgs();
  const { printifyToken, printifyShopId } = validateEnv();

  console.log(`Product: ${options.product.name} (${options.productKey})`);
  console.log(`Blueprint ID: ${options.product.blueprintId}`);
  console.log(`Provider ID: ${options.product.providerId}`);
  console.log(`Color: ${options.color}`);
  console.log(`Position: ${options.position}`);
  if (options.scaleOverride !== null) console.log(`Scale override: ${options.scaleOverride}`);
  if (options.skipBgRemoval) console.log('Background removal: DISABLED');
  if (options.dryRun) console.log('Mode: DRY RUN (no products will be created)');
  console.log('');

  // Find gemini-generated images
  const images = findGeminiImages(MOCKUPS_DIR, options.folders);

  if (images.length === 0) {
    console.log('No gemini-generated images found in the mockups folder.');
    console.log(`Searched in: ${MOCKUPS_DIR}`);
    if (options.folders.length > 0) {
      console.log(`Filtered folders: ${options.folders.join(', ')}`);
    }
    process.exit(0);
  }

  console.log(`Found ${images.length} gemini-generated images:\n`);
  images.forEach((img, i) => {
    console.log(`  ${i + 1}. ${img.folder}/${img.filename}`);
  });
  console.log('');

  if (options.dryRun) {
    console.log('DRY RUN: Would create products for the above images.');
    console.log('Remove --dry-run flag to actually create products.');
    process.exit(0);
  }

  // Create output directory
  fs.mkdirSync(options.outputDir, { recursive: true });

  // Process each image
  const results = {
    success: [],
    failed: [],
  };

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    console.log(`\n[${i + 1}/${images.length}] Processing: ${img.folder}`);

    let productId = null;

    try {
      // Upload image
      const uploadedImage = await uploadImageToPrintify(img.filepath, printifyToken, options.skipBgRemoval);

      // Determine which positions to print on
      // For socks (left_leg/right_leg), print on both legs
      // For other products, use the specified position
      const positionsToPrint = (options.position === 'left_leg' || options.position === 'right_leg')
        ? ['left_leg', 'right_leg']  // Print on both legs for socks
        : [options.position];         // Single position for other products

      // Create product using product's configured provider
      const product = await createCustomProduct({
        blueprintId: options.product.blueprintId,
        providerId: options.product.providerId,
        imageId: uploadedImage.id,
        color: options.color,
        shopId: printifyShopId,
        token: printifyToken,
        imageWidth: uploadedImage.width,
        imageHeight: uploadedImage.height,
        positions: positionsToPrint,
        designName: img.folder,
        scaleOverride: options.scaleOverride,
      });
      productId = product.id;

      // Save mockup images
      const mockupImages = product.images || [];
      if (mockupImages.length > 0) {
        const savedImages = await saveMockupImages(
          mockupImages,
          options.outputDir,
          img.folder,
          options.productKey,
          options.product.blueprintId,
          options.color
        );
        console.log(`      Saved ${savedImages.length} mockup images`);
        results.success.push({ folder: img.folder, images: savedImages.length });
      } else {
        console.warn('      Warning: No mockup images generated');
        results.success.push({ folder: img.folder, images: 0 });
      }

    } catch (error) {
      console.error(`      Error: ${error.message}`);
      results.failed.push({ folder: img.folder, error: error.message });
    } finally {
      // Cleanup: delete the temporary product
      if (productId && !options.keepProducts) {
        console.log('      Cleaning up product...');
        await deleteProduct(productId, printifyShopId, printifyToken);
      }
    }

    // Small delay between requests to avoid rate limiting
    if (i < images.length - 1) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));
  console.log(`\nProduct: ${options.product.name}`);
  console.log(`Color: ${options.color}`);
  console.log(`Output: ${options.outputDir}`);
  console.log(`\nSuccess: ${results.success.length}/${images.length}`);
  if (results.failed.length > 0) {
    console.log(`Failed: ${results.failed.length}`);
    results.failed.forEach(f => console.log(`  - ${f.folder}: ${f.error}`));
  }

  const totalImages = results.success.reduce((sum, r) => sum + r.images, 0);
  console.log(`\nTotal mockup images saved: ${totalImages}`);
}

main().catch(error => {
  console.error(`\nFatal error: ${error.message}`);
  process.exit(1);
});
