import { expect } from '@playwright/test';
import { generate } from './browser.mjs';
import { required } from './environment.mjs';

export async function customize(page, env, productName) {
  expect((await generate(page)).status()).toBe(200);
  await page.getByRole('button', { name: /use this image/i }).filter({ visible: true }).click();
  const name = productName || required(env, 'TEST_PRODUCT_NAME');
  const product = page.locator('#step-5').getByRole('button', { name: `Select ${name}`, exact: true });
  if (await product.count() === 0) {
    await page.locator('#step-5').getByRole('button', { name: /show .* more/i }).click();
  }
  await product.click();
  await page.getByRole('button', { name: /continue to customization/i }).filter({ visible: true }).click();
  await expect(page.getByRole('heading', { name: /customize your product/i })).toBeVisible();
}
export async function createProduct(page) {
  const preview = page.getByRole('button', { name: /^continue to preview$/i }).filter({ visible: true });
  if (await preview.count()) await preview.click();
  const result = page.waitForResponse(r => r.url().includes('/create-custom-product') && r.request().method() === 'POST', { timeout: 90000 });
  await page.getByRole('button', { name: /^create product$/i }).filter({ visible: true }).click();
  const response = await result;
  expect(response.ok(), `create-custom-product ${response.status()}: ${response.ok() ? '' : `${await response.text()} for ${response.request().postData()}`}`).toBe(true);
  await expect(page.locator('[aria-current="step"]')).toContainText(/final/i, { timeout: 90000 });
  await expect(page.getByRole('button', { name: /^bag it$/i }).filter({ visible: true })).toBeEnabled({ timeout: 90000 });
  return { request: response.request().postDataJSON(), body: await response.json() };
}
