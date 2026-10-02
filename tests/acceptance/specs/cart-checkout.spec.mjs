import { setCheckbox } from '../support/browser.mjs';
/* Playwright fixtures establish sessions even when their value is unused. */
/* eslint @typescript-eslint/no-unused-vars: ["warn", {"argsIgnorePattern": "^(suppliedUser|account)$"}] */
import { test, expect, unwrap, client } from '../support/fixtures.mjs';
import { seedCart, itemCard, proceed, fillAddress, ITEMS } from '../support/cart.mjs';

test('CART-01 single item selected by default; deselection disables checkout', async ({ page, account }) => {
  await seedCart(account, [ITEMS[0]]);
  await page.goto('/cart');
  const selection = itemCard(page, 'Acceptance A').getByRole('checkbox');
  await expect(selection).toBeChecked();
  await setCheckbox(selection, false);
  await expect(page.getByRole('button', { name: /checkout|proceed/i }).filter({ visible: true }).first()).toBeDisabled();
  await setCheckbox(selection, true);
  await proceed(page);
  await expect(page.getByText('Acceptance A', { exact: true })).toBeVisible();
});
test('CART-02 selected subset only appears in checkout with exact total', async ({ page, account }) => {
  await seedCart(account);
  await page.goto('/cart');
  await setCheckbox(itemCard(page, 'Acceptance B').getByRole('checkbox'), false);
  await proceed(page);
  await expect(page.getByText('Acceptance A', { exact: true })).toBeVisible();
  await expect(page.getByText('Acceptance C', { exact: true })).toBeVisible();
  await expect(page.getByText('Acceptance B', { exact: true })).toHaveCount(0);
  await expect(page.getByText(/56[.,]97/).first()).toBeVisible();
});
test('CART-03 select and deselect all update every item', async ({ page, account }) => {
  await seedCart(account);
  await page.goto('/cart');
  // The master checkbox relabels itself ("Deselect all" <-> "Select all (n)")
  // as its state changes, so match the stable part of both names.
  const master = page.getByRole('checkbox', { name: /select all/i });
  await expect(master).toHaveAccessibleName(/^deselect all/i);
  await setCheckbox(master, false);
  for (const item of ITEMS) await expect(itemCard(page, item.product_name).getByRole('checkbox')).not.toBeChecked();
  await expect(master).toHaveAccessibleName(/^select all/i);
  await setCheckbox(master, true);
  for (const item of ITEMS) await expect(itemCard(page, item.product_name).getByRole('checkbox')).toBeChecked();
});
test('CART-04 quantities persist in the real database after reload', async ({ page, account }) => {
  const cart = await seedCart(account, [ITEMS[0]]);
  await page.goto('/cart');
  await itemCard(page, 'Acceptance A').getByRole('button', { name: /increase/i }).click();
  await expect.poll(async () => unwrap(await account.db.from('cart_items').select('quantity').eq('id', cart.items[0].id).single(), 'Read quantity').quantity).toBe(3);
  await page.reload();
  await expect(itemCard(page, 'Acceptance A').getByRole('group')).toContainText('3');
});
for (const quantity of [0, -1, 1.5, 100]) {
  test(`CART-05 server rejects quantity ${quantity}`, async ({ account }) => {
    const cart = await seedCart(account, [ITEMS[0]]);
    const result = await account.db.from('cart_items').update({ quantity }).eq('id', cart.items[0].id).select();
    expect(result.error, 'Database-facing API must enforce quantity rules').not.toBeNull();
    expect(unwrap(await account.db.from('cart_items').select('quantity').eq('id', cart.items[0].id).single(), 'Verify unchanged row').quantity).toBe(2);
  });
}
test('CART-06 removing the last item persists and shows empty state', async ({ page, account }) => {
  const cart = await seedCart(account, [ITEMS[0]]);
  await page.goto('/cart');
  await itemCard(page, 'Acceptance A').getByRole('button', { name: /remove/i }).click();
  await expect.poll(async () => unwrap(await account.db.from('cart_items').select('id').eq('cart_id', cart.id), 'Read cart')).toEqual([]);
  await page.reload();
  await expect(page.getByText(/bag(?: is|'s) empty|cart is empty/i).first()).toBeVisible();
});
test('CART-07 failed persistence cannot falsely remove an item', async ({ page, account }) => {
  const cart = await seedCart(account, [ITEMS[0]]);
  await page.goto('/cart');
  await page.route('**/rest/v1/cart_items*', async route => {
    if (route.request().method() === 'DELETE') await route.abort('failed'); else await route.continue();
  });
  await itemCard(page, 'Acceptance A').getByRole('button', { name: /remove/i }).click();
  await expect(page.getByText(/error|failed|couldn.t/i).filter({ visible: true }).first()).toBeVisible();
  expect(unwrap(await account.db.from('cart_items').select('id').eq('cart_id', cart.id), 'Read persisted cart')).toHaveLength(1);
});
test('CART-08 another user cannot read or mutate this cart', async ({ account, env }) => {
  const cart = await seedCart(account);
  const other = client(env);
  unwrap(await other.auth.signInWithPassword({ email: env.TEST_USER_EMAIL, password: env.TEST_USER_PASSWORD }), 'Other user login');
  expect(unwrap(await other.from('cart_items').select('*').eq('cart_id', cart.id), 'Other user read')).toEqual([]);
  const mutation = await other.from('cart_items').update({ quantity: 99 }).eq('cart_id', cart.id).select();
  expect(mutation.data ?? []).toEqual([]);
  const original = unwrap(await account.db.from('cart_items').select('id,quantity').eq('cart_id', cart.id), 'Owner verification');
  expect(original.map(r => r.quantity).sort()).toEqual([1, 1, 2]);
});
for (const [cents, total] of [[5999, '64.98'], [6000, '60.00'], [6001, '60.01']]) {
  test(`CHECK-04 shipping boundary ${cents} cents`, async ({ page, account }) => {
    await seedCart(account, [{ ...ITEMS[0], quantity: 1, unit_price: cents }]);
    await page.goto('/cart'); await proceed(page);
    await expect(page.getByText(new RegExp(total.replace('.', '[.,]'))).first()).toBeVisible();
  });
}
for (const field of ['first_name', 'email', 'address1', 'city', 'zip']) {
  test(`CHECK-01 missing billing ${field} prevents payment`, async ({ page, account }) => {
    await seedCart(account, [ITEMS[0]]);
    await page.goto('/cart'); await proceed(page);
    await fillAddress(page, account.email);
    await page.locator(`[name="billing.${field}"]`).fill('');
    await page.locator(`[name="billing.${field}"]`).blur();
    await expect(page.getByRole('button', { name: /^pay /i }).first()).toBeDisabled();
  });
}
test('CHECK-08 payment selection has exactly one active method', async ({ page, account }) => {
  await seedCart(account, [ITEMS[0]]); await page.goto('/cart'); await proceed(page);
  for (const name of [/paypal/i, /ideal/i, /credit|card|stripe/i]) {
    await page.getByRole('radio', { name }).click();
    await expect(page.getByRole('radio', { checked: true })).toHaveCount(1);
    await expect(page.getByRole('radio', { name })).toHaveAttribute('aria-checked', 'true');
  }
});
