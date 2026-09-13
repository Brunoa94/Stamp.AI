#!/usr/bin/env node
/**
 * Generate Gemini lifestyle photo from a mockup with session ID linking
 *
 * Usage:
 *   node scripts/test-gemini-lifestyle.mjs <mockup-path> "<environment-prompt>" [--session <id>]
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Parse arguments
const args = process.argv.slice(2);
let mockupPath = null;
let userPrompt = null;
let sessionId = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--session' && args[i + 1]) {
    sessionId = args[i + 1];
    i++;
  } else if (!mockupPath) {
    mockupPath = args[i];
  } else if (!userPrompt) {
    userPrompt = args[i];
  }
}

if (!mockupPath || !userPrompt) {
  console.log('Usage: node scripts/test-gemini-lifestyle.mjs <mockup-path> "<environment-prompt>" [--session <id>]');
  console.log('');
  console.log('Options:');
  console.log('  --session <id>    Link to existing session ID for carousel grouping');
  console.log('');
  console.log('Example:');
  console.log('  node scripts/test-gemini-lifestyle.mjs ./mockup.png "guy in sports shorts at a park"');
  console.log('  node scripts/test-gemini-lifestyle.mjs ./mockup.png "beach setting" --session abc123');
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

async function enhancePrompt(userPrompt, mockupBase64) {
  console.log('\n1. Enhancing prompt with Gemini...');
  console.log(`   User prompt: "${userPrompt}"`);

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const enhanceRequest = `You are a professional e-commerce photographer creating catalog-ready lifestyle photos.

=== CRITICAL RULE ===
PRESERVE THE PRODUCT IN THE PHOTO ALWAYS AS MUCH AS POSSIBLE.
This is the #1 priority - the product must look exactly like the source image.

FIRST: Carefully analyze the product mockup image. Identify and describe in detail:
- The exact design/logo/graphic on the product
- All text, colors, and visual elements
- The product color and style (hoodie, t-shirt, etc.)

Then enhance the user's environment request into a detailed photography prompt.

USER REQUEST: "${userPrompt}"

YOUR ENHANCED PROMPT MUST START WITH THIS EXACT PRODUCT PRESERVATION BLOCK:
"[PRODUCT PRESERVATION - MANDATORY]
RULE: Preserve the product in the photo always as much as possible.
The product in this image must remain PIXEL-PERFECT identical to the source mockup:
- Design/Logo: [describe the exact design you see]
- Colors: [exact colors of the design]
- Text: [any text visible on the product]
- Placement: [where the design sits on the product]
DO NOT modify, distort, reinterpret, or regenerate any part of the product or its design. Copy it exactly."

AFTER the preservation block, describe:
- The environment/setting requested by the user
- Pose/angle (NO FACES - crop above shoulders, shoot from behind, or side angles)
- Lighting conditions
- Props and background elements
- Photography style (realistic, catalog-quality)

Output the complete enhanced prompt. Keep it under 300 words.`;

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: 'image/png',
        data: mockupBase64,
      },
    },
    { text: enhanceRequest },
  ]);

  const enhancedPrompt = result.response.text().trim();
  console.log(`   Enhanced prompt: "${enhancedPrompt.substring(0, 150)}..."`);

  return enhancedPrompt;
}

async function generateLifestylePhoto(mockupBase64, enhancedPrompt) {
  console.log('\n2. Generating lifestyle photo...');

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

  const generationPrompt = `You are generating a lifestyle photograph. Your #1 priority is EXACT PRODUCT PRESERVATION.

=== CRITICAL RULE ===
PRESERVE THE PRODUCT IN THE PHOTO ALWAYS AS MUCH AS POSSIBLE.

=== PRODUCT PRESERVATION RULES ===
1. The PRODUCT from the input image must be COPIED EXACTLY - pixel-perfect
2. DO NOT regenerate, reinterpret, or modify the product design in ANY way
3. DO NOT change the logo, text, colors, or any graphic element on the product
4. The product design must look IDENTICAL to the source - as if photographed, not regenerated
5. If you cannot preserve the design exactly, the image is a FAILURE
6. PRESERVE THE PRODUCT IN THE PHOTO ALWAYS AS MUCH AS POSSIBLE

Think of it this way: The product with its design is a REAL PHYSICAL OBJECT that exists. You are placing this EXACT object into a new scene. You cannot change what's printed on it.

=== SCENE DESCRIPTION ===
${enhancedPrompt}

=== PHOTOGRAPHY REQUIREMENTS ===
- Professional e-commerce/catalog quality photograph
- High resolution, sharp focus on the product
- Natural lighting that clearly shows the product and its design
- Realistic photographic style (NOT illustrated, NOT AI-looking)
- NO visible faces - crop above shoulders, shoot from behind, or use side angles
- The product and its design must be the clear focal point
- The design on the product must be fully visible and legible
- PRESERVE THE PRODUCT IN THE PHOTO ALWAYS AS MUCH AS POSSIBLE

=== FINAL CHECK ===
Before outputting: Verify the product design matches the source EXACTLY.
Remember: PRESERVE THE PRODUCT IN THE PHOTO ALWAYS AS MUCH AS POSSIBLE.

Generate one high-quality lifestyle photograph.`;

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
        { text: generationPrompt },
      ],
    }],
    generationConfig: { responseModalities: ['image', 'text'] },
  });

  const parts = result.response.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find(p => p.inlineData)?.inlineData;

  if (!imagePart?.data) {
    throw new Error('No image generated');
  }

  return {
    data: imagePart.data,
    mimeType: imagePart.mimeType || 'image/png',
  };
}

function findCarouselManifest(mockupPath) {
  // Try to find carousel manifest in the mockup's directory
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
  console.log('=== Gemini Lifestyle Photo Generator ===');
  console.log(`Session ID: ${sessionId}`);
  console.log(`Mockup: ${mockupPath}`);
  console.log(`Prompt: ${userPrompt}`);

  // Read mockup
  const mockupBuffer = fs.readFileSync(mockupPath);
  const mockupBase64 = mockupBuffer.toString('base64');

  // Step 1: Enhance the prompt
  const enhancedPrompt = await enhancePrompt(userPrompt, mockupBase64);

  // Step 2: Generate the lifestyle photo
  const result = await generateLifestylePhoto(mockupBase64, enhancedPrompt);

  // Step 3: Save the result with session ID
  // Save in the same directory as the mockup if it has a carousel manifest
  const mockupDir = path.dirname(mockupPath);
  const carouselManifestPath = findCarouselManifest(mockupPath);
  const outputDir = carouselManifestPath ? mockupDir : 'images-generated/catalog-photos';
  fs.mkdirSync(outputDir, { recursive: true });

  // Count existing lifestyle photos for this session
  const existingLifestylePhotos = fs.readdirSync(outputDir)
    .filter(f => f.startsWith(`${sessionId}_lifestyle_`)).length;
  const lifestyleIndex = existingLifestylePhotos + 1;

  const ext = result.mimeType.includes('jpeg') ? 'jpg' : 'png';
  const filename = `${sessionId}_lifestyle_${String(lifestyleIndex).padStart(2, '0')}.${ext}`;
  const outputPath = path.join(outputDir, filename);

  fs.writeFileSync(outputPath, Buffer.from(result.data, 'base64'));

  const sizeKb = Math.round(Buffer.from(result.data, 'base64').length / 1024);
  console.log(`\n3. Saved: ${outputPath} (${sizeKb}kb)`);

  // Create lifestyle photo metadata
  const lifestylePhoto = {
    id: `${sessionId}_lifestyle_${String(lifestyleIndex).padStart(2, '0')}`,
    session_id: sessionId,
    type: 'lifestyle',
    index: lifestyleIndex,
    filename: filename,
    source_mockup: path.basename(mockupPath),
    user_prompt: userPrompt,
    enhanced_prompt: enhancedPrompt,
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
}

main().catch(err => {
  console.error(`\nError: ${err.message}`);
  process.exit(1);
});
