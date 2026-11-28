// Prepares the local Supabase stack for the offline acceptance tier:
//   npm run test:acceptance:local:setup
// Starts the stack (Docker required), rebuilds the schema from
// supabase/migrations, creates the supplied test user, mirrors the catalog
// snapshot and writes LOCAL_ENV_FILE. Everything it touches is local; it never
// reads .env* files or talks to a hosted project.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { parseEnv } from 'node:util';
import { createClient } from '@supabase/supabase-js';
import { LOCAL_ENV_FILE, LOCAL_URL, TEST_URL, validateLocalEnvironment } from '../../tests/acceptance/support/environment.mjs';
import { ANONYMOUS_GUARDED_FUNCTIONS } from '../../tests/acceptance/support/edge-functions.mjs';

const MIGRATIONS = 'supabase/migrations';
// The CLI's own migration runner cannot replay this history (its statement
// splitter fails on 20260413000000), so the stack starts empty and psql applies
// each file. psql is also told the files that only ever ran against a database
// patched by hand:
const RUN_AFTER = {
  // Adds policies to tables the next migration creates.
  '20260620120000_add_catalog_rls_policies.sql': '20260620120001_create_catalog_schema.sql',
};
const EXPECTED_ERRORS = {
  '20260413000000_add_atomic_operations_and_constraints.sql': 'its payment_transactions.order_id (text) -> orders.id (uuid) foreign key cannot exist',
  '20260414100000_cleanup_unused_tables.sql': 'drops payment_webhook_events, which no migration creates',
  '20260613025000_drop_products_provider_table.sql': 'drops products_provider, which no migration creates',
};
const SUPPLIED_USER_EMAIL = 'acceptance-supplied@sandcastle.local';
const CLI_ENV = { ...process.env, SUPABASE_DB_MIGRATIONS_ENABLED: 'false', SUPABASE_DB_SEED_ENABLED: 'false' };

function supabase(args, options = {}) {
  return execFileSync('supabase', args, { env: CLI_ENV, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options });
}
function localStatus() {
  try { return parseEnv(supabase(['status', '-o', 'env'])); }
  catch { return null; }
}
function databaseContainer() {
  const projectId = readFileSync('supabase/config.toml', 'utf8').match(/^project_id\s*=\s*"([^"]+)"/m)?.[1];
  if (!projectId) throw new Error('supabase/config.toml has no project_id');
  return `supabase_db_${projectId}`;
}
function applyMigration(container, file) {
  const expected = EXPECTED_ERRORS[file];
  const result = spawnSync('docker', ['exec', '-i', container, 'psql', '-U', 'postgres', '-d', 'postgres', '-q', '-X', '-v', `ON_ERROR_STOP=${expected ? 0 : 1}`], {
    input: readFileSync(`${MIGRATIONS}/${file}`), encoding: 'utf8',
  });
  const errors = `${result.stdout}\n${result.stderr}`.split('\n').filter(line => line.includes('ERROR:'));
  if (result.status !== 0 || (errors.length && !expected)) throw new Error(`Migration ${file} failed:\n${errors.join('\n') || result.stderr}`);
  if (errors.length) console.log(`  ${file}: ${errors.length} expected error(s): ${expected}`);
}
function migrationOrder() {
  const files = readdirSync(MIGRATIONS).filter(file => /^\d+_.+\.sql$/.test(file)).sort();
  const deferred = new Set(Object.keys(RUN_AFTER));
  return files.flatMap(file => deferred.has(file) ? [] : [file, ...Object.keys(RUN_AFTER).filter(late => RUN_AFTER[late] === file)]);
}

// Services no spec uses; skipping them saves image pulls on CI runners.
const UNUSED_SERVICES = 'studio,postgres-meta,logflare,vector,imgproxy';

console.log('Starting the local Supabase stack...');
// The Edge runtime mounts the files functions import outside supabase/functions
// when the stack starts; restart it (supabase stop) after changing those imports.
if (!localStatus()) supabase(['start', '-x', UNUSED_SERVICES], { stdio: ['ignore', 'ignore', 'inherit'] });
const status = localStatus();
if (status?.API_URL !== LOCAL_URL) throw new Error(`Local Supabase API is ${status?.API_URL}, expected ${LOCAL_URL}`);

console.log('Resetting the local database...');
supabase(['db', 'reset', '--local'], { stdio: ['ignore', 'ignore', 'inherit'] });
const container = databaseContainer();
const order = migrationOrder();
console.log(`Applying ${order.length} migrations...`);
for (const file of order) applyMigration(container, file);

console.log('Creating the supplied test user...');
const admin = createClient(LOCAL_URL, status.SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const password = `Acceptance!${randomUUID()}`;
const created = await admin.auth.admin.createUser({ email: SUPPLIED_USER_EMAIL, password, email_confirm: true });
if (created.error) throw new Error(`Supplied user creation failed: ${created.error.message}`);
// Admin-created users get no profile (no auth.users trigger), as on the hosted test project.
const profile = await admin.from('profiles').upsert({ id: created.data.user.id, email: SUPPLIED_USER_EMAIL });
if (profile.error) throw new Error(`Supplied user profile failed: ${profile.error.message}`);

/** The CDN the hosted tiers use (.env.test.local), else the test project's old bucket. */
function staticAssetsUrl() {
  const testEnvFile = '.env.test.local';
  const fromTestEnv = existsSync(testEnvFile) ? parseEnv(readFileSync(testEnvFile, 'utf8')).NEXT_PUBLIC_STATIC_ASSETS_URL : '';
  return process.env.NEXT_PUBLIC_STATIC_ASSETS_URL || fromTestEnv || `${TEST_URL}/storage/v1/object/public/static-assets`;
}

const env = validateLocalEnvironment({
  NEXT_PUBLIC_SUPABASE_URL: LOCAL_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: status.ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY,
  TEST_USER_EMAIL: SUPPLIED_USER_EMAIL,
  TEST_USER_PASSWORD: password,
  TEST_USER_ID: created.data.user.id,
  // The local stack has no static-assets bucket; the site's static images are
  // read (public, no credentials) from the static-assets CDN of .env.test.local.
  NEXT_PUBLIC_STATIC_ASSETS_URL: staticAssetsUrl(),
});
mkdirSync('.acceptance/local', { recursive: true });
writeFileSync(LOCAL_ENV_FILE, Object.entries(env).map(([key, value]) => `${key}=${value}`).join('\n') + '\n', { mode: 0o600 });

// A function's first request makes the Edge runtime download its remote
// imports (process-refund pulls Stripe from esm.sh). When that download fails
// the worker cannot boot and the gateway answers 503, which SEC-02 would report
// as a missing auth check. Boot each guarded function here, retrying cold-boot
// failures, so the specs hit a cached module graph.
console.log('Booting the guarded Edge Functions...');
const anonymous = createClient(LOCAL_URL, status.ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
for (const name of ANONYMOUS_GUARDED_FUNCTIONS) {
  let bootStatus;
  for (let attempt = 1; attempt <= 5; attempt++) {
    const result = await anonymous.functions.invoke(name, { body: {} });
    bootStatus = result.error?.context?.status ?? 200;
    if (bootStatus !== 503) break;
    console.log(`  ${name}: 503 on boot attempt ${attempt}, retrying`);
    await new Promise(resolve => setTimeout(resolve, attempt * 3000));
  }
  if (bootStatus === 503) {
    const logs = spawnSync('docker', ['logs', '--tail', '80', container.replace('supabase_db_', 'supabase_edge_runtime_')], { encoding: 'utf8' });
    throw new Error(`Edge Function ${name} failed to boot after 5 attempts:\n${logs.stdout}${logs.stderr}`);
  }
}

console.log('Mirroring the catalog snapshot...');
const sync = spawnSync(process.execPath, ['scripts/acceptance/sync-catalog.mjs', '--apply'], { env: { ...process.env, ACCEPTANCE_LOCAL: '1' }, stdio: 'inherit' });
if (sync.status !== 0) throw new Error('Catalog snapshot sync failed');
console.log(`Local acceptance database ready; credentials in ${LOCAL_ENV_FILE}.`);
