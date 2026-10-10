import { randomUUID } from 'node:crypto';
import { expect } from '@playwright/test';
import { unwrap } from './fixtures.mjs';
import { required } from './environment.mjs';

export async function realOrder(account, env, quantities = [1]) {
  const productId = required(env, 'TEST_PRINTIFY_PRODUCT_ID');
  const variantId = Number(required(env, 'TEST_PRINTIFY_VARIANT_ID'));
  if (!Number.isSafeInteger(variantId)) throw new Error('Invalid test variant ID');
  const product = await account.orders.request(`products/${encodeURIComponent(productId)}.json`);
  expect(product.variants.some(v => v.id === variantId && v.is_enabled)).toBe(true);
  const provider = await account.orders.create({
    line_items: quantities.map(quantity => ({ product_id: productId, variant_id: variantId, quantity })),
    shipping_method: 1,
    address_to: { first_name: 'Acceptance', last_name: 'Test', email: account.email, phone: '+31600000000', country: 'NL', region: '', address1: 'Damrak 1', address2: '', city: 'Amsterdam', zip: '1012LG' },
  });
  const order = unwrap(await account.db.from('orders').insert({
    user_id: account.id, customer_email: account.email, order_number: `acceptance-${randomUUID()}`,
    printify_order_id: provider.id, status: 'pending', payment_status: 'pending', currency: 'EUR',
  }).select().single(), 'Persist linked real order');
  return { order, provider, productId, variantId };
}
