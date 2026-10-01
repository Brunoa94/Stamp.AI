import { setCheckbox } from '../support/browser.mjs';
/* Playwright fixtures establish sessions even when their value is unused. */
/* eslint @typescript-eslint/no-unused-vars: ["warn", {"argsIgnorePattern": "^(suppliedUser|account)$"}] */
import { randomUUID } from 'node:crypto';
import { test, expect } from '../support/fixtures.mjs';
import { observeAnalytics, receivedEvent } from '../support/analytics.mjs';
import { upload, generate } from '../support/browser.mjs';
import { seedCart, itemCard, proceed, ITEMS } from '../support/cart.mjs';

test('GA-01 GA-08 page_view is sent once per navigation without private data', async ({ page, env }) => {
  const ga = await observeAnalytics(page, env);
  await page.goto('/');
  await ga.wait('page_view');
  expect(ga.events.filter(e => e.en === 'page_view')).toHaveLength(1);
  await page.getByRole('link', { name: /catalog/i }).filter({ visible: true }).first().click();
  await expect.poll(() => ga.events.filter(e => e.en === 'page_view').length).toBe(2);
  ga.assertPrivate();
});
test('GA-03 upload sends the real event', async ({ page, env, suppliedUser }) => {
  const ga = await observeAnalytics(page, env);
  await upload(page);
  const [event] = await ga.wait('stamp_image_upload');
  expect(event['ep.file_type']).toBe('image/png');
  expect(Number(event['epn.file_size_kb'])).toBeGreaterThanOrEqual(0);
  expect(ga.events.filter(e => e.en === 'stamp_image_upload')).toHaveLength(1);
  ga.assertPrivate();
});
for (const [prompt, terminal] of [['A fox', 'stamp_generate_complete'], ['[acceptance:fail] A fox', 'stamp_generate_failed']]) {
  test(`GA-03 generation terminal event ${terminal}`, async ({ page, env, account }) => {
    const ga = await observeAnalytics(page, env);
    await generate(page, prompt);
    await ga.wait('stamp_generate_start');
    await ga.wait(terminal);
    expect(ga.events.filter(e => ['stamp_generate_complete', 'stamp_generate_failed'].includes(e.en))).toHaveLength(1);
    ga.assertPrivate();
  });
}
test('GA-04 cart removal sends the selected item and correct EUR value', async ({ page, env, account }) => {
  const cart = await seedCart(account, [ITEMS[0]]);
  const ga = await observeAnalytics(page, env);
  await page.goto('/cart'); await ga.wait('view_cart');
  await itemCard(page, 'Acceptance A').getByRole('button', { name: /remove/i }).click();
  const [event] = await ga.wait('remove_from_cart');
  expect(event.cu ?? event['ep.currency']).toBe('EUR');
  expect(Number(event['epn.value'])).toBe(39.98);
  expect(JSON.stringify(event)).toContain(cart.items[0].product_id);
  ga.assertPrivate();
});
test('GA-05 begin_checkout excludes unselected items', async ({ page, env, account }) => {
  const cart = await seedCart(account);
  const ga = await observeAnalytics(page, env);
  await page.goto('/cart');
  await setCheckbox(itemCard(page, 'Acceptance B').getByRole('checkbox'), false);
  await proceed(page);
  const [event] = await ga.wait('begin_checkout');
  expect(event.cu ?? event['ep.currency']).toBe('EUR');
  const body = JSON.stringify(event);
  for (const item of cart.items) {
    if (item.product_name === 'Acceptance B') expect(body).not.toContain(item.product_id);
    else expect(body).toContain(item.product_id);
  }
  ga.assertPrivate();
});
test('GA-07 blocked analytics does not prevent upload', async ({ page, suppliedUser }) => {
  await page.route(/google-analytics\.com|googletagmanager\.com/, route => route.abort());
  await upload(page);
  await expect(page.getByRole('button', { name: /^next step$/i }).filter({ visible: true })).toBeEnabled();
});
test('GA-01 ingestion proof in the dedicated test property', async ({ page, env }) => {
  test.setTimeout(180000);
  const ga = await observeAnalytics(page, env);
  // Unique marker proves ingestion for THIS browser/run, not a previous visitor.
  const event = `acceptance_${randomUUID().replaceAll('-', '').slice(0, 24)}`;
  expect(await receivedEvent(env, event)).toBe(0);
  await page.goto('/'); await ga.wait('page_view');
  await page.evaluate(name => window.gtag('event', name, { debug_mode: true }), event);
  await ga.wait(event);
  await expect.poll(() => receivedEvent(env, event), { timeout: 120000, intervals: [5000] }).toBeGreaterThan(0);
});
