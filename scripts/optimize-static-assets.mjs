#!/usr/bin/env node
/**
 * Re-encode the site's raster images before they are pushed to the CDN.
 *
 * Every image is scaled down to fit 1600x1600 (never up) and re-encoded:
 * - Photos (PNG or JPEG) under the folders in CONVERT_DIRS become WebP at
 *   quality 80, so `home/1-a.png` is written as `home/1-a.webp`. Update the
 *   references in code to the new extension.
 * - Other WebP stays WebP, other PNG becomes palette PNG (logos, icons, the
 *   invoice logo and the AI mock image keep their format), other JPEG is
 *   re-encoded with mozjpeg. A file that would grow keeps its original bytes.
 *
 * Image originals of 1-3 MB shrink to 50-250 KB. Each original is downloaded once
 * per `next/image` width it is shown at, so their size drives the CDN traffic.
 *
 * Usage:
 *   node scripts/optimize-static-assets.mjs <source-dir> <out-dir>
 *   node scripts/push-static-assets.mjs --target test --source-dir <out-dir>
 */

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const CONVERT_DIRS = ['home', 'suggested-edits', 'promo-sections', 'products-images', 'stamp-steps', 'badges'];
const MAX_EDGE = 1600;
const RASTER = new Set(['.png', '.jpg', '.jpeg', '.webp']);

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true })
  .flatMap((entry) => (entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]));

async function encode(input, ext, toWebp) {
  const image = sharp(input).rotate().resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true });
  if (toWebp || ext === '.webp') return image.webp({ quality: 80, alphaQuality: 90, effort: 6 }).toBuffer();
  if (ext === '.png') return image.png({ palette: true, quality: 90, effort: 10, compressionLevel: 9 }).toBuffer();
  return image.jpeg({ quality: 80, mozjpeg: true }).toBuffer();
}

async function main() {
  const [sourceDir, outDir] = process.argv.slice(2);
  if (!sourceDir || !outDir) fail('usage: optimize-static-assets.mjs <source-dir> <out-dir>');
  if (!fs.existsSync(sourceDir)) fail(`source directory ${sourceDir} does not exist`);
  let before = 0;
  let after = 0;
  for (const file of walk(sourceDir)) {
    const ext = path.extname(file).toLowerCase();
    if (!RASTER.has(ext)) continue;
    const key = path.relative(sourceDir, file).split(path.sep).join('/');
    const toWebp = CONVERT_DIRS.includes(key.split('/')[0]) && ext !== '.webp';
    const outKey = toWebp ? `${key.slice(0, -ext.length)}.webp` : key;
    const input = fs.readFileSync(file);
    let output = await encode(input, ext, toWebp);
    if (!toWebp && output.length >= input.length) output = input;
    fs.mkdirSync(path.dirname(path.join(outDir, outKey)), { recursive: true });
    fs.writeFileSync(path.join(outDir, outKey), output);
    before += input.length;
    after += output.length;
    if (outKey !== key) console.log(`${key} -> ${outKey}`);
  }
  console.log(`\nDone: ${(before / 1e6).toFixed(1)} MB -> ${(after / 1e6).toFixed(1)} MB in ${outDir}`);
}

main().catch((error) => fail(error.message));
