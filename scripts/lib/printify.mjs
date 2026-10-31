/**
 * Shared Printify helpers for the scripts in scripts/
 *
 * Product catalog, placement algorithm (same as the app) and Printify API calls.
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

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
export const PRODUCTS = {
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
    name: 'Matte Canvas, Stretched 0.75"',
    blueprintId: 937, // 658 was removed from the Printify catalog
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
  937: { safeZone: DEFAULT_SAFE_ZONE, minDpi: 150, anchorY: 0.5 },
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
// Border kept around trimmed artwork, as a fraction of its longest side
const TRIM_PADDING = 0.08;

// ============================================================================
// Placement Calculation Functions
// ============================================================================

export function getProductConfig(blueprintId) {
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
export function calculatePlacement(artworkWidth, artworkHeight, printAreaWidth, printAreaHeight, blueprintId, position = 'front') {
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

export function getMimeType(filePath) {
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

export async function removeBackground(imageBuffer, mimeType) {
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

/**
 * @param {{ trim?: boolean }} [options] trim: crop the empty (transparent or flat
 *   background) border so the design itself fills the print area
 */
export async function uploadImageToPrintify(imagePath, token, skipBgRemoval = false, { trim = false } = {}) {
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

  if (trim) {
    // Crop to the content, then add back a small even border so the design
    // stays clear of seams and edges
    const trimmed = await sharp(processedBuffer).trim({ threshold: 25 }).ensureAlpha().png().toBuffer({ resolveWithObject: true });
    const pad = Math.round(Math.max(trimmed.info.width, trimmed.info.height) * TRIM_PADDING);
    const { data, info } = await sharp(trimmed.data)
      .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toBuffer({ resolveWithObject: true });
    console.log(`      Trimmed empty border (${info.width}x${info.height})`);
    processedBuffer = data;
    fileName = fileName.replace(/\.[^.]+$/, '.png');
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

export async function getBlueprintVariants(blueprintId, providerId, token) {
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

export async function createCustomProduct(options) {
  const { blueprintId, providerId, imageId, color, shopId, token, imageWidth, imageHeight, positions, designName, scaleOverride = null, title, description, variantFilter, maxScale } = options;

  // Get variants
  const variants = await getBlueprintVariants(blueprintId, providerId, token);

  // Filter variants by color, or by a custom title filter (e.g. canvas sizes)
  const colorVariants = variants.filter(v => {
    const title = (v.title || '').toLowerCase();
    return variantFilter ? variantFilter(title) : title.includes(color.toLowerCase());
  });

  if (colorVariants.length === 0) {
    console.warn(`      Warning: No variants found for color "${color}", using first available`);
  }

  const chosenVariants = (colorVariants.length > 0 ? colorVariants : variants).slice(0, 10);
  const selectedVariants = chosenVariants.map(v => v.id);

  // Build placeholders for all positions, sized from the variants actually used
  const placeholders = [];
  const firstVariant = chosenVariants[0];

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
    let finalScale = scaleOverride !== null ? scaleOverride : placement.scale;
    if (maxScale !== undefined) finalScale = Math.min(finalScale, maxScale);

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
    title: title ?? `${designName} - Product ${Date.now()}`,
    description: description ?? 'Generated from Gemini design',
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

/** Lists every product in the shop (all pages) */
export async function listProducts(shopId, token) {
  const products = [];
  for (let page = 1; ; page++) {
    const response = await fetch(
      `https://api.printify.com/v1/shops/${shopId}/products.json?limit=50&page=${page}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Failed to list products: ${JSON.stringify(data)}`);
    }
    products.push(...(data.data || []));
    if (page >= (data.last_page || 1)) return products;
  }
}

export async function deleteProduct(productId, shopId, token) {
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

export async function downloadImage(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer);
}
