import { unresolvedAccounts } from '../../tests/acceptance/support/account-ledger.mjs';
import { createClient } from '@supabase/supabase-js';
import { loadEnvironment } from '../../tests/acceptance/support/environment.mjs';
import { PrintifyOrders } from '../../tests/acceptance/support/printify.mjs';

export async function preflight() {
  const env = loadEnvironment();
  if (unresolvedAccounts().length) throw new Error('Unfinished test accounts found in .acceptance/accounts; reconcile their orders and data before another run.');
  const outstanding = new PrintifyOrders(env).records().filter(r => r.state !== 'canceled');
  if (outstanding.length) throw new Error(`Unresolved Printify ledger entries: ${outstanding.length}. Run npm run test:acceptance:cleanup before creating more orders.`);
  const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(15000) }) },
  });
  const { data, error } = await db.auth.signInWithPassword({ email: env.TEST_USER_EMAIL, password: env.TEST_USER_PASSWORD });
  if (error) throw new Error(`Test login failed (${error.code ?? error.status})`);
  if (data.user?.id !== env.TEST_USER_ID) throw new Error('Authenticated user ID differs from the supplied test identity');
  for (const table of ['profiles', 'carts', 'cart_items', 'products', 'orders', 'order_items']) {
    const { error: tableError } = await db.from(table).select('*').limit(1);
    if (tableError) throw new Error(`Test database schema/access check failed: ${table} (${tableError.code})`);
  }
  if (env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(15000) }) } });
    const result = await admin.auth.admin.getUserById(env.TEST_USER_ID);
    if (result.error || result.data.user?.id !== env.TEST_USER_ID) throw new Error('Test project administrator credential verification failed');
    console.log('Preflight: administrator access verified on the authorized test project.');
  }
  console.log('Preflight: real test database reachable; supplied login and user ID verified.');
  for (const name of [
    'SUPABASE_SERVICE_ROLE_KEY', 'PRINTIFY_API_TOKEN', 'TEST_PRINTIFY_MANUAL_APPROVAL',
    'TEST_EDGE_ENVIRONMENT_VERIFIED', 'TEST_PRINTIFY_PRODUCT_ID', 'TEST_PRINTIFY_VARIANT_ID',
    'TEST_PRODUCT_NAME', 'TEST_SOCK_PRODUCT_NAME', 'TEST_MUG_PRODUCT_NAME', 'TEST_CART_FIXTURES_PATH',
    'STRIPE_SECRET_KEY', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'STRIPE_WEBHOOK_SECRET',
    'MOLLIE_API_KEY', 'PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET', 'PAYPAL_WEBHOOK_ID', 'PAYPAL_TEST_EMAIL', 'PAYPAL_TEST_PASSWORD',
    'NEXT_PUBLIC_GA_MEASUREMENT_ID', 'TEST_GA_PROPERTY_CONFIRMED', 'TEST_GA_PROPERTY_ID', 'TEST_GA_READ_ACCESS_TOKEN',
    'BREVO_API_KEY', 'TEST_EMAIL_TEMPLATE', 'TEST_IMAP_HOST', 'TEST_IMAP_USER', 'TEST_IMAP_PASSWORD',
    'TEST_GOOGLE_EMAIL', 'TEST_GOOGLE_PASSWORD',
  ]) {
    console.log(`${name}: ${env[name] ? 'present, service-specific verification still required' : 'MISSING'}`);
  }
  return env;
}
if (process.argv[1]?.endsWith('/preflight.mjs')) preflight().catch(e => { console.error(e.message); process.exitCode = 1; });
