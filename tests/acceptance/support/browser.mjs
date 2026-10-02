import { expect } from '@playwright/test';
import { resolve } from 'node:path';
export const IMAGE = resolve('src/tests/fixtures/test-image.png');
export async function enterUpload(page) {
  await page.goto('/stamp');
  await page.getByRole('button', { name: /begin customizing|begin customization/i }).click();
  await expect(page.getByRole('heading', { name: /upload image/i })).toBeVisible();
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
  await page.getByRole('button', { name: /open login dialog|login|sign in/i }).first().click();
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
  // A keypress that lands before hydration attaches the handler is reverted by
  // the controlled input, so re-press a few times instead of waiting 15s once.
  // Keep trying for up to ~10s: a cold dev page can take several seconds to
  // hydrate, and every press before that is reverted.
  for (let attempt = 0; attempt < 20; attempt++) {
    if (await control.isChecked() === checked) break;
    await control.focus();
    await control.press('Space');
    await control.page().waitForTimeout(500);
  }
  await expect(control).toBeChecked({ checked });
}
