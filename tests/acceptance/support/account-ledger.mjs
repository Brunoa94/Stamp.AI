import { cleanAccountData } from './account-cleanup.mjs';
import { discoverAndCancel } from './recovery.mjs';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { required } from './environment.mjs';
import { PrintifyOrders } from './printify.mjs';
const directory = '.acceptance/accounts';
export function registerAccount(id) {
  mkdirSync(directory, { recursive: true });
  writeFileSync(`${directory}/${id}.json`, JSON.stringify({ id, state: 'active' }), { mode: 0o600, flush: true });
}
export function completeAccount(id) {
  writeFileSync(`${directory}/${id}.json`, JSON.stringify({ id, state: 'cleaned' }), { mode: 0o600, flush: true });
}
export async function recoverAccountOrders(env, { recoverFailed = false } = {}) {
  mkdirSync(directory, { recursive: true });
  const entries = readdirSync(directory).filter(f => f.endsWith('.json')).map(f => JSON.parse(readFileSync(`${directory}/${f}`, 'utf8'))).filter(r => r.state === 'active');
  if (!entries.length) return;
  const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, required(env, 'SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(15000) }) } });
  const errors = [];
  for (const entry of entries) {
    try {
      const provider = new PrintifyOrders(env, entry.id);
      await discoverAndCancel({
        discover: async () => {
          const { data, error } = await admin.from('orders').select('printify_order_id').eq('user_id', entry.id);
          if (error) throw new Error(`Cannot reconcile orders for test user ${entry.id}`);
          return data;
        },
        register: id => provider.register(id), cancel: () => provider.cleanup({ recoverFailed }),
      });
      await cleanAccountData(admin, entry.id);
      completeAccount(entry.id);
    } catch (error) { errors.push(error.message); }
  }
  if (errors.length) throw new Error(errors.join('\n'));
}
export function unresolvedAccounts() {
  mkdirSync(directory, { recursive: true });
  return readdirSync(directory).filter(f => f.endsWith('.json')).map(f => JSON.parse(readFileSync(`${directory}/${f}`, 'utf8'))).filter(r => r.state === 'active');
}
