import { randomUUID } from 'node:crypto';
import { expect } from '@playwright/test';
import { unwrap } from './fixtures.mjs';

export const ITEMS = [
  { product_name: 'Acceptance A', unit_price: 1999, quantity: 2 },
  { product_name: 'Acceptance B', unit_price: 2501, quantity: 1 },
  { product_name: 'Acceptance C', unit_price: 1200, quantity: 1 },
];
export async function seedCart(account, items = ITEMS) {
  const cart = unwrap(await account.db.from('carts').insert({ user_id: account.id, user_email: account.email }).select().single(), 'Create real test cart');
  const rows = items.map((item, i) => ({ cart_id: cart.id, product_id: randomUUID(), variant_id: String(90000 + i), custom_image_url: '/zoe.png', is_selected: true, ...item }));
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
