import { randomUUID } from 'node:crypto';
import { expect } from '@playwright/test';
import { unwrap } from './fixtures.mjs';
import { TEST_URL } from './environment.mjs';

// Seeded item artwork: zoe.png on the test project's static-assets CDN (public/ holds no images).
export const FIXTURE_IMAGE_URL = `${TEST_URL}/storage/v1/object/public/static-assets/zoe.png`;

export const ITEMS = [
  { product_name: 'Acceptance A', unit_price: 1999, quantity: 2 },
  { product_name: 'Acceptance B', unit_price: 2501, quantity: 1 },
  { product_name: 'Acceptance C', unit_price: 1200, quantity: 1 },
];
export async function seedCart(account, items = ITEMS) {
  const cart = unwrap(await account.db.from('carts').insert({ user_id: account.id, user_email: account.email }).select().single(), 'Create real test cart');
  const rows = items.map((item, i) => ({ cart_id: cart.id, product_id: randomUUID(), variant_id: String(90000 + i), custom_image_url: FIXTURE_IMAGE_URL, is_selected: true, ...item }));
  const saved = unwrap(await account.db.from('cart_items').insert(rows).select(), 'Seed real cart items');
  return { ...cart, items: saved };
}
export function itemCard(page, name) { return page.getByRole('article').filter({ hasText: name }); }
export async function proceed(page) {
  await page.getByRole('button', { name: /checkout|proceed/i }).filter({ visible: true }).first().click();
  await expect(page).toHaveURL(/\/checkout/);
}
export async function fillAddress(page, email) {
  for (const [key, value] of Object.entries({ first_name: 'Acceptance', last_name: 'Test', email, address1: 'Damrak 1', city: 'Amsterdam', zip: '1012LG' })) {
    await page.locator(`[name="billing.${key}"]`).fill(value);
  }
  await page.locator('[id="billing.country"]').click();
  await page.getByRole('option', { name: /Netherlands/i }).click();
}
