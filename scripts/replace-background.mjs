#!/usr/bin/env node
/**
 * Replace Background - True background replacement using compositing
 *
 * This script removes the white background from a product mockup and
 * composites it onto a new background, keeping the product PIXEL-PERFECT.
 *
 * Usage:
 *   node scripts/replace-background.mjs <mockup-path> "<background-prompt>" [--session <id>]
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Parse arguments
const args = process.argv.slice(2);
let mockupPath = null;
let backgroundPrompt = null;
let sessionId = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--session' && args[i + 1]) {
    sessionId = args[i + 1];
    i++;
  } else if (!mockupPath) {
    mockupPath = args[i];
  } else if (!backgroundPrompt) {
    backgroundPrompt = args[i];
  }
}

if (!mockupPath || !backgroundPrompt) {
  console.log('Usage: node scripts/replace-background.mjs <mockup-path> "<background-prompt>" [--session <id>]');
  console.log('');
  console.log('This script replaces ONLY the white background while keeping the product PIXEL-PERFECT.');
  console.log('');
  console.log('Options:');
  console.log('  --session <id>    Link to existing session ID for carousel grouping');
  console.log('');
  console.log('Example:');
  console.log('  node scripts/replace-background.mjs ./mockup.png "autumn park with fallen leaves"');
  process.exit(1);
}

if (!fs.existsSync(mockupPath)) {
  console.error(`Error: File not found: ${mockupPath}`);
  process.exit(1);
}

// Generate session ID if not provided
if (!sessionId) {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  sessionId = `${timestamp}-${random}`;
}

const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;
if (!geminiKey) {
  console.error('Error: GOOGLE_GEMINI_API_KEY not set');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(geminiKey);

/**
 * Remove background from image using AI-based removal
 */
async function removeProductBackground(inputBuffer) {
  console.log('   Removing background with AI...');

  const { removeBackground } = await import('@imgly/background-removal-node');

  const sourceBlob = new Blob([inputBuffer], { type: 'image/png' });

  const processedBlob = await removeBackground(sourceBlob, {
    model: 'medium',
    output: { format: 'image/png', quality: 1 },
  });

  const processedBuffer = Buffer.from(await processedBlob.arrayBuffer());
  console.log(`   Background removed (${Math.round(processedBuffer.length / 1024)}kb)`);

  return processedBuffer;
}

/**
 * Generate a background image using Gemini
 */
async function generateBackground(prompt, width, height) {
  console.log('   Generating background with Gemini...');

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

  const backgroundPrompt = `Generate a high-quality background image for product photography.

REQUIREMENTS:
- Create ONLY a background scene, NO products or objects in the foreground
- The background should be suitable for placing a tote bag on top of it
- Style: Professional e-commerce catalog photography background
- Resolution: High quality, detailed textures
- Lighting: Soft, even lighting suitable for product display
- DO NOT include any bags, products, or objects that would overlap with a product

SCENE DESCRIPTION:
${prompt}

Generate a clean, professional background that would work well behind a product mockup.`;

  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [{ text: backgroundPrompt }],
    }],
    generationConfig: { responseModalities: ['image', 'text'] },
  });

  const parts = result.response.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find(p => p.inlineData)?.inlineData;

  if (!imagePart?.data) {
    throw new Error('No background image generated');
  }

  // Resize to match target dimensions
  const bgBuffer = Buffer.from(imagePart.data, 'base64');
  const resizedBg = await sharp(bgBuffer)
    .resize(width, height, { fit: 'cover' })
    .png()
    .toBuffer();

  console.log('   Background generated');
  return resizedBg;
}

/**
 * Composite product over background
 */
async function compositeImages(productBuffer, backgroundBuffer) {
  console.log('   Compositing product over background...');

  const result = await sharp(backgroundBuffer)
    .composite([{
      input: productBuffer,
      gravity: 'center',
    }])
    .png()
    .toBuffer();

  console.log('   Compositing complete');
  return result;
}

function findCarouselManifest(mockupPath) {
  const mockupDir = path.dirname(mockupPath);
  const manifestPath = path.join(mockupDir, 'carousel_manifest.json');
  if (fs.existsSync(manifestPath)) {
    return manifestPath;
  }
  return null;
}

function updateCarouselManifest(manifestPath, lifestylePhoto) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.lifestyle_photos = manifest.lifestyle_photos || [];
    manifest.lifestyle_photos.push(lifestylePhoto);
    manifest.total_images = manifest.carousel_images.length + manifest.lifestyle_photos.length;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`   Updated carousel manifest: ${manifestPath}`);
    return true;
  } catch (error) {
    console.warn(`   Warning: Could not update carousel manifest: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('=== Background Replacement (Pixel-Perfect) ===');
  console.log(`Session ID: ${sessionId}`);
  console.log(`Mockup: ${mockupPath}`);
  console.log(`Background: ${backgroundPrompt}`);

  // Read mockup
  const mockupBuffer = fs.readFileSync(mockupPath);
  const metadata = await sharp(mockupBuffer).metadata();
  const { width, height } = metadata;

  console.log(`\n1. Processing mockup (${width}x${height})...`);

  // Step 1: Remove background from product using AI
  const productWithTransparency = await removeProductBackground(mockupBuffer);

  // Step 2: Generate background
  console.log('\n2. Generating background...');
  const backgroundBuffer = await generateBackground(backgroundPrompt, width, height);

  // Step 3: Composite product over background
  console.log('\n3. Compositing final image...');
  const finalImage = await compositeImages(productWithTransparency, backgroundBuffer);

  // Step 4: Save result
  const mockupDir = path.dirname(mockupPath);
  const carouselManifestPath = findCarouselManifest(mockupPath);
  const outputDir = carouselManifestPath ? mockupDir : 'images-generated/catalog-photos';
  fs.mkdirSync(outputDir, { recursive: true });

  // Count existing lifestyle photos for this session
  const existingLifestylePhotos = fs.readdirSync(outputDir)
    .filter(f => f.startsWith(`${sessionId}_lifestyle_`)).length;
  const lifestyleIndex = existingLifestylePhotos + 1;

  const filename = `${sessionId}_lifestyle_${String(lifestyleIndex).padStart(2, '0')}.png`;
  const outputPath = path.join(outputDir, filename);

  fs.writeFileSync(outputPath, finalImage);

  const sizeKb = Math.round(finalImage.length / 1024);
  console.log(`\n4. Saved: ${outputPath} (${sizeKb}kb)`);

  // Create lifestyle photo metadata
  const lifestylePhoto = {
    id: `${sessionId}_lifestyle_${String(lifestyleIndex).padStart(2, '0')}`,
    session_id: sessionId,
    type: 'lifestyle',
    index: lifestyleIndex,
    filename: filename,
    source_mockup: path.basename(mockupPath),
    background_prompt: backgroundPrompt,
    method: 'composite', // Indicates pixel-perfect compositing was used
    generated_at: new Date().toISOString(),
    size_kb: sizeKb,
  };

  // Update carousel manifest if it exists
  if (carouselManifestPath) {
    updateCarouselManifest(carouselManifestPath, lifestylePhoto);
  } else {
    // Save standalone metadata
    const metadataPath = path.join(outputDir, `${sessionId}_lifestyle_${String(lifestyleIndex).padStart(2, '0')}_metadata.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(lifestylePhoto, null, 2));
    console.log(`   Metadata: ${metadataPath}`);
  }

  console.log(`\n=== DONE ===`);
  console.log(`Session ID: ${sessionId}`);
  console.log(`Image ID: ${lifestylePhoto.id}`);
  console.log(`\nThe product is PIXEL-PERFECT identical to the source mockup.`);
}

main().catch(err => {
  console.error(`\nError: ${err.message}`);
  process.exit(1);
});
