/* Playwright fixtures establish sessions even when their value is unused. */
/* eslint @typescript-eslint/no-unused-vars: ["warn", {"argsIgnorePattern": "^(suppliedUser|account)$"}] */
import { test, expect, client, unwrap } from '../support/fixtures.mjs';
import { openLogin, loginUI, assertNoHorizontalOverflow } from '../support/browser.mjs';

for (const route of ['/', '/catalog', '/privacy', '/terms', '/returns', '/cookies']) {
  test(`HOME-01 HOME-03 ${route} renders usable content`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response.status()).toBe(200);
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('heading').first()).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });
}
test('HOME-02 desktop/mobile navigation reaches catalog and Stamp', async ({ page, isMobile, suppliedUser }) => {
  await page.goto('/');
  for (const [name, path] of [[/catalog/i, '/catalog'], [/^stamp$|^start stamping process$/i, '/stamp']]) {
    if (isMobile) await page.getByRole('button', { name: /menu/i }).click();
    await page.getByRole('link', { name }).filter({ visible: true }).first().click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
  }
  await page.getByRole('link', { name: /home|stamp.?ai/i }).filter({ visible: true }).first().click();
  await expect(page).toHaveURL(/\/$/);
});
test('HOME-03 unknown route offers recovery', async ({ page }) => {
  expect((await page.goto('/acceptance-page-does-not-exist')).status()).toBe(404);
  await expect(page.getByRole('link', { name: /home/i }).first()).toBeVisible();
});
test('AUTH-04 supplied credentials establish the exact account', async ({ page, env }) => {
  expect((await loginUI(page, { email: env.TEST_USER_EMAIL, password: env.TEST_USER_PASSWORD })).status()).toBe(200);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('button', { name: /logout|sign out/i }).first()).toBeVisible();
  const db = client(env);
  const data = unwrap(await db.auth.signInWithPassword({ email: env.TEST_USER_EMAIL, password: env.TEST_USER_PASSWORD }), 'Identity check');
  expect(data.user.id).toBe(env.TEST_USER_ID);
});
for (const credentials of [
  { email: 'test@sandcastle.dev', password: 'Incorrect!1234' },
  { email: 'nonexistent-acceptance@sandcastle.dev', password: 'Incorrect!1234' },
]) {
  test(`AUTH-04 rejected credentials: ${credentials.email}`, async ({ page }) => {
    expect((await loginUI(page, credentials)).status()).toBe(401);
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/invalid|incorrect|unable to log/i).first()).toBeVisible();
  });
}
test('AUTH-05 forms switch without stale passwords', async ({ page }) => {
  const dialog = await openLogin(page);
  await dialog.locator('input[type="password"]').fill('DoNotRetain!123');
  await page.getByRole('button', { name: /create one now/i }).click();
  await expect(dialog.locator('input[type="password"]')).toHaveCount(0);
  await page.getByRole('dialog', { name: /create account/i }).getByRole('button', { name: /log in/i }).click();
  await expect(dialog.locator('input[type="password"]')).toHaveValue('');
});
for (const route of ['/orders', '/dashboard']) {
  test(`AUTH-08 anonymous ${route} does not expose private data`, async ({ page }) => {
    await page.goto(route);
    await expect(page).toHaveURL(/\/\?redirectedFrom=/);
  });
}
async function signInFromPrompt(page, env) {
  const dialog = page.getByRole('dialog').first();
  await expect(dialog.locator('input[type="password"]')).toBeVisible();
  await dialog.getByLabel(/email/i).fill(env.TEST_USER_EMAIL);
  await dialog.locator('input[type="password"]').fill(env.TEST_USER_PASSWORD);
  await dialog.getByRole('button', { name: /^login$|^sign in$/i }).click();
}
test('AUTH-08 guest Stamp click prompts login and continues to the studio after sign-in', async ({ page, isMobile, env }) => {
  await page.goto('/');
  const openStamp = async () => {
    if (isMobile) await page.getByRole('button', { name: /open menu/i }).click();
    await page.getByRole('link', { name: /^stamp$|^start stamping process$/i }).filter({ visible: true }).first().click();
  };
  await openStamp();
  await expect(page).toHaveURL(/\/\?redirectedFrom=%2Fstamp$/);
  await expect(page.getByRole('dialog').locator('input[type="password"]')).toBeVisible();
  // Dismissing clears the bounce, so a second click prompts again instead of doing nothing.
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/\/$/);
  await openStamp();
  await signInFromPrompt(page, env);
  await expect(page).toHaveURL(/\/stamp$/, { timeout: 30000 });
});
test('AUTH-08 guest deep link to orders returns there after sign-in', async ({ page, env }) => {
  await page.goto('/orders');
  await expect(page).toHaveURL(/\/\?redirectedFrom=%2Forders$/);
  await signInFromPrompt(page, env);
  await expect(page).toHaveURL(/\/orders$/, { timeout: 30000 });
});
for (const target of ['//evil.example', 'https://evil.example/stamp']) {
  test(`AUTH-09 redirectedFrom ${target} neither prompts nor leaves the site`, async ({ page }) => {
    await page.goto(`/?redirectedFrom=${encodeURIComponent(target)}`);
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(new URL(page.url()).host).toBe('localhost:3107');
  });
}
for (const url of ['/api/fetch-custom-product?id=unknown', '/api/fetch-remote-image?url=http://127.0.0.1']) {
  test(`SEC-02 unauthenticated ${url.split('?')[0]} is protected`, async ({ request }) => {
    expect([401, 403]).toContain((await request.get(url)).status());
  });
}
test('AUTH-09 callback cannot redirect off-site', async ({ request }) => {
  const response = await request.get('/auth/callback?code=invalid&next=https://example.org/stolen', { maxRedirects: 0 });
  const location = response.headers().location;
  expect(location).toBeTruthy();
  expect(new URL(location, 'http://localhost:3107').origin).toBe('http://localhost:3107');
});
for (const body of [{}, { email: 'invalid', password: 'x' }, { email: 'test@sandcastle.dev', password: '' }]) {
  test(`AUTH-02 invalid login payload ${JSON.stringify(body)}`, async ({ request }) => {
    expect((await request.post('/api/auth/login', { data: body })).status()).toBe(400);
  });
}
test('UX-02 auth dialog supports Escape and restores focus', async ({ page }) => {
  const dialog = await openLogin(page);
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('button', { name: /open login dialog|login|sign in/i }).first()).toBeFocused();
});
