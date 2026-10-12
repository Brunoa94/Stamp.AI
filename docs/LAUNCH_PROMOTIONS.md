# Launch promotions

`catalog_products.promotional_price` is an optional **integer EUR-cent unit price**.
The regular price stays in `selling_price_cents`. The database requires a positive
promotion below the regular price. Initially every promotion is NULL.

## Activation and cache refresh

An authorized operator sets the price using the existing Supabase SQL editor or
catalog management process. For example, for a product already priced at €30:

```sql
UPDATE public.catalog_products
SET promotional_price = 2000
WHERE blueprint_id = 6 AND selling_price_cents = 3000;
```

These are illustrative prices; the migration does not assign them. To end an offer,
set `promotional_price = NULL`. Clear or adjust an offer before lowering its regular
price below the promotional price. Catalog/Printify sync preserves promotional prices.

**After each price change**, POST to the existing protected
`/api/revalidate?tag=products&secret=<REVALIDATION_SECRET>` endpoint. Use a secure
operator client and do not paste secrets into shell history or PRs. This immediately expires
both catalog and priced-product caches; the next request waits for fresh data. Client catalog queries refresh on a fresh
navigation/session; an already open page can be reloaded. Until invalidation, the
storefront's existing 30-minute cache may show old inventory/prices; checkout quotes
always read current prices and reject stale payment totals.

The homepage and catalog show the launch banner while active promotional inventory
exists. The homepage section lists all active promoted products in existing catalog
order. No campaign dates, percentage claims, or initial discounts are fabricated.

## Purchase flow

Authenticated cart and checkout quotes reprice existing item snapshots without writing
cart rows. Existing Printify products resolve through the same ownership and blueprint
lookup as payment creation; catalog items use blueprint IDs. Duplicate variants,
quantities, and selected items retain their identity. Guest carts retain their preview
until login; payment requires an authenticated, current quote.

Promotional prices take priority in display and server payment pricing. Coupons stack
on the promotional subtotal. Shipping stays €4.99, free from €60 **after coupons**.
Cart summary uses its existing selected-item subtotal rule; checkout additionally
applies the coupon. Promotions can therefore change free-shipping eligibility.

Before Stripe, PayPal, or iDEAL creation, checkout refreshes the quote. A changed price
or total stops that payment action and asks the customer to review and click again.
Quote loading/errors block payment and expose a retry. Provider creation still
recalculates prices and validates the client's amount, catching changes after the quote.
A provider failure refreshes the quote; it never automatically retries a payment.

The effective promotional unit prices are stored in the existing payment transaction
pricing metadata. Order finalization, recovery, fulfillment, VAT, invoices, and refunds
continue to use that paid snapshot. Editing or ending an offer does not reprice a paid
order. Credit purchases are unaffected. Legacy sale-display fields still work for
products without `promotional_price`; promoted products derive their regular price
and discount percentage from the actual selling price.

## Deployment

1. Apply `20261012120000_add_promotional_price.sql`.
2. Deploy `checkout-quote` and the shared-pricing consumers:
   `create-payment-intent`, `create-paypal-order`, and `create-mollie-payment`.
   The quote function verifies user authentication internally and never creates a payment.
3. Deploy the frontend.
4. Invalidate the `products` cache; then configure approved real offers and invalidate again.

Apply the additive migration before functions/frontend because their explicit queries
include the new column. Leave prices NULL for a neutral rollout. To disable a campaign,
clear its promotional prices and refresh the cache. To roll back application behavior,
clear promotional prices first, then roll back frontend and payment functions together;
keep the additive column so deployed queries remain compatible.

Watch quote failures, `PRICE_MISMATCH`, `PRODUCT_NOT_PRICED`, payment creation errors,
and order finalization discrepancies in the existing application/Edge Function logs.
This PR does not deploy production, execute real payments, or change catalog prices.

## Reproducible checks

- Unit/regression suite: `npm run test:unit`.
- Storefront fixtures and mobile/desktop screenshots:
  `npx playwright test --config tests/promotions/playwright.config.mjs`.
  This starts only local fake Supabase services (55432) and Next.js (3104), uses
  synthetic credentials, and disables all payment creation. `bypassCSP` applies
  only to these test browser contexts so they can reach the HTTP fixture service;
  the application CSP is unchanged. Screenshots appear under `test-results/`.
- Constraint verification: point `PROMOTIONS_TEST_DATABASE_URL` at a **disposable empty**
  PostgreSQL database and run
  `psql "$PROMOTIONS_TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/promotional_price.sql`.
  The fixture creates a minimal catalog table, applies the real migration, checks
  invalid prices and regular-price updates, and rolls its transaction back.
  With that variable set, `npm run test:integration` also runs this fixture.

Local fixtures and mocked provider preflight tests do not establish that the quote
function is deployed or that external payment credentials work. After test-environment
deployment, validate one promotional order per provider in sandbox/test mode, then
verify its transaction metadata, invoice, recovery, and refund amounts before rollout.

## Validation recorded for this change

- Clean `npm ci` using the committed lockfile.
- Full unit run: **126 files, 1,374 tests passed**. The subsequently added effective-price
  sorting regression also passed (catalog mapper suite: 9 tests).
- PostgreSQL integration fixture: passed against a disposable local PostgreSQL 15 instance;
  the existing four live-Supabase integration suites were skipped without remote credentials.
- Browser fixtures: **3 tests passed**, exercising shopping pages at 390px and 1440px,
  keyboard navigation, header spacing, overflow, dual prices, cart/checkout quotes, and
  campaign removal after cache invalidation. No browser page errors occurred.
- Production `npm run build` with Next.js **16.4.0**, TypeScript, and lint on changed/new
  TypeScript files: passed. Lint retains existing unused-variable warnings.
- Deno checks passed for the quote function, shared pricing, Stripe creation, and Mollie
  creation. Checking PayPal creation additionally exposes **two pre-existing type errors**
  in its optional shipping-address fields (`address1` and `zip`); that provider file is unchanged.
- Provider payment actions were tested with mocks; no externally hosted sandbox payments
  were created. Sandbox validation remains a deployment check.

Fixture screenshots for homepage, launch offers, catalog, cart, and checkout at both
widths are in [screenshots/launch-promotions](screenshots/launch-promotions).
