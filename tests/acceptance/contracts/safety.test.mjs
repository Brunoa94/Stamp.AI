import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateEnvironment } from '../support/environment.mjs';
import { cancelWithRetry, waitForCancelableStatus } from '../support/cancellation.mjs';

const env = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://tgccxydchvujhrqyzqao.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-public-key',
  TEST_USER_EMAIL: 'test@sandcastle.dev',
  TEST_USER_PASSWORD: 'contract-only',
  TEST_USER_ID: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
};
test('ENV-01 rejects any database except the explicitly authorized project', () => {
  assert.doesNotThrow(() => validateEnvironment(env));
  for (const url of ['https://production.supabase.co', 'http://localhost:54321', 'https://tgccxydchvujhrqyzqao.supabase.co.attacker.test']) {
    assert.throws(() => validateEnvironment({ ...env, NEXT_PUBLIC_SUPABASE_URL: url }));
  }
});
test('ENV-01 rejects a privileged key for another project before network access', () => {
  const payload = Buffer.from(JSON.stringify({ ref: 'wrong-project', role: 'service_role' })).toString('base64url');
  assert.throws(() => validateEnvironment({ ...env, SUPABASE_SERVICE_ROLE_KEY: `x.${payload}.x` }));
});
for (const failures of [0, 1, 2, 3]) {
  test(`CLEAN-02 initial attempt plus ${failures} retries; verify provider state`, async () => {
    let calls = 0;
    const result = await cancelWithRetry({
      cancel: async () => { calls++; if (calls <= failures) throw new Error('transport failure'); },
      read: async () => ({ status: calls > failures ? 'canceled' : 'pending' }),
      sleep: async () => {},
    });
    assert.equal(calls, failures + 1);
    assert.equal(result.attempts, failures + 1);
  });
}
test('CLEAN-03 four failed attempts throw and preserve attempt evidence', async () => {
  let calls = 0;
  await assert.rejects(cancelWithRetry({
    cancel: async () => { calls++; }, read: async () => ({ status: 'pending' }), sleep: async () => {},
  }), error => error.attempts === 4);
  assert.equal(calls, 4);
});
test('CLEAN-02 waits through Printify cost calculation before spending cancellation attempts', async () => {
  const states = ['pending', 'cost-calculation', 'on-hold'];
  let reads = 0;
  let sleeps = 0;
  const status = await waitForCancelableStatus({
    read: async () => ({ status: states[reads++] }),
    sleep: async () => { sleeps++; },
    maxPolls: 3,
  });
  assert.equal(status, 'on-hold');
  assert.equal(reads, 3);
  assert.equal(sleeps, 2);
});
test('CLEAN-02 stops when Printify order is submitted or readiness times out', async () => {
  await assert.rejects(waitForCancelableStatus({
    read: async () => ({ status: 'in-production' }),
    sleep: async () => { throw new Error('should not wait'); },
  }), /no longer cancelable/);
  await assert.rejects(waitForCancelableStatus({
    read: async () => ({ status: 'pending' }), sleep: async () => {}, maxPolls: 2,
  }), /did not reach a cancelable status/);
});
test('CLEAN-04 lost cancel response succeeds only when remote cancellation is verified', async () => {
  const result = await cancelWithRetry({
    cancel: async () => { throw new Error('response lost'); },
    read: async () => ({ status: 'canceled' }), sleep: async () => {},
  });
  assert.equal(result.attempts, 1);
});
test('CLEAN-04 local success cannot override an unverified provider status', async () => {
  await assert.rejects(cancelWithRetry({
    cancel: async () => ({ success: true }),
    read: async () => { throw new Error('unreachable'); }, sleep: async () => {},
  }));
});
test('CLEAN-04 in-production and unknown states are never treated as canceled', async () => {
  for (const status of ['in-production', 'fulfilled', '', undefined]) {
    await assert.rejects(cancelWithRetry({
      cancel: async () => {}, read: async () => ({ status }), sleep: async () => {},
    }));
  }
});
test('GA-01 refuses a measurement ID without dedicated test-property confirmation', () => {
  assert.throws(() => validateEnvironment({ ...env, NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-EXAMPLE' }));
  assert.doesNotThrow(() => validateEnvironment({ ...env, NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-EXAMPLE', TEST_GA_PROPERTY_CONFIRMED: 'true' }));
});
