#!/usr/bin/env node
// Generate a single image interactively.
//
// Usage: node generate-single.js
//
// You provide a basic idea, the script enhances the prompt,
// shows it for approval, then generates the image.
//
// Needs GEMINI_API_KEY in the environment.

import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";
import { BLOCKS, STYLES } from "./prompts.js";

const ai = new GoogleGenAI({});

const args = process.argv.slice(2);
const SIZE = args.find(a => a.startsWith("--size="))?.split("=")[1] ?? "1K";
const OUT = "out/custom";

const IMAGE_MODEL = "gemini-3.1-flash-image";
const TEXT_MODEL = "gemini-3.1-flash";

const PRICE = {
  "gemini-3.1-flash-image": { "1K": 0.067, "2K": 0.11, "4K": 0.151 },
};

// ── Readline setup ──────────────────────────────────────────────────────────
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

// ── Enhance the user's basic idea into a detailed prompt ────────────────────
async function enhancePrompt(basicIdea) {
  const res = await ai.interactions.create({
    model: TEXT_MODEL,
    input: `You are an expert at writing image generation prompts for t-shirt designs.

The user has this basic idea: "${basicIdea}"

Transform this into a detailed, vivid image generation prompt. Include:
- Specific visual details (colors, composition, lighting)
- Artistic style suggestions
- Mood and atmosphere
- Technical details that will make the image striking

Keep the prompt concise but descriptive (2-4 sentences).
Return ONLY the enhanced prompt, no explanations or preamble.`,
  });
  return res.output_text.trim();
}

// ── Build the final prompt with blocks ──────────────────────────────────────
function assemblePrompt(enhancedPrompt, style = null) {
  return [
    enhancedPrompt,
    style ? `Style: ${style}.` : "",
    BLOCKS.print,
    BLOCKS.ip,
  ].filter(Boolean).join("\n\n");
}

// ── Generate the image ──────────────────────────────────────────────────────
async function generateImage(prompt, label) {
  const dir = OUT;
  const file = path.join(dir, `${label}.jpg`);

  console.log("\n⏳ Generating image...\n");

  const started = Date.now();
  const res = await ai.interactions.create({
    model: IMAGE_MODEL,
    input: prompt,
    response_format: { type: "image", mime_type: "image/jpeg", aspect_ratio: "4:5", image_size: SIZE },
  });

  if (!res.output_image) throw new Error("No image returned (prompt may have been refused)");

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, Buffer.from(res.output_image.data, "base64"));
  fs.writeFileSync(path.join(dir, `${label}.txt`), prompt);

  const secs = ((Date.now() - started) / 1000).toFixed(1);
  const cost = PRICE[IMAGE_MODEL]?.[SIZE] ?? 0;

  console.log(`✓ Image saved: ${file}`);
  console.log(`  Time: ${secs}s | Cost: $${cost.toFixed(3)}\n`);

  return file;
}

// ── Main interactive loop ───────────────────────────────────────────────────
async function main() {
  console.log("\n🎨 T-Shirt Design Generator (Interactive Mode)\n");
  console.log("Available styles:", Object.keys(STYLES).join(", "));
  console.log("Resolution:", SIZE, "\n");
  console.log("Type 'quit' to exit.\n");

  while (true) {
    // Step 1: Get basic idea
    const basicIdea = await ask("📝 Your idea (basic description): ");
    if (basicIdea.toLowerCase() === "quit") break;
    if (!basicIdea.trim()) continue;

    // Step 2: Enhance the prompt
    console.log("\n🔮 Enhancing your prompt...\n");
    const enhanced = await enhancePrompt(basicIdea);

    console.log("━".repeat(60));
    console.log("Enhanced prompt:\n");
    console.log(enhanced);
    console.log("━".repeat(60));

    // Step 3: Optional style
    const styleInput = await ask("\n🎨 Style (press Enter for none, or type style name): ");
    const style = STYLES[styleInput] || null;

    // Step 4: Build final prompt
    const finalPrompt = assemblePrompt(enhanced, style);

    console.log("\n" + "═".repeat(60));
    console.log("FINAL PROMPT:\n");
    console.log(finalPrompt);
    console.log("═".repeat(60));

    // Step 5: Confirm
    const confirm = await ask("\n✅ Generate this image? (y/n/edit): ");

    if (confirm.toLowerCase() === "n") {
      console.log("Skipped.\n");
      continue;
    }

    if (confirm.toLowerCase() === "edit") {
      const edited = await ask("\n📝 Enter your edited prompt: ");
      const editedFinal = assemblePrompt(edited, style);

      const labelInput = await ask("📁 Filename (no extension): ");
      const label = labelInput.trim() || `design-${Date.now()}`;

      await generateImage(editedFinal, label);
      continue;
    }

    // Step 6: Get filename and generate
    const labelInput = await ask("📁 Filename (no extension): ");
    const label = labelInput.trim() || `design-${Date.now()}`;

    try {
      await generateImage(finalPrompt, label);
    } catch (err) {
      console.log(`\n❌ Error: ${err.message}\n`);
    }
  }

  rl.close();
  console.log("\n👋 Goodbye!\n");
}

main().catch(console.error);
