/* Playwright fixtures establish sessions even when their value is unused. */
/* eslint @typescript-eslint/no-unused-vars: ["warn", {"argsIgnorePattern": "^(suppliedUser|account)$"}] */
import { test, expect, unwrap, client } from '../support/fixtures.mjs';
import { realOrder } from '../support/orders.mjs';
import { waitForCancelableStatus } from '../support/cancellation.mjs';

test('CLEAN-01 real Printify order is linked to the database and canceled in teardown', async ({ account, env }) => {
  const { order, provider, variantId } = await realOrder(account, env);
  const remote = await account.orders.request(`orders/${provider.id}.json`);
  expect(remote.id).toBe(order.printify_order_id);
  expect(remote.line_items.map(i => ({ variant: i.variant_id, quantity: i.quantity }))).toEqual([{ variant: variantId, quantity: 1 }]);
  expect(remote.line_items.every(i => !i.sent_to_production_at)).toBe(true);
});
test('ORDER-07 another user cannot read or cancel a real order', async ({ account, env }) => {
  const { order } = await realOrder(account, env);
  const other = client(env);
  unwrap(await other.auth.signInWithPassword({ email: env.TEST_USER_EMAIL, password: env.TEST_USER_PASSWORD }), 'Other account login');
  expect(unwrap(await other.from('orders').select('*').eq('id', order.id), 'Other account read')).toEqual([]);
  const cancellation = await other.functions.invoke('cancel-order', { body: { order_id: order.id, cancellation_reason: 'Unauthorized acceptance attempt' } });
  expect(cancellation.error).not.toBeNull();
  expect(unwrap(await account.db.from('orders').select('status').eq('id', order.id).single(), 'Owner order read').status).toBe('pending');
});
test('ORDER-01 real seeded order appears in owner history only once', async ({ page, account, env }) => {
  const { order } = await realOrder(account, env);
  await page.goto('/orders');
  await expect(page.getByText(`#${order.order_number}`, { exact: true })).toHaveCount(1);
  await page.reload();
  await expect(page.getByText(`#${order.order_number}`, { exact: true })).toHaveCount(1);
});
test('CLEAN-04 already canceled remote order remains safe to clean again', async ({ account, env }) => {
  const { provider } = await realOrder(account, env);
  await account.orders.cleanup();
  expect((await account.orders.request(`orders/${provider.id}.json`)).status).toBe('canceled');
  await account.orders.cleanup();
});
test('ORDER-04 owner cancellation is remotely verified and repeated requests are idempotent', async ({ account, env }) => {
  const { order, provider } = await realOrder(account, env);
  await waitForCancelableStatus({ read: () => account.orders.request(`orders/${provider.id}.json`) });
  for (let attempt = 0; attempt < 2; attempt++) {
    const result = unwrap(await account.db.functions.invoke('cancel-order', { body: { order_id: order.id, cancellation_reason: 'Acceptance test' } }), 'Owner cancellation');
    expect(result.success).toBe(true);
    expect((await account.orders.request(`orders/${provider.id}.json`)).status).toBe('canceled');
    const row = unwrap(await account.db.from('orders').select('status').eq('id', order.id).single(), 'Canceled order persistence');
    expect(['canceled', 'cancelled']).toContain(row.status);
  }
});
