/**
 * E2E Tests for Payment Registration, PayPal Capture & Cancellation Refund
 *
 * Regression coverage for the migration-drift bugs fixed in:
 *  - 20260714000005 (paypal_order_id UNIQUE)  -> upsert / capture ON CONFLICT works
 *  - 20260714000006 (status CHECK + captured_at)
 *      * payment rows in 'pending' / 'processing' must be insertable (they weren't:
 *        two conflicting CHECK constraints excluded both statuses, so create-*-payment
 *        never recorded a row -> "not all payment_transactions registered")
 *      * payment_transactions.captured_at must exist (atomic capture RPCs write it)
 *  - 20260714000007 (process_refund_atomic no longer references dropped
 *        orders.internal_notes / refund_failed -> refunds actually record)
 *
 * Runs real DB operations via the service-role client (same pattern as
 * data-integrity.e2e.spec.ts). Prefer running against a test database.
 */

import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const uid = () => crypto.randomUUID();
const stamp = () => `${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;
// payment_transactions.user_id / orders.user_id FK auth.users; use NULL for throwaway rows.
const NO_USER = null;

// Track rows created per test so we can clean up (payments before orders: FK order).
const createdPaymentIds: string[] = [];
const createdOrderIds: string[] = [];

async function insertOrder(fields: Record<string, unknown>): Promise<string> {
  const id = uid();
  const { error } = await supabaseAdmin.from('orders').insert({
    id,
    order_number: `TEST-E2E-${stamp()}`,
    customer_email: 'e2e@example.com',
    ...fields,
  });
  expect(error, `order insert: ${error?.message}`).toBeNull();
  createdOrderIds.push(id);
  return id;
}

async function insertPayment(fields: Record<string, unknown>): Promise<string> {
  const id = uid();
  const { error } = await supabaseAdmin.from('payment_transactions').insert({ id, ...fields });
  expect(error, `payment insert: ${error?.message}`).toBeNull();
  createdPaymentIds.push(id);
  return id;
}

test.afterEach(async () => {
  if (createdPaymentIds.length) {
    await supabaseAdmin.from('payment_transactions').delete().in('id', createdPaymentIds);
    createdPaymentIds.length = 0;
  }
  if (createdOrderIds.length) {
    await supabaseAdmin.from('orders').delete().in('id', createdOrderIds);
    createdOrderIds.length = 0;
  }
});

test.describe('Payment transaction registration', () => {
  // Regression: 'pending' was rejected by the conflicting status CHECK constraints,
  // so create-payment-intent / create-paypal-order silently failed to record a row.
  test('records a pending payment row', async () => {
    const id = await insertPayment({
      user_id: NO_USER,
      payment_provider: 'stripe',
      stripe_payment_intent_id: `pi_test_pending_${stamp()}`,
      amount: 100,
      currency: 'usd',
      status: 'pending',
      payment_method_type: 'card',
    });
    const { data } = await supabaseAdmin
      .from('payment_transactions')
      .select('status')
      .eq('id', id)
      .single();
    expect(data?.status).toBe('pending');
  });

  test('accepts every status the app uses', async () => {
    for (const status of ['pending', 'processing', 'succeeded', 'failed', 'refunded', 'canceled']) {
      await insertPayment({
        user_id: NO_USER,
        payment_provider: 'stripe',
        stripe_payment_intent_id: `pi_test_${status}_${stamp()}`,
        amount: 50,
        currency: 'usd',
        status,
        payment_method_type: 'card',
      });
    }
    // If any status were rejected, insertPayment's expect(error).toBeNull() would fail.
  });
});

test.describe('PayPal capture flow', () => {
  // create-order records a pending row; capture-order runs atomic_paypal_payment_capture,
  // which sets status='succeeded' + captured_at and flips the order to paid.
  test('atomic_paypal_payment_capture marks paid and sets captured_at', async () => {
    const paypalOrderId = `paypal_test_capture_${stamp()}`;
    const orderId = await insertOrder({ status: 'pending', payment_status: 'pending', total_amount: 40, currency: 'eur' });
    await insertPayment({
      user_id: NO_USER,
      order_id: orderId,
      payment_provider: 'paypal',
      paypal_order_id: paypalOrderId,
      amount: 40,
      currency: 'eur',
      status: 'pending',
      payment_method_type: 'paypal',
    });

    const { data: result, error } = await supabaseAdmin.rpc('atomic_paypal_payment_capture', {
      p_paypal_order_id: paypalOrderId,
      p_paypal_capture_id: `CAP_${stamp()}`,
      p_amount: 40,
      p_currency: 'eur',
      p_captured_at: new Date().toISOString(),
    });

    expect(error, error?.message).toBeNull();
    expect(result?.success).toBe(true);

    const { data: payment } = await supabaseAdmin
      .from('payment_transactions')
      .select('status, captured_at, paypal_capture_id')
      .eq('paypal_order_id', paypalOrderId)
      .single();
    expect(payment?.status).toBe('succeeded');
    expect(payment?.captured_at).toBeTruthy();

    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('payment_status')
      .eq('id', orderId)
      .single();
    expect(order?.payment_status).toBe('paid');
  });
});

test.describe('Cancellation refund flow', () => {
  // Cancelling a paid order runs process_refund_atomic, which must record the refund
  // (previously threw on the dropped orders.internal_notes column and rolled back).
  test('process_refund_atomic records the refund on a paid order', async () => {
    const orderId = await insertOrder({ status: 'cancelled', payment_status: 'paid', total_amount: 30, currency: 'usd' });
    const refundId = `re_test_${stamp()}`;
    await insertPayment({
      user_id: NO_USER,
      order_id: orderId,
      payment_provider: 'stripe',
      stripe_payment_intent_id: `pi_test_refund_${stamp()}`,
      amount: 30,
      currency: 'usd',
      status: 'succeeded',
      payment_method_type: 'card',
    });

    const { data: result, error } = await supabaseAdmin.rpc('process_refund_atomic', {
      p_order_id: orderId,
      p_refund_id: refundId,
      p_reason: 'customer_request',
      p_payment_provider: 'stripe',
    });

    expect(error, error?.message).toBeNull();
    expect(result?.success).toBe(true);
    expect(result?.transactions_updated).toBe(1);

    const { data: payment } = await supabaseAdmin
      .from('payment_transactions')
      .select('status, metadata')
      .eq('order_id', orderId)
      .single();
    expect(payment?.status).toBe('refunded');
    expect((payment?.metadata as { refund_id?: string })?.refund_id).toBe(refundId);
  });

  test('refund is idempotent (already-refunded row is not updated again)', async () => {
    const orderId = await insertOrder({ status: 'cancelled', payment_status: 'paid', total_amount: 30, currency: 'usd' });
    await insertPayment({
      user_id: NO_USER,
      order_id: orderId,
      payment_provider: 'stripe',
      stripe_payment_intent_id: `pi_test_refunded_${stamp()}`,
      amount: 30,
      currency: 'usd',
      status: 'refunded',
      payment_method_type: 'card',
    });

    const { data: result, error } = await supabaseAdmin.rpc('process_refund_atomic', {
      p_order_id: orderId,
      p_refund_id: `re_test_${stamp()}`,
      p_reason: 'customer_request',
      p_payment_provider: 'stripe',
    });

    expect(error, error?.message).toBeNull();
    expect(result?.success).toBe(true);
    expect(result?.transactions_updated).toBe(0); // already refunded -> no rows updated
  });
});
