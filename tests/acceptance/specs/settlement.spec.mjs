import { createHmac } from 'node:crypto';
import { test, expect, unwrap } from '../support/fixtures.mjs';
import { purchaseSetup, pay, verifyPurchase } from '../support/purchase.mjs';
import { verifyProviderPayment } from '../support/provider-payment.mjs';
import { required } from '../support/environment.mjs';
import { waitForCancelableStatus } from '../support/cancellation.mjs';

async function stripeGet(env, path) {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, { headers: { Authorization: `Bearer ${required(env, 'STRIPE_SECRET_KEY')}` }, signal: AbortSignal.timeout(15000) });
  expect(response.ok).toBe(true);
  return response.json();
}
async function buy(page, account, env) {
  const expected = await purchaseSetup(page, account, env);
  await pay(page, env, 'stripe');
  const order = await verifyPurchase(account, expected, 'stripe');
  const payment = await verifyProviderPayment(account, env, order, expected);
  return { expected, order, payment };
}
test('ORDER-05 Stripe cancellation refunds captured funds exactly once', async ({ page, account, env }) => {
  test.setTimeout(240000);
  const { expected, order, payment } = await buy(page, account, env);
  await waitForCancelableStatus({ read: () => account.orders.request(`orders/${order.printify_order_id}.json`) });
  for (let attempt = 0; attempt < 2; attempt++) {
    expect(unwrap(await account.db.functions.invoke('cancel-order', { body: { order_id: order.id, cancellation_reason: 'Acceptance refund' } }), 'Cancel paid order').success).toBe(true);
  }
  await expect.poll(async () => {
    const charge = await stripeGet(env, `charges/${payment.latest_charge}`);
    expect(charge.livemode).toBe(false);
    return charge.amount_refunded;
  }, { timeout: 60000 }).toBe(expected.totalCents);
  const refunds = await stripeGet(env, `refunds?payment_intent=${payment.id}`);
  expect(refunds.data).toHaveLength(1);
  expect(refunds.data[0].status).toBe('succeeded');
  const recorded = unwrap(await account.db.from('refunds').select('*').eq('order_id', order.id), 'Read persisted refund');
  expect(recorded).toHaveLength(1);
  expect(recorded[0].provider_refund_id).toBe(refunds.data[0].id);
  expect(recorded[0].status).toBe('completed');
  expect(Math.round(Number(recorded[0].amount) * 100)).toBe(expected.totalCents);
});
test('ORDER-06 invoice download is a real PDF with an exact stable order snapshot', async ({ page, account, env }) => {
  test.setTimeout(240000);
  const { expected, order } = await buy(page, account, env);
  for (let attempt = 0; attempt < 2; attempt++) {
    const result = unwrap(await account.db.functions.invoke('generate-invoice', { body: { order_id: order.id } }), 'Generate invoice');
    expect(result.download_url).toBeTruthy();
    const url = new URL(result.download_url);
    expect(url.origin).toBe(env.NEXT_PUBLIC_SUPABASE_URL);
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    expect(response.ok).toBe(true);
    expect(Buffer.from(await response.arrayBuffer()).subarray(0, 5).toString()).toBe('%PDF-');
  }
  const invoices = unwrap(await account.db.from('invoices').select('*').eq('order_id', order.id).eq('type', 'invoice'), 'Read invoice snapshot');
  expect(invoices).toHaveLength(1);
  const invoice = invoices[0];
  expect(invoice.order_number).toBe(order.order_number);
  expect(invoice.customer_email).toBe(account.email);
  expect(invoice.currency.toUpperCase()).toBe('EUR');
  expect(Number(invoice.total_amount)).toBe(expected.totalCents);
  expect(Number(invoice.shipping_cost)).toBe(499);
  expect(invoice.line_items.map(i => [i.product_name, i.quantity]).sort()).toEqual(expected.selected.map(i => [i.product_name, i.quantity]).sort());
});
test('PAY-09 duplicate authentic Stripe events cannot duplicate payment, order or fulfillment', async ({ page, account, env }) => {
  test.setTimeout(240000);
  const secret = required(env, 'STRIPE_WEBHOOK_SECRET');
  const { order, payment } = await buy(page, account, env);
  let event;
  await expect.poll(async () => {
    const events = await stripeGet(env, 'events?type=payment_intent.succeeded&limit=100');
    event = events.data.find(e => e.data.object.id === payment.id);
    return Boolean(event);
  }, { timeout: 30000 }).toBe(true);
  expect(event.livemode).toBe(false);
  const body = JSON.stringify(event);
  for (let attempt = 0; attempt < 2; attempt++) {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex');
    const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/stripe-webhook`, {
      method: 'POST', signal: AbortSignal.timeout(15000), body,
      headers: { 'Content-Type': 'application/json', 'stripe-signature': `t=${timestamp},v1=${signature}` },
    });
    expect(response.ok).toBe(true);
  }
  const orders = unwrap(await account.db.from('orders').select('id,printify_order_id').eq('user_id', account.id), 'Read replayed orders');
  expect(orders).toEqual([{ id: order.id, printify_order_id: order.printify_order_id }]);
  expect(unwrap(await account.db.from('payment_transactions').select('id').eq('order_id', order.id), 'Read replayed transactions')).toHaveLength(1);
  const charge = await stripeGet(env, `charges/${payment.latest_charge}`);
  expect(charge.refunded).toBe(false);
});
