/* eslint @typescript-eslint/no-unused-vars: ["warn", {"argsIgnorePattern": "^account$"}] */
import { test, expect, unwrap } from '../support/fixtures.mjs';
import { customize, createProduct } from '../support/customization.mjs';
import { required } from '../support/environment.mjs';

for (const edge of ['min', 'middle', 'max']) {
  test(`CUSTOM-04 ${edge} placement survives creation and reaches real Printify product`, async ({ page, account, env }) => {
    test.setTimeout(240000);
    await customize(page, env);
    const preview = page.getByRole('button', { name: /^continue to preview$/i }).filter({ visible: true });
    if (await preview.count()) await preview.click();
    const expected = { angle: 90 };
    for (const [property, selector] of [['x', '#placement-x'], ['y', '#placement-y'], ['scale', '#placement-scale']]) {
      const control = page.locator(selector).filter({ visible: true });
      const min = Number(await control.getAttribute('min'));
      const max = Number(await control.getAttribute('max'));
      expected[property] = edge === 'min' ? min : edge === 'max' ? max : Math.round((min + max) * 50) / 100;
      await control.fill(String(expected[property]));
    }
    await page.getByRole('button', { name: /rotate.*90|rotation.*90/i }).filter({ visible: true }).click();
    const { request, body } = await createProduct(page);
    expect(Object.keys(request.placements)).toHaveLength(1);
    const [position, placement] = Object.entries(request.placements)[0];
    expect(placement).toEqual(expected);
    const product = await account.orders.request(`products/${body.product.id}.json`);
    const image = product.print_areas.flatMap(a => a.placeholders).find(p => p.position === position)?.images[0];
    expect(image).toBeTruthy();
    for (const [key, value] of Object.entries(expected)) expect(image[key]).toBeCloseTo(value, 4);
  });
}
test('CUSTOM-05 socks create both leg print areas without overwriting either', async ({ page, account, env }) => {
  // Printify names the sock positions left_leg / right_leg (catalog blueprint 496, provider 26).
  test.setTimeout(240000);
  await customize(page, env, required(env, 'TEST_SOCK_PRODUCT_NAME'));
  const { request, body } = await createProduct(page);
  expect(Object.keys(request.print_areas).sort()).toEqual(['left_leg', 'right_leg']);
  const product = await account.orders.request(`products/${body.product.id}.json`);
  // Printify lists every placeholder the blueprint offers (e.g. an empty 'all'); only printed ones matter.
  const positions = new Set(product.print_areas.flatMap(a => a.placeholders).filter(p => p.images.length > 0).map(p => p.position));
  expect([...positions].sort()).toEqual(['left_leg', 'right_leg']);
});
test('CUSTOM-06 automatic mug placement does not send generic client placements', async ({ page, account, env }) => {
  test.setTimeout(240000);
  await customize(page, env, required(env, 'TEST_MUG_PRODUCT_NAME'));
  const { request, body } = await createProduct(page);
  expect(request.placements).toBeUndefined();
  const product = await account.orders.request(`products/${body.product.id}.json`);
  expect(product.print_areas.flatMap(a => a.placeholders).flatMap(p => p.images).length).toBeGreaterThan(0);
});
test('BAG-03 fast double-click adds the created product once', async ({ page, account, env }) => {
  test.setTimeout(240000);
  await customize(page, env); await createProduct(page);
  await page.getByRole('button', { name: /^bag it$/i }).filter({ visible: true }).dblclick();
  await expect(page).toHaveURL(/\/cart/);
  const cart = unwrap(await account.db.from('carts').select('cart_items(*)').eq('user_id', account.id).single(), 'Read cart after duplicate action');
  expect(cart.cart_items).toHaveLength(1);
  expect(cart.cart_items[0].quantity).toBe(1);
});
test('BAG-04 failed cart write leaves review recoverable without false success', async ({ page, account, env }) => {
  test.setTimeout(240000);
  await customize(page, env); await createProduct(page);
  await page.route(/\/rest\/v1\/(cart_items|rpc\/upsert_cart_item)/, route => ['POST', 'PATCH'].includes(route.request().method()) ? route.abort('failed') : route.fallback());
  await page.getByRole('button', { name: /^bag it$/i }).filter({ visible: true }).click();
  await expect(page.getByText(/failed|error|couldn.t/i).filter({ visible: true }).first()).toBeVisible();
  expect(new URL(page.url()).pathname).toBe('/stamp');
  await expect(page.getByRole('button', { name: /^bag it$/i }).filter({ visible: true })).toBeEnabled();
});
test('CREATE-03 duplicate create request resolves to one product', async ({ page, account, env }) => {
  test.setTimeout(240000);
  await customize(page, env);
  const preview = page.getByRole('button', { name: /^continue to preview$/i }).filter({ visible: true });
  if (await preview.count()) await preview.click();
  const requests = [];
  page.on('request', request => { if (request.url().endsWith('/create-custom-product') && request.method() === 'POST') requests.push(request); });
  await page.getByRole('button', { name: /^create product$/i }).filter({ visible: true }).dblclick();
  await expect(page.getByRole('button', { name: /^bag it$/i }).filter({ visible: true })).toBeEnabled({ timeout: 90000 });
  expect(requests).toHaveLength(1);
  const products = unwrap(await account.db.from('products').select('id').eq('user_id', account.id), 'Verify created product count');
  expect(products).toHaveLength(1);
});
