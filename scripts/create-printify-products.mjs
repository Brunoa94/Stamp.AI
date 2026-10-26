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
import {
  PRODUCTS,
  createCustomProduct,
  deleteProduct,
  downloadImage,
  uploadImageToPrintify,
} from './lib/printify.mjs';

const MOCKUPS_DIR = 'images-generated/mockups';
const OUTPUT_DIR = 'images-generated/printify-products';

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

// ============================================================================
// Output
// ============================================================================

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
