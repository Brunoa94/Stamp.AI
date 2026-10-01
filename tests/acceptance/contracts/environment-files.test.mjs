import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadEnvironment } from '../support/environment.mjs';
const base = 'NEXT_PUBLIC_SUPABASE_URL=https://tgccxydchvujhrqyzqao.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=contract-key\nTEST_USER_EMAIL=fixture@example.test\nTEST_USER_PASSWORD=fixture-password\nTEST_USER_ID=fixture-id\n';
for (const localOnly of [false, true]) test(`ENV-02 test-local configuration loads (local only: ${localOnly})`, () => {
  const dir = mkdtempSync(join(tmpdir(), 'acceptance-env-'));
  try {
    if (!localOnly) writeFileSync(join(dir, '.env.test'), base + 'TEST_PRODUCT_NAME=base\n');
    writeFileSync(join(dir, '.env.test.local'), (localOnly ? base : '') + 'TEST_PRODUCT_NAME=local\nNEXT_PUBLIC_PAYPAL_CLIENT_ID=contract-client\nNEXT_PUBLIC_PAYPAL_WEBHOOK_ID=contract-hook\n');
    writeFileSync(join(dir, '.env.local'), 'MOLLIE_API_KEY=live_forbidden\n');
    const env = loadEnvironment(dir);
    assert.equal(env.TEST_PRODUCT_NAME, 'local');
    assert.equal(env.MOLLIE_API_KEY, undefined);
    assert.equal(env.PAYPAL_CLIENT_ID, 'contract-client');
    assert.equal(env.PAYPAL_WEBHOOK_ID, 'contract-hook');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
test('ENV-02 unsafe local override cannot bypass database allowlist', () => {
  const dir = mkdtempSync(join(tmpdir(), 'acceptance-env-'));
  try {
    writeFileSync(join(dir, '.env.test'), base);
    writeFileSync(join(dir, '.env.test.local'), 'NEXT_PUBLIC_SUPABASE_URL=https://production.supabase.co\n');
    assert.throws(() => loadEnvironment(dir), /allowlist/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
