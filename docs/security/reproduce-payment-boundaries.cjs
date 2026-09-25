// Offline security reproductions using actual TypeScript modules and synthetic adapters.
// No env files, network, payment providers or database connections are used.
// Run from repository root: node docs/security/reproduce-payment-boundaries.cjs
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
function load(path, mocks, globals = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, {
    module, exports: module.exports,
    require: name => { if (!(name in mocks)) throw new Error(`Unmocked import: ${name}`); return mocks[name]; },
    console: { log() {}, warn() {}, error() {} }, Request, Response, URL,
    ...globals,
  }, { filename: path });
  return module.exports;
}
const errors = {
  ErrorCodes: new Proxy({}, { get: (_, name) => () => new Error(String(name)) }),
  handleError: e => new Response(JSON.stringify({ error: e.message }), { status: 500 }),
};
async function main() {
  const pricing = load('supabase/functions/_shared/serverPriceService.ts', {
    './supabase.ts': { supabaseRest: async endpoint => ({
      data: endpoint.startsWith('catalog_products')
        ? [{ blueprint_id: 12, display_title: 'Fixture' }]
        : [{ blueprint_id: 12, printify_variant_id: 1, price_cents: 3000 }],
    }) },
  });
  const result = await pricing.validatePricingAgainstDatabase({
    lineItems: [{ blueprint_id: 12, printify_variant_id: 1, quantity: 1 }],
    clientSubtotalCents: 3000, shippingCostCents: 0, discountCents: 2950, clientTotalCents: 50,
  });
  assert.equal(result.isValid, true);
  console.log('REPRODUCED: catalog basket 3000 cents accepts unverified discount 2950 cents and total 50 cents');

  let fulfillHandler;
  const providerOrders = [];
  load('supabase/functions/create-printify-order/index.ts', {
    'https://deno.land/std@0.168.0/http/server.ts': { serve: fn => { fulfillHandler = fn; } },
    '../_shared/errors.ts': errors,
    '../_shared/validators.ts': { validateEnvVars: {
      supabaseUrl: () => 'https://fixture.invalid', supabaseAnonKey: () => 'fixture-anon',
      printifyToken: () => 'fixture-merchant-token', printifyShopId: () => 'fixture-shop',
    } },
    '../_shared/testModeSafeguard.ts': { validateAndEnforceTestMode: () => ({ testMode: false }) },
    '../_shared/amountValidator.ts': { validatePaymentAmount: () => { throw new Error('Unexpected payment validation'); } },
    '../_shared/supabase.ts': { supabaseRest: () => { throw new Error('Unexpected database lookup'); } },
    '../_shared/orderStatusHistory.ts': { insertOrderStatusHistory: async () => {} },
    '../_shared/cors.ts': { corsHeadersFor: () => ({}) },
  }, {
    Deno: { env: { get: () => undefined } },
    fetch: async (url, options) => {
      if (url.endsWith('/auth/v1/user')) return Response.json({ id: 'fixture-user', email: 'user@example.invalid' });
      if (url.endsWith('/products.json')) return Response.json({ data: [] });
      if (url.endsWith('/orders.json') && options.method === 'POST') {
        providerOrders.push(JSON.parse(options.body));
        return Response.json({ id: 'fixture-provider-order' });
      }
      throw new Error(`Unmocked fetch: ${url}`);
    },
  });
  const response = await fulfillHandler(new Request('https://fixture.invalid/fulfill', {
    method: 'POST', headers: { authorization: 'Bearer fixture-user-token', 'content-type': 'application/json' },
    body: JSON.stringify({
      line_items: [{ blueprint_id: 12, print_provider_id: 99, variant_id: 1, quantity: 10 }],
      shipping_address: { first_name: 'Fixture', address1: 'Synthetic only', city: 'Fixture', country: 'US', zip: '00000' },
    }),
  }));
  assert.equal(response.status, 200, await response.text());
  assert.equal(providerOrders.length, 1);
  assert.equal(providerOrders[0].line_items[0].quantity, 10);
  console.log('REPRODUCED: actual fulfillment handler creates provider order without order ID, payment ID or payment amount');

  let cancelHandler;
  let cancelledLocally = false;
  let refundRequested = false;
  load('supabase/functions/cancel-order/index.ts', {
    'https://deno.land/std@0.168.0/http/server.ts': { serve: fn => { cancelHandler = fn; } },
    '../_shared/errors.ts': errors,
    '../_shared/validators.ts': {
      verifyAuth: async () => ({ userId: 'fixture-user' }),
      validateEnvVars: { printifyToken: () => 'fixture-token', printifyShopId: () => 'fixture-shop', supabaseUrl: () => 'https://fixture.invalid' },
    },
    '../_shared/supabase.ts': { supabaseRest: async (endpoint, method, body) => {
      if (endpoint.startsWith('orders?') && method === 'GET') return { data: [{
        id: 'fixture-order', user_id: 'fixture-user', status: 'confirmed', payment_status: 'paid',
        printify_order_id: 'fixture-manufacturing-order', total_amount: 100, currency: 'USD',
      }] };
      if (endpoint.startsWith('orders?') && method === 'PATCH') {
        cancelledLocally = body.status === 'cancelled'; return { data: null, error: null };
      }
      if (endpoint.startsWith('payment_transactions?')) return { data: [{
        payment_provider: 'stripe', stripe_payment_intent_id: 'pi_FIXTURE', status: 'succeeded', amount: 100, currency: 'USD',
      }] };
      throw new Error(`Unmocked DB request: ${endpoint}`);
    } },
    '../_shared/orderStatusHistory.ts': { insertOrderStatusHistory: async () => {} },
    '../_shared/cors.ts': { corsHeadersFor: () => ({}) },
  }, {
    Deno: { env: { get: () => 'fixture-service-key' } },
    fetch: async url => {
      if (url.endsWith('/cancel.json')) return Response.json({ errors: { reason: 'Order status does not allow cancellation' } }, { status: 400 });
      if (url.endsWith('/process-refund')) { refundRequested = true; return Response.json({ success: true, refundId: 'fixture-refund' }); }
      throw new Error(`Unmocked fetch: ${url}`);
    },
  });
  const cancellation = await cancelHandler(new Request('https://fixture.invalid/cancel', {
    method: 'POST', headers: { authorization: 'Bearer fixture-user-token', 'content-type': 'application/json' },
    body: JSON.stringify({ order_id: 'fixture-order' }),
  }));
  assert.equal(cancellation.status, 200, await cancellation.text());
  assert.equal(cancelledLocally, true);
  assert.equal(refundRequested, true);
  console.log('REPRODUCED: actual cancellation handler requests refund after provider explicitly rejects cancellation');
}
main().catch(e => { console.error(e); process.exitCode = 1; });
