#!/usr/bin/env node
// Generate lifestyle mockups for existing designs on specific products.
//
//   node generate-mockups.js           # generate all mockups
//   node generate-mockups.js --dry     # preview prompts, spend nothing
//
// Needs GEMINI_API_KEY in the environment.

import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import * as path from "node:path";

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const SIZE = args.includes("--size") ? args[args.indexOf("--size") + 1] : "1K";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey && !DRY) {
  console.error("Error: GEMINI_API_KEY environment variable is not set.");
  console.error("Get your API key from: https://aistudio.google.com/apikey");
  console.error("Or use --dry to preview prompts without spending.");
  process.exit(1);
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
const OUT = "out-mockups";
const MODEL = "gemini-3.1-flash-image";

const PRICE = {
  "gemini-3.1-flash-image": { "1K": 0.067, "2K": 0.11, "4K": 0.151 },
};

// ============================================
// YOUR SPECIFIC TEST MOCKUPS
// ============================================

const MOCKUP_JOBS = [
  // Front view of t-shirt - family design only
  {
    id: "tshirt-front-family",
    product: "T-Shirt (Front View)",
    aspect: "4:5",
    prompt: `A lifestyle photo of a person wearing a white cotton t-shirt with a printed design on the front chest area. The back of the shirt is not visible.

THE FRONT DESIGN: A happy family portrait illustration - parents, two kids, and their beloved dog sitting in front. Everyone looking at the viewer with joy, the dog with tongue out. Vibrant digital illustration style with rich gradients, detailed shading, and warm colors. Heartwarming composition.

Urban coffee shop setting, natural window light, the person holding a coffee cup and smiling. Casual weekend vibe. The person is facing the camera.

This is realistic product photography, not an illustration. Professional lighting, sharp focus on the t-shirt. The print should look like an actual screen-printed design on cotton fabric.`,
  },

  // Back view of t-shirt - gym design only (NO front print visible)
  {
    id: "tshirt-back-gym",
    product: "T-Shirt (Back View)",
    aspect: "4:5",
    prompt: `A lifestyle photo showing the back of a person wearing a white cotton t-shirt with a large printed design on the back only.

THE BACK DESIGN: A powerful gorilla silhouette mid-deadlift, muscles defined, raw strength on display. Bold varsity athletic typography style, minimalist but impactful with strong black contrast. Gym motivation aesthetic.

The front of the shirt is NOT visible - this is a back view only. Gym environment or urban street setting, the person walking away from camera showing the full back print. Athletic confident posture.

This is realistic product photography, not an illustration. Professional lighting, sharp focus on the back of the t-shirt. The print should look like actual screen-printing on fabric.`,
  },

  // Ceramic Mug with developer design
  {
    id: "mug-developer",
    product: "Ceramic Mug",
    aspect: "4:3",
    prompt: `A cozy product photo of a white ceramic mug with a printed design wrapped around its surface.

THE DESIGN: A humorous illustration of a developer surrounded by floating code snippets, coffee cups stacked high, multiple monitors showing colorful syntax. Exhausted but passionate expression. Vibrant digital illustration with rich gradients and detailed shading. Tech humor aesthetic.

The mug is placed on a wooden desk next to a laptop keyboard, with steam rising from hot coffee inside. Morning light through a window, home office atmosphere. A pair of glasses and some sticky notes visible in the background.

This is realistic product photography, not an illustration. Professional lighting, sharp focus on the mug. The print should look like actual ceramic printing, slightly glossy.`,
  },

  // Tote Bag with reunion selfie design
  {
    id: "totebag-friends",
    product: "Tote Bag",
    aspect: "1:1",
    prompt: `A lifestyle photo of a canvas tote bag with an all-over printed design.

THE DESIGN: Six friends squeezed into a chaotic group selfie, some making faces, some laughing, authentic imperfect moment. Elegant fine line art style with delicate cross-hatching and detailed textures, artistic pen and ink illustration. Real friendship captured, candid and fun.

The tote bag is carried over the shoulder by a stylish person walking through a sunny outdoor market or city street. The bag is prominently displayed, showing the full design. Casual weekend aesthetic, natural daylight.

This is realistic product photography, not an illustration. Professional lighting, sharp focus on the tote bag. The print should look like actual canvas printing with visible fabric texture.`,
  },
];

// ============================================
// GENERATION FUNCTION
// ============================================

async function generateImage({ id, prompt, aspect }) {
  const file = path.join(OUT, `${id}.jpg`);
  if (fs.existsSync(file)) {
    console.log(`  ↷ ${id} (exists, skipping)`);
    return { skipped: true };
  }

  if (DRY) {
    fs.mkdirSync(OUT, { recursive: true });
    fs.writeFileSync(path.join(OUT, `${id}.txt`), prompt);
    console.log(`  · ${id} (dry)`);
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

  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(file, Buffer.from(res.output_image.data, "base64"));
  fs.writeFileSync(path.join(OUT, `${id}.txt`), prompt);

  const secs = ((Date.now() - started) / 1000).toFixed(1);
  const cost = PRICE[MODEL]?.[SIZE] ?? 0;
  console.log(`  ✓ ${id}  ${secs}s  $${cost.toFixed(3)}`);
  return { cost };
}

// ============================================
// MAIN
// ============================================

const estimate = MOCKUP_JOBS.length * (PRICE[MODEL]?.[SIZE] ?? 0);

console.log(`\n🎨 Product Mockup Generation`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`Mockups to generate: ${MOCKUP_JOBS.length}`);
console.log(`Resolution: ${SIZE}`);
console.log(`Estimated cost: $${estimate.toFixed(2)}${DRY ? "  (dry run)" : ""}\n`);

console.log(`Products:`);
for (const job of MOCKUP_JOBS) {
  console.log(`  • ${job.product} → ${job.id}`);
}
console.log("");

let spent = 0;
for (const job of MOCKUP_JOBS) {
  console.log(`Generating: ${job.product}`);
  try {
    const result = await generateImage(job);
    spent += result.cost ?? 0;
  } catch (err) {
    console.log(`  ✗ ${job.id}: ${err.message}`);
  }
  console.log("");
}

console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`Done. Actual spend: $${spent.toFixed(2)}`);
console.log(`Output in ./${OUT}/\n`);

console.log(`📁 Generated mockups:`);
for (const job of MOCKUP_JOBS) {
  console.log(`   ${OUT}/${job.id}.jpg`);
}
console.log("");
