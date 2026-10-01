import { setCheckbox } from './browser.mjs';
import { readFileSync } from 'node:fs';
import { expect } from '@playwright/test';
import { required } from './environment.mjs';
import { unwrap } from './fixtures.mjs';
import { seedCart, itemCard, proceed, fillAddress } from './cart.mjs';

export async function purchaseSetup(page, account, env, subset = true) {
  if (env.TEST_PRINTIFY_MANUAL_APPROVAL !== 'confirmed') throw new Error('Verify Printify manual approval before purchase tests');
  if (env.TEST_EDGE_ENVIRONMENT_VERIFIED !== env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('Verify deployed Edge Functions use the parallel DB, APP_ENV=test, sandbox payments and authorized Printify shop; then set TEST_EDGE_ENVIRONMENT_VERIFIED to the test URL');
  const fixtures = JSON.parse(readFileSync(required(env, 'TEST_CART_FIXTURES_PATH'), 'utf8'));
  expect(fixtures.map(i => [i.unit_price, i.quantity])).toEqual([[1999, 2], [2501, 1], [1200, 1]]);
  for (const fixture of fixtures) {
    const product = await account.orders.request(`products/${encodeURIComponent(fixture.product_id)}.json`);
    expect(product.variants.some(v => v.id === Number(fixture.variant_id) && v.is_enabled)).toBe(true);
  }
  const cart = await seedCart(account, subset ? fixtures : [fixtures[0]]);
  await page.goto('/cart');
  if (subset) await setCheckbox(itemCard(page, fixtures[1].product_name).getByRole('checkbox'), false);
  await proceed(page);
  await fillAddress(page, account.email);
  return { cart, selected: subset ? [cart.items[0], cart.items[2]] : cart.items, totalCents: subset ? 5697 : 4497 };
}
export async function pay(page, env, provider, { decline = false, doubleSubmit = false } = {}) {
  if (provider === 'stripe') {
    required(env, 'STRIPE_SECRET_KEY');
    await page.getByRole('radio', { name: /credit|card|stripe/i }).click();
    await page.getByRole('checkbox', { name: /test mode/i }).check();
    if (decline) {
      await page.getByRole('combobox').last().click();
      await page.getByRole('option', { name: /generic decline|card declined/i }).first().click();
    }
    const submit = page.getByRole('button', { name: /^pay /i });
    if (doubleSubmit) await submit.dblclick();
    else await submit.click();
    return;
  }
  if (provider === 'paypal') {
    required(env, 'PAYPAL_TEST_EMAIL'); required(env, 'PAYPAL_TEST_PASSWORD');
    await page.getByRole('radio', { name: /paypal/i }).click();
    await page.getByRole('button', { name: /paypal/i }).filter({ visible: true }).click();
    await page.waitForURL(/sandbox\.paypal\.com/);
    expect(new URL(page.url()).hostname.endsWith('sandbox.paypal.com')).toBe(true);
    await page.locator('#email').fill(env.PAYPAL_TEST_EMAIL);
    const next = page.getByRole('button', { name: /^next$/i });
    if (await next.isVisible()) await next.click();
    await page.locator('#password').fill(env.PAYPAL_TEST_PASSWORD);
    await page.getByRole('button', { name: /log in/i }).click();
    await page.getByRole('button', { name: /complete purchase|agree.*pay|pay now/i }).click();
    return;
  }
  required(env, 'MOLLIE_API_KEY');
  await page.getByRole('radio', { name: /ideal/i }).click();
  await page.getByRole('button', { name: /ideal/i }).filter({ visible: true }).click();
  await page.waitForURL(/mollie\.com/);
  await expect(page.getByText(/test/i).first()).toBeVisible();
  await page.getByRole('button', { name: /^paid$|^pay$/i }).click();
}
export async function verifyPurchase(account, expected, provider) {
  let order;
  await expect.poll(async () => {
    const rows = unwrap(await account.db.from('orders').select('*,order_items(*)').eq('user_id', account.id), 'Read purchased orders');
    expect(rows.length).toBeLessThanOrEqual(1);
    order = rows[0];
    return order?.payment_status;
  }, { timeout: 90000 }).toBe('paid');
  expect(order.payment_provider).toBe(provider);
  expect(order.currency.toUpperCase()).toBe('EUR');
  expect(Math.round(Number(order.total_amount) * 100)).toBe(expected.totalCents);
  const project = rows => rows.map(i => ({ product: i.product_id, variant: String(i.variant_id), quantity: i.quantity, unitPrice: i.unit_price })).sort((a, b) => a.product.localeCompare(b.product));
  expect(project(order.order_items)).toEqual(project(expected.selected));
  expect(order.printify_order_id).toBeTruthy();
  account.orders.register(order.printify_order_id);
  const remote = await account.orders.request(`orders/${order.printify_order_id}.json`);
  const identity = rows => rows.map(i => ({ product: i.product_id, variant: Number(i.variant_id), quantity: i.quantity })).sort((a, b) => a.product.localeCompare(b.product));
  expect(identity(remote.line_items)).toEqual(identity(expected.selected));
  expect(remote.line_items.every(i => !i.sent_to_production_at)).toBe(true);
  const remaining = unwrap(await account.db.from('cart_items').select('id').eq('cart_id', expected.cart.id), 'Verify purchased subset cleanup');
  expect(remaining.map(r => r.id).sort()).toEqual(expected.cart.items.filter(i => !expected.selected.some(s => s.id === i.id)).map(i => i.id).sort());
  return order;
}
