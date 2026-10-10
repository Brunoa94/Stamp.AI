/* Playwright fixtures establish sessions even when their value is unused. */
/* eslint @typescript-eslint/no-unused-vars: ["warn", {"argsIgnorePattern": "^(suppliedUser|account)$"}] */
import { test, expect, unwrap } from '../support/fixtures.mjs';
import { purchaseSetup, pay, verifyPurchase } from '../support/purchase.mjs';
import { observeAnalytics } from '../support/analytics.mjs';
import { verifyProviderPayment } from '../support/provider-payment.mjs';

for (const provider of ['stripe', 'paypal', 'mollie']) {
  for (const subset of [false, true]) {
    test(`PAY-01 PAY-02 ORDER-01 ${provider} ${subset ? 'selected subset' : 'single item'} real purchase`, async ({ page, account, env }) => {
      test.setTimeout(240000);
      const expected = await purchaseSetup(page, account, env, subset);
      if (process.env.ACCEPTANCE_DEBUG_PRINTIFY === '1') {
        page.on('request', request => {
          if (request.url().includes('/create-printify-order')) console.log('Printify create request started');
          if (request.url().includes('/api/paypal/capture-order')) console.log('PayPal capture request started');
        });
        page.on('requestfailed', request => {
          if (request.url().includes('/create-printify-order')) console.log('Printify create request failed:', request.failure()?.errorText);
          if (request.url().includes('/api/paypal/capture-order')) console.log('PayPal capture request failed:', request.failure()?.errorText);
          if (new URL(request.url()).hostname.endsWith('.supabase.co')) console.log('Test Supabase request failed:', new URL(request.url()).pathname, request.failure()?.errorText);
        });
        page.on('response', async response => {
          if (response.url().includes('/api/paypal/capture-order')) console.log('PayPal capture response:', response.status());
          if (!response.url().includes('/create-printify-order')) return;
          const body = await response.json().catch(() => ({}));
          console.log('Printify create response:', response.status(), JSON.stringify({ code: body.code, error: body.error, message: body.message }));
        });
      }
      await pay(page, env, provider);
      const order = await verifyPurchase(account, expected, provider);
      await verifyProviderPayment(account, env, order, expected);
      await page.reload();
      expect(unwrap(await account.db.from('orders').select('id').eq('user_id', account.id), 'Verify no duplicate after refresh')).toHaveLength(1);
    });
  }
}
test('PAY-03 declined Stripe payment creates no paid order', async ({ page, account, env }) => {
  await purchaseSetup(page, account, env);
  await pay(page, env, 'stripe', { decline: true });
  await expect(page.getByRole('alert').filter({ hasText: /declin|failed/i }).first()).toBeVisible();
  expect(unwrap(await account.db.from('orders').select('id').eq('user_id', account.id).eq('payment_status', 'paid'), 'Verify no paid order')).toEqual([]);
});
test('PAY-07 fabricated return parameters cannot create a paid order', async ({ page, account }) => {
  await page.goto('/checkout/mollie-return?payment_id=tr_not_real&status=paid');
  await expect(page.getByText(/error|failed|not found|unable|missing/i).filter({ visible: true }).first()).toBeVisible();
  expect(unwrap(await account.db.from('orders').select('id').eq('user_id', account.id).eq('payment_status', 'paid'), 'Read orders')).toEqual([]);
});
test('GA-05 GA-06 purchase sends once with EUR value and stable transaction ID', async ({ page, account, env }) => {
  test.setTimeout(240000);
  const ga = await observeAnalytics(page, env);
  const expected = await purchaseSetup(page, account, env);
  await pay(page, env, 'stripe');
  const order = await verifyPurchase(account, expected, 'stripe');
  const [event] = await ga.wait('purchase');
  expect(event.cu ?? event['ep.currency']).toBe('EUR');
  expect(Number(event['epn.value'])).toBe(expected.totalCents / 100);
  expect(event['ep.transaction_id']).toBeTruthy();
  await page.reload();
  await page.goto('/orders');
  await expect(page.getByText(`#${order.order_number}`, { exact: true })).toBeVisible();
  expect(ga.events.filter(e => e.en === 'purchase')).toHaveLength(1);
  ga.assertPrivate();
});
test('PAY-05 double-submit Stripe payment creates one transaction, order and fulfillment', async ({ page, account, env }) => {
  test.setTimeout(240000);
  const expected = await purchaseSetup(page, account, env);
  await pay(page, env, 'stripe', { doubleSubmit: true });
  const order = await verifyPurchase(account, expected, 'stripe');
  await verifyProviderPayment(account, env, order, expected);
  await page.reload();
  const orders = unwrap(await account.db.from('orders').select('id,printify_order_id').eq('user_id', account.id), 'Read double-submit orders');
  expect(orders).toEqual([{ id: order.id, printify_order_id: order.printify_order_id }]);
  const transactions = unwrap(await account.db.from('payment_transactions').select('id,status').eq('user_id', account.id), 'Read all transactions for isolated buyer');
  expect(transactions).toHaveLength(1);
  expect(transactions[0].status).toBe('succeeded');
});
