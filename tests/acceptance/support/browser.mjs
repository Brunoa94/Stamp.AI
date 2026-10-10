import { expect } from '@playwright/test';
import { resolve } from 'node:path';
export const IMAGE = resolve('src/tests/fixtures/test-image.png');
export async function enterUpload(page) {
  await page.goto('/stamp');
  await page.getByRole('button', { name: /begin customizing|begin customization/i }).click();
  await expect(page.getByRole('heading', { name: /upload image/i })).toBeVisible();
}
// The dev server can paint /catalog before React hydrates, so an early click
// on a showcase card is dropped; retry until the product grid appears.
export async function browseCatalogGroup(page) {
  const products = page.getByRole('button', { name: /^view .+ details$/i });
  await expect(async () => {
    if (!(await products.first().isVisible())) {
      await page.getByRole('button', { name: /^browse /i }).first().click({ timeout: 2000 });
    }
    await expect(products.first()).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 30000 });
  return products;
}
export async function upload(page, image = IMAGE) {
  await enterUpload(page);
  await page.getByLabel('File upload input').setInputFiles(image);
  await expect(page.getByAltText('Uploaded reference preview')).toBeVisible();
}
export async function describeDesign(page) {
  await upload(page);
  await page.getByRole('button', { name: /^next step$/i }).filter({ visible: true }).click();
  await expect(page.locator('textarea')).toBeVisible();
}
export async function generate(page, prompt = 'A friendly red fox on a transparent background') {
  await describeDesign(page);
  await page.locator('textarea').fill(prompt);
  const response = page.waitForResponse(r => r.url().endsWith('/api/generate-image') && r.request().method() === 'POST');
  await page.getByRole('button', { name: /stamp it/i }).filter({ visible: true }).click();
  return response;
}
export async function openLogin(page) {
  await page.goto('/');
  const mobileMenu = page.getByRole('button', { name: /open menu/i });
  if (await mobileMenu.isVisible()) await mobileMenu.click();
  await page.getByRole('button', { name: /open login dialog|login|sign in/i }).filter({ visible: true }).first().click();
  return page.getByRole('dialog').first();
}
export async function loginUI(page, credentials) {
  const dialog = await openLogin(page);
  await dialog.getByLabel(/email/i).fill(credentials.email);
  await dialog.locator('input[type="password"]').fill(credentials.password);
  const response = page.waitForResponse(r => r.url().includes('/api/auth/login'));
  await dialog.getByRole('button', { name: /^login$|^sign in$/i }).click();
  return response;
}
export async function assertNoHorizontalOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
}

// Styled checkboxes conceal the native input behind a visible label. Keyboard
// activation exercises the accessible control without forcing pointer events.
export async function setCheckbox(control, checked) {
  if (await control.isChecked() !== checked) await control.setChecked(checked, { force: true });
  await expect(control).toBeChecked({ checked });
}
