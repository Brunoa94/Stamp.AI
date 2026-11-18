#!/usr/bin/env node
/**
 * Push the site's static images to the Supabase Storage CDN.
 *
 * The app serves its static images (homepage, backdrops, payment logos, brand
 * marks...) from the public `static-assets` bucket instead of `public/`. The
 * object key is the file's path relative to the source directory, so
 * `<dir>/home/1-a.png` is served at
 *   <SUPABASE_URL>/storage/v1/object/public/static-assets/home/1-a.png
 * which is what `staticAssetUrl("/home/1-a.png")` returns in the app.
 *
 * Two sources:
 *   --source-dir <dir>      upload every image under a local folder
 *   --from <test|prod>      mirror the bucket of the other project (how prod is
 *                           filled once the images were pushed to test)
 *
 * The bucket is created (public, images only) when it does not exist. Objects
 * whose content is unchanged (same MD5 as the stored ETag) are skipped, so
 * re-runs only upload what changed.
 *
 * Usage:
 *   node scripts/push-static-assets.mjs --target test --source-dir ./images
 *   node scripts/push-static-assets.mjs --target prod --from test
 *   node scripts/push-static-assets.mjs --target test --source-dir ./images --dry-run
 *
 * Credentials: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, read from
 * .env.test.local for the test project and .env for production.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'static-assets';
const ENV_FILES = { test: '.env.test.local', prod: '.env' };
const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
};
const ONE_WEEK_SECONDS = '604800';
const MAX_FILE_SIZE = '10MB';
const CONCURRENCY = 6;

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const opts = { target: null, sourceDir: null, from: null, dryRun: false, cacheControl: ONE_WEEK_SECONDS };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--target') opts.target = argv[++i];
    else if (arg === '--source-dir') opts.sourceDir = argv[++i];
    else if (arg === '--from') opts.from = argv[++i];
    else if (arg === '--cache-control') opts.cacheControl = argv[++i];
    else if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--help' || arg === '-h') {
      console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('*/')[0]);
      process.exit(0);
    } else fail(`unknown argument ${arg}`);
  }
  if (!ENV_FILES[opts.target]) fail('--target must be "test" or "prod"');
  if (Boolean(opts.sourceDir) === Boolean(opts.from)) fail('pass exactly one of --source-dir or --from');
  if (opts.from && !ENV_FILES[opts.from]) fail('--from must be "test" or "prod"');
  if (opts.from === opts.target) fail('--from and --target must be different projects');
  return opts;
}

/** A service-role client for one project, read from that project's env file without touching process.env. */
function projectClient(project) {
  const file = ENV_FILES[project];
  if (!fs.existsSync(file)) fail(`${file} not found (needed for the ${project} project)`);
  const env = dotenv.parse(fs.readFileSync(file));
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) fail(`${file} must define NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY`);
  return { url: url.replace(/\/+$/, ''), client: createClient(url, key, { auth: { persistSession: false } }) };
}

async function ensureBucket(client, dryRun) {
  const { data, error } = await client.storage.getBucket(BUCKET);
  if (data) {
    if (!data.public) fail(`bucket ${BUCKET} exists but is not public`);
    return;
  }
  if (error && !/not found/i.test(error.message)) fail(`could not read bucket ${BUCKET}: ${error.message}`);
  if (dryRun) {
    console.log(`[dry-run] would create public bucket ${BUCKET}`);
    return;
  }
  const { error: createError } = await client.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_FILE_SIZE,
    allowedMimeTypes: [...new Set(Object.values(MIME_TYPES))],
  });
  if (createError) fail(`could not create bucket ${BUCKET}: ${createError.message}`);
  console.log(`Created public bucket ${BUCKET}`);
}

/** Every object in the bucket as key → ETag (without quotes), walking folders recursively. */
async function listObjects(client, prefix = '') {
  const objects = new Map();
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await client.storage.from(BUCKET).list(prefix, { limit: 1000, offset });
    if (error) {
      if (/not found/i.test(error.message)) return objects;
      fail(`could not list ${BUCKET}/${prefix}: ${error.message}`);
    }
    for (const entry of data) {
      const key = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.id === null) {
        for (const [childKey, etag] of await listObjects(client, key)) objects.set(childKey, etag);
      } else {
        objects.set(key, String(entry.metadata?.eTag ?? '').replace(/"/g, ''));
      }
    }
    if (data.length < 1000) return objects;
  }
}

function localImages(dir) {
  if (!fs.existsSync(dir)) fail(`source directory ${dir} does not exist`);
  const files = [];
  const walk = (folder) => {
    for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
      const full = path.join(folder, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (MIME_TYPES[path.extname(entry.name).toLowerCase()]) files.push(full);
    }
  };
  walk(dir);
  return files.map((file) => {
    const key = path.relative(dir, file).split(path.sep).join('/');
    if (/\s/.test(key)) fail(`"${key}" has whitespace; rename it so the CDN URL needs no escaping`);
    return { key, load: async () => fs.readFileSync(file) };
  });
}

async function mirroredImages(source) {
  const keys = [...(await listObjects(source.client)).keys()];
  return keys.map((key) => ({
    key,
    load: async () => {
      const { data, error } = await source.client.storage.from(BUCKET).download(key);
      if (error) throw new Error(`download ${key}: ${error.message}`);
      return Buffer.from(await data.arrayBuffer());
    },
  }));
}

async function runPool(items, limit, worker) {
  let next = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) await worker(items[next++]);
  });
  await Promise.all(runners);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const target = projectClient(opts.target);
  const images = opts.from ? await mirroredImages(projectClient(opts.from)) : localImages(opts.sourceDir);
  if (images.length === 0) fail('no images found to push');

  console.log(`Pushing ${images.length} images to ${target.url} (bucket ${BUCKET})${opts.dryRun ? ' [dry-run]' : ''}`);
  await ensureBucket(target.client, opts.dryRun);
  const existing = await listObjects(target.client);

  const counts = { uploaded: 0, unchanged: 0, failed: 0 };
  await runPool(images, CONCURRENCY, async ({ key, load }) => {
    try {
      const body = await load();
      const md5 = crypto.createHash('md5').update(body).digest('hex');
      if (existing.get(key) === md5) {
        counts.unchanged++;
        return;
      }
      if (opts.dryRun) {
        console.log(`[dry-run] would upload ${key}`);
        counts.uploaded++;
        return;
      }
      const contentType = MIME_TYPES[path.extname(key).toLowerCase()];
      const { error } = await target.client.storage
        .from(BUCKET)
        .upload(key, body, { contentType, cacheControl: opts.cacheControl, upsert: true });
      if (error) throw new Error(error.message);
      counts.uploaded++;
      console.log(`uploaded ${key}`);
    } catch (error) {
      counts.failed++;
      console.error(`FAILED ${key}: ${error.message}`);
    }
  });

  console.log(`\nDone: ${counts.uploaded} uploaded, ${counts.unchanged} unchanged, ${counts.failed} failed`);
  console.log(`Public base URL: ${target.url}/storage/v1/object/public/${BUCKET}`);
  if (counts.failed > 0) process.exit(1);
}

main().catch((error) => fail(error.message));
