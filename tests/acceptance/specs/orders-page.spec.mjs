/* Playwright fixtures establish sessions even when their value is unused. */
/* eslint @typescript-eslint/no-unused-vars: ["warn", {"argsIgnorePattern": "^account$"}] */
import { test, expect, unwrap } from '../support/fixtures.mjs';
import { assertNoHorizontalOverflow } from '../support/browser.mjs';
import { realOrder } from '../support/orders.mjs';
import { waitForCancelableStatus } from '../support/cancellation.mjs';
import { purchaseSetup, pay, verifyPurchase } from '../support/purchase.mjs';
import { verifyProviderPayment } from '../support/provider-payment.mjs';
import { required } from '../support/environment.mjs';
import {
  seedOrders, tShirt, isOrdersListRequest, gotoOrders, loadingState, emptyState, errorState, orderCard, detailsDialog,
  cancelDialog, toast, visibleOrderNumbers, expectOrders, expectTotal, chooseFilter, openCancelDialog, recordCancellations,
  fulfillFunction, readOrder, readHistory, formatDate,
} from '../support/orders-page.mjs';

const TRACKING_HOST = 'https://tracking.example.test';

async function stripeGet(env, path) {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, { headers: { Authorization: `Bearer ${required(env, 'STRIPE_SECRET_KEY')}` }, signal: AbortSignal.timeout(15000) });
  expect(response.ok).toBe(true);
  return response.json();
}

test.describe('orders list', () => {
  test('ORDER-01 ORDER-11 list shows every owned order once, newest first, with its own details and actions', async ({ page, account, env }) => {
    const [pending, inProduction, shipped, delivered, cancelled, issues] = await seedOrders(account.admin, account, [
      { status: 'pending', total_amount: 4497, items: [tShirt({ quantity: 2, unit_price: 1999 })] },
      { status: 'processing', printify_status: 'in-production', payment_status: 'paid', total_amount: 2999, items: [tShirt({ product_name: 'Ceramic Mug (EU)', variant_name: '11oz', unit_price: 2500 })] },
      { status: 'shipped', printify_status: 'fulfilled', payment_status: 'paid', total_amount: 3498, tracking_number: 'TRACK-SHIPPED', tracking_url: `${TRACKING_HOST}/shipped`, items: [tShirt()] },
      { status: 'delivered', payment_status: 'paid', total_amount: 1999, items: [tShirt({ variant_name: 'Black / L' })] },
      { status: 'cancelled', total_amount: 1200, items: [tShirt({ product_name: 'Sublimation Crew Socks (EU)', variant_name: 'M' })] },
      { status: 'confirmed', printify_status: 'has-issues', payment_status: 'paid', total_amount: 2501, items: [tShirt()] },
    ]);
    // An order owned by another user must never reach this list.
    const [foreign] = await seedOrders(account.admin, { id: env.TEST_USER_ID, email: env.TEST_USER_EMAIL }, [{ status: 'pending' }]);
    try {
      await gotoOrders(page);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(/your orders/i);
      await expectTotal(page, 6);
      await expectOrders(page, [pending, inProduction, shipped, delivered, cancelled, issues].map(o => o.order_number));
      await expect(orderCard(page, foreign.order_number)).toHaveCount(0);

      const expectations = [
        [pending, 'Processing', 'Unisex Softstyle T-Shirt', 'White / M', '02 unit', '€44.97'],
        [inProduction, 'In production', 'Ceramic Mug (EU)', '11oz', '01 unit', '€29.99'],
        [shipped, 'Shipped', 'Unisex Softstyle T-Shirt', 'White / M', '01 unit', '€34.98'],
        [delivered, 'Delivered', 'Unisex Softstyle T-Shirt', 'Black / L', '01 unit', '€19.99'],
        [cancelled, 'Cancelled', 'Sublimation Crew Socks (EU)', 'M', '01 unit', '€12.00'],
        [issues, 'Needs attention', 'Unisex Softstyle T-Shirt', 'White / M', '01 unit', '€25.01'],
      ];
      for (const [order, badge, product, variant, quantity, total] of expectations) {
        const card = orderCard(page, order.order_number);
        await expect(card).toHaveCount(1);
        for (const text of [badge, product, variant, quantity, total, formatDate(order.created_at)]) {
          await expect(card.getByText(text, { exact: true })).toBeVisible();
        }
      }

      // Cancellation is offered only before production; everything else offers a reorder instead.
      const action = (order, name) => orderCard(page, order.order_number).getByRole('button', { name, exact: true });
      await expect(action(pending, 'Cancel order')).toBeVisible();
      await expect(action(pending, 'Reorder')).toHaveCount(0);
      for (const order of [inProduction, shipped, delivered, cancelled]) {
        await expect(action(order, 'Cancel order')).toHaveCount(0);
        await expect(action(order, 'Reorder')).toBeVisible();
      }
      await expect(action(delivered, 'View design')).toBeVisible();
      await expect(action(delivered, 'Track order')).toHaveCount(0);
      await expect(action(shipped, 'Track shipment')).toBeVisible();
      await expect(action(pending, 'Track shipment')).toHaveCount(0);
      await assertNoHorizontalOverflow(page);

      await page.reload();
      await expect(loadingState(page)).toHaveCount(0);
      await expect(orderCard(page, pending.order_number)).toHaveCount(1);
      await expectTotal(page, 6);
    } finally {
      unwrap(await account.admin.from('orders').delete().eq('id', foreign.id), 'Remove foreign seeded order');
    }
  });

  test('ORDER-02 loading state is shown while orders are fetched and replaced by the list', async ({ page, account }) => {
    const [order] = await seedOrders(account.admin, account, [{ items: [tShirt()] }]);
    let release;
    const held = new Promise(resolve => { release = resolve; });
    await page.route('**/rest/v1/orders?*', async route => {
      if (!isOrdersListRequest(route.request())) return route.fallback();
      await held;
      await route.fallback();
    });
    await page.goto('/orders');
    await expect(loadingState(page)).toBeVisible();
    await expect(loadingState(page)).toHaveAttribute('aria-busy', 'true');
    await expect(page.locator('article')).toHaveCount(0);
    await expect(emptyState(page)).toHaveCount(0);
    release();
    await expect(orderCard(page, order.order_number)).toBeVisible();
    await expect(loadingState(page)).toHaveCount(0);
  });

  test('ORDER-02 failed order fetch shows a recoverable error, never an empty history', async ({ page, account }) => {
    const [order] = await seedOrders(account.admin, account, [{ items: [tShirt()] }]);
    let failures = 0;
    const fail = async route => {
      if (!isOrdersListRequest(route.request())) return route.fallback();
      failures++;
      await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ code: 'XX000', message: 'Injected acceptance failure' }) });
    };
    await page.route('**/rest/v1/orders?*', fail);
    await page.goto('/orders');
    // The query client retries transient failures before surfacing the error.
    await expect(errorState(page)).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('Something went wrong. Give it another try.')).toBeVisible();
    await expect(emptyState(page)).toHaveCount(0);
    await expect(page.locator('article')).toHaveCount(0);
    expect(failures).toBeGreaterThanOrEqual(1);

    await page.unroute('**/rest/v1/orders?*', fail);
    const recovered = page.waitForResponse(r => isOrdersListRequest(r.request()) && r.ok());
    await page.getByRole('button', { name: 'Retry' }).click();
    await recovered;
    await expect(orderCard(page, order.order_number)).toBeVisible();
    await expect(errorState(page)).toHaveCount(0);
  });

  test('ORDER-02 account without orders sees the empty state and can start a design', async ({ page, account }) => {
    await gotoOrders(page);
    await expect(emptyState(page)).toBeVisible();
    await expect(emptyState(page).getByRole('heading', { name: 'No orders yet' })).toBeVisible();
    await expectTotal(page, 0);
    await expect(page.locator('article')).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'Pagination' })).toHaveCount(0);
    await emptyState(page).getByRole('button', { name: 'Start a design' }).click();
    await expect(page).toHaveURL(/\/stamp$/);
  });

  test('ORDER-02 pagination splits orders without duplicates or omissions', async ({ page, account }) => {
    const seeded = await seedOrders(account.admin, account, Array.from({ length: 12 }, (_, i) => ({ total_amount: 1000 + i, items: [tShirt()] })));
    const expected = seeded.map(o => o.order_number);
    await gotoOrders(page);
    const pagination = page.getByRole('navigation', { name: 'Pagination' });
    await expectTotal(page, 12);
    await expect(page.getByText('Showing 1-10 of 12 orders')).toBeVisible();
    await expect(pagination.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    await expect(pagination.getByRole('button', { name: 'Go to page 1' })).toHaveAttribute('aria-current', 'page');
    await expectOrders(page, expected.slice(0, 10));
    const first = await visibleOrderNumbers(page);

    await pagination.getByRole('button', { name: 'Next page' }).click();
    await expect(page.getByText('Showing 11-12 of 12 orders')).toBeVisible();
    await expect(pagination.getByRole('button', { name: 'Next page' })).toBeDisabled();
    await expect(pagination.getByRole('button', { name: 'Go to page 2' })).toHaveAttribute('aria-current', 'page');
    await expectOrders(page, expected.slice(10));
    const second = await visibleOrderNumbers(page);
    expect(new Set([...first, ...second]).size).toBe(12);

    await pagination.getByRole('button', { name: 'Go to page 1' }).click();
    await expect(page.getByText('Showing 1-10 of 12 orders')).toBeVisible();
    await expectOrders(page, first);
  });

  test('ORDER-02 status and date filters agree with counts and can be cleared', async ({ page, account }) => {
    const [recentCancelled, shipped, delivered, olderCancelled, oldPending] = await seedOrders(account.admin, account, [
      { status: 'cancelled', ageDays: 1 },
      { status: 'shipped', ageDays: 2 },
      { status: 'delivered', ageDays: 3 },
      { status: 'cancelled', ageDays: 45 },
      { status: 'pending', ageDays: 120 },
    ]);
    await gotoOrders(page);
    await expectTotal(page, 5);

    await chooseFilter(page, 'Filter by order status', 'Cancelled');
    await expectOrders(page, [recentCancelled.order_number, olderCancelled.order_number]);
    await expectTotal(page, 2);
    await expect(page.getByText('Status: cancelled', { exact: true })).toBeVisible();

    await chooseFilter(page, 'Filter by date range', 'Last 30 Days');
    await expectOrders(page, [recentCancelled.order_number]);
    await expectTotal(page, 1);

    await page.getByRole('button', { name: 'Clear Status: cancelled filter' }).click();
    await expect(loadingState(page)).toHaveCount(0);
    await expectOrders(page, [recentCancelled, shipped, delivered].map(o => o.order_number));

    await chooseFilter(page, 'Filter by date range', 'Last 90 Days');
    await expectOrders(page, [recentCancelled, shipped, delivered, olderCancelled].map(o => o.order_number));
    await expect(orderCard(page, oldPending.order_number)).toHaveCount(0);

    // A filter with no matches is an empty result, recoverable with "Clear filters".
    await chooseFilter(page, 'Filter by date range', 'Year 2023');
    await expect(emptyState(page)).toBeVisible();
    await expectTotal(page, 0);
    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(loadingState(page)).toHaveCount(0);
    await expectTotal(page, 5);
  });

  test('ORDER-02 processing filter lists every order whose badge reads Processing', async ({ page, account }) => {
    const [pending, confirmed, shipped] = await seedOrders(account.admin, account, [
      { status: 'pending' }, { status: 'confirmed' }, { status: 'shipped' },
    ]);
    await gotoOrders(page);
    for (const order of [pending, confirmed]) await expect(orderCard(page, order.order_number).getByText('Processing', { exact: true })).toBeVisible();
    await chooseFilter(page, 'Filter by order status', 'Processing');
    await expectOrders(page, [pending.order_number, confirmed.order_number]);
    await expect(orderCard(page, shipped.order_number)).toHaveCount(0);
  });

  test('ORDER-02 grid view exposes the same track and cancel actions', async ({ page, account }) => {
    test.skip(page.viewportSize().width < 1024, 'The view toggle is only rendered at the lg breakpoint');
    const [pending, delivered] = await seedOrders(account.admin, account, [{ status: 'pending', items: [tShirt()] }, { status: 'delivered', items: [tShirt()] }]);
    await gotoOrders(page);
    await page.getByRole('button', { name: 'Switch to grid view' }).click();
    await expect(page.getByRole('region', { name: 'Orders grid view' })).toBeVisible();
    await expectOrders(page, [pending.order_number, delivered.order_number]);

    await orderCard(page, pending.order_number).getByRole('button', { name: 'Track', exact: true }).click();
    await expect(detailsDialog(page)).toContainText(`Order #${pending.order_number}`);
    await page.keyboard.press('Escape');
    await expect(detailsDialog(page)).toHaveCount(0);

    await orderCard(page, pending.order_number).getByRole('button', { name: 'Options', exact: true }).click();
    await expect(cancelDialog(page)).toBeVisible();
    await cancelDialog(page).getByRole('button', { name: 'Keep order' }).click();
    await expect(cancelDialog(page)).toHaveCount(0);

    await orderCard(page, delivered.order_number).getByRole('button', { name: 'Reorder', exact: true }).click();
    await expect(page).toHaveURL(/\/stamp$/);
  });

  test('ORDER-07 unauthenticated visitors are sent away without loading any order', async ({ page }) => {
    const listRequests = [];
    page.on('request', request => { if (isOrdersListRequest(request)) listRequests.push(request.url()); });
    await page.goto('/orders');
    await expect.poll(() => new URL(page.url()).pathname).toBe('/');
    expect(new URL(page.url()).searchParams.get('redirectedFrom')).toBe('/orders');
    await expect(page.getByRole('heading', { name: /your orders/i })).toHaveCount(0);
    expect(listRequests).toEqual([]);
  });
});

test.describe('track order dialog', () => {
  test('ORDER-09 track order opens a dialog with the full order details and chronological timeline', async ({ page, account }) => {
    const now = Date.now();
    const [order] = await seedOrders(account.admin, account, [{
      status: 'shipped', printify_status: 'fulfilled', payment_status: 'paid', payment_method: 'stripe',
      customer_name: 'Acceptance Buyer', customer_phone: '+31600000000',
      shipping_address: { first_name: 'Acceptance', last_name: 'Buyer', address1: 'Damrak 1', city: 'Amsterdam', zip: '1012LG', country: 'NL' },
      subtotal: 3998, shipping_cost: 499, discount_amount: 500, promo_code: 'WELCOME5', total_amount: 3997,
      tracking_number: 'TRACK-0001', tracking_url: `${TRACKING_HOST}/TRACK-0001`, shipped_at: new Date(now - 86400000).toISOString(),
      items: [tShirt({ quantity: 2 })],
      // Inserted out of order: the timeline must sort chronologically.
      history: [
        { status: 'shipped', source: 'printify_sync', printify_status: 'fulfilled', created_at: new Date(now - 86400000).toISOString() },
        { status: 'confirmed', source: 'order_creation', created_at: new Date(now - 3 * 86400000).toISOString() },
        { status: 'processing', source: 'printify_sync', printify_status: 'in-production', created_at: new Date(now - 2 * 86400000).toISOString() },
      ],
    }]);
    await gotoOrders(page);
    await orderCard(page, order.order_number).getByRole('button', { name: 'Track order', exact: true }).click();

    const dialog = detailsDialog(page);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Close details modal' })).toBeFocused();
    await expect(dialog.getByRole('heading', { name: 'Order details' })).toBeVisible();
    await expect(dialog.getByText(`Order #${order.order_number} • Placed ${formatDate(order.created_at)}`)).toBeVisible();
    for (const text of [
      'Unisex Softstyle T-Shirt', 'Variant: White / M • Qty: 2', '€19.99', 'Acceptance Buyer', 'Amsterdam, NL', account.email, '+31600000000',
      'stripe', '€39.98', '€4.99', '-€5.00', '€39.97', 'Download invoice', 'Order timeline',
    ]) await expect(dialog.getByText(text, { exact: true }).first()).toBeVisible();
    await expect(dialog.getByText('(WELCOME5)')).toBeVisible();
    await expect(dialog.getByText('Shipped', { exact: true }).first()).toBeVisible();
    const trackingLinks = dialog.getByRole('link', { name: 'TRACK-0001' });
    await expect(trackingLinks).toHaveCount(2);
    for (const link of await trackingLinks.all()) await expect(link).toHaveAttribute('href', order.tracking_url);

    const timeline = dialog.locator('section').filter({ hasText: 'Order timeline' }).getByRole('listitem');
    await expect(timeline).toHaveCount(3);
    const labels = (await timeline.allTextContents()).map(text => text.match(/^(Processing|Shipped|Delivered|Cancelled)/)?.[1]);
    expect(labels).toEqual(['Processing', 'Processing', 'Shipped']);
    await assertNoHorizontalOverflow(page);

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    // The product thumbnail opens the same record; the backdrop and close button dismiss it.
    await page.getByRole('button', { name: `Open details for order ${order.order_number}` }).click();
    await expect(dialog).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(dialog).toHaveCount(0);
    await orderCard(page, order.order_number).getByRole('button', { name: 'Track order', exact: true }).click();
    await dialog.getByRole('button', { name: 'Close details modal' }).click();
    await expect(dialog).toHaveCount(0);
  });

  test('ORDER-09 delivered order is opened with View design and shows delivery dates', async ({ page, account }) => {
    const shippedAt = new Date(Date.now() - 5 * 86400000).toISOString();
    const deliveredAt = new Date(Date.now() - 2 * 86400000).toISOString();
    const [order] = await seedOrders(account.admin, account, [{
      status: 'delivered', payment_status: 'paid', total_amount: 1999, shipped_at: shippedAt, delivered_at: deliveredAt, items: [tShirt()],
      history: [{ status: 'confirmed', source: 'order_creation', created_at: shippedAt }, { status: 'delivered', source: 'printify_sync', created_at: deliveredAt }],
    }]);
    await gotoOrders(page);
    await orderCard(page, order.order_number).getByRole('button', { name: 'View design', exact: true }).click();
    const dialog = detailsDialog(page);
    await expect(dialog.getByText('Delivered', { exact: true }).first()).toBeVisible();
    await expect(dialog.getByText('Shipped', { exact: true })).toBeVisible();
    await expect(dialog.getByText(formatDate(shippedAt), { exact: true })).toBeVisible();
    await expect(dialog.getByText(formatDate(deliveredAt), { exact: true })).toBeVisible();
  });

  test('ORDER-09 unpaid order without items, address or history shows safe fallbacks', async ({ page, account }) => {
    const [order] = await seedOrders(account.admin, account, [{ status: 'pending', total_amount: null }]);
    await gotoOrders(page);
    await orderCard(page, order.order_number).getByRole('button', { name: 'Track order', exact: true }).click();
    const dialog = detailsDialog(page);
    for (const text of ['Custom Product', 'Variant: Standard • Qty: 1', 'Recipient', 'Shipping address', '€0.00']) {
      await expect(dialog.getByText(text, { exact: true }).first()).toBeVisible();
    }
    await expect(dialog.getByText('Processing', { exact: true })).toBeVisible();
    await expect(dialog.getByText('Order timeline')).toHaveCount(0);
    await expect(dialog.getByRole('button', { name: 'Download invoice' })).toHaveCount(0);
    await expect(dialog.getByText(/orders\.|statusBadge/)).toHaveCount(0);
  });

  test('ORDER-09 timeline failure leaves the rest of the dialog usable', async ({ page, account }) => {
    const [order] = await seedOrders(account.admin, account, [{
      status: 'confirmed', total_amount: 1999, items: [tShirt()], history: [{ status: 'confirmed', source: 'order_creation' }],
    }]);
    await page.route('**/rest/v1/order_status_history?*', route => route.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"Injected acceptance failure"}' }));
    await gotoOrders(page);
    await orderCard(page, order.order_number).getByRole('button', { name: 'Track order', exact: true }).click();
    const dialog = detailsDialog(page);
    await expect(dialog.getByText('Unisex Softstyle T-Shirt', { exact: true })).toBeVisible();
    await expect(dialog.getByText('€19.99', { exact: true }).first()).toBeVisible();
    await expect(dialog.getByText('Order timeline')).toHaveCount(0, { timeout: 30000 });
    await dialog.getByRole('button', { name: 'Close details modal' }).click();
    await expect(dialog).toHaveCount(0);
  });

  test('ORDER-09 track shipment opens the carrier page in a new tab', async ({ page, context, account }) => {
    const [order] = await seedOrders(account.admin, account, [{
      status: 'shipped', tracking_number: 'TRACK-POPUP', tracking_url: `${TRACKING_HOST}/TRACK-POPUP`, items: [tShirt()],
    }]);
    await context.route(`${TRACKING_HOST}/**`, route => route.fulfill({ contentType: 'text/html', body: '<title>Carrier</title>' }));
    await gotoOrders(page);
    const popup = context.waitForEvent('page');
    await orderCard(page, order.order_number).getByRole('button', { name: 'Track shipment', exact: true }).click();
    const carrier = await popup;
    await carrier.waitForLoadState();
    expect(carrier.url()).toBe(order.tracking_url);
    expect(await carrier.evaluate(() => window.opener)).toBeNull();
    await expect(page).toHaveURL(/\/orders$/);
  });
});

test.describe('cancel order', () => {
  test('ORDER-10 keeping the order closes the confirmation without any cancellation', async ({ page, account }) => {
    const [order] = await seedOrders(account.admin, account, [{ status: 'pending', items: [tShirt()] }]);
    const cancellations = recordCancellations(page);
    await gotoOrders(page);
    let dialog = await openCancelDialog(page, order.order_number);
    await expect(dialog.getByRole('heading', { name: 'Cancel this order?' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Keep order' })).toBeFocused();
    await dialog.getByRole('button', { name: 'Keep order' }).click();
    await expect(cancelDialog(page)).toHaveCount(0);
    dialog = await openCancelDialog(page, order.order_number);
    await page.keyboard.press('Escape');
    await expect(cancelDialog(page)).toHaveCount(0);

    expect(cancellations).toEqual([]);
    const row = await readOrder(account, order.id);
    expect(row.status).toBe('pending');
    expect(row.cancelled_at).toBeNull();
    await expect(orderCard(page, order.order_number).getByRole('button', { name: 'Cancel order', exact: true })).toBeVisible();
  });

  test('ORDER-04 ORDER-10 unpaid order is cancelled in the database and at Printify, without a refund', async ({ page, account, env }) => {
    test.setTimeout(240000);
    const { order, provider } = await realOrder(account, env);
    await waitForCancelableStatus({ read: () => account.orders.request(`orders/${provider.id}.json`) });
    const cancellations = recordCancellations(page);
    await gotoOrders(page);
    const card = orderCard(page, order.order_number);

    const dialog = await openCancelDialog(page, order.order_number);
    const response = page.waitForResponse(r => r.url().endsWith('/functions/v1/cancel-order') && r.request().method() === 'POST');
    await dialog.getByRole('button', { name: 'Cancel order', exact: true }).click();
    const result = await (await response).json();
    expect(result.success).toBe(true);
    expect(result.results).toMatchObject({ cancelled_at_printify: true, database_updated: true, refund_processed: false });

    const success = toast(page, 'success').filter({ hasText: 'Order cancelled' });
    await expect(success).toContainText('Order cancelled at Printify');
    await expect(success).not.toContainText('Refund');
    await expect(cancelDialog(page)).toHaveCount(0);
    await expect(card.getByText('Cancelled', { exact: true })).toBeVisible();
    await expect(card.getByRole('button', { name: 'Cancel order', exact: true })).toHaveCount(0);
    await expect(card.getByRole('button', { name: 'Reorder', exact: true })).toBeVisible();
    expect(cancellations).toEqual([{ order_id: order.id, cancellation_reason: 'Cancelled by customer' }]);

    const row = await readOrder(account, order.id);
    expect(row.status).toBe('cancelled');
    expect(row.cancelled_at).toBeTruthy();
    expect(row.cancellation_reason).toBe('Cancelled by customer');
    expect(row.payment_status).toBe('pending');
    expect((await account.orders.request(`orders/${provider.id}.json`)).status).toBe('canceled');
    expect((await readHistory(account, order.id)).filter(h => h.status === 'cancelled')).toEqual([{ status: 'cancelled', source: 'cancellation' }]);
    expect(unwrap(await account.admin.from('refunds').select('id').eq('order_id', order.id), 'Read refunds')).toEqual([]);

    await page.reload();
    await expect(loadingState(page)).toHaveCount(0);
    await expect(card.getByText('Cancelled', { exact: true })).toBeVisible();
    await card.getByRole('button', { name: 'Track order', exact: true }).click();
    const details = detailsDialog(page);
    await expect(details.getByText('Cancelled', { exact: true }).first()).toBeVisible();
    await expect(details.locator('section').filter({ hasText: 'Order timeline' }).getByRole('listitem').last()).toHaveText(/^Cancelled/);
  });

  test('ORDER-05 ORDER-10 paid Stripe order is cancelled at Printify and refunded exactly once', async ({ page, account, env }) => {
    test.setTimeout(360000);
    const expected = await purchaseSetup(page, account, env);
    await pay(page, env, 'stripe');
    const order = await verifyPurchase(account, expected, 'stripe');
    const payment = await verifyProviderPayment(account, env, order, expected);
    await waitForCancelableStatus({ read: () => account.orders.request(`orders/${order.printify_order_id}.json`) });

    const cancellations = recordCancellations(page);
    await gotoOrders(page);
    const card = orderCard(page, order.order_number);
    await expect(card.getByText(`€${(expected.totalCents / 100).toFixed(2)}`, { exact: true })).toBeVisible();
    const dialog = await openCancelDialog(page, order.order_number);
    const response = page.waitForResponse(r => r.url().endsWith('/functions/v1/cancel-order') && r.request().method() === 'POST', { timeout: 60000 });
    await dialog.getByRole('button', { name: 'Cancel order', exact: true }).click();
    const result = await (await response).json();
    expect(result.results).toMatchObject({ cancelled_at_printify: true, database_updated: true, refund_processed: true });
    expect(result.results.refund_id).toMatch(/^re_/);

    const success = toast(page, 'success').filter({ hasText: 'Order cancelled' });
    await expect(success).toContainText('Order cancelled at Printify');
    await expect(success).toContainText('Refund processed successfully');
    await expect(card.getByText('Cancelled', { exact: true })).toBeVisible();
    expect(cancellations).toHaveLength(1);

    // Provider truth: the full captured amount is refunded once, in test mode.
    await expect.poll(async () => (await stripeGet(env, `charges/${payment.latest_charge}`)).amount_refunded, { timeout: 60000 }).toBe(expected.totalCents);
    const refunds = await stripeGet(env, `refunds?payment_intent=${payment.id}`);
    expect(refunds.data).toHaveLength(1);
    expect(refunds.data[0]).toMatchObject({ id: result.results.refund_id, status: 'succeeded', amount: expected.totalCents, currency: 'eur' });
    expect((await account.orders.request(`orders/${order.printify_order_id}.json`)).status).toBe('canceled');

    const row = await readOrder(account, order.id);
    expect(row).toMatchObject({ status: 'cancelled', payment_status: 'refunded', cancellation_reason: 'Cancelled by customer' });
    const recorded = unwrap(await account.admin.from('refunds').select('*').eq('order_id', order.id), 'Read persisted refund');
    expect(recorded).toHaveLength(1);
    expect(recorded[0]).toMatchObject({ provider_refund_id: refunds.data[0].id, status: 'completed', payment_provider: 'stripe' });
    expect(Math.round(Number(recorded[0].amount) * 100)).toBe(expected.totalCents);
    const transactions = unwrap(await account.admin.from('payment_transactions').select('status').eq('order_id', order.id), 'Read payment transaction');
    expect(transactions).toEqual([{ status: 'refunded' }]);
    expect((await readHistory(account, order.id)).filter(h => h.status === 'cancelled')).toEqual([{ status: 'cancelled', source: 'cancellation' }]);
  });

  test('ORDER-04 double-clicking confirm sends one cancellation and records it once', async ({ page, account }) => {
    const [order] = await seedOrders(account.admin, account, [{ status: 'pending', items: [tShirt()] }]);
    const cancellations = recordCancellations(page);
    await gotoOrders(page);
    const dialog = await openCancelDialog(page, order.order_number);
    await dialog.getByRole('button', { name: 'Cancel order', exact: true }).dblclick();
    await expect(toast(page, 'success').filter({ hasText: 'Order cancelled' }).first()).toBeVisible();
    await expect(orderCard(page, order.order_number).getByText('Cancelled', { exact: true })).toBeVisible();
    expect(cancellations).toHaveLength(1);
    expect((await readOrder(account, order.id)).status).toBe('cancelled');
    expect(await readHistory(account, order.id)).toEqual([{ status: 'cancelled', source: 'cancellation' }]);
  });

  test('ORDER-04 server rejects cancellation after a concurrent move into production', async ({ page, account }) => {
    const [order] = await seedOrders(account.admin, account, [{ status: 'confirmed', items: [tShirt()] }]);
    await gotoOrders(page);
    // The page still shows the stale, cancellable state when production starts.
    unwrap(await account.admin.from('orders').update({ status: 'processing', printify_status: 'in-production' }).eq('id', order.id), 'Move order into production');
    const dialog = await openCancelDialog(page, order.order_number);
    const response = page.waitForResponse(r => r.url().endsWith('/functions/v1/cancel-order') && r.request().method() === 'POST');
    await dialog.getByRole('button', { name: 'Cancel order', exact: true }).click();
    expect((await response).status()).toBe(400);
    await expect(toast(page, 'error').first()).toBeVisible();
    await expect(toast(page, 'success')).toHaveCount(0);

    const row = await readOrder(account, order.id);
    expect(row.status).toBe('processing');
    expect(row.cancelled_at).toBeNull();
    expect(await readHistory(account, order.id)).toEqual([]);
  });

  test('ORDER-10 failed cancellation keeps the order active and can be retried', async ({ page, account }) => {
    const [order] = await seedOrders(account.admin, account, [{ status: 'pending', items: [tShirt()] }]);
    const failCancellation = route => fulfillFunction(route, 409, { success: false, message: 'Printify cancellation could not be verified', results: { cancelled_at_printify: false } });
    await page.route('**/functions/v1/cancel-order', failCancellation);
    await gotoOrders(page);
    const dialog = await openCancelDialog(page, order.order_number);
    await dialog.getByRole('button', { name: 'Cancel order', exact: true }).click();
    await expect(toast(page, 'error').first()).toBeVisible({ timeout: 30000 });
    await expect(toast(page, 'success')).toHaveCount(0);
    await expect(dialog.getByRole('button', { name: 'Cancel order', exact: true })).toBeEnabled();
    expect((await readOrder(account, order.id)).status).toBe('pending');

    // Once the fault clears, the same confirmation succeeds against the real function.
    await page.unroute('**/functions/v1/cancel-order', failCancellation);
    await dialog.getByRole('button', { name: 'Cancel order', exact: true }).click();
    await expect(toast(page, 'success').filter({ hasText: 'Order cancelled' })).toBeVisible();
    await expect(orderCard(page, order.order_number).getByText('Cancelled', { exact: true })).toBeVisible();
    expect((await readOrder(account, order.id)).status).toBe('cancelled');
  });
});
