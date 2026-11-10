import { resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';

export const TEST_PROJECT = 'tgccxydchvujhrqyzqao';
export const TEST_URL = `https://${TEST_PROJECT}.supabase.co`;
export const SHOP_ID = '25847763';
// ACCEPTANCE_LOCAL=1 runs the offline tier against the local Supabase stack
// that scripts/acceptance/local-supabase.mjs starts and writes LOCAL_ENV_FILE for.
// Its ledgers live apart so recovery never mixes local and hosted accounts.
export const LOCAL = process.env.ACCEPTANCE_LOCAL === '1';
export const LOCAL_URL = 'http://127.0.0.1:54321';
export const STATE_DIR = LOCAL ? '.acceptance/local' : '.acceptance';
export const LOCAL_ENV_FILE = '.acceptance/local/local.env';
const LOCAL_FORBIDDEN = ['STRIPE_SECRET_KEY', 'MOLLIE_API_KEY', 'PAYPAL_CLIENT_SECRET', 'PRINTIFY_API_TOKEN', 'BREVO_API_KEY', 'NEXT_PUBLIC_GA_MEASUREMENT_ID'];
export function required(env, key) {
  if (!env[key]?.trim()) throw new Error(`Missing ${key} in ${LOCAL ? LOCAL_ENV_FILE : '.env.test.local or .env.test'} (no production fallback allowed)`);
  return env[key];
}
export function validateLocalEnvironment(env) {
  if (env.NEXT_PUBLIC_SUPABASE_URL !== LOCAL_URL) throw new Error(`Refusing database access: local mode only runs against ${LOCAL_URL}`);
  for (const key of ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'TEST_USER_EMAIL', 'TEST_USER_PASSWORD', 'TEST_USER_ID']) required(env, key);
  for (const key of ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY']) {
    let claims;
    try { claims = JSON.parse(Buffer.from(env[key].split('.')[1], 'base64url')); }
    catch { throw new Error(`Malformed ${key}`); }
    const role = key === 'SUPABASE_SERVICE_ROLE_KEY' ? 'service_role' : 'anon';
    if (claims.iss !== 'supabase-demo' || claims.role !== role) throw new Error(`${key} is not a local Supabase ${role} key`);
  }
  for (const key of LOCAL_FORBIDDEN) if (env[key]) throw new Error(`${key} must not be set in local mode: the offline tier never calls real providers`);
  return env;
}
export function validateEnvironment(env) {
  if (env.NEXT_PUBLIC_SUPABASE_URL !== TEST_URL) throw new Error('Refusing database access: test project allowlist mismatch');
  for (const key of ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'TEST_USER_EMAIL', 'TEST_USER_PASSWORD', 'TEST_USER_ID']) required(env, key);
  for (const key of ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY']) {
    const token = env[key];
    if (!token || token.split('.').length !== 3) continue;
    let claims;
    try { claims = JSON.parse(Buffer.from(token.split('.')[1], 'base64url')); }
    catch { throw new Error(`Malformed ${key}`); }
    const role = key === 'SUPABASE_SERVICE_ROLE_KEY' ? 'service_role' : 'anon';
    if (claims.ref !== TEST_PROJECT || claims.role !== role) throw new Error(`${key} does not belong to the test project/role`);
  }
  if (env.STRIPE_SECRET_KEY && !env.STRIPE_SECRET_KEY.startsWith('sk_test_')) throw new Error('Stripe must use test credentials');
  if (env.MOLLIE_API_KEY && !env.MOLLIE_API_KEY.startsWith('test_')) throw new Error('Mollie must use test credentials');
  if (env.PAYPAL_MODE && env.PAYPAL_MODE !== 'sandbox') throw new Error('PayPal must use sandbox mode');
  if (env.PRINTIFY_SHOP_ID && env.PRINTIFY_SHOP_ID !== SHOP_ID) throw new Error('Printify shop allowlist mismatch');
  if (env.NEXT_PUBLIC_GA_MEASUREMENT_ID && env.TEST_GA_PROPERTY_CONFIRMED !== 'true') throw new Error('GA measurement ID requires dedicated test-property confirmation');
  return env;
}
export function loadEnvironment(directory = process.cwd()) {
  if (LOCAL) {
    const file = resolve(directory, LOCAL_ENV_FILE);
    if (!existsSync(file)) throw new Error(`Missing ${LOCAL_ENV_FILE}: run npm run test:acceptance:local:setup first`);
    return validateLocalEnvironment(parseEnv(readFileSync(file, 'utf8')));
  }
  const env = {};
  // Local test values override the optional base; never load production files
  // or inherited shell credentials. Aliases are resolved per layer.
  for (const name of ['.env.test', '.env.test.local']) {
    const file = resolve(directory, name);
    if (!existsSync(file)) continue;
    const layer = parseEnv(readFileSync(file, 'utf8'));
    if (!Object.hasOwn(layer, 'PRINTIFY_API_TOKEN') && Object.hasOwn(layer, 'NEXT_PUBLIC_PRINTIFY_API_TOKEN')) layer.PRINTIFY_API_TOKEN = layer.NEXT_PUBLIC_PRINTIFY_API_TOKEN;
    if (!Object.hasOwn(layer, 'PRINTIFY_SHOP_ID') && Object.hasOwn(layer, 'NEXT_PUBLIC_PRINTIFY_SHOP_ID')) layer.PRINTIFY_SHOP_ID = layer.NEXT_PUBLIC_PRINTIFY_SHOP_ID;
    for (const key of ['PAYPAL_CLIENT_ID', 'PAYPAL_WEBHOOK_ID']) {
      if (!Object.hasOwn(layer, key) && Object.hasOwn(layer, `NEXT_PUBLIC_${key}`)) layer[key] = layer[`NEXT_PUBLIC_${key}`];
    }
    Object.assign(env, layer);
  }
  return validateEnvironment(env);
}
