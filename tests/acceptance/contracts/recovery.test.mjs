import { test } from 'node:test';
import assert from 'node:assert/strict';
import { discoverAndCancel } from '../support/recovery.mjs';

test('CLEAN-05 database outage cannot prevent cancellation of orders already in the durable ledger', async () => {
  let canceled = false;
  await assert.rejects(discoverAndCancel({
    discover: async () => { throw new Error('Database unavailable'); },
    register: () => {}, cancel: async () => { canceled = true; },
  }));
  assert.equal(canceled, true);
});
test('CLEAN-05 discovery registers all correlated provider orders before cleanup', async () => {
  const registered = [];
  const result = await discoverAndCancel({
    discover: async () => [{ id: 'a', printify_order_id: 'remote-a' }, { id: 'b', printify_order_id: null }, { id: 'c', printify_order_id: 'remote-c' }],
    register: id => registered.push(id), cancel: async () => assert.deepEqual(registered, ['remote-a', 'remote-c']),
  });
  assert.equal(result.length, 3);
});
test('CLEAN-03 preserves both discovery and cleanup errors', async () => {
  await assert.rejects(discoverAndCancel({
    discover: async () => { throw new Error('Discovery failed'); },
    register: () => {}, cancel: async () => { throw new Error('Cancellation failed'); },
  }), error => error instanceof AggregateError && error.errors.length === 2);
});
