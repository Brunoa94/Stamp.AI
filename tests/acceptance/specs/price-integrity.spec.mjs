import { randomUUID } from 'node:crypto';
import { test, expect, unwrap, client } from '../support/fixtures.mjs';
import { required } from '../support/environment.mjs';
import { callFunction } from '../support/orders-page.mjs';
import { purchaseSetup, pay } from '../support/purchase.mjs';

// Requirement constants, deliberately not imported from production code.
const SHIPPING_CENTS = 499;
const FREE_SHIPPING_FROM_CENTS = 6000;
const PAYMENT_FUNCTIONS = ['create-payment-intent', 'create-paypal-order', 'create-mollie-payment'];

async function stripe(env, path, method = 'GET') {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, { method, headers: { Authorization: `Bearer ${required(env, 'STRIPE_SECRET_KEY')}` }, signal: AbortSignal.timeout(15000) });
  expect(response.ok, `Stripe ${method} ${path}`).toBe(true);
  return response.json();
}

/** A real catalog item: an active, priced blueprint with an available variant. */
async function catalogItem(account, blueprintId = 145) {
  const product = unwrap(await account.admin.from('catalog_products').select('selling_price_cents,is_active').eq('blueprint_id', blueprintId).single(), 'Read catalog price');
  expect(product.is_active).toBe(true);
  expect(product.selling_price_cents).toBeGreaterThan(0);
  const variant = unwrap(await account.admin.from('product_variants').select('printify_variant_id').eq('blueprint_id', blueprintId).neq('is_available', false).limit(1).single(), 'Read catalog variant');
  return { blueprintId, variantId: variant.printify_variant_id, priceCents: product.selling_price_cents };
}

const lineItem = (item, quantity) => ({ blueprint_id: item.blueprintId, print_provider_id: 99, variant_id: item.variantId, quantity });
const shippingFor = (subtotalAfterDiscount) => subtotalAfterDiscount >= FREE_SHIPPING_FROM_CENTS ? 0 : SHIPPING_CENTS;
const euros = cents => cents / 100;

async function createIntent(account, env, body, intents) {
  const result = await callFunction(env, account.db, 'create-payment-intent', { currency: 'eur', test_mode: true, ...body });
  if (result.body?.paymentIntentId) intents.push(result.body.paymentIntentId);
  return result;
}

async function seedPromo(account, fields) {
  const code = `ACC${randomUUID().slice(0, 8).toUpperCase()}`;
  return unwrap(await account.admin.from('promocodes').insert({ code, is_active: true, used_count: 0, ...fields }).select().single(), 'Seed promo code');
}

async function transactionsOf(account) {
  return unwrap(await account.admin.from('payment_transactions').select('id,order_id,stripe_payment_intent_id,paypal_order_id,mollie_payment_id,amount,status,metadata').eq('user_id', account.id), 'Read payment transactions');
}

test.describe('server-side checkout pricing', () => {
  let intents;
  test.beforeEach(() => { intents = []; });
  test.afterEach(async ({ env }) => {
    // Never leave unconfirmed test-mode intents behind.
    for (const id of intents) await stripe(env, `payment_intents/${id}/cancel`, 'POST').catch(() => {});
  });

  test('CHECK-07 PAY-10 the server charges the catalog price and records the verified breakdown', async ({ account, env }) => {
    const item = await catalogItem(account);
    const subtotal = item.priceCents * 2;
    const total = subtotal + shippingFor(subtotal);

    const result = await createIntent(account, env, { amount: euros(total), line_items: [lineItem(item, 2)] }, intents);
    expect(result.status, JSON.stringify(result.body)).toBe(200);

    const intent = await stripe(env, `payment_intents/${result.body.paymentIntentId}`);
    expect(intent).toMatchObject({ amount: total, currency: 'eur', livemode: false });
    expect(intent.metadata).toMatchObject({ subtotal_cents: String(subtotal), discount_cents: '0', shipping_cost_cents: String(shippingFor(subtotal)) });

    const [transaction] = await transactionsOf(account);
    expect(Math.round(Number(transaction.amount) * 100)).toBe(total);
    expect(transaction.metadata).toMatchObject({
      promo_code: null, subtotal_cents: subtotal, discount_cents: 0, shipping_cost_cents: shippingFor(subtotal), total_cents: total,
      priced_items: [{ blueprint_id: item.blueprintId, variant_id: item.variantId, quantity: 2, unit_price_cents: item.priceCents }],
    });
  });

  for (const functionName of PAYMENT_FUNCTIONS) {
    test(`CHECK-07 PAY-10 ${functionName} refuses tampered or unpriceable checkouts`, async ({ account, env }) => {
      const item = await catalogItem(account);
      const honestTotal = item.priceCents + shippingFor(item.priceCents);
      const inactive = unwrap(await account.admin.from('catalog_products').select('blueprint_id').eq('is_active', false).limit(1).single(), 'Read inactive product');
      const cases = [
        ['a lowered amount', { amount: 0.5, line_items: [lineItem(item, 1)] }, 'PRICE_MISMATCH'],
        ['a forged discount and shipping', { amount: euros(honestTotal - 1000), shipping_cost_cents: 0, discount_cents: 1000 - SHIPPING_CENTS, line_items: [lineItem(item, 1)] }, 'PRICE_MISMATCH'],
        ['an amount above the price', { amount: euros(honestTotal + 100), line_items: [lineItem(item, 1)] }, 'PRICE_MISMATCH'],
        ['no line items', { amount: 0.5 }, 'INVALID_LINE_ITEMS'],
        ['an empty cart', { amount: 0.5, line_items: [] }, 'INVALID_LINE_ITEMS'],
        ['a zero quantity', { amount: 0.5, line_items: [lineItem(item, 0)] }, 'INVALID_LINE_ITEMS'],
        ['a quantity above 99', { amount: 0.5, line_items: [lineItem(item, 100)] }, 'INVALID_LINE_ITEMS'],
        ['an item without a product', { amount: 0.5, line_items: [{ variant_id: item.variantId, quantity: 1 }] }, 'INVALID_LINE_ITEMS'],
        ['an unknown variant', { amount: euros(honestTotal), line_items: [{ ...lineItem(item, 1), variant_id: 999999999 }] }, 'VARIANT_NOT_AVAILABLE'],
        ['a product that is not for sale', { amount: euros(honestTotal), line_items: [{ ...lineItem(item, 1), blueprint_id: inactive.blueprint_id }] }, 'PRODUCT_NOT_PRICED'],
        ['another currency', { amount: euros(honestTotal), currency: 'usd', line_items: [lineItem(item, 1)] }, 'INVALID_CURRENCY'],
      ];
      for (const [name, body, code] of cases) {
        const result = await callFunction(env, account.db, functionName, { currency: 'eur', test_mode: true, ...body });
        if (result.body?.paymentIntentId) intents.push(result.body.paymentIntentId);
        expect({ name, status: result.status, error: result.body?.error }).toEqual({ name, status: 400, error: code });
      }
      expect(await transactionsOf(account), 'Refused checkouts create no payment').toEqual([]);
    });
  }

  test('CHECK-06 the server recomputes the promo discount and the shipping after it', async ({ account, env }) => {
    const item = await catalogItem(account);
    const subtotal = item.priceCents * 3;
    const promo = await seedPromo(account, { type: 'percentage', value: 10 });
    try {
      const discount = Math.round(subtotal * 0.1);
      const total = subtotal + shippingFor(subtotal - subtotal * 0.1) - discount;

      // The undiscounted total is wrong once a code is applied, and vice versa.
      for (const [amount, promo_code] of [[subtotal + shippingFor(subtotal), promo.code], [total, undefined]]) {
        const result = await createIntent(account, env, { amount: euros(amount), promo_code, line_items: [lineItem(item, 3)] }, intents);
        expect(result.body?.error).toBe('PRICE_MISMATCH');
      }

      const result = await createIntent(account, env, { amount: euros(total), promo_code: promo.code.toLowerCase(), line_items: [lineItem(item, 3)] }, intents);
      expect(result.status, JSON.stringify(result.body)).toBe(200);
      const intent = await stripe(env, `payment_intents/${result.body.paymentIntentId}`);
      expect(intent.amount).toBe(total);
      expect(intent.metadata).toMatchObject({ promo_code: promo.code, discount_cents: String(discount) });
      const [transaction] = await transactionsOf(account);
      expect(transaction.metadata).toMatchObject({ promo_code: promo.code, discount_cents: discount, total_cents: total });
      // Payment creation alone never consumes the code.
      expect(unwrap(await account.admin.from('promocodes').select('used_count').eq('code', promo.code).single(), 'Read usage').used_count).toBe(0);
    } finally {
      unwrap(await account.admin.from('promocodes').delete().eq('code', promo.code), 'Remove promo code');
    }
  });

  test('CHECK-06 the server refuses promo codes the checkout would refuse', async ({ account, env }) => {
    const item = await catalogItem(account);
    const total = item.priceCents + shippingFor(item.priceCents);
    const codes = await Promise.all([
      seedPromo(account, { type: 'numeric', value: 5, is_active: false }),
      seedPromo(account, { type: 'numeric', value: 5, expires_at: new Date(Date.now() - 60000).toISOString() }),
      seedPromo(account, { type: 'numeric', value: 5, max_uses: 1, used_count: 1 }),
    ]);
    try {
      const attempts = [...codes.map(promo => promo.code), 'ACC-DOES-NOT-EXIST'];
      for (const code of attempts) {
        for (const functionName of PAYMENT_FUNCTIONS) {
          // The amount a valid €5 code would produce: a refused code must not discount.
          const result = await callFunction(env, account.db, functionName, { currency: 'eur', test_mode: true, amount: euros(total - 500), promo_code: code, line_items: [lineItem(item, 1)] });
          expect({ code, functionName, status: result.status, error: result.body?.error }).toEqual({ code, functionName, status: 400, error: 'INVALID_PROMO_CODE' });
        }
      }
      expect(await transactionsOf(account)).toEqual([]);
    } finally {
      unwrap(await account.admin.from('promocodes').delete().in('code', codes.map(promo => promo.code)), 'Remove promo codes');
    }
  });
});

test.describe('payment transaction integrity', () => {
  let intents;
  test.beforeEach(() => { intents = []; });
  test.afterEach(async ({ env }) => {
    for (const id of intents) await stripe(env, `payment_intents/${id}/cancel`, 'POST').catch(() => {});
  });

  async function pricedPayment(account, env, quantity = 1) {
    const item = await catalogItem(account);
    const subtotal = item.priceCents * quantity;
    const result = await createIntent(account, env, { amount: euros(subtotal + shippingFor(subtotal)), line_items: [lineItem(item, quantity)] }, intents);
    expect(result.status, JSON.stringify(result.body)).toBe(200);
    const [transaction] = await transactionsOf(account);
    return { item, transaction, paymentIntentId: result.body.paymentIntentId };
  }

  async function ownOrder(account) {
    return unwrap(await account.db.from('orders').insert({
      user_id: account.id, customer_email: account.email, order_number: `acceptance-${randomUUID()}`, status: 'pending', payment_status: 'pending', currency: 'EUR',
      // Fulfilment refuses unshippable orders before it checks what was paid.
      shipping_address: { first_name: 'Acceptance', last_name: 'Buyer', address1: 'Damrak 1', city: 'Amsterdam', zip: '1012LG', country: 'NL' },
    }).select().single(), 'Create own order');
  }

  test('PAY-13 users cannot create, alter or reuse payment transactions', async ({ account, env }) => {
    const { transaction } = await pricedPayment(account, env);
    const forged = await account.db.from('payment_transactions').insert({ user_id: account.id, payment_provider: 'stripe', amount: 0.5, currency: 'eur', status: 'succeeded', stripe_payment_intent_id: `pi_forged_${randomUUID()}` });
    expect(forged.error, 'Users cannot insert payments').not.toBeNull();

    for (const change of [{ status: 'succeeded' }, { amount: 0.5 }, { metadata: { ...transaction.metadata, total_cents: 50 } }, { user_id: randomUUID() }]) {
      const update = await account.db.from('payment_transactions').update(change).eq('id', transaction.id);
      expect(update.error, `Users cannot change ${Object.keys(change)[0]}`).not.toBeNull();
    }

    const other = client(env);
    unwrap(await other.auth.signInWithPassword({ email: env.TEST_USER_EMAIL, password: env.TEST_USER_PASSWORD }), 'Other account login');
    const foreignOrder = unwrap(await other.from('orders').insert({
      user_id: env.TEST_USER_ID, customer_email: env.TEST_USER_EMAIL, order_number: `acceptance-${randomUUID()}`, status: 'pending', payment_status: 'pending', currency: 'EUR',
    }).select().single(), 'Create foreign order');
    try {
      // finalize-order links payments server-side; browsers cannot link one even to their own order.
      const own = await ownOrder(account);
      for (const [order, label] of [[foreignOrder, 'another user’s order'], [own, 'their own order']]) {
        expect((await account.db.from('payment_transactions').update({ order_id: order.id }).eq('id', transaction.id)).error, `Cannot link to ${label}`).not.toBeNull();
      }

      const row = unwrap(await account.admin.from('payment_transactions').select('order_id,status,amount,metadata').eq('id', transaction.id).single(), 'Read transaction');
      expect(row).toMatchObject({ order_id: transaction.order_id, status: transaction.status, metadata: transaction.metadata });
      expect(Number(row.amount)).toBe(Number(transaction.amount));
    } finally {
      unwrap(await account.admin.from('orders').delete().eq('id', foreignOrder.id), 'Remove foreign order');
    }

    for (const [fn, args] of [
      ['atomic_stripe_payment_capture', { p_stripe_payment_intent_id: transaction.stripe_payment_intent_id, p_amount: 0.5, p_currency: 'eur' }],
      ['upsert_stripe_payment_transaction', { p_stripe_payment_intent_id: transaction.stripe_payment_intent_id, p_user_id: account.id, p_stripe_customer_id: null, p_amount: 0.5, p_currency: 'eur', p_status: 'succeeded', p_payment_method_type: 'card' }],
    ]) {
      const call = await account.db.rpc(fn, args);
      expect(call.error?.code, `${fn} is server-only`).toBe('42501');
    }
    expect(unwrap(await account.admin.from('payment_transactions').select('status').eq('id', transaction.id).single(), 'Read status').status).toBe(transaction.status);
  });

  test('PAY-13 ORDER-03 fulfilment refuses items that were not paid for', async ({ account, env }) => {
    const { item, transaction } = await pricedPayment(account, env, 2);
    const order = await ownOrder(account);
    // Stand in for finalize-order, the only writer allowed to link a payment.
    unwrap(await account.admin.from('payment_transactions').update({ order_id: order.id }).eq('id', transaction.id), 'Link payment to order');
    const other = await catalogItem(account, 1525);

    for (const [name, body] of [
      ['more units', { line_items: [lineItem(item, 3)], metadata: { order_id: order.id } }],
      ['a different variant', { line_items: [{ ...lineItem(item, 2), variant_id: item.variantId + 1 }], metadata: { order_id: order.id } }],
      ['a pricier product', { line_items: [lineItem(other, 2)], metadata: { order_id: order.id } }],
      ['an extra item', { line_items: [lineItem(item, 2), lineItem(other, 1)], metadata: { order_id: order.id } }],
      ['no order', { line_items: [lineItem(item, 2)] }],
    ]) {
      const result = await callFunction(env, account.db, 'create-printify-order', { shipping_method: 1, is_test: true, ...body });
      // A wrongly accepted request must still be cancelled at teardown.
      if (result.body?.order?.id) account.orders.register(result.body.order.id);
      expect({ name, status: result.status }).toEqual({ name, status: name === 'no order' ? 400 : 409 });
    }
    expect(unwrap(await account.admin.from('orders').select('printify_order_id').eq('id', order.id).single(), 'Read order').printify_order_id).toBeNull();
  });
});

test('CHECK-09 a promo code is redeemed once per successful payment and then honours its limit', async ({ page, account, env }) => {
  test.setTimeout(240000);
  const promo = await seedPromo(account, { type: 'numeric', value: 5, max_uses: 1 });
  try {
    const expected = await purchaseSetup(page, account, env, false);
    await page.getByRole('textbox', { name: /promo.*code/i }).fill(promo.code);
    await page.getByRole('button', { name: /^apply/i }).click();
    await expect(page.getByText(/[−-]\s*€\s*5\.00/).first()).toBeVisible();
    await pay(page, env, 'stripe');

    const totalCents = expected.totalCents - 500;
    let transaction;
    await expect.poll(async () => {
      [transaction] = (await transactionsOf(account)).filter(row => row.stripe_payment_intent_id);
      return transaction?.status;
    }, { timeout: 90000 }).toBe('succeeded');
    expect(Math.round(Number(transaction.amount) * 100)).toBe(totalCents);
    expect(transaction.metadata).toMatchObject({ promo_code: promo.code, discount_cents: 500, total_cents: totalCents });
    const intent = await stripe(env, `payment_intents/${transaction.stripe_payment_intent_id}`);
    expect(intent).toMatchObject({ amount: totalCents, status: 'succeeded', livemode: false });

    // The webhook's success update must not erase the paid items: the order is fulfilled.
    let order;
    await expect.poll(async () => {
      [order] = unwrap(await account.admin.from('orders').select('id,status,printify_order_id,total_amount,discount_amount').eq('user_id', account.id), 'Read promo order');
      return Boolean(order?.printify_order_id);
    }, { timeout: 90000 }).toBe(true);
    account.orders.register(order.printify_order_id);
    expect(order).toMatchObject({ status: 'confirmed' });
    expect(Number(order.total_amount)).toBe(totalCents);
    expect(Number(order.discount_amount)).toBe(500);

    const usage = async () => ({
      used: unwrap(await account.admin.from('promocodes').select('used_count').eq('code', promo.code).single(), 'Read usage').used_count,
      redemptions: unwrap(await account.admin.from('promocode_redemptions').select('payment_transaction_id').eq('code', promo.code), 'Read redemptions').length,
    });
    await expect.poll(usage, { timeout: 30000 }).toEqual({ used: 1, redemptions: 1 });

    // A redelivered success (webhook retry) must not redeem the code again.
    unwrap(await account.admin.from('payment_transactions').update({ status: 'processing' }).eq('id', transaction.id), 'Simulate replay: leave succeeded');
    unwrap(await account.admin.from('payment_transactions').update({ status: 'succeeded' }).eq('id', transaction.id), 'Simulate replay: succeed again');
    expect(await usage()).toEqual({ used: 1, redemptions: 1 });

    // The code is now exhausted for the checkout and for a crafted request.
    const validation = await page.request.post('/api/validate-promocode', { data: { code: promo.code, subtotal: 40 } });
    expect(await validation.json()).toMatchObject({ isValid: false, message: 'promoCodeLimitReached' });
    const item = await catalogItem(account);
    const replay = await callFunction(env, account.db, 'create-payment-intent', {
      currency: 'eur', test_mode: true, amount: euros(item.priceCents + shippingFor(item.priceCents) - 500), promo_code: promo.code, line_items: [lineItem(item, 1)],
    });
    expect(replay).toMatchObject({ status: 400, body: { error: 'INVALID_PROMO_CODE' } });
  } finally {
    unwrap(await account.admin.from('promocodes').delete().eq('code', promo.code), 'Remove promo code');
  }
});
