import { readFileSync } from 'node:fs';
import { test, expect, unwrap } from '../support/fixtures.mjs';
import { IMAGE, describeDesign, loginUI } from '../support/browser.mjs';
import { ITEMS, itemCard, proceed, fillAddress } from '../support/cart.mjs';
import { pay } from '../support/purchase.mjs';
import {
  anonymousId,
  cancelIdealPayment,
  createGuestProduct,
  databaseLines,
  goToCheckout,
  guestCarts,
  localLines,
  purchaseFixtures,
  readLocalCart,
  seedLocalCart,
  startStripePaymentWithoutPaying,
} from '../support/guest.mjs';

// ITEMS: 2 × 19.99 + 25.01 + 12.00 = 76.99, above the free-shipping threshold.
const ITEMS_TOTAL = /76[.,]99/;

test('GUEST-01 a guest bag survives a reload with the same items and total on /cart and /checkout', async ({ page, guest }) => {
  await seedLocalCart(page, ITEMS);
  await page.goto('/cart');
  await page.reload();
  for (const item of ITEMS) await expect(itemCard(page, item.product_name)).toBeVisible();
  await expect(page.getByText(ITEMS_TOTAL).first()).toBeVisible();

  await proceed(page);
  await page.reload();
  for (const item of ITEMS) await expect(page.getByText(item.product_name, { exact: true })).toBeVisible();
  await expect(page.getByText(ITEMS_TOTAL).first()).toBeVisible();
  expect(guest.ids(), 'Browsing the bag creates no auth user').toEqual([]);
});

test('GUEST-02 an anonymous session cannot generate and sees the login overlay', async ({ page, guest }) => {
  await guest.signIn();
  const response = await page.request.post('/api/generate-image', {
    multipart: { prompt: 'A fox', image: { name: 'fox.png', mimeType: 'image/png', buffer: readFileSync(IMAGE) } },
  });
  expect(response.status()).toBe(401);

  await describeDesign(page);
  await expect(page.getByText('Login or register to continue').filter({ visible: true }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /stamp it/i }).filter({ visible: true }).first()).toBeDisabled();
});

test('GUEST-03 starting a payment copies the bag into a database cart owned by the anonymous user', async ({ page, guest, env }) => {
  const fixtures = purchaseFixtures(env);
  await seedLocalCart(page, fixtures);
  await goToCheckout(page, 'guest-03@sandcastle.dev');
  const before = await readLocalCart(page);

  await startStripePaymentWithoutPaying(page);

  const guestId = anonymousId(guest);
  await expect.poll(async () => (await guestCarts(guest, guestId)).map(cart => databaseLines(cart.cart_items)))
    .toEqual([localLines(before)]);
  expect(await readLocalCart(page), 'The bag is only cleared once an order is confirmed').toEqual(before);
});

test('GUEST-04 a guest who cancels the payment comes back to the same bag', async ({ page, guest, env }) => {
  test.setTimeout(180000);
  const fixtures = purchaseFixtures(env);
  await seedLocalCart(page, fixtures);
  await goToCheckout(page, 'guest-04@sandcastle.dev');

  await cancelIdealPayment(page, env);

  await page.goto('/cart');
  for (const item of fixtures) await expect(itemCard(page, item.product_name)).toBeVisible();
  const expected = (fixtures.reduce((sum, i) => sum + i.unit_price * i.quantity, 0) / 100).toFixed(2);
  await expect(page.getByText(new RegExp(expected.replace('.', '[.,]'))).first()).toBeVisible();
  expect(unwrap(await guest.admin.from('orders').select('id').eq('user_id', anonymousId(guest)).eq('payment_status', 'paid'), 'No paid order')).toEqual([]);
});

test('GUEST-05 after a cancelled payment a new product joins the earlier items', async ({ page, guest, env }) => {
  test.setTimeout(300000);
  const fixtures = purchaseFixtures(env);
  await seedLocalCart(page, fixtures);
  await goToCheckout(page, 'guest-05@sandcastle.dev');
  await cancelIdealPayment(page, env);

  const { body } = await createGuestProduct(page, env);

  const bag = await readLocalCart(page);
  expect(bag.map(item => item.productId).sort()).toEqual([...fixtures.map(f => f.product_id), body.product?.id ?? bag.at(-1).productId].sort());
  for (const item of fixtures) await expect(itemCard(page, item.product_name)).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(fixtures.length + 1);
  expect(guest.ids(), 'The new product belongs to the same guest').toHaveLength(1);
});

test('GUEST-06 a second payment reuses the guest database cart with exactly the current bag', async ({ page, guest, env }) => {
  test.setTimeout(240000);
  const fixtures = purchaseFixtures(env);
  await seedLocalCart(page, fixtures);
  await goToCheckout(page, 'guest-06@sandcastle.dev');
  await cancelIdealPayment(page, env);

  await page.goto('/cart');
  await itemCard(page, fixtures[1].product_name).getByRole('button', { name: /remove/i }).click();
  await expect(page.getByRole('article')).toHaveCount(fixtures.length - 1);
  await proceed(page);
  await fillAddress(page, 'guest-06@sandcastle.dev');
  const current = await readLocalCart(page);
  await startStripePaymentWithoutPaying(page);

  const guestId = anonymousId(guest);
  await expect.poll(async () => (await guestCarts(guest, guestId)).map(cart => databaseLines(cart.cart_items)))
    .toEqual([localLines(current)]);
});

test('GUEST-07 a paid guest order uses the checkout email and empties the bag', async ({ page, guest, env }) => {
  test.setTimeout(240000);
  const [fixture] = purchaseFixtures(env);
  const email = `guest-07-${Date.now()}@sandcastle.dev`;
  await seedLocalCart(page, [fixture]);
  await goToCheckout(page, email);

  await pay(page, env, 'stripe');

  const guestId = anonymousId(guest);
  let order;
  await expect.poll(async () => {
    [order] = unwrap(await guest.admin.from('orders').select('*').eq('user_id', guestId), 'Read guest order');
    return order && { payment: order.payment_status, printify: Boolean(order.printify_order_id) };
  }, { timeout: 90000 }).toEqual({ payment: 'paid', printify: true });
  guest.orders(guestId).register(order.printify_order_id);
  expect(order.customer_email).toBe(email);
  expect(Number(order.total_amount)).toBe(fixture.unit_price * fixture.quantity + 499);

  await expect.poll(() => readLocalCart(page), { timeout: 30000 }).toEqual([]);
  await page.goto('/cart');
  await expect(page.getByText(/bag(?: is|'s) empty|cart is empty/i).first()).toBeVisible();
});

test('GUEST-08 a guest who logs in keeps their product in the bag and can pay for it', async ({ page, guest, env }) => {
  test.setTimeout(360000);
  purchaseFixtures(env);
  const { body } = await createGuestProduct(page, env);
  const productId = body.product?.id ?? (await readLocalCart(page))[0].productId;
  const account = await guest.createAccount();

  expect((await loginUI(page, account)).status()).toBe(200);

  await expect.poll(async () => unwrap(await guest.admin.from('products').select('user_id').eq('printify_product_id', productId), 'Read claimed product').map(r => r.user_id), { timeout: 30000 })
    .toEqual([account.id]);
  await expect.poll(() => readLocalCart(page), { timeout: 30000 }).toEqual([]);
  await page.goto('/cart');
  await expect(page.getByRole('article')).toHaveCount(1);

  await proceed(page);
  await fillAddress(page, account.email);
  const failures = [];
  page.on('response', async response => {
    if (response.url().includes('/functions/v1/create-payment-intent') && !response.ok()) failures.push(await response.text());
  });
  await pay(page, env, 'stripe');

  let order;
  await expect.poll(async () => {
    [order] = unwrap(await guest.admin.from('orders').select('*').eq('user_id', account.id), 'Read account order');
    return order && { payment: order.payment_status, printify: Boolean(order.printify_order_id) };
  }, { timeout: 90000 }).toEqual({ payment: 'paid', printify: true });
  guest.orders(account.id).register(order.printify_order_id);
  expect(failures.join(' ')).not.toMatch(/PRODUCT_NOT_FOUND/);
});
