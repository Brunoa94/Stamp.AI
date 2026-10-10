import { randomUUID } from 'node:crypto';
import { expect } from '@playwright/test';
import { unwrap } from './fixtures.mjs';

const DAY = 86400000;
export const ITEM_IMAGE = '/products-images/kid t-shirt/kid-t-shirt-b-printed.png';

export function orderNumber() {
  return `ACC-${randomUUID().slice(0, 8).toUpperCase()}`;
}

// Seeded rows never carry a printify_order_id: teardown cancels every provider
// ID it discovers, so only orders that really exist at Printify may hold one.
// Specs are listed newest first; `ageDays` overrides the default spacing.
export async function seedOrders(admin, owner, specs) {
  const now = Date.now();
  const rows = specs.map((spec, index) => {
    const order = { ...spec };
    for (const key of ['items', 'history', 'ageDays']) delete order[key];
    return {
      user_id: owner.id, customer_email: owner.email, order_number: orderNumber(),
      status: 'pending', payment_status: 'pending', currency: 'EUR',
      created_at: new Date(now - (spec.ageDays ?? 0) * DAY - index * 60000).toISOString(),
      ...order,
    };
  });
  if (rows.some(row => row.printify_order_id)) throw new Error('Seeded orders must not reference Printify orders');
  const orders = unwrap(await admin.from('orders').insert(rows).select(), 'Seed orders');
  const byNumber = new Map(orders.map(order => [order.order_number, order]));
  const seeded = rows.map(row => byNumber.get(row.order_number));
  const items = specs.flatMap((spec, index) => (spec.items ?? []).map(item => ({
    order_id: seeded[index].id, custom_image_url: ITEM_IMAGE, total_price: item.unit_price * item.quantity, ...item,
  })));
  if (items.length) unwrap(await admin.from('order_items').insert(items), 'Seed order items');
  const history = specs.flatMap((spec, index) => (spec.history ?? []).map(entry => ({ order_id: seeded[index].id, ...entry })));
  if (history.length) unwrap(await admin.from('order_status_history').insert(history), 'Seed order status history');
  return seeded;
}

export function tShirt(overrides = {}) {
  return { product_name: 'Unisex Softstyle T-Shirt', variant_name: 'White / M', quantity: 1, unit_price: 1999, ...overrides };
}

export function isOrdersListRequest(request) {
  const url = new URL(request.url());
  return request.method() === 'GET' && url.pathname.endsWith('/rest/v1/orders') && (url.searchParams.get('select') ?? '').includes('order_items');
}

export async function gotoOrders(page) {
  const response = page.waitForResponse(r => isOrdersListRequest(r.request()));
  await page.goto('/orders');
  expect((await response).ok()).toBe(true);
  await expect(loadingState(page)).toHaveCount(0);
}

export const loadingState = page => page.getByRole('status', { name: 'Loading orders', exact: true });
export const emptyState = page => page.getByRole('region', { name: 'Empty order archive' });
export const errorState = page => page.getByRole('heading', { name: "We couldn't load your orders" });
export const orderCard = (page, number) => page.locator('article').filter({ hasText: `#${number}` });
export const detailsDialog = page => page.getByRole('dialog', { name: 'Order details', exact: true });
export const cancelDialog = page => page.getByRole('dialog', { name: 'Cancel order confirmation', exact: true });
export const toast = (page, type) => page.locator(`[data-sonner-toast][data-type="${type}"]`);

/** Order numbers in render order; the seeded format is fixed-length. */
export async function visibleOrderNumbers(page) {
  return page.locator('article').evaluateAll(cards => cards.map(card => card.textContent.match(/#(ACC-[0-9A-F]{8})/)?.[1]));
}

export async function expectTotal(page, total) {
  await expect(page.getByText('Total orders', { exact: true }).locator('xpath=..')).toHaveText(new RegExp(`Total orders\\s*${total}\\s*Orders`));
}

export async function chooseFilter(page, name, option) {
  await page.getByRole('combobox', { name }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
  await expect(loadingState(page)).toHaveCount(0);
}

export async function openCancelDialog(page, number) {
  await orderCard(page, number).getByRole('button', { name: 'Cancel order', exact: true }).click();
  await expect(cancelDialog(page)).toBeVisible();
  return cancelDialog(page);
}

/** Records every browser cancellation request so tests can prove how many left the page. */
export function recordCancellations(page) {
  const requests = [];
  page.on('request', request => {
    if (request.method() === 'POST' && request.url().endsWith('/functions/v1/cancel-order')) requests.push(request.postDataJSON());
  });
  return requests;
}

/** Fulfills cross-origin Edge Function calls, answering the CORS preflight as the real function does. */
export async function fulfillFunction(route, status, body) {
  const headers = {
    'access-control-allow-origin': route.request().headers().origin ?? 'http://localhost:3107',
    'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
    'access-control-allow-methods': 'POST, OPTIONS',
  };
  if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
  return route.fulfill({ status, headers, contentType: 'application/json', body: JSON.stringify(body) });
}

export async function readOrder(account, id) {
  return unwrap(await account.db.from('orders').select('*').eq('id', id).single(), 'Read order');
}

export async function readHistory(account, id) {
  return unwrap(await account.db.from('order_status_history').select('status,source').eq('order_id', id), 'Read order status history');
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export async function expectOrders(page, numbers) {
  await expect.poll(() => visibleOrderNumbers(page)).toEqual(numbers);
}

/** Calls an Edge Function as the signed-in user, exactly as a crafted client request would. */
export async function callFunction(env, db, name, body) {
  const { data: { session } } = await db.auth.getSession();
  if (!session) throw new Error('No session for direct function call');
  const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST', body: JSON.stringify(body), signal: AbortSignal.timeout(60000),
    headers: { Authorization: `Bearer ${session.access_token}`, apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
  });
  return { status: response.status, body: await response.json().catch(() => null) };
}

export async function readRefunds(account, orderId) {
  return unwrap(await account.admin.from('refunds').select('*').eq('order_id', orderId), 'Read refunds');
}
