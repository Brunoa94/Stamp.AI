#!/usr/bin/env node
/**
 * Push the site's raster images (PNG, JPEG, WebP...) to the static-assets CDN.
 *
 * The app serves its raster images (homepage, backdrops, payment logos, brand
 * marks...) from a CDN instead of `public/`. SVGs stay in the repo under
 * public/assets/ and are never pushed. The object key is the file's path
 * relative to the source directory, so `<dir>/home/1-a.webp` is served at
 * `<NEXT_PUBLIC_STATIC_ASSETS_URL>/home/1-a.webp`, which is what
 * `staticAssetUrl("/home/1-a.webp")` returns in the app.
 *
 * Targets:
 *   r2                      the Cloudflare R2 bucket `stamp-static-assets`, served by the
 *                           Worker in cloudflare/static-assets (the CDN every environment uses)
 *   test | prod             the `static-assets` bucket of that Supabase project (the old CDN)
 *
 * Sources:
 *   --source-dir <dir>      upload every image under a local folder (run
 *                           scripts/optimize-static-assets.mjs on new images first)
 *   --from <test|prod>      mirror the `static-assets` bucket of a Supabase project
 *
 * Objects whose content is unchanged (same MD5 as the stored ETag) are skipped,
 * so re-runs only upload what changed. A missing Supabase bucket is created
 * (public, images only); the R2 bucket must exist already.
 *
 * Usage:
 *   node scripts/push-static-assets.mjs --target r2 --source-dir images-generated/static-assets
 *   node scripts/push-static-assets.mjs --target r2 --source-dir images-generated/static-assets --dry-run
 *   node scripts/push-static-assets.mjs --target prod --from test
 *
 * Credentials, read from .env: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID and
 * R2_SECRET_ACCESS_KEY (an R2 API token with Object Read & Write on the bucket)
 * for r2; NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from
 * .env.test.local (test) or .env (prod) for Supabase.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'static-assets';
const R2_BUCKET = 'stamp-static-assets';
const ENV_FILES = { test: '.env.test.local', prod: '.env' };
const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
};
const THIRTY_DAYS_SECONDS = '2592000';
const MAX_FILE_SIZE = '10MB';
const CONCURRENCY = 6;

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const opts = { target: null, sourceDir: null, from: null, dryRun: false, cacheControl: THIRTY_DAYS_SECONDS };
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
  if (opts.target !== 'r2' && !ENV_FILES[opts.target]) fail('--target must be "r2", "test" or "prod"');
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

/** Signs an S3 API request to R2 with AWS Signature V4 (region "auto"). */
function signR2Request({ method, url, body, accessKeyId, secretAccessKey, headers = {} }) {
  const hash = (data) => crypto.createHash('sha256').update(data).digest('hex');
  const hmac = (key, data) => crypto.createHmac('sha256', key).update(data).digest();
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const date = amzDate.slice(0, 8);
  const scope = `${date}/auto/s3/aws4_request`;
  const signed = { ...headers, host: url.host, 'x-amz-content-sha256': hash(body ?? ''), 'x-amz-date': amzDate };
  const names = Object.keys(signed).map((name) => name.toLowerCase()).sort();
  const lower = Object.fromEntries(Object.entries(signed).map(([name, value]) => [name.toLowerCase(), String(value).trim()]));
  const query = [...url.searchParams].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');
  const canonical = [method, url.pathname, query, names.map((name) => `${name}:${lower[name]}\n`).join(''), names.join(';'), lower['x-amz-content-sha256']].join('\n');
  const toSign = ['AWS4-HMAC-SHA256', amzDate, scope, hash(canonical)].join('\n');
  const key = ['auto', 's3', 'aws4_request'].reduce(hmac, hmac(`AWS4${secretAccessKey}`, date));
  const signature = crypto.createHmac('sha256', key).update(toSign).digest('hex');
  return { ...signed, authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${scope}, SignedHeaders=${names.join(';')}, Signature=${signature}` };
}

/** Uploads to the Cloudflare R2 bucket through its S3-compatible API. */
function r2Target() {
  const env = fs.existsSync('.env') ? dotenv.parse(fs.readFileSync('.env')) : {};
  const read = (name) => process.env[name] || env[name];
  const accountId = read('R2_ACCOUNT_ID');
  const accessKeyId = read('R2_ACCESS_KEY_ID');
  const secretAccessKey = read('R2_SECRET_ACCESS_KEY');
  if (!accountId || !accessKeyId || !secretAccessKey) fail('.env must define R2_ACCOUNT_ID, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY');
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com/${R2_BUCKET}`;
  const send = async (method, url, body, headers) => {
    const response = await fetch(url, { method, body, headers: signR2Request({ method, url, body, accessKeyId, secretAccessKey, headers }) });
    if (!response.ok) throw new Error(`${method} ${url.pathname}: HTTP ${response.status} ${(await response.text()).slice(0, 300)}`);
    return response;
  };
  const objectUrl = (key) => new URL(`${endpoint}/${key.split('/').map(encodeURIComponent).join('/')}`);
  return {
    label: `R2 bucket ${R2_BUCKET}`,
    publicBase: 'the Worker URL of cloudflare/static-assets (NEXT_PUBLIC_STATIC_ASSETS_URL)',
    ensureBucket: async () => {},
    async listObjects() {
      const objects = new Map();
      let token = null;
      do {
        const url = new URL(endpoint);
        url.searchParams.set('list-type', '2');
        if (token) url.searchParams.set('continuation-token', token);
        const xml = await (await send('GET', url)).text();
        for (const [, entry] of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
          const key = entry.match(/<Key>([\s\S]*?)<\/Key>/)?.[1];
          const etag = entry.match(/<ETag>([\s\S]*?)<\/ETag>/)?.[1] ?? '';
          if (key) objects.set(key.replace(/&amp;/g, '&'), etag.replace(/&quot;|"/g, ''));
        }
        token = /<IsTruncated>true<\/IsTruncated>/.test(xml) ? xml.match(/<NextContinuationToken>([\s\S]*?)<\/NextContinuationToken>/)?.[1] : null;
      } while (token);
      return objects;
    },
    async upload(key, body, contentType, cacheSeconds) {
      await send('PUT', objectUrl(key), body, { 'content-type': contentType, 'cache-control': `public, max-age=${cacheSeconds}` });
    },
  };
}

/** Uploads to the `static-assets` bucket of a Supabase project. */
function supabaseTarget(project, dryRun) {
  const { url, client } = projectClient(project);
  return {
    label: `${url} (bucket ${BUCKET})`,
    publicBase: `${url}/storage/v1/object/public/${BUCKET}`,
    ensureBucket: () => ensureBucket(client, dryRun),
    listObjects: () => listObjects(client),
    async upload(key, body, contentType, cacheSeconds) {
      const { error } = await client.storage.from(BUCKET).upload(key, body, { contentType, cacheControl: cacheSeconds, upsert: true });
      if (error) throw new Error(error.message);
    },
  };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const target = opts.target === 'r2' ? r2Target() : supabaseTarget(opts.target, opts.dryRun);
  const images = opts.from ? await mirroredImages(projectClient(opts.from)) : localImages(opts.sourceDir);
  if (images.length === 0) fail('no images found to push');

  console.log(`Pushing ${images.length} images to ${target.label}${opts.dryRun ? ' [dry-run]' : ''}`);
  await target.ensureBucket();
  const existing = await target.listObjects();

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
      await target.upload(key, body, MIME_TYPES[path.extname(key).toLowerCase()], opts.cacheControl);
      counts.uploaded++;
      console.log(`uploaded ${key}`);
    } catch (error) {
      counts.failed++;
      console.error(`FAILED ${key}: ${error.message}`);
    }
  });

  console.log(`\nDone: ${counts.uploaded} uploaded, ${counts.unchanged} unchanged, ${counts.failed} failed`);
  console.log(`Public base URL: ${target.publicBase}`);
  if (counts.failed > 0) process.exit(1);
}

main().catch((error) => fail(error.message));
