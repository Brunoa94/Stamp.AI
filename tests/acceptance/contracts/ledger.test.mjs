import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PrintifyOrders } from '../support/printify.mjs';

test('CLEAN-03 automatic finalizers cannot restart an exhausted cancellation budget', async () => {
  const provider = new PrintifyOrders({}, 'test');
  provider.records = () => [{ externalId: 'test', orderId: 'remote', state: 'cleanup-failed', cancellations: [{ id: 'remote', failed: true, attempts: 4 }] }];
  provider.save = () => {};
  let calls = 0;
  provider.request = async () => { calls++; return { status: 'canceled' }; };
  await assert.rejects(provider.cleanup(), /exhausted|failed/i);
  assert.equal(calls, 0);
});
test('CLEAN-03 explicit recovery may retry while retaining previous failure evidence', async () => {
  const provider = new PrintifyOrders({}, 'test');
  const record = { externalId: 'test', orderId: 'remote', state: 'cleanup-failed', hadCleanupFailure: true, cancellations: [{ id: 'remote', failed: true, attempts: 4 }] };
  provider.records = () => [record]; provider.save = () => {};
  provider.request = async () => ({ status: 'canceled' });
  await provider.cleanup({ recoverFailed: true });
  assert.equal(record.state, 'canceled');
  assert.equal(record.hadCleanupFailure, true);
  assert.equal(record.cleanupHistory[0][0].attempts, 4);
});
test('CLEAN-03 duplicate correlation records cannot bypass the per-order retry limit', async () => {
  const provider = new PrintifyOrders({}, 'test');
  provider.records = () => [
    { externalId: 'intent', orderId: 'same-remote', state: 'cleanup-failed', cancellations: [{ id: 'same-remote', failed: true, attempts: 4 }] },
    { externalId: 'discovered', orderId: 'same-remote', state: 'created' },
  ];
  provider.save = () => {};
  let calls = 0;
  provider.request = async () => { calls++; return { status: 'canceled' }; };
  await assert.rejects(provider.cleanup());
  assert.equal(calls, 0);
});
