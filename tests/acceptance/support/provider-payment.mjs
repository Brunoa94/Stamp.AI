import { expect } from '@playwright/test';
import { required } from './environment.mjs';
import { unwrap } from './fixtures.mjs';

async function json(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(15000) });
  expect(response.ok, `Provider verification HTTP ${response.status}`).toBe(true);
  return response.json();
}
export async function verifyProviderPayment(account, env, order, expected) {
  const transactions = unwrap(await account.db.from('payment_transactions').select('*').eq('order_id', order.id), 'Read provider transaction');
  expect(transactions).toHaveLength(1);
  const transaction = transactions[0];
  if (order.payment_provider === 'stripe') {
    expect(transaction.stripe_payment_intent_id).toMatch(/^pi_/);
    const payment = await json(`https://api.stripe.com/v1/payment_intents/${encodeURIComponent(transaction.stripe_payment_intent_id)}`, { headers: { Authorization: `Bearer ${required(env, 'STRIPE_SECRET_KEY')}` } });
    expect(payment.livemode).toBe(false);
    expect(payment.status).toBe('succeeded');
    expect(payment.amount_received).toBe(expected.totalCents);
    expect(payment.currency).toBe('eur');
    return payment;
  }
  if (order.payment_provider === 'mollie') {
    expect(transaction.mollie_payment_id).toMatch(/^tr_/);
    const payment = await json(`https://api.mollie.com/v2/payments/${encodeURIComponent(transaction.mollie_payment_id)}`, { headers: { Authorization: `Bearer ${required(env, 'MOLLIE_API_KEY')}` } });
    expect(payment.mode).toBe('test');
    expect(payment.status).toBe('paid');
    expect(payment.amount.currency).toBe('EUR');
    expect(Math.round(Number(payment.amount.value) * 100)).toBe(expected.totalCents);
    return payment;
  }
  expect(order.payment_provider).toBe('paypal');
  expect(transaction.paypal_capture_id).toBeTruthy();
  const basic = Buffer.from(`${required(env, 'PAYPAL_CLIENT_ID')}:${required(env, 'PAYPAL_CLIENT_SECRET')}`).toString('base64');
  const token = await json('https://api-m.sandbox.paypal.com/v1/oauth2/token', { method: 'POST', headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials' });
  const payment = await json(`https://api-m.sandbox.paypal.com/v2/payments/captures/${encodeURIComponent(transaction.paypal_capture_id)}`, { headers: { Authorization: `Bearer ${token.access_token}` } });
  expect(payment.status).toBe('COMPLETED');
  expect(payment.amount.currency_code).toBe('EUR');
  expect(Math.round(Number(payment.amount.value) * 100)).toBe(expected.totalCents);
  expect(payment.supplementary_data.related_ids.order_id).toBe(transaction.paypal_order_id);
  return payment;
}
