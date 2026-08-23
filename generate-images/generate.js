#!/usr/bin/env node
// Generate the whole prompt catalogue.
//
//   node generate.js                 # everything
//   node generate.js pets jokes      # only those categories
//   node generate.js --dry           # print prompts, spend nothing
//   node generate.js --size 4K       # override resolution
//
// Needs GEMINI_API_KEY in the environment.

import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import * as path from "node:path";
import { CATEGORIES, BLOCKS } from "./prompts.js";

const ai = new GoogleGenAI({});

const args     = process.argv.slice(2);
const DRY      = args.includes("--dry");
const SIZE     = argValue("--size") ?? "1K";
const CONC     = Number(argValue("--concurrency") ?? 3);
const only     = args.filter((a) => !a.startsWith("--") && !isValueOf(a));
const OUT      = "out";

const DEFAULT_MODEL = "gemini-3.1-flash-image";
const TEXT_MODEL    = "gemini-3.1-flash";

// Google's published rates, USD per image.
const PRICE = {
  "gemini-3.1-flash-image":      { "1K": 0.067, "2K": 0.11,  "4K": 0.151 },
  "gemini-3-pro-image":          { "1K": 0.134, "2K": 0.134, "4K": 0.24  },
  "gemini-3.1-flash-lite-image": { "1K": 0.034, "2K": 0.034, "4K": 0.034 },
};

function argValue(flag) {
  const i = args.indexOf(flag);
  return i === -1 ? null : args[i + 1];
}
function isValueOf(a) {
  const i = args.indexOf(a);
  return i > 0 && args[i - 1].startsWith("--");
}

// ── Step 1: invent brand names (text call, JSON out) ────────────────────────
async function inventBrand(sector) {
  const res = await ai.interactions.create({
    model: TEXT_MODEL,
    input: `You invent fictional brand identities for t-shirt prints.
Invent one brand in the "${sector}" space.

Return ONLY minified JSON, no markdown fences, no preamble:
{"name":"1-2 words, pronounceable, invented","tagline":"max 4 words, may be empty","motif":"one concrete object or shape","typography":"font direction, e.g. heavy geometric sans, all caps, tight tracking","palette":"2-3 named colours"}

The name must not match any real existing brand.`,
  });
  const raw = res.output_text.replace(/```json|```/g, "").trim();
  return JSON.parse(raw);
}

// ── Step 2: assemble the full prompt ────────────────────────────────────────
function assemble(cat, v, body) {
  // Use logo block for logo categories, print block for t-shirt designs
  const contextBlock = cat.isLogo ? BLOCKS.logo : BLOCKS.print;

  return [
    body.trim(),
    v.style ? `Style: ${v.style}.` : cat.style ? `Style: ${cat.style}.` : "",
    cat.extra ?? "",
    cat.candid ? BLOCKS.candid : "",
    contextBlock,
    BLOCKS.ip,
  ].filter(Boolean).join("\n").replace(/\n{3,}/g, "\n\n");
}

// ── Step 3: generate one image ──────────────────────────────────────────────
async function generate({ dir, label, prompt, model, aspect }) {
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
    model,
    input: prompt,
    response_format: { type: "image", mime_type: "image/jpeg", aspect_ratio: aspect, image_size: SIZE },
  });

  if (!res.output_image) throw new Error("no image returned (prompt may have been refused)");

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, Buffer.from(res.output_image.data, "base64"));
  fs.writeFileSync(path.join(dir, `${label}.txt`), prompt);

  const secs = ((Date.now() - started) / 1000).toFixed(1);
  const cost = PRICE[model]?.[SIZE] ?? 0;
  console.log(`  ✓ ${label}  ${secs}s  $${cost.toFixed(3)}`);
  return { cost };
}

// ── Simple concurrency limiter ──────────────────────────────────────────────
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

// ── Main ────────────────────────────────────────────────────────────────────
const cats = only.length
  ? CATEGORIES.filter((c) => only.includes(c.id))
  : CATEGORIES;

if (!cats.length) {
  console.error(`No matching categories. Available: ${CATEGORIES.map((c) => c.id).join(", ")}`);
  process.exit(1);
}

// Build the full job list first, so the cost estimate is honest.
const jobs = [];
for (const cat of cats) {
  const model  = cat.model  ?? DEFAULT_MODEL;
  const aspect = cat.aspect ?? "4:5";
  const dir    = path.join(OUT, cat.id);

  if (cat.invent) {
    for (const sector of cat.invent) {
      jobs.push({ cat, dir, model, aspect, sector, label: sector.replace(/\s+/g, "-") });
    }
  } else {
    for (const v of cat.variants) {
      jobs.push({ cat, dir, model, aspect, v, label: v.label });
    }
  }
}

const estimate = jobs.reduce((sum, j) => sum + (PRICE[j.model]?.[SIZE] ?? 0), 0);
console.log(`\n${jobs.length} images across ${cats.length} categories at ${SIZE}`);
console.log(`Estimated cost: $${estimate.toFixed(2)}${DRY ? "  (dry run — spending nothing)" : ""}\n`);

let spent = 0;
for (const cat of cats) {
  const catJobs = jobs.filter((j) => j.cat === cat);
  console.log(`${cat.name}  (${catJobs.length})`);

  const prepared = [];
  for (const j of catJobs) {
    let prompt;
    if (j.sector) {
      if (DRY) { prompt = `[would invent a brand in "${j.sector}" then build a logo prompt]`; }
      else {
        const brand = await inventBrand(j.sector);
        console.log(`  → "${brand.name}" (${j.sector})`);
        prompt = assemble(cat, {}, cat.build(brand));
      }
    } else {
      prompt = assemble(cat, j.v, j.v.prompt);
    }
    prepared.push({ ...j, prompt });
  }

  const results = await pool(prepared, CONC, generate);
  spent += results.reduce((s, r) => s + (r.cost ?? 0), 0);
  console.log("");
}

console.log(`Done. Actual spend: $${spent.toFixed(2)}`);
console.log(`Output in ./${OUT}/\n`);
