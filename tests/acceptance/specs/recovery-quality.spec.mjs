/* Playwright fixture values may be unused while establishing the test session. */
/* eslint @typescript-eslint/no-unused-vars: ["warn", {"argsIgnorePattern": "^(suppliedUser|account)$"}] */
import { readFileSync } from 'node:fs';
import { test, expect, unwrap } from '../support/fixtures.mjs';
import { describeDesign, generate, enterUpload, IMAGE, assertNoHorizontalOverflow } from '../support/browser.mjs';
import { seedCart, proceed, ITEMS } from '../support/cart.mjs';

for (const length of [1, 499, 500]) {
  test(`GEN-02 valid prompt boundary ${length}`, async ({ page, account }) => {
    const response = await generate(page, 'x'.repeat(length));
    expect(response.status()).toBe(200);
    await expect(page.getByAltText('Generated design result')).toBeVisible();
  });
}
test('GEN-04 no filter removes old guidance', async ({ page, account }) => {
  await describeDesign(page);
  await page.locator('textarea').fill('My fox');
  await page.getByRole('button', { name: /apply suggestion: vibrant/i }).filter({ visible: true }).click();
  await expect(page.locator('textarea')).not.toHaveValue('My fox');
  await page.getByRole('button', { name: /^no filter/i }).filter({ visible: true }).click();
  await expect(page.locator('textarea')).toHaveValue('My fox');
});
test('GEN-08 whitespace with no design cannot advance or generate', async ({ page, account }) => {
  await enterUpload(page);
  await page.getByRole('button', { name: /^skip upload$/i }).filter({ visible: true }).click();
  await page.locator('textarea').fill('   ');
  await expect(page.getByRole('button', { name: /stamp it/i }).filter({ visible: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: /proceed without editing|proceed with previous photos/i })).toHaveCount(0);
});
test('GEN-12 client timeout stops loading without inventing a refund', async ({ page, account }) => {
  test.setTimeout(150000);
  const before = unwrap(await account.db.from('profiles').select('coins').eq('id', account.id).single(), 'Read initial balance').coins;
  await describeDesign(page);
  await page.locator('textarea').fill('[acceptance:timeout] A fox');
  const response = page.waitForResponse(r => r.url().endsWith('/api/generate-image'), { timeout: 110000 });
  await page.getByRole('button', { name: /stamp it/i }).filter({ visible: true }).click();
  await expect(page.getByText(/timed out/i).filter({ visible: true }).first()).toBeVisible({ timeout: 100000 });
  expect((await response).status()).toBe(200);
  const after = unwrap(await account.db.from('profiles').select('coins').eq('id', account.id).single(), 'Reconcile actual completed work').coins;
  expect(after).toBe(before - 1);
});
test('GEN-13 expired daily allowance resets once under concurrent reads', async ({ account }) => {
  unwrap(await account.admin.from('profiles').update({ coins: 0, coins_reset_at: '2000-01-01' }).eq('id', account.id), 'Seed expired allowance');
  const responses = await Promise.all([account.db.rpc('get_user_coins', { user_id: account.id }), account.db.rpc('get_user_coins', { user_id: account.id })]);
  for (const response of responses) expect(response.error).toBeNull();
  expect(unwrap(await account.db.from('profiles').select('coins').eq('id', account.id).single(), 'Read reset allowance').coins).toBe(5);
  const deductions = await Promise.all([account.db.rpc('deduct_coin', { user_id: account.id }), account.db.rpc('deduct_coin', { user_id: account.id })]);
  expect(deductions.map(r => unwrap(r, 'Concurrent deductions'))).toEqual([true, true]);
  expect(unwrap(await account.db.from('profiles').select('coins').eq('id', account.id).single(), 'Read remaining allowance').coins).toBe(3);
});
test('GEN-14 coin-fetch failure offers recovery rather than asserting zero coins', async ({ page, account }) => {
  await page.route('**/rest/v1/rpc/get_user_coins', route => route.abort('failed'));
  await describeDesign(page);
  await expect(page.getByText(/failed|unable|try again|error/i).filter({ visible: true }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /stamp it/i }).filter({ visible: true })).toBeDisabled();
  await page.unroute('**/rest/v1/rpc/get_user_coins');
  await page.reload();
  // Reload must leave a valid restart/recovery step, never an endless loader.
  await expect(page.getByRole('button', { name: /begin customizing|begin customization|stamp it/i }).filter({ visible: true }).first()).toBeVisible();
});
test('FLOW-02 going back preserves entered design text', async ({ page, account }) => {
  await describeDesign(page);
  await page.locator('textarea').fill('Keep this design text');
  await page.getByRole('button', { name: /back|previous step/i }).filter({ visible: true }).first().click();
  await page.getByRole('button', { name: /^next step$/i }).filter({ visible: true }).click();
  await expect(page.locator('textarea')).toHaveValue('Keep this design text');
});
test('FLOW-03 reload during upload offers valid progression', async ({ page, suppliedUser }) => {
  await enterUpload(page); await page.reload();
  await expect(page.getByRole('button', { name: /begin customizing|begin customization|skip upload/i }).filter({ visible: true }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /^bag it$/i })).toHaveCount(0);
});
test('CART-09 stale cart selection cannot silently buy the whole cart', async ({ page, account }) => {
  const cart = await seedCart(account);
  await page.goto(`/checkout?cartId=${cart.id}`);
  unwrap(await account.db.from('cart_items').update({ is_selected: false }).eq('cart_id', cart.id), 'Clear persisted selection');
  await page.reload();
  await expect(page.getByRole('button', { name: /^pay /i })).toHaveCount(0);
});
test('CHECK-08 empty checkout cannot create a charge', async ({ page, account }) => {
  await page.goto('/checkout');
  await expect(page.getByText(/empty|not found|no.*cart|missing/i).filter({ visible: true }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /^pay /i })).toHaveCount(0);
});
for (const input of ['not-an-email', '   ']) {
  test(`CHECK-03 invalid email ${JSON.stringify(input)} disables payment`, async ({ page, account }) => {
    await seedCart(account, [ITEMS[0]]); await page.goto('/cart'); await proceed(page);
    await page.locator('[name="billing.email"]').fill(input);
    await page.locator('[name="billing.email"]').blur();
    await expect(page.getByRole('button', { name: /^pay /i }).first()).toBeDisabled();
  });
}
for (const width of [320, 768, 1440]) {
  test(`UX-01 UX-03 upload works at ${width}px with reduced motion`, async ({ page, suppliedUser }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await enterUpload(page);
    await assertNoHorizontalOverflow(page);
    await page.getByLabel('File upload input').setInputFiles(IMAGE);
    const next = page.getByRole('button', { name: /^next step$/i }).filter({ visible: true });
    await expect(next).toBeInViewport(); await next.click();
    await expect(page.locator('textarea')).toBeVisible();
  });
}
test('UX-02 preservation slider supports keyboard changes', async ({ page, suppliedUser }) => {
  await describeDesign(page);
  const slider = page.getByRole('slider');
  await slider.focus();
  const before = Number(await slider.inputValue());
  await page.keyboard.press('ArrowRight');
  expect(Number(await slider.inputValue())).toBe(before + 1);
});
test('ORDER-02 empty order history has useful empty state', async ({ page, account }) => {
  await page.goto('/orders');
  await expect(page.getByText(/no orders|no purchases|haven.t.*order/i).filter({ visible: true }).first()).toBeVisible();
});
test('OBS-01 unauthenticated generation errors expose no secret material', async ({ request, env }) => {
  const response = await request.post('/api/generate-image', { multipart: { prompt: 'test', image: { name: 'test.png', mimeType: 'image/png', buffer: readFileSync(IMAGE) } } });
  expect(response.status()).toBe(401);
  const body = await response.text();
  for (const name of ['TEST_USER_PASSWORD', 'PRINTIFY_API_TOKEN', 'STRIPE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY']) {
    if (env[name]) expect(body).not.toContain(env[name]);
  }
});
