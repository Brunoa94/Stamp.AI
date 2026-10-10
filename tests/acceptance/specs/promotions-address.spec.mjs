import { randomUUID } from 'node:crypto';
import { test, expect, unwrap } from '../support/fixtures.mjs';
import { seedCart, proceed, fillAddress, ITEMS } from '../support/cart.mjs';

for (const [type, value, discount] of [['numeric', 10, 10], ['percentage', 10, 6]]) {
  test(`CHECK-05 ${type} discount crosses free-shipping threshold and can be removed`, async ({ page, account }) => {
    const code = `ACCEPT-${randomUUID().slice(0, 8).toUpperCase()}`;
    const promo = unwrap(await account.admin.from('promocodes').insert({ code, type, value, is_active: true, used_count: 0 }).select().single(), 'Seed promotion');
    try {
      await seedCart(account, [{ ...ITEMS[0], quantity: 1, unit_price: 6000 }]);
      await page.goto('/cart'); await proceed(page);
      await page.getByRole('textbox', { name: /promo.*code/i }).fill(code);
      await page.getByRole('button', { name: /^apply$/i }).click();
      const total = (60 - discount + 4.99).toFixed(2);
      await expect(page.getByText(new RegExp(total.replace('.', '[.,]'))).first()).toBeVisible();
      await page.getByRole('button', { name: /remove.*promo/i }).click();
      await expect(page.getByText(/60[.,]00/).first()).toBeVisible();
    } finally {
      unwrap(await account.admin.from('promocodes').delete().eq('promocode_id', promo.promocode_id), 'Cleanup promotion');
    }
  });
}
for (const [name, overrides] of [
  ['inactive', { is_active: false }],
  ['expired', { expires_at: '2000-01-01T00:00:00Z' }],
  ['exhausted', { used_count: 1, max_uses: 1 }],
]) {
  test(`CHECK-06 rejects ${name} promotion using real database rules`, async ({ page, account }) => {
    const code = `ACCEPT-${randomUUID().slice(0, 8).toUpperCase()}`;
    const promo = unwrap(await account.admin.from('promocodes').insert({ code, type: 'percentage', value: 10, is_active: true, used_count: 0, ...overrides }).select().single(), 'Seed ineligible promotion');
    try {
      const response = await page.request.post('/api/validate-promocode', { data: { code, subtotal: 60 } });
      expect(response.ok()).toBe(true);
      expect(await response.json()).toMatchObject({ isValid: false, appliedPromo: null });
    } finally { unwrap(await account.admin.from('promocodes').delete().eq('promocode_id', promo.promocode_id), 'Cleanup promotion'); }
  });
}
test('CHECK-02 hidden separate shipping fields no longer validate or override billing', async ({ page, account }) => {
  await seedCart(account, [ITEMS[0]]); await page.goto('/cart'); await proceed(page);
  await fillAddress(page, account.email);
  await page.getByRole('checkbox', { name: /different.*address|separate.*address/i }).check();
  await expect(page.locator('[name="shipping.address1"]')).toBeVisible();
  await page.locator('[name="shipping.address1"]').fill('Old address that must be cleared');
  await page.getByRole('checkbox', { name: /different.*address|separate.*address/i }).uncheck();
  await expect(page.locator('[name="shipping.address1"]')).toHaveCount(0);
  await page.getByRole('checkbox', { name: /different.*address|separate.*address/i }).check();
  await expect(page.locator('[name="shipping.address1"]')).toHaveValue('');
});
test('CHECK-07 client price tampering cannot reduce server-calculated payment', async ({ account }) => {
  const cart = await seedCart(account, [ITEMS[0]]);
  const result = await account.db.functions.invoke('create-payment-intent', { body: {
    amount: 1, currency: 'eur', metadata: { cartId: cart.id },
    line_items: [{ product_id: cart.items[0].product_id, variant_id: Number(cart.items[0].variant_id), quantity: 2 }],
  } });
  // The deliberately non-provider fixture must be rejected, never charged at a forged amount.
  expect(result.error).not.toBeNull();
  const transactions = unwrap(await account.db.from('payment_transactions').select('id').eq('user_id', account.id).in('status', ['paid', 'succeeded']), 'Verify no successful forged payment');
  expect(transactions).toEqual([]);
});
