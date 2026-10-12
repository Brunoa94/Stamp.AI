/* Playwright fixtures establish sessions even when their value is unused. */
/* eslint @typescript-eslint/no-unused-vars: ["warn", {"argsIgnorePattern": "^(suppliedUser|account)$"}] */
import { test, expect, client, unwrap } from '../support/fixtures.mjs';
import { seedCart } from '../support/cart.mjs';

// The dev server compiles API routes on demand; a cold compile can exceed actionTimeout.
for (const path of ['/api/auth/signup', '/api/auth/resend-confirmation']) {
  test(`AUTH-02 malformed email rejected by ${path}`, async ({ request }) => {
    expect((await request.post(path, { data: { email: 'not-an-email' }, timeout: 60000 })).status()).toBe(400);
  });
}
for (const functionName of ['create-printify-order', 'cancel-order', 'process-refund', 'create-payment-intent', 'create-mollie-payment', 'capture-paypal-order', 'generate-invoice']) {
  test(`SEC-02 ${functionName} rejects anonymous access`, async ({ env }) => {
    const db = client(env);
    const result = await db.functions.invoke(functionName, { body: {} });
    expect(result.error).not.toBeNull();
    const status = result.error?.context?.status;
    expect([401, 403], 'A missing deployment (404) does not count as authorization enforcement').toContain(status);
  });
}
for (const url of ['http://127.0.0.1', 'http://169.254.169.254/latest/meta-data/', 'http://[::1]', 'file:///etc/passwd']) {
  test(`SEC-02 authenticated image proxy rejects ${url}`, async ({ page, suppliedUser }) => {
    const response = await page.request.get(`/api/fetch-remote-image?url=${encodeURIComponent(url)}`);
    expect([400, 403]).toContain(response.status());
  });
}
test('SEC-01 cart renders hostile content as text', async ({ page, account }) => {
  const attack = '<img src=x onerror="window.acceptanceXss=true">';
  await seedCart(account, [{ product_name: attack, unit_price: 1000, quantity: 1 }]);
  await page.goto('/cart');
  await expect(page.getByRole('article').first()).toContainText(attack);
  expect(await page.evaluate(() => window.acceptanceXss)).toBeUndefined();
});
test('GEN-10 direct client cannot deduct another users coins', async ({ account, env }) => {
  const before = unwrap(await account.admin.from('profiles').select('coins').eq('id', env.TEST_USER_ID).single(), 'Read protected balance').coins;
  const result = await account.db.rpc('deduct_coin', { user_id: env.TEST_USER_ID });
  expect(result.error).not.toBeNull();
  const after = unwrap(await account.admin.from('profiles').select('coins').eq('id', env.TEST_USER_ID).single(), 'Verify protected balance').coins;
  expect(after).toBe(before);
});
test('GEN-11 normal user cannot grant themselves refunds', async ({ account }) => {
  const result = await account.db.rpc('refund_coin', { p_user_id: account.id });
  expect(result.error).not.toBeNull();
});

for (const [name, args] of Object.entries({
  upsert_stripe_payment_transaction: { p_stripe_payment_intent_id: 'pi_forbidden', p_user_id: '00000000-0000-0000-0000-000000000000', p_stripe_customer_id: null, p_amount: 999, p_currency: 'eur', p_status: 'succeeded', p_payment_method_type: 'card' },
  atomic_stripe_payment_capture: { p_stripe_payment_intent_id: 'pi_forbidden', p_amount: 999, p_currency: 'eur' },
  atomic_paypal_payment_capture: { p_paypal_order_id: 'forbidden', p_paypal_capture_id: 'forbidden', p_amount: 999, p_currency: 'eur' },
  atomic_mollie_payment_capture: { p_mollie_payment_id: 'tr_forbidden', p_amount: 999, p_currency: 'eur' },
})) {
  test(`SEC-03 anonymous ${name} is denied at the privilege boundary`, async ({ env }) => {
    const result = await client(env).rpc(name, args);
    expect(result.error?.code).toBe('42501');
  });
}

test('SEC-04 anonymous and foreign users cannot write an owned cart via RPC', async ({ account, env }) => {
  const cart = await seedCart(account);
  const args = { p_cart_id: cart.id, p_selected_item_ids: [] };
  expect((await client(env).rpc('update_cart_items_selection', args)).error?.code).toBe('42501');
  const foreign = client(env);
  unwrap(await foreign.auth.signInWithPassword({ email: env.TEST_USER_EMAIL, password: env.TEST_USER_PASSWORD }), 'Foreign test login');
  expect((await foreign.rpc('update_cart_items_selection', args)).error?.code).toBe('42501');
  const inserted = await foreign.rpc('upsert_cart_item', { p_cart_id: cart.id, p_product_id: 'forbidden', p_variant_id: '1', p_quantity: 1, p_unit_price: 1 });
  expect(inserted.error).not.toBeNull();
  const items = unwrap(await account.db.from('cart_items').select('id,is_selected').eq('cart_id', cart.id), 'Cart unchanged');
  expect(items).toHaveLength(cart.items.length);
  expect(items.every(item => item.is_selected)).toBe(true);
});

test('SEC-05 guest session IDs grant no database access', async ({ account, env }) => {
  const guest = unwrap(await account.admin.from('carts').insert({ session_id: `acceptance-${account.id}` }).select().single(), 'Guest legacy fixture');
  try {
    expect(unwrap(await client(env).from('carts').select('id').eq('id', guest.id), 'Anonymous guest read')).toEqual([]);
    const result = await client(env).from('carts').insert({ session_id: 'spoofed-guest' });
    expect(result.error).not.toBeNull();
  } finally { unwrap(await account.admin.from('carts').delete().eq('id', guest.id), 'Remove guest fixture'); }
});

test('SEC-06 signed-in users cannot forge payment columns or product ownership', async ({ account }) => {
  const payment = unwrap(await account.admin.from('payment_transactions').insert({ user_id: account.id, payment_provider: 'stripe', stripe_payment_intent_id: `pi_acceptance_${account.id}`, amount: 10, currency: 'eur', status: 'pending' }).select().single(), 'Unpaid payment fixture');
  const update = await account.db.from('payment_transactions').update({ amount: 999, status: 'succeeded' }).eq('id', payment.id);
  expect(update.error?.code).toBe('42501');
  const saved = unwrap(await account.admin.from('payment_transactions').select('amount,status').eq('id', payment.id).single(), 'Payment unchanged');
  expect(Number(saved.amount)).toBe(10); expect(saved.status).toBe('pending');
  const claim = await account.db.from('products').insert({ user_id: account.id, name: 'Forged owner', printify_product_id: '000000000000000000000000' });
  expect(claim.error?.code).toBe('42501');
});

test('GEN-12 purchased credits pay for generation after daily allowance is exhausted', async ({ page, account }) => {
  await account.coins(0);
  unwrap(await account.admin.from('user_credits').upsert({ user_id: account.id, credits: 2 }), 'Purchased credit fixture');
  const response = await page.request.post('/api/generate-image', { multipart: { prompt: 'A fox', image: { name: 'fox.png', mimeType: 'image/png', buffer: (await import('node:fs')).readFileSync(new URL('../../../src/tests/fixtures/test-image.png', import.meta.url)) } } });
  expect(response.status()).toBe(200);
  expect(unwrap(await account.db.from('user_credits').select('credits').eq('user_id', account.id).single(), 'Purchased balance')).toMatchObject({ credits: 1 });
  const debits = unwrap(await account.admin.from('generation_credit_debits').select('id,source').eq('user_id', account.id), 'Server debit receipt');
  expect(debits).toHaveLength(1); expect(debits[0].source).toBe('purchased');
  expect(unwrap(await account.admin.rpc('refund_generation_credit', { p_debit_id: debits[0].id }), 'First refund')).toBe(true);
  expect(unwrap(await account.admin.rpc('refund_generation_credit', { p_debit_id: debits[0].id }), 'Repeated refund')).toBe(false);
  expect(unwrap(await account.db.from('user_credits').select('credits').eq('user_id', account.id).single(), 'Refunded balance')).toMatchObject({ credits: 2 });
});
