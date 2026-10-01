/* Playwright fixtures establish sessions even when their value is unused. */
/* eslint @typescript-eslint/no-unused-vars: ["warn", {"argsIgnorePattern": "^(suppliedUser|account)$"}] */
import { readFileSync } from 'node:fs';
import { test, expect, unwrap } from '../support/fixtures.mjs';
import { enterUpload, IMAGE, describeDesign } from '../support/browser.mjs';
const png = `data:image/png;base64,${readFileSync(IMAGE).toString('base64')}`;
async function history(page, entries) {
  await page.addInitScript(value => localStorage.setItem('stamp:generated-images', JSON.stringify({ entries: value })), entries);
}
function entry(age = 0, n = 0) {
  return { result: { imageUrl: `${png}#${n}`, enhancedPrompt: `Design ${n}`, timestamp: Date.now() - age }, createdAt: Date.now() - age };
}
test('GEN-07 RES-02 cached designs can be selected without generation', async ({ page, suppliedUser }) => {
  await history(page, [entry(0, 1), entry(1000, 2)]);
  await enterUpload(page);
  await page.getByRole('button', { name: /proceed with previous photos/i }).filter({ visible: true }).first().click();
  await expect(page.getByAltText('Generated design result')).toBeVisible();
  await page.getByRole('button', { name: 'Select image 2' }).click();
  await expect(page.getByRole('button', { name: 'Select image 2' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: /use this image/i }).filter({ visible: true }).click();
  await expect(page.getByRole('heading', { name: /select your product/i })).toBeVisible();
});
test('RES-04 expired images do not enable cached-image progression', async ({ page, suppliedUser }) => {
  await history(page, [entry(24 * 60 * 60 * 1000 + 1000)]);
  await enterUpload(page);
  await expect(page.getByRole('button', { name: /proceed with previous photos/i })).toHaveCount(0);
  const entries = await page.evaluate(() => JSON.parse(localStorage.getItem('stamp:generated-images')).entries);
  expect(entries).toEqual([]);
});
for (const bad of ['invalid json', '{"entries":null}', '{"entries":[null]}']) {
  test(`RES-05 malformed history recovers: ${bad}`, async ({ page, suppliedUser }) => {
    await page.addInitScript(value => localStorage.setItem('stamp:generated-images', value), bad);
    await enterUpload(page);
    await expect(page.getByRole('button', { name: /^skip upload$/i }).filter({ visible: true })).toBeEnabled();
  });
}
test('RES-05 storage denial does not prevent selecting an uploaded file', async ({ page, suppliedUser }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key === 'stamp:generated-images') throw new DOMException('Quota exceeded', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await describeDesign(page);
  await expect(page.locator('textarea')).toBeVisible();
});
test('CAT-01 available database catalog renders on the catalog page', async ({ page, suppliedUser }) => {
  const rows = unwrap(await suppliedUser.db.from('catalog_products').select('*').limit(3), 'Catalog fixtures');
  expect(rows.length, 'Parallel DB must contain catalog fixtures').toBeGreaterThan(0);
  await page.goto('/catalog');
  await expect(page.getByRole('heading').first()).toBeVisible();
  await expect(page.getByRole('img').first()).toBeVisible();
});
test('PROD-02 product selection required; removal restores grid', async ({ page, suppliedUser }) => {
  await history(page, [entry()]); await enterUpload(page);
  await page.getByRole('button', { name: /proceed with previous photos/i }).filter({ visible: true }).first().click();
  await page.getByRole('button', { name: /use this image/i }).filter({ visible: true }).click();
  const next = page.getByRole('button', { name: /continue to customization/i }).filter({ visible: true });
  await expect(next).toBeDisabled();
  await page.getByRole('button', { name: /^select /i }).filter({ visible: true }).first().click();
  await expect(next).toBeEnabled();
  await page.getByRole('button', { name: 'Remove selected product' }).click();
  await expect(next).toBeDisabled();
});
for (const category of ['Mug', 'Canvas', 'Notebook', 'Pillow', 'Socks', 'Tote']) {
  test(`CUSTOM-03 ${category} offers only white`, async ({ page, suppliedUser }) => {
    await history(page, [entry()]); await enterUpload(page);
    await page.getByRole('button', { name: /proceed with previous photos/i }).filter({ visible: true }).first().click();
    await page.getByRole('button', { name: /use this image/i }).filter({ visible: true }).click();
    await page.getByRole('button', { name: new RegExp(`^select .*${category}`, 'i') }).first().click();
    await page.getByRole('button', { name: /continue to customization/i }).filter({ visible: true }).click();
    const colors = page.getByRole('button', { name: /^select .* color$/i });
    await expect(colors).toHaveCount(1);
    await expect(colors).toHaveAttribute('aria-label', /select white color/i);
  });
}
test('CAT-02 unmatched catalog search has an empty state and clearing restores real products', async ({ page, suppliedUser }) => {
  await page.goto('/catalog');
  await page.getByRole('button', { name: /^browse /i }).first().click();
  const products = page.getByRole('button', { name: /^view .+ details$/i });
  await expect(products.first()).toBeVisible();
  const count = await products.count();
  await page.getByRole('searchbox').fill('acceptance-no-match-7f599643');
  await expect(products).toHaveCount(0);
  await expect(page.getByRole('status')).toContainText(/no .*found|no .*match/i);
  await page.getByRole('status').getByRole('button', { name: /clear filters/i }).click();
  await expect(page.getByRole('searchbox')).toHaveValue('');
  await page.getByRole('button', { name: /^browse /i }).first().click();
  await expect(products).toHaveCount(count);
});
test('CAT-03 catalog quick-view customization opens the design studio', async ({ page, suppliedUser }) => {
  await page.goto('/catalog');
  await page.getByRole('button', { name: /^browse /i }).first().click();
  await page.getByRole('button', { name: /^view .+ details$/i }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading')).toBeVisible();
  await dialog.getByRole('link', { name: /customize|create|stamp|design/i }).click();
  await expect(page).toHaveURL(/\/stamp(?:\?|$)/);
  await expect(page.getByRole('button', { name: /begin customizing|begin customization/i })).toBeVisible();
});
test('PROD-03 catalog request failure disables selection and reload recovers using real data', async ({ page, suppliedUser }) => {
  await history(page, [entry()]);
  const pattern = '**/rest/v1/catalog_products*';
  await page.route(pattern, route => route.abort('failed'));
  await enterUpload(page);
  await page.getByRole('button', { name: /proceed with previous photos/i }).filter({ visible: true }).first().click();
  await page.getByRole('button', { name: /use this image/i }).filter({ visible: true }).click();
  await expect(page.getByText(/failed|unable|error/i).filter({ visible: true }).first()).toBeVisible({ timeout: 30000 });
  await expect(page.getByRole('button', { name: /continue to customization/i }).filter({ visible: true })).toBeDisabled();
  await page.unroute(pattern);
  await enterUpload(page);
  await page.getByRole('button', { name: /proceed with previous photos/i }).filter({ visible: true }).first().click();
  await page.getByRole('button', { name: /use this image/i }).filter({ visible: true }).click();
  await expect(page.getByRole('button', { name: /^select /i }).filter({ visible: true }).first()).toBeVisible();
});
