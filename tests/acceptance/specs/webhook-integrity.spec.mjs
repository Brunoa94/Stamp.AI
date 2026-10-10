import { randomUUID } from 'node:crypto';
import { test, expect, unwrap } from '../support/fixtures.mjs';

for (const provider of ['stripe', 'paypal', 'mollie']) {
  test(`PAY-10 forged ${provider} webhook cannot mark an owned order paid`, async ({ account, env }) => {
    const order = unwrap(await account.db.from('orders').insert({ user_id: account.id, customer_email: account.email, order_number: `acceptance-${randomUUID()}`, payment_status: 'pending', status: 'pending', currency: 'EUR', total_amount: 44.97 }).select().single(), 'Create unpaid order');
    const body = provider === 'stripe'
      ? { id: `evt_${randomUUID()}`, type: 'payment_intent.succeeded', data: { object: { id: 'pi_forged', status: 'succeeded', amount: 4497, currency: 'eur', metadata: { order_id: order.id } } } }
      : { id: randomUUID(), event_type: 'PAYMENT.CAPTURE.COMPLETED', resource: { id: 'forged', status: 'COMPLETED', custom_id: order.id, amount: { currency_code: 'EUR', value: '44.97' } } };
    const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${provider}-webhook`, {
      method: 'POST', signal: AbortSignal.timeout(15000),
      headers: { 'Content-Type': provider === 'mollie' ? 'application/x-www-form-urlencoded' : 'application/json' },
      body: provider === 'mollie' ? 'id=tr_forged' : JSON.stringify(body),
    });
    // Some webhook endpoints acknowledge unknown objects to stop provider retries.
    // The database invariant is mandatory regardless of acknowledgement policy.
    expect(response.status).not.toBe(404);
    expect(response.status).toBeLessThan(500);
    const saved = unwrap(await account.db.from('orders').select('payment_status,printify_order_id').eq('id', order.id).single(), 'Verify forged event did not finalize');
    expect(saved.payment_status).toBe('pending');
    expect(saved.printify_order_id).toBeNull();
    expect(unwrap(await account.db.from('payment_transactions').select('id').eq('order_id', order.id).eq('status', 'succeeded'), 'No forged successful transaction')).toEqual([]);
  });
}
