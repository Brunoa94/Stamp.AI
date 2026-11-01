#!/usr/bin/env node
/**
 * Create Sample Products in Printify
 *
 * This script:
 * 1. Generates the source artwork for each sample design with Gemini
 *    (skipped when the -photo file already exists, so re-runs reuse it)
 * 2. Uploads the artwork to Printify and creates a product with it
 * 3. Saves the artwork and the Printify mockups into the product's folder:
 *      public/products-images/<folder>/<prefix>-<letter>-photo.png
 *      public/products-images/<folder>/<prefix>-<letter>-mockup-<view>.png
 *    Only mockups showing the full design on the product alone are kept.
 *
 * Products are kept in the Printify shop (unpublished) unless --cleanup is passed.
 * With --replace, an existing product with the same title is deleted first.
 * Print-ready artwork is trimmed to its content before upload so it prints large.
 *
 * Usage:
 *   node scripts/create-sample-products.mjs [options]
 *
 * Examples:
 *   node scripts/create-sample-products.mjs
 *   node scripts/create-sample-products.mjs --designs hoodie-a,mug-a
 *   node scripts/create-sample-products.mjs --artwork-only
 *   node scripts/create-sample-products.mjs --dry-run
 *   node scripts/create-sample-products.mjs --image-provider openai
 *
 * Environment variables required:
 *   - GOOGLE_GEMINI_API_KEY (or OPENAI_API_KEY with --image-provider openai)
 *   - PRINTIFY_API_TOKEN (or NEXT_PUBLIC_PRINTIFY_API_TOKEN)
 *   - PRINTIFY_SHOP_ID (or NEXT_PUBLIC_PRINTIFY_SHOP_ID)
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import {
  PRODUCTS,
  createCustomProduct,
  deleteProduct,
  downloadImage,
  listProducts,
  uploadImageToPrintify,
} from './lib/printify.mjs';
import { DESIGNS } from './lib/sample-designs.mjs';

const OUTPUT_ROOT = 'public/products-images';
const GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-image';
const OPENAI_IMAGE_MODEL = 'gpt-image-1-mini';
const PRODUCT_COLOR = 'white';

/**
 * Printify camera labels, per print position, for mockups that show the full
 * printed design on the product alone (no people, no room scenes, no views
 * where the print is hidden).
 */
const PRODUCT_ONLY_VIEWS = {
  front: ['front', 'front-2', 'folded', 'side', 'hanging'],
  back: ['back', 'back-2'],
};

/** Print position of a design: its own `position`, or the product's first one */
function printPosition(design) {
  return design.position ?? PRODUCTS[design.productKey].positions[0];
}

// ============================================================================
// Utility Functions
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node scripts/create-sample-products.mjs [options]

Options:
  --designs <list>        Comma-separated design ids to process (default: all)
  --artwork-only          Only generate the -photo artwork, skip Printify
  --regenerate            Regenerate artwork even if the -photo file exists
  --image-provider <name> Artwork generator: gemini or openai (default: gemini)
  --cleanup               Delete the Printify products after saving mockups
  --replace               Delete existing products with the same title before creating
  --dry-run               Show what would be created without calling any API
  --help, -h              Show this help message

Designs:
${DESIGNS.map(d => `  ${d.id.padEnd(16)} ${d.productKey.padEnd(12)} ${printPosition(d).padEnd(6)} ${d.title}`).join('\n')}
`);
    process.exit(0);
  }

  let designIds = [];
  let imageProvider = 'gemini';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--designs' && args[i + 1]) {
      designIds = args[i + 1].split(',').map(d => d.trim());
      i++;
    } else if (args[i] === '--image-provider' && args[i + 1]) {
      imageProvider = args[i + 1].toLowerCase();
      i++;
    }
  }

  if (!['gemini', 'openai'].includes(imageProvider)) {
    console.error(`Error: Unknown image provider "${imageProvider}". Use gemini or openai.`);
    process.exit(1);
  }

  const unknown = designIds.filter(id => !DESIGNS.some(d => d.id === id));
  if (unknown.length > 0) {
    console.error(`Error: Unknown design(s): ${unknown.join(', ')}. Use --help to see available designs.`);
    process.exit(1);
  }

  return {
    designs: designIds.length > 0 ? DESIGNS.filter(d => designIds.includes(d.id)) : DESIGNS,
    imageProvider,
    artworkOnly: args.includes('--artwork-only'),
    regenerate: args.includes('--regenerate'),
    cleanup: args.includes('--cleanup'),
    replace: args.includes('--replace'),
    dryRun: args.includes('--dry-run'),
  };
}

function validateEnv(artworkOnly, imageProvider) {
  const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const printifyToken = process.env.PRINTIFY_API_TOKEN || process.env.NEXT_PUBLIC_PRINTIFY_API_TOKEN;
  const printifyShopId = process.env.PRINTIFY_SHOP_ID || process.env.NEXT_PUBLIC_PRINTIFY_SHOP_ID;

  const missing = [];
  if (imageProvider === 'gemini' && !geminiKey) missing.push('GOOGLE_GEMINI_API_KEY');
  if (imageProvider === 'openai' && !openaiKey) missing.push('OPENAI_API_KEY');
  if (!artworkOnly && !printifyToken) missing.push('PRINTIFY_API_TOKEN');
  if (!artworkOnly && !printifyShopId) missing.push('PRINTIFY_SHOP_ID');

  if (missing.length > 0) {
    console.error(`Error: Missing required environment variables: ${missing.join(', ')}`);
    console.error('Please set these in your .env or .env.local file');
    process.exit(1);
  }

  return { geminiKey, openaiKey, printifyToken, printifyShopId };
}

function designDir(design) {
  return path.join(OUTPUT_ROOT, design.folder);
}

function artworkPath(design) {
  return path.join(designDir(design), `${design.id}-photo.png`);
}

// ============================================================================
// Artwork Generation
// ============================================================================

/** Returns the generated image as base64 PNG data */
async function generateWithGemini(design, apiKey) {
  const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: GEMINI_IMAGE_MODEL });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: design.prompt }] }],
    generationConfig: { responseModalities: ['image', 'text'] },
  });

  const parts = result.response.candidates?.[0]?.content?.parts || [];
  return parts.find(p => p.inlineData)?.inlineData?.data;
}

/** Returns the generated image as base64 PNG data (transparent background for print-ready artwork) */
async function generateWithOpenAI(design, apiKey) {
  const response = await new OpenAI({ apiKey }).images.generate({
    model: OPENAI_IMAGE_MODEL,
    prompt: design.prompt,
    size: '1024x1024',
    quality: 'medium',
    n: 1,
    output_format: 'png',
    ...(design.transparentBackground ? { background: 'transparent' } : {}),
  });

  return response.data?.[0]?.b64_json;
}

async function generateArtwork(design, provider, apiKey) {
  console.log(`      Generating artwork with ${provider === 'openai' ? 'OpenAI' : 'Gemini'}...`);

  const data = provider === 'openai'
    ? await generateWithOpenAI(design, apiKey)
    : await generateWithGemini(design, apiKey);

  if (!data) {
    throw new Error('No image generated');
  }

  const filepath = artworkPath(design);
  fs.mkdirSync(designDir(design), { recursive: true });
  fs.writeFileSync(filepath, Buffer.from(data, 'base64'));
  console.log(`      Saved artwork: ${filepath}`);

  return filepath;
}

// ============================================================================
// Output
// ============================================================================

async function saveMockups(design, mockupImages) {
  const saved = [];

  // Drop mockups from a previous run so re-runs don't leave stale files
  fs.readdirSync(designDir(design))
    .filter(f => f.startsWith(`${design.id}-mockup-`))
    .forEach(f => fs.rmSync(path.join(designDir(design), f)));

  // Keep one mockup per product-only view (sizes repeat the same views)
  const views = new Map();
  for (const img of mockupImages) {
    const view = img.src?.match(/camera_label=([^&]+)/)?.[1];
    if (PRODUCT_ONLY_VIEWS[printPosition(design)].includes(view) && !views.has(view)) views.set(view, img.src);
  }

  for (const [view, src] of views) {
    try {
      const buffer = await downloadImage(src);
      const filename = `${design.id}-mockup-${view}.png`;
      fs.writeFileSync(path.join(designDir(design), filename), buffer);
      saved.push(filename);
    } catch (error) {
      console.warn(`      Warning: Failed to save ${view} mockup: ${error.message}`);
    }
  }

  return saved;
}

// ============================================================================
// Main Script
// ============================================================================

async function main() {
  console.log('=== Create Sample Products in Printify ===\n');

  const options = parseArgs();
  const { geminiKey, openaiKey, printifyToken, printifyShopId } = validateEnv(options.artworkOnly, options.imageProvider);
  const imageApiKey = options.imageProvider === 'openai' ? openaiKey : geminiKey;

  console.log(`Designs: ${options.designs.map(d => d.id).join(', ')}`);
  console.log(`Image provider: ${options.imageProvider}`);
  if (options.artworkOnly) console.log('Mode: ARTWORK ONLY (Printify skipped)');
  if (options.dryRun) console.log('Mode: DRY RUN (no API calls)');
  console.log('');

  if (options.dryRun) {
    options.designs.forEach(d => {
      const artwork = fs.existsSync(artworkPath(d)) && !options.regenerate ? 'reuse' : 'generate';
      console.log(`  ${d.id.padEnd(16)} ${artwork.padEnd(9)} → ${PRODUCTS[d.productKey].name} (${printPosition(d)}) → ${designDir(d)}/`);
    });
    process.exit(0);
  }

  // Existing products by title, so --replace can swap them for the new ones
  const existingByTitle = new Map();
  if (options.replace && !options.artworkOnly) {
    for (const p of await listProducts(printifyShopId, printifyToken)) {
      existingByTitle.set(p.title, [...(existingByTitle.get(p.title) || []), p.id]);
    }
  }

  const results = { success: [], failed: [] };

  for (let i = 0; i < options.designs.length; i++) {
    const design = options.designs[i];
    const product = PRODUCTS[design.productKey];
    console.log(`\n[${i + 1}/${options.designs.length}] ${design.id} — ${design.title}`);

    let productId = null;

    try {
      const filepath = fs.existsSync(artworkPath(design)) && !options.regenerate
        ? artworkPath(design)
        : await generateArtwork(design, options.imageProvider, imageApiKey);

      if (options.artworkOnly) {
        results.success.push({ id: design.id, mockups: 0 });
        continue;
      }

      const uploadedImage = await uploadImageToPrintify(filepath, printifyToken, !design.removeBackground, {
        trim: design.transparentBackground || design.removeBackground,
      });

      for (const oldId of existingByTitle.get(design.title) || []) {
        console.log(`      Replacing existing product ${oldId}...`);
        await deleteProduct(oldId, printifyShopId, printifyToken);
      }

      const created = await createCustomProduct({
        blueprintId: product.blueprintId,
        providerId: product.providerId,
        imageId: uploadedImage.id,
        color: PRODUCT_COLOR,
        shopId: printifyShopId,
        token: printifyToken,
        imageWidth: uploadedImage.width,
        imageHeight: uploadedImage.height,
        positions: [printPosition(design)],
        designName: design.id,
        title: design.title,
        description: `${design.kind} sample design`,
        variantFilter: design.variantFilter,
        maxScale: design.maxScale,
      });
      productId = created.id;

      const saved = await saveMockups(design, created.images || []);
      console.log(`      Saved ${saved.length} mockups to ${designDir(design)}/`);
      results.success.push({ id: design.id, productId, mockups: saved.length });
    } catch (error) {
      console.error(`      Error: ${error.message}`);
      results.failed.push({ id: design.id, error: error.message });
    } finally {
      if (productId && options.cleanup) {
        console.log('      Cleaning up product...');
        await deleteProduct(productId, printifyShopId, printifyToken);
      }
    }

    // Small delay between requests to avoid rate limiting
    if (i < options.designs.length - 1) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));
  console.log(`\nSuccess: ${results.success.length}/${options.designs.length}`);
  results.success.forEach(r => {
    const productInfo = r.productId ? ` (product ${r.productId}, ${r.mockups} mockups)` : '';
    console.log(`  - ${r.id}${productInfo}`);
  });
  if (results.failed.length > 0) {
    console.log(`Failed: ${results.failed.length}`);
    results.failed.forEach(f => console.log(`  - ${f.id}: ${f.error}`));
    process.exit(1);
  }
}

main().catch(error => {
  console.error(`\nFatal error: ${error.message}`);
  process.exit(1);
});
