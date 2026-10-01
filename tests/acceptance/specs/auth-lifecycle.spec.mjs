import { randomUUID } from 'node:crypto';
import { test, expect, client, unwrap } from '../support/fixtures.mjs';
import { openLogin, loginUI } from '../support/browser.mjs';
import { required } from '../support/environment.mjs';
import { waitForEmailLink } from '../support/mailbox.mjs';
import { observeAnalytics } from '../support/analytics.mjs';

async function findUser(admin, email) {
  for (let page = 1; ; page++) {
    const data = unwrap(await admin.auth.admin.listUsers({ page, perPage: 100 }), 'Locate run-owned signup');
    const found = data.users.find(user => user.email === email);
    if (found) return found;
    if (data.users.length < 100) return null;
  }
}
async function signup(page, env, email) {
  required(env, 'BREVO_API_KEY'); required(env, 'TEST_IMAP_HOST');
  const dialog = await openLogin(page);
  await dialog.getByRole('button', { name: /create account|sign up/i }).click();
  await dialog.getByLabel(/email/i).fill(email);
  const response = page.waitForResponse(r => r.url().endsWith('/api/auth/signup'));
  await dialog.getByRole('button', { name: /create account|sign up/i }).click();
  expect((await response).status()).toBe(200);
  await expect(page).toHaveURL(/\/auth\/check-email/);
}
test('AUTH-01 real email confirmation, password setup and immediate login', async ({ page, env }) => {
  test.setTimeout(180000);
  const admin = client(env, true);
  const template = required(env, 'TEST_EMAIL_TEMPLATE');
  expect(template).toContain('{id}');
  const email = template.replace('{id}', randomUUID());
  const password = `Acceptance!${randomUUID()}`;
  try {
    const since = Date.now();
    await signup(page, env, email);
    const user = await findUser(admin, email);
    expect(user).not.toBeNull();
    expect(user.email_confirmed_at).toBeFalsy();
    const link = await waitForEmailLink(env, email, since);
    const confirm = await page.request.get(link, { maxRedirects: 0 });
    expect(confirm.status()).toBe(307);
    const destination = new URL(confirm.headers().location);
    expect(destination.origin).toBe('http://localhost:3107');
    expect(destination.pathname).toBe('/reset-password');
    await page.goto(destination.toString());
    await page.locator('#password').fill(password);
    await page.locator('#confirmPassword').fill(password);
    await page.getByRole('button', { name: /^reset password$/i }).click();
    await expect(page.getByText(/your password is set/i).first()).toBeVisible();
    await page.context().clearCookies();
    expect((await loginUI(page, { email, password })).status()).toBe(200);
    const logged = unwrap(await client(env).auth.signInWithPassword({ email, password }), 'Verify new account');
    expect(logged.user.id).toBe(user.id);
    expect(logged.user.email_confirmed_at).toBeTruthy();
    // Replay must not issue a fresh authenticated session.
    await page.context().clearCookies();
    const replay = await page.request.get(link, { maxRedirects: 0 });
    expect(new URL(replay.headers().location).pathname).toBe('/auth/auth-code-error');
  } finally {
    const user = await findUser(admin, email);
    if (user) unwrap(await admin.auth.admin.deleteUser(user.id), 'Cleanup signup account');
  }
});
test('AUTH-03 repeated signup does not duplicate an unverified account', async ({ page, env }) => {
  const admin = client(env, true);
  required(env, 'BREVO_API_KEY');
  const template = required(env, 'TEST_EMAIL_TEMPLATE');
  expect(template).toContain('{id}');
  const email = template.replace('{id}', randomUUID());
  try {
    const first = await page.request.post('/api/auth/signup', { data: { email } });
    expect(first.status()).toBe(200);
    const before = await findUser(admin, email);
    const second = await page.request.post('/api/auth/signup', { data: { email } });
    expect(second.status()).toBe(200);
    expect((await findUser(admin, email)).id).toBe(before.id);
  } finally {
    const user = await findUser(admin, email);
    if (user) unwrap(await admin.auth.admin.deleteUser(user.id), 'Cleanup repeated signup');
  }
});
test('AUTH-07 reset via a delivered recovery email invalidates the old password', async ({ page, account, env }) => {
  test.setTimeout(180000);
  // This test needs a delivered mailbox address, not the random sandbox fixture.
  const address = required(env, 'TEST_EMAIL_TEMPLATE').replace('{id}', randomUUID());
  expect(address).not.toBe(env.TEST_EMAIL_TEMPLATE);
  unwrap(await account.admin.auth.admin.updateUserById(account.id, { email: address, email_confirm: true }), 'Set run mailbox address');
  await page.context().clearCookies();
  const since = Date.now();
  const dialog = await openLogin(page);
  await dialog.getByRole('button', { name: /forgot password/i }).click();
  await dialog.getByPlaceholder(/email/i).last().fill(address);
  await dialog.getByRole('button', { name: /send.*link|reset password/i }).click();
  const link = await waitForEmailLink(env, address, since, '/auth/v1/verify');
  await page.goto(link);
  await expect(page).toHaveURL(/localhost:3107\/reset-password/);
  const password = `Changed!${randomUUID()}`;
  await page.locator('#password').fill(password);
  await page.locator('#confirmPassword').fill(password);
  await page.getByRole('button', { name: /^reset password$/i }).click();
  await expect(page.getByText(/your password is set/i).first()).toBeVisible();
  expect((await client(env).auth.signInWithPassword({ email: address, password: account.password })).error).not.toBeNull();
  expect(unwrap(await client(env).auth.signInWithPassword({ email: address, password }), 'New password login').user.id).toBe(account.id);
});
test('AUTH-06 Google sign-in completes for the controlled test account', async ({ page, env }) => {
  test.setTimeout(120000);
  const email = required(env, 'TEST_GOOGLE_EMAIL');
  const password = required(env, 'TEST_GOOGLE_PASSWORD');
  const dialog = await openLogin(page);
  await dialog.getByRole('button', { name: /continue with google/i }).click();
  await page.waitForURL(/accounts\.google\.com/);
  await page.locator('input[type="email"]').fill(email);
  await page.locator('#identifierNext').click();
  await page.locator('input[type="password"]').fill(password);
  await page.locator('#passwordNext').click();
  const consent = page.getByRole('button', { name: /^continue$|^allow$/i });
  if (await consent.isVisible()) await consent.click();
  await page.waitForURL(/localhost:3107/);
  await expect(page.getByRole('button', { name: /logout|sign out/i }).first()).toBeVisible();
  // Google challenge or anti-automation rejection is a failed/blocked integration, not bypassed.
});
test('AUTH-06 GA-02 canceled Google flow does not send a success login event', async ({ page, env }) => {
  const ga = await observeAnalytics(page, env);
  const dialog = await openLogin(page);
  await page.route('**/auth/v1/authorize*', route => route.abort('aborted'));
  await dialog.getByRole('button', { name: /continue with google/i }).click();
  await page.goto('/');
  await ga.wait('page_view');
  expect(ga.events.filter(e => e.en === 'login')).toEqual([]);
});
test('GA-02 successful email login event reports the correct method', async ({ page, env }) => {
  const ga = await observeAnalytics(page, env);
  expect((await loginUI(page, { email: env.TEST_USER_EMAIL, password: env.TEST_USER_PASSWORD })).status()).toBe(200);
  const [event] = await ga.wait('login');
  expect(event['ep.method']).toBe('email');
  expect(ga.events.filter(e => e.en === 'login')).toHaveLength(1);
  ga.assertPrivate();
});
