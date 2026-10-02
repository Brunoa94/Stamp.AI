import { expect } from '@playwright/test';
import { required } from './environment.mjs';

export async function observeAnalytics(page, env) {
  const measurementId = required(env, 'NEXT_PUBLIC_GA_MEASUREMENT_ID');
  if (env.TEST_GA_PROPERTY_CONFIRMED !== 'true') throw new Error('Set TEST_GA_PROPERTY_CONFIRMED=true only for the dedicated test GA property');
  const events = [];
  const requests = new WeakMap();
  page.on('request', request => {
    const url = new URL(request.url());
    if (!/(^|\.)google-analytics\.com$/.test(url.hostname) || !url.pathname.endsWith('/collect')) return;
    const lines = request.postData()?.split(/\r?\n/) ?? [''];
    const batch = [];
    requests.set(request, batch);
    for (const line of lines) {
      const params = new URLSearchParams(url.search);
      for (const [key, value] of new URLSearchParams(line)) params.set(key, value);
      if (params.get('en')) {
        const event = Object.fromEntries(params);
        events.push(event); batch.push(event);
      }
    }
  });
  page.on('response', response => {
    for (const event of requests.get(response.request()) ?? []) event.transportStatus = response.status();
  });
  return {
    events,
    async wait(name) {
      await expect.poll(
        () => events.filter(e => e.en === name && e.transportStatus >= 200 && e.transportStatus < 300).length,
        { timeout: 30000, message: () => `No delivered "${name}" event. Observed: ${events.map(e => `${e.en}:${e.transportStatus ?? 'pending'}`).join(', ') || 'none'}` },
      ).toBeGreaterThan(0);
      const selected = events.filter(e => e.en === name);
      for (const event of selected) {
        expect(event.tid).toBe(measurementId);
        await expect.poll(() => event.transportStatus).toBeGreaterThanOrEqual(200);
        expect(event.transportStatus).toBeLessThan(300);
      }
      return selected;
    },
    assertPrivate() {
      for (const event of events) {
        const serialized = JSON.stringify(event);
        expect(serialized).not.toMatch(/@sandcastle\.dev|TestPassword|Bearer |data:image|sk_test_/i);
        const location = event.dl && new URL(event.dl);
        if (location) for (const key of ['code', 'token', 'access_token', 'client_secret']) expect(location.searchParams.has(key)).toBe(false);
      }
    },
  };
}
export async function receivedEvent(env, eventName) {
  const property = required(env, 'TEST_GA_PROPERTY_ID');
  if (!/^\d+$/.test(property)) throw new Error('TEST_GA_PROPERTY_ID must be numeric');
  const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${property}:runRealtimeReport`, {
    method: 'POST', signal: AbortSignal.timeout(15000),
    headers: { Authorization: `Bearer ${required(env, 'TEST_GA_READ_ACCESS_TOKEN')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ dimensions: [{ name: 'eventName' }], metrics: [{ name: 'eventCount' }], dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: eventName } } } }),
  });
  if (!response.ok) throw new Error(`GA receipt query failed (${response.status})`);
  const result = await response.json();
  return (result.rows ?? []).reduce((sum, row) => sum + Number(row.metricValues[0].value), 0);
}
