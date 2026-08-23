#!/usr/bin/env node
// Generate designs for actual store products with lifestyle mockups.
//
//   node generate-products.js                 # generate all
//   node generate-products.js --dry           # print prompts, spend nothing
//   node generate-products.js --products 3    # limit number of products
//
// Needs GEMINI_API_KEY in the environment.

import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import * as path from "node:path";

const args = process.argv.slice(2);
const DRY = args.includes("--dry");

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey && !DRY) {
  console.error("Error: GEMINI_API_KEY environment variable is not set.");
  console.error("Get your API key from: https://aistudio.google.com/apikey");
  console.error("Or use --dry to preview prompts without spending.");
  process.exit(1);
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
const PRODUCT_LIMIT = Number(argValue("--products") ?? 999);
const SIZE = argValue("--size") ?? "1K";
const CONC = Number(argValue("--concurrency") ?? 2);
const OUT = "out-products";

const MODEL = "gemini-3.1-flash-image";

const PRICE = {
  "gemini-3.1-flash-image": { "1K": 0.067, "2K": 0.11, "4K": 0.151 },
};

function argValue(flag) {
  const i = args.indexOf(flag);
  return i === -1 ? null : args[i + 1];
}

// ============================================
// STORE PRODUCT CATALOG (from your Supabase)
// ============================================

const STORE_PRODUCTS = [
  {
    blueprint_id: 1326,
    name: "T-Shirt",
    type: "tshirt",
    aspect: "4:5",
    designPrompt: {
      context: "This artwork will be printed onto a t-shirt. Single centred subject on a clean white background with clear margins. The design should be visually striking and detailed. No signature, no watermark.",
    },
    mockupPrompt: "A lifestyle photo of a person wearing a white cotton t-shirt with this design printed on the front chest area. Urban street setting, natural daylight, casual confident pose. The person is relaxed, not looking directly at camera.",
  },
  {
    blueprint_id: 1389,
    name: "Tote Bag",
    type: "totebag",
    aspect: "1:1",
    designPrompt: {
      context: "This artwork will be printed as an all-over-print on a canvas tote bag. The design should tile seamlessly or work as a full coverage pattern. Vibrant colors, detailed illustration. No signature, no watermark.",
    },
    mockupPrompt: "A lifestyle photo of a canvas tote bag with this colorful all-over-print design, carried over shoulder by a stylish person walking through a sunny farmers market. Natural lighting, casual weekend aesthetic.",
  },
  {
    blueprint_id: 441,
    name: "Ceramic Mug",
    type: "mug",
    aspect: "4:3",
    designPrompt: {
      context: "This artwork will be printed onto a ceramic mug. The design wraps around the mug surface. Bold, clear imagery that reads well at small scale. No signature, no watermark.",
    },
    mockupPrompt: "A cozy product photo of a white ceramic mug with this design printed on its surface, placed on a wooden table with steam rising from hot coffee inside. Warm morning light through a window, homey kitchen atmosphere.",
  },
  {
    blueprint_id: 475,
    name: "Spiral Journal",
    type: "journal",
    aspect: "4:5",
    designPrompt: {
      context: "This artwork will be the cover of a spiral-bound journal. Full bleed design that works as a book cover. Artistic, inspiring imagery. No signature, no watermark.",
    },
    mockupPrompt: "A flat lay photo of a spiral-bound journal with this design as the cover, placed on a clean wooden desk alongside a quality pen, reading glasses, and a small plant. Creative workspace aesthetic, soft natural lighting from above.",
  },
  {
    blueprint_id: 229,
    name: "Pillowcase",
    type: "pillow",
    aspect: "1:1",
    designPrompt: {
      context: "This artwork will be printed on a square pillowcase. The design should work as home decor - sophisticated, artistic, or playful depending on theme. No signature, no watermark.",
    },
    mockupPrompt: "A lifestyle photo of a decorative throw pillow with this design printed on it, placed on a modern grey sofa in a stylish minimalist living room. Cozy home decor setting, soft ambient afternoon lighting.",
  },
  {
    blueprint_id: 496,
    name: "Crew Socks",
    type: "socks",
    aspect: "2:3",
    designPrompt: {
      context: "This artwork will be sublimation printed on crew socks. Bold patterns or fun motifs that work on a long narrow format. Vibrant colors. No signature, no watermark.",
    },
    mockupPrompt: "A lifestyle photo of colorful sublimation printed crew socks with this pattern, worn by someone sitting on a bench, legs crossed casually. Modern streetwear aesthetic, clean urban background.",
  },
];

// ============================================
// DESIGN THEMES (one per product for testing)
// ============================================

const DESIGN_THEMES = [
  {
    id: "geometric-nature",
    name: "Geometric Nature",
    style: "Modern geometric illustration with clean lines",
    body: "A majestic mountain landscape with a rising sun, rendered in geometric polygonal style. Bold shapes, warm sunset colors of orange, pink and purple against deep blue mountains. Minimalist and modern.",
  },
  {
    id: "botanical-art",
    name: "Botanical Art",
    style: "Elegant botanical illustration with watercolor touches",
    body: "A beautiful arrangement of wildflowers including poppies, daisies, and lavender. Delicate watercolor style with soft edges and natural colors. Artistic and sophisticated.",
  },
  {
    id: "cosmic-wonder",
    name: "Cosmic Wonder",
    style: "Vibrant space illustration with rich colors",
    body: "A dreamy cosmic scene with swirling galaxies, colorful nebulas, and scattered stars. Deep purples, electric blues, and bright pinks. Sense of wonder and infinite space.",
  },
  {
    id: "ocean-waves",
    name: "Ocean Waves",
    style: "Japanese-inspired wave art",
    body: "Stylized ocean waves in the style of traditional Japanese woodblock prints. Dynamic flowing water with white foam caps against deep blue sea. Powerful and serene.",
  },
  {
    id: "forest-animals",
    name: "Forest Animals",
    style: "Charming illustrated wildlife",
    body: "A friendly fox sitting in an autumn forest, surrounded by falling leaves and mushrooms. Warm fall colors, cozy woodland atmosphere. Whimsical and heartwarming.",
  },
  {
    id: "abstract-flow",
    name: "Abstract Flow",
    style: "Modern abstract art with fluid shapes",
    body: "Flowing abstract shapes in harmonious colors, resembling liquid marble or aurora borealis. Soft gradients of teal, coral, and gold. Contemporary and artistic.",
  },
];

// ============================================
// SHARED BLOCKS
// ============================================

const BLOCKS = {
  ip: `All designs, emblems, and imagery are entirely original inventions. Do not reproduce or imitate any existing trademarked character, brand, or franchise.`,
  quality: `High quality, professional illustration. Clean composition with clear focal point.`,
};

// ============================================
// GENERATION FUNCTIONS
// ============================================

function assembleDesignPrompt(product, theme) {
  return [
    theme.body,
    `Style: ${theme.style}.`,
    product.designPrompt.context,
    BLOCKS.quality,
    BLOCKS.ip,
  ].join("\n\n");
}

function assembleMockupPrompt(product, theme) {
  // For mockups, we describe the design AND the product context
  return [
    `The design on the product shows: ${theme.body}`,
    `Style of the design: ${theme.style}.`,
    product.mockupPrompt,
    `This is a realistic product photography shot, not an illustration. Professional lighting, sharp focus on the product.`,
    BLOCKS.ip,
  ].join("\n\n");
}

async function generateImage({ dir, label, prompt, aspect }) {
  const file = path.join(dir, `${label}.jpg`);
  if (fs.existsSync(file)) {
    console.log(`  ↷ ${label} (exists, skipping)`);
    return { skipped: true };
  }

  if (DRY) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${label}.txt`), prompt);
    console.log(`  · ${label} (dry)`);
    return { dry: true };
  }

  const started = Date.now();
  const res = await ai.interactions.create({
    model: MODEL,
    input: prompt,
    response_format: {
      type: "image",
      mime_type: "image/jpeg",
      aspect_ratio: aspect,
      image_size: SIZE,
    },
  });

  if (!res.output_image) throw new Error("no image returned (prompt may have been refused)");

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, Buffer.from(res.output_image.data, "base64"));
  fs.writeFileSync(path.join(dir, `${label}.txt`), prompt);

  const secs = ((Date.now() - started) / 1000).toFixed(1);
  const cost = PRICE[MODEL]?.[SIZE] ?? 0;
  console.log(`  ✓ ${label}  ${secs}s  $${cost.toFixed(3)}`);
  return { cost };
}

async function pool(items, limit, fn) {
  const results = [];
  let i = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (i < items.length) {
      const item = items[i++];
      try {
        results.push(await fn(item));
      } catch (err) {
        console.log(`  ✗ ${item.label}: ${err.message}`);
        results.push({ error: true });
      }
    }
  });
  await Promise.all(workers);
  return results;
}

// ============================================
// MAIN
// ============================================

const products = STORE_PRODUCTS.slice(0, PRODUCT_LIMIT);
const jobs = [];

// For each product, pick a theme and create both flat design + mockup jobs
for (let i = 0; i < products.length; i++) {
  const product = products[i];
  const theme = DESIGN_THEMES[i % DESIGN_THEMES.length];
  const dir = path.join(OUT, product.type);

  // Job 1: Flat design (for Printify upload)
  jobs.push({
    type: "design",
    product,
    theme,
    dir,
    label: `${theme.id}-design`,
    prompt: assembleDesignPrompt(product, theme),
    aspect: product.aspect,
  });

  // Job 2: Lifestyle mockup (for marketing)
  jobs.push({
    type: "mockup",
    product,
    theme,
    dir,
    label: `${theme.id}-mockup`,
    prompt: assembleMockupPrompt(product, theme),
    aspect: product.aspect,
  });
}

const estimate = jobs.length * (PRICE[MODEL]?.[SIZE] ?? 0);
console.log(`\n🎨 Product-Aware Image Generation`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`Products: ${products.length} (${products.map(p => p.name).join(", ")})`);
console.log(`Images: ${jobs.length} (${jobs.length / 2} designs + ${jobs.length / 2} mockups)`);
console.log(`Resolution: ${SIZE}`);
console.log(`Estimated cost: $${estimate.toFixed(2)}${DRY ? "  (dry run)" : ""}\n`);

let spent = 0;
for (const product of products) {
  const productJobs = jobs.filter(j => j.product === product);
  const theme = productJobs[0].theme;
  console.log(`${product.name} (${product.type}) — "${theme.name}"`);

  const results = await pool(productJobs, CONC, generateImage);
  spent += results.reduce((s, r) => s + (r.cost ?? 0), 0);
  console.log("");
}

console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`Done. Actual spend: $${spent.toFixed(2)}`);
console.log(`Output in ./${OUT}/\n`);

// Summary of what was generated
console.log(`📁 Output structure:`);
for (const product of products) {
  const theme = DESIGN_THEMES[products.indexOf(product) % DESIGN_THEMES.length];
  console.log(`   ${OUT}/${product.type}/`);
  console.log(`     ├── ${theme.id}-design.jpg   (flat art for Printify)`);
  console.log(`     └── ${theme.id}-mockup.jpg   (lifestyle photo for marketing)`);
}
console.log("");
