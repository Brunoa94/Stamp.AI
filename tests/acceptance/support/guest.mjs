import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect } from '@playwright/test';
import { describeDesign } from './browser.mjs';
import { selectProduct, createProduct } from './customization.mjs';
import { required } from './environment.mjs';
import { unwrap } from './fixtures.mjs';
import { proceed, fillAddress } from './cart.mjs';

// The guest bag lives in localStorage under this key (LocalCartStorageService).
const LOCAL_CART_KEY = 'local_cart';

/** Cart lines (cart-fixture shape) as a guest's local bag entries. */
function toLocalItems(items) {
  return items.map(item => ({
    id: randomUUID(),
    productId: item.product_id ?? randomUUID(),
    variantId: String(item.variant_id ?? 90000),
    productName: item.product_name,
    unitPrice: item.unit_price,
    quantity: item.quantity,
    customImageUrl: '/zoe.png',
    blueprintId: null,
    printProviderId: null,
    isSelected: true,
    createdAt: Date.now(),
  }));
}

/** Puts items in the guest's local bag, as a visitor with no session would have it. */
export async function seedLocalCart(page, items) {
  await page.goto('/');
  await page.evaluate(([key, value]) => localStorage.setItem(key, value), [
    LOCAL_CART_KEY,
    JSON.stringify({ items: toLocalItems(items), timestamp: Date.now() }),
  ]);
}

/** The guest's local bag as the browser holds it. */
export async function readLocalCart(page) {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? 'null')?.items ?? [], LOCAL_CART_KEY);
}

export function localLines(items) {
  return items.map(i => ({ product: i.productId, variant: String(i.variantId), quantity: i.quantity })).sort((a, b) => a.product.localeCompare(b.product));
}
export function databaseLines(rows) {
  return rows.map(i => ({ product: i.product_id, variant: String(i.variant_id), quantity: i.quantity })).sort((a, b) => a.product.localeCompare(b.product));
}

/** Real cart fixtures (Printify products whose blueprint price matches) for guest payments. */
export function purchaseFixtures(env) {
  if (env.TEST_PRINTIFY_MANUAL_APPROVAL !== 'confirmed') throw new Error('Verify Printify manual approval before purchase tests');
  if (env.TEST_EDGE_ENVIRONMENT_VERIFIED !== env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('Verify deployed Edge Functions use the parallel DB before guest purchase tests');
  return JSON.parse(readFileSync(required(env, 'TEST_CART_FIXTURES_PATH'), 'utf8'));
}

/** The anonymous user's database carts with their items. */
export async function guestCarts(guest, userId) {
  return unwrap(await guest.admin.from('carts').select('id,cart_items(*)').eq('user_id', userId), 'Read guest database carts');
}

/** The one anonymous user the browser signed in during this test. */
export function anonymousId(guest) {
  const ids = guest.ids();
  expect(ids, 'Exactly one anonymous guest session').toHaveLength(1);
  return ids[0];
}

/** /cart → /checkout with the billing address filled in. */
export async function goToCheckout(page, email) {
  await page.goto('/cart');
  await proceed(page);
  await fillAddress(page, email);
}

/**
 * Clicks the Stripe pay button but stops the payment-intent call, so the
 * guest's database cart is written and no payment is made.
 */
export async function startStripePaymentWithoutPaying(page) {
  await page.route('**/functions/v1/create-payment-intent', route => route.abort());
  const attempted = page.waitForRequest(r => r.url().includes('/functions/v1/create-payment-intent'), { timeout: 60000 });
  await page.getByRole('radio', { name: /credit|card|stripe/i }).click();
  await page.getByRole('checkbox', { name: /test mode/i }).check();
  await page.getByRole('button', { name: /^pay /i }).click();
  await attempted;
  await page.unroute('**/functions/v1/create-payment-intent');
}

/** Starts an iDEAL payment and cancels it on Mollie's test checkout. */
export async function cancelIdealPayment(page, env) {
  required(env, 'MOLLIE_API_KEY');
  await page.getByRole('radio', { name: /ideal/i }).click();
  await page.getByRole('button', { name: /ideal/i }).filter({ visible: true }).click();
  await page.waitForURL(/mollie\.com/);
  await page.getByRole('radio', { name: /^cancel+ed$/i }).or(page.getByRole('button', { name: /^cancel+ed$/i })).first().click();
  const next = page.getByRole('button', { name: /^continue$/i });
  if (await next.isVisible()) await next.click();
  await page.waitForURL(/\/checkout\/mollie-return/, { timeout: 60000 });
  await expect(page.getByText(/cancel+ed/i).filter({ visible: true }).first()).toBeVisible({ timeout: 60000 });
}

/**
 * A guest's own design: upload, skip AI editing, create a real product and
 * bag it. Product creation starts the anonymous session.
 */
export async function createGuestProduct(page, env) {
  await describeDesign(page);
  await page.getByRole('button', { name: /proceed without editing|use.*photo|skip.*editing/i }).filter({ visible: true }).click();
  await page.getByRole('button', { name: /use this image/i }).filter({ visible: true }).click();
  const name = required(env, 'TEST_PRODUCT_NAME');
  await selectProduct(page, page.locator('#step-5').getByRole('button', { name: `Select ${name}`, exact: true }));
  await page.getByRole('button', { name: /continue to customization/i }).filter({ visible: true }).click();
  await expect(page.getByRole('heading', { name: /customize your product/i })).toBeVisible();
  const created = await createProduct(page);
  await page.getByRole('button', { name: /^bag it$/i }).filter({ visible: true }).click();
  await expect(page).toHaveURL(/\/cart$/, { timeout: 30000 });
  return created;
}
