/* Playwright fixtures establish sessions even when their value is unused. */
/* eslint @typescript-eslint/no-unused-vars: ["warn", {"argsIgnorePattern": "^(suppliedUser|account)$"}] */
import { test, expect, unwrap } from '../support/fixtures.mjs';
import { customize, createProduct } from '../support/customization.mjs';

test('CUSTOM-02 CREATE-01 BAG-01 created product/variant reaches persisted cart', async ({ page, account, env }) => {
  test.setTimeout(240000);
  await customize(page, env);
  await createProduct(page);
  await page.getByRole('button', { name: /^bag it$/i }).filter({ visible: true }).click();
  await expect(page).toHaveURL(/\/cart/);
  const cart = unwrap(await account.db.from('carts').select('*,cart_items(*)').eq('user_id', account.id).single(), 'Read created cart');
  expect(cart.cart_items).toHaveLength(1);
  const item = cart.cart_items[0];
  expect(item.product_name).toBe(env.TEST_PRODUCT_NAME);
  expect(item.unit_price).toBeGreaterThan(0);
  const remote = await account.orders.request(`products/${item.product_id}.json`);
  expect(remote.variants.some(v => String(v.id) === item.variant_id && v.is_enabled)).toBe(true);
  await page.reload();
  await expect(page.getByRole('article').filter({ hasText: env.TEST_PRODUCT_NAME })).toHaveCount(1);
});
test('BAG-02 create another returns to first upload step', async ({ page, account, env }) => {
  test.setTimeout(240000);
  await customize(page, env); await createProduct(page);
  await page.getByRole('button', { name: /bag it.*create another/i }).filter({ visible: true }).click();
  await expect(page.locator('[aria-current="step"]')).toContainText(/upload/i);
  const uploadHeading = page.getByRole('heading', { name: /upload image/i });
  await expect(uploadHeading).toBeInViewport({ ratio: 0.5 });
  const carts = unwrap(await account.db.from('carts').select('cart_items(*)').eq('user_id', account.id).single(), 'Read cart');
  expect(carts.cart_items).toHaveLength(1);
});
test('CREATE-02 failed product creation keeps a recoverable design', async ({ page, account, env }) => {
  await customize(page, env);
  await page.route('**/functions/v1/create-custom-product', route => route.abort('failed'));
  const preview = page.getByRole('button', { name: /^continue to preview$/i }).filter({ visible: true });
  if (await preview.count()) await preview.click();
  await page.getByRole('button', { name: /^create product$/i }).filter({ visible: true }).click();
  await expect(page.getByText(/error|failed|couldn.t/i).filter({ visible: true }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /^bag it$/i })).toHaveCount(0);
  expect(unwrap(await account.db.from('products').select('id').eq('user_id', account.id), 'No falsely created product')).toEqual([]);
});
