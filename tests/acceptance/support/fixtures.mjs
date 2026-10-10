import { cleanAccountData } from './account-cleanup.mjs';
import { discoverAndCancel } from './recovery.mjs';
import { registerAccount, completeAccount } from './account-ledger.mjs';
import { test as base, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { randomUUID } from 'node:crypto';
import { loadEnvironment, required, TEST_PROJECT } from './environment.mjs';
import { PrintifyOrders } from './printify.mjs';

export function client(env, privileged = false) {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, required(env, privileged ? 'SUPABASE_SERVICE_ROLE_KEY' : 'NEXT_PUBLIC_SUPABASE_ANON_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(15000) }) },
  });
}
export function unwrap(result, operation) {
  if (result.error) {
    const cause = [result.error.code, result.error.status, result.error.context?.status, result.error.message].filter(Boolean).join(' / ') || 'unknown';
    throw new Error(`${operation} failed (${cause}): ${JSON.stringify(result.data ?? null)}`);
  }
  return result.data;
}
export async function setBrowserSession(context, env, session) {
  const jar = new Map();
  const auth = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: { getAll: () => [...jar].map(([name, value]) => ({ name, value })), setAll: values => values.forEach(({ name, value }) => jar.set(name, value)) },
  });
  const data = unwrap(await auth.auth.setSession({ access_token: session.access_token, refresh_token: session.refresh_token }), 'Browser session setup');
  await context.addCookies([...jar].map(([name, value]) => ({ name, value, domain: 'localhost', path: '/', sameSite: 'Lax' })));
  return data.user.id;
}
export const test = base.extend({
  env: async ({}, provide) => { await provide(loadEnvironment()); },
  // Auto guard is active for every browser test, even guest navigation.
  networkGuard: [async ({ context }, provide) => {
    const forbidden = [];
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      const otherDatabase = url.hostname.endsWith('.supabase.co') && url.hostname !== `${TEST_PROJECT}.supabase.co`;
      const ai = /(^|\.)(openai\.com|generativelanguage\.googleapis\.com|api\.anthropic\.com)$/.test(url.hostname);
      if (otherDatabase || ai) { forbidden.push(`${url.hostname}${url.pathname}`); await route.abort(); }
      else await route.continue();
    });
    await provide();
    expect(forbidden, 'No production database or real AI requests').toEqual([]);
  }, { auto: true }],
  suppliedUser: async ({ context, env }, provide) => {
    const credentials = { email: env.TEST_USER_EMAIL, password: env.TEST_USER_PASSWORD };
    const db = client(env);
    const data = unwrap(await db.auth.signInWithPassword(credentials), 'Supplied account login');
    expect(data.user.id).toBe(env.TEST_USER_ID);
    expect(await setBrowserSession(context, env, data.session)).toBe(env.TEST_USER_ID);
    await provide({ db, id: data.user.id, credentials });
  },
  account: [async ({ context, env }, provide, testInfo) => {
    const admin = client(env, true);
    const id = randomUUID();
    const password = `Acceptance!${randomUUID()}`;
    const email = `acceptance-${id}@sandcastle.dev`;
    const user = unwrap(await admin.auth.admin.createUser({ email, password, email_confirm: true }), 'Isolated test user creation').user;
    registerAccount(user.id);
    const orders = new PrintifyOrders(env, user.id);
    const db = client(env);
    // Persist intent before the browser's fulfillment request leaves the machine.
    await context.route('**/functions/v1/create-printify-order', async route => {
      if (env.TEST_PRINTIFY_MANUAL_APPROVAL !== 'confirmed' || env.TEST_EDGE_ENVIRONMENT_VERIFIED !== env.NEXT_PUBLIC_SUPABASE_URL) {
        await route.abort();
        return;
      }
      const payload = route.request().postDataJSON();
      const orderId = payload?.metadata?.order_id;
      if (!orderId) { await route.abort(); return; }
      orders.registerApplicationIntent(orderId);
      await route.fallback();
    });
    let functionalFinished = false;
    try {
      const session = unwrap(await db.auth.signInWithPassword({ email, password }), 'Isolated user login').session;
      await setBrowserSession(context, env, session);
      unwrap(await admin.from('profiles').upsert({ id: user.id, email }, { onConflict: 'id', ignoreDuplicates: true }), 'Seed isolated user profile');
      const coins = async value => unwrap(await admin.from('profiles').update({ coins: value, coins_reset_at: new Date().toISOString().slice(0, 10) }).eq('id', user.id).select().single(), 'Seed coin balance');
      await coins(5);
      await provide({ id: user.id, db, admin, email, password, coins, orders });
      functionalFinished = true;
    } finally {
      // Discover all app-created provider IDs, not just IDs returned to the browser.
      await discoverAndCancel({
        discover: async () => unwrap(await admin.from('orders').select('id,printify_order_id').eq('user_id', user.id), 'Order cleanup discovery'),
        register: id => orders.register(id), cancel: () => orders.cleanup(),
      }); // Throws BEFORE deleting rows/user, preserving reconciliation evidence.
      await testInfo.attach('printify-cleanup', { body: Buffer.from(JSON.stringify(orders.records())), contentType: 'application/json' });
      await cleanAccountData(admin, user.id);
      completeAccount(user.id);
      if (!functionalFinished) testInfo.annotations.push({ type: 'cleanup', description: 'Cleanup completed after failed setup or test' });
    }
  }, { timeout: 600000 }],
});
export { expect };
