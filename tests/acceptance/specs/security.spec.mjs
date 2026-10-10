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
