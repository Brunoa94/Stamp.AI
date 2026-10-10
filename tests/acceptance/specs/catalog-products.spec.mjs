import { test, expect, unwrap } from '../support/fixtures.mjs';
import { customize, createProduct } from '../support/customization.mjs';
import { activeCatalogProducts } from '../support/catalog.mjs';
import { proceed, fillAddress } from '../support/cart.mjs';
import { pay, verifyPurchase } from '../support/purchase.mjs';

test('CAT-04 test catalog mirrors the production snapshot', async ({ suppliedUser }) => {
  const rows = unwrap(await suppliedUser.db.from('catalog_products').select('blueprint_id,display_title,print_provider_id').eq('is_active', true), 'Active catalog');
  const key = ({ blueprint_id, display_title, print_provider_id }) => `${blueprint_id}|${display_title}|${print_provider_id}`;
  expect(rows.map(key).sort(), 'Run scripts/acceptance/sync-catalog.mjs --apply').toEqual(activeCatalogProducts().map(key).sort());
});
for (const product of activeCatalogProducts()) {
  test(`CUSTOM-08 ${product.display_title} creates a real Printify product on blueprint ${product.blueprint_id}`, async ({ page, account, env }) => {
    test.setTimeout(240000);
    await customize(page, env, product.display_title);
    const { body } = await createProduct(page);
    const created = await account.orders.request(`products/${body.product.id}.json`);
    expect(created.blueprint_id).toBe(product.blueprint_id);
    expect(created.print_provider_id).toBe(product.print_provider_id);
    expect(created.print_areas.flatMap(area => area.placeholders).flatMap(placeholder => placeholder.images).length).toBeGreaterThan(0);
  });
  test(`ORDER-08 ${product.display_title} is bought with Stripe and fulfilled as a real Printify order`, async ({ page, account, env }) => {
    test.setTimeout(300000);
    await customize(page, env, product.display_title);
    // Notebooks are bought in the paper type the customer picks.
    const paperType = page.getByRole('button', { name: 'Select Lined paper type' });
    const choosesPaper = await paperType.count() > 0;
    if (choosesPaper) await paperType.click();
    const { body } = await createProduct(page);
    await page.getByRole('button', { name: /^bag it$/i }).filter({ visible: true }).click();
    await expect(page).toHaveURL(/\/cart/);
    const cart = unwrap(await account.db.from('carts').select('id,cart_items(*)').eq('user_id', account.id).single(), 'Read bagged cart');
    expect(cart.cart_items).toHaveLength(1);
    const [item] = cart.cart_items;
    expect(item.product_id).toBe(body.product.id);
    expect(item.unit_price, 'Catalog product must have a sellable price').toBeGreaterThan(0);
    await proceed(page);
    await fillAddress(page, account.email);
    await pay(page, env, 'stripe');
    // Teardown cancels the Printify order registered here.
    const order = await verifyPurchase(account, { cart: { id: cart.id, items: cart.cart_items }, selected: cart.cart_items, totalCents: item.unit_price * item.quantity + 499 }, 'stripe');
    const remote = await account.orders.request(`orders/${order.printify_order_id}.json`);
    const [line] = remote.line_items;
    expect(line.product_id).toBe(body.product.id);
    const ordered = await account.orders.request(`products/${line.product_id}.json`);
    expect(ordered.blueprint_id).toBe(product.blueprint_id);
    // The fulfilled variant must be one the created product offers, not the blueprint's first.
    const variant = ordered.variants.find(candidate => candidate.id === line.variant_id);
    expect(variant?.is_enabled, `variant ${line.variant_id} enabled on product`).toBe(true);
    if (choosesPaper) expect(variant.title).toMatch(/lined/i);
  });
}
