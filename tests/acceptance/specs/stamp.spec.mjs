/* Playwright fixtures establish sessions even when their value is unused. */
/* eslint @typescript-eslint/no-unused-vars: ["warn", {"argsIgnorePattern": "^(suppliedUser|account)$"}] */
import { readFileSync } from 'node:fs';
import { test, expect, unwrap } from '../support/fixtures.mjs';
import { enterUpload, upload, describeDesign, generate, IMAGE } from '../support/browser.mjs';

async function balance(account) {
  return unwrap(await account.db.from('profiles').select('coins').eq('id', account.id).single(), 'Read coin balance').coins;
}
test('FLOW-01 UP-02 upload is optional and canceling picker changes nothing', async ({ page, suppliedUser }) => {
  await enterUpload(page);
  await expect(page.getByRole('button', { name: /^skip upload$/i }).filter({ visible: true })).toBeEnabled();
  await page.getByLabel('File upload input').setInputFiles([]);
  await expect(page.getByAltText('Uploaded reference preview')).toHaveCount(0);
});
test('UP-01 UP-03 upload/remove/reselect the same image', async ({ page, suppliedUser }) => {
  await upload(page);
  await expect(page.getByRole('button', { name: /^next step$/i }).filter({ visible: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Remove uploaded file' }).click();
  await expect(page.getByAltText('Uploaded reference preview')).toHaveCount(0);
  await page.getByLabel('File upload input').setInputFiles(IMAGE);
  await expect(page.getByAltText('Uploaded reference preview')).toBeVisible();
});
for (const [label, name, mimeType, buffer] of [
  ['unsupported type', 'unsafe.svg', 'image/svg+xml', Buffer.from('<svg/>')],
  ['one byte too large', 'large.png', 'image/png', Buffer.alloc(10 * 1024 * 1024 + 1)],
]) {
  test(`UP-04 rejects ${label}`, async ({ page, suppliedUser }) => {
    await enterUpload(page);
    await page.getByLabel('File upload input').setInputFiles({ name, mimeType, buffer });
    await expect(page.getByAltText('Uploaded reference preview')).toHaveCount(0);
    await expect(page.getByText(/too large|invalid.*type|10MB|supported/i).filter({ visible: true }).first()).toBeVisible();
  });
}
for (const [label, buffer] of [['empty', Buffer.alloc(0)], ['corrupt', Buffer.from('not an image')]]) {
  test(`UP-05 rejects ${label} image before allowing progression`, async ({ page, suppliedUser }) => {
    await enterUpload(page);
    await page.getByLabel('File upload input').setInputFiles({ name: `${label}.png`, mimeType: 'image/png', buffer });
    await expect(page.getByAltText('Uploaded reference preview')).toHaveCount(0);
  });
}
test('GEN-09 guest generation is blocked at API', async ({ request }) => {
  const response = await request.post('/api/generate-image', { multipart: { prompt: 'A fox', image: { name: 'fox.png', mimeType: 'image/png', buffer: readFileSync(IMAGE) } } });
  expect(response.status()).toBe(401);
});
test('GEN-01 RES-01 ENV-03 mocked generation charges the real database once', async ({ page, account }) => {
  const before = await balance(account);
  expect((await generate(page)).status()).toBe(200);
  await expect(page.getByAltText('Generated design result')).toBeVisible();
  await expect.poll(() => balance(account)).toBe(before - 1);
  const history = await page.evaluate(() => JSON.parse(localStorage.getItem('stamp:generated-images')));
  expect(history.entries).toHaveLength(1);
  expect(history.entries[0].result.imageUrl).toMatch(/^data:image\/png;base64,/);
});
test('GEN-11 real coin refund after mocked provider failure', async ({ page, account }) => {
  const before = await balance(account);
  expect((await generate(page, '[acceptance:fail] A fox')).status()).toBe(500);
  await expect.poll(() => balance(account)).toBe(before);
});
for (const prompt of ['', '   ', 'a'.repeat(501)]) {
  test(`GEN-02 rejects invalid API prompt length=${prompt.length} without charge`, async ({ page, account }) => {
    const before = await balance(account);
    const response = await page.request.post('/api/generate-image', { multipart: { prompt, image: { name: 'fox.png', mimeType: 'image/png', buffer: readFileSync(IMAGE) } } });
    expect(response.status()).toBe(400);
    expect(await balance(account)).toBe(before);
  });
}
test('UP-06 valid prompt-only generation works without reference image', async ({ page, account }) => {
  const before = await balance(account);
  const response = await page.request.post('/api/generate-image', { multipart: { prompt: 'A red fox silhouette' } });
  expect(response.status()).toBe(200);
  expect(await balance(account)).toBe(before - 1);
});
test('GEN-06 skip editing opens Results and does not charge', async ({ page, account }) => {
  const before = await balance(account);
  await describeDesign(page);
  await page.getByRole('button', { name: /proceed without editing|use.*photo|skip.*editing/i }).filter({ visible: true }).click();
  await expect(page.locator('[aria-current="step"]')).toContainText(/results/i);
  await expect(page.getByRole('heading', { name: /your creation/i })).toBeInViewport({ ratio: 0.5 });
  expect(await balance(account)).toBe(before);
});
test('GEN-09 zero coins rejects direct generation', async ({ page, account }) => {
  await account.coins(0);
  const response = await page.request.post('/api/generate-image', { multipart: { prompt: 'A fox', image: { name: 'fox.png', mimeType: 'image/png', buffer: readFileSync(IMAGE) } } });
  expect(response.status()).toBe(402);
  expect(await balance(account)).toBe(0);
});
test('GEN-10 one coin permits one of two concurrent generations', async ({ page, account }) => {
  await account.coins(1);
  const send = () => page.request.post('/api/generate-image', { multipart: { prompt: 'A fox', image: { name: 'fox.png', mimeType: 'image/png', buffer: readFileSync(IMAGE) } } });
  const responses = await Promise.all([send(), send()]);
  expect(responses.map(r => r.status()).sort()).toEqual([200, 402]);
  expect(await balance(account)).toBe(0);
});
test('GEN-03 filter guidance reaches the prompt', async ({ page, account }) => {
  await describeDesign(page);
  await page.locator('textarea').fill('My fox');
  await page.getByRole('button', { name: /apply suggestion: vibrant/i }).filter({ visible: true }).click();
  const sent = page.waitForRequest(r => r.url().endsWith('/api/generate-image') && r.method() === 'POST');
  await page.getByRole('button', { name: /stamp it/i }).filter({ visible: true }).click();
  const request = await sent;
  const form = await new Request(request.url(), { method: 'POST', headers: request.headers(), body: request.postDataBuffer() }).formData();
  const prompt = String(form.get('prompt'));
  await expect(page.getByAltText('Generated design result')).toBeVisible();
  expect(prompt).toContain('My fox');
  expect(prompt).toMatch(/vibrant/i);
  expect(prompt.match(/My fox/g)).toHaveLength(1);
});
for (const value of [0, 50, 100]) {
  test(`GEN-05 preservation ${value} reaches generation request`, async ({ page, account }) => {
    await describeDesign(page);
    await page.locator('textarea').fill('A fox');
    await page.locator('input[type="range"]').fill(String(value));
    const request = page.waitForRequest(r => r.url().endsWith('/api/generate-image'));
    await page.getByRole('button', { name: /stamp it/i }).filter({ visible: true }).click();
    const body = (await request).postData();
    expect(body).toMatch(new RegExp(`name="preservation"\\r?\\n\\r?\\n${value}\\r?\\n`));
    await expect(page.getByAltText('Generated design result')).toBeVisible();
  });
}
test('RES-03 Repeat returns to description', async ({ page, account }) => {
  expect((await generate(page)).status()).toBe(200);
  await page.getByRole('button', { name: /^repeat$/i }).click();
  await expect(page.locator('textarea')).toBeVisible();
});
