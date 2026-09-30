# Stamp.AI — End-to-End Test Suite Specification

This document specifies a complete end-to-end (E2E) suite for **every flow** described in [USER_FLOWS.md](./USER_FLOWS.md). It drives the real UI with Playwright, calls the **real APIs, edge functions and third-party services** (Printify, Stripe, PayPal, Mollie), and verifies every write by **reading it back from the database**.

The suite runs against the **production-replica Supabase project**. Nothing is mocked. The checkout chain **places a real Printify order and cancels it** as part of the same run.

Contents

1. [Principles](#1-principles)
2. [Environment and prerequisites](#2-environment-and-prerequisites)
3. [Suite architecture](#3-suite-architecture)
4. [Shared helpers](#4-shared-helpers)
5. [Suite A — Stamp](#5-suite-a--stamp)
6. [Suite B — Cart](#6-suite-b--cart)
7. [Suite C — Checkout with Stripe, real Printify order, cancellation](#7-suite-c--checkout-with-stripe-real-printify-order-cancellation)
8. [Suite D — Checkout with PayPal](#8-suite-d--checkout-with-paypal)
9. [Suite E — Checkout with iDEAL (Mollie)](#9-suite-e--checkout-with-ideal-mollie)
10. [Suite F — Post-payment: webhooks, invoices, recovery](#10-suite-f--post-payment-webhooks-invoices-recovery)
11. [Suite G — Orders](#11-suite-g--orders)
12. [Suite H — Auth, profile, dashboard, credits](#12-suite-h--auth-profile-dashboard-credits)
13. [Suite J — Homepage, catalog, static pages](#13-suite-j--homepage-catalog-static-pages)
14. [Suite K — Responsive layouts](#14-suite-k--responsive-layouts)
15. [Suite L — Analytics events](#15-suite-l--analytics-events)
16. [Suite I — API contract tests](#16-suite-i--api-contract-tests)
17. [Traceability matrix](#17-traceability-matrix)
18. [Flows that cannot be automated end to end](#18-flows-that-cannot-be-automated-end-to-end)
19. [Running the suite](#19-running-the-suite)
20. [Data lifecycle, cleanup and Printify safety net](#20-data-lifecycle-cleanup-and-printify-safety-net)

---

## 1. Principles

1. **Write, then read back.** Every user action that must persist is followed by a database query (service-role client) asserting the exact row and columns. A UI assertion alone never counts as verification.
2. **One chain, real state.** The core journey is a serial chain: create product → bag it → cart → checkout → payment → order → **real Printify order** → invoice → orders page → **cancel the order** → refund. Each step consumes the ids produced by the previous one (product id, cart id, cart item ids, payment id, order id, Printify order id). No step seeds shortcut data when the previous step can produce it.
3. **Real services.** Printify (the shop configured on the replica), Stripe test mode, PayPal sandbox, Mollie test mode, the Next.js API routes and every Supabase edge function are called for real. The AI model is called by exactly one test group (costs coins and money).
4. **Every identified flow has a test.** Each scenario ID in USER_FLOWS.md maps to at least one test in the traceability matrix (§17). Flows whose specified outcome is a non-error state (guest redirect, empty cart, cart-not-found, pending payment, coin overlay) are covered like any other. Provider failure paths are covered where a deterministic trigger exists (Stripe test-card tokens, Mollie's status picker, PayPal cancel URL); the test passes when the app shows the specified screen and writes the specified state. The very few flows that cannot be automated are listed in §18 with their substitute.
5. **Known defects are pinned, not hidden.** Where USER_FLOWS §7 documents a defect, the test asserts the *specified* behaviour and marks that assertion `test.fixme` so the suite turns green the moment the fix lands, and nobody encodes the bug as expected.
6. **Isolation by identity.** Every run uses a unique `runId` (`e2e-<timestamp>-<rand>`) embedded in prompts, names and addresses, and a dedicated test user, so cleanup targets the run precisely.
7. **Poll, don't sleep.** Asynchronous effects (webhooks, invoices, Printify status) are verified with `pollUntil` against the database or the provider API with explicit timeouts.

---

## 2. Environment and prerequisites

### 2.1 Services

| Service | Mode | Notes |
|---|---|---|
| Supabase | production replica | service-role key for verification/cleanup; edge functions deployed on the replica. |
| Next.js app | `npm run dev` or a deployed replica (`BASE_URL`) | Playwright starts the dev server when `BASE_URL` is unset. |
| Printify | **the real shop configured on the replica** | Orders are created with `is_test: false` exactly as the app does, sit **on hold**, and are cancelled by the suite. See 2.4. |
| Stripe | test mode | `pk_test_` / `sk_test_`; webhook forwarding for invoice tests (2.5). |
| PayPal | sandbox | business + personal sandbox accounts. |
| Mollie | test API key | Mollie's hosted test page lets the test choose the final status. |
| OpenAI / Gemini | live | Used by Suite A-2 only. |
| Email (Brevo/Resend) | sandbox key | Asserted through `invoices.emailed_at` only. |
| GA4 | any measurement id | Needed by Suite L (events are no-ops without it). |

### 2.2 Environment variables

All variables live in `.env.local` (loaded by `playwright.config.ts` via `@next/env`). Never commit credentials. `src/tests/integration/setup-auth.ts` currently hardcodes a real login and must be migrated to these variables.

```bash
# Supabase (replica)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Dedicated E2E user (created by the global setup if missing)
TEST_USER_EMAIL=e2e+stamp@yourdomain.test
TEST_USER_PASSWORD=

# Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...              # from `stripe listen`
NEXT_PUBLIC_PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_SANDBOX_BUYER_EMAIL=
PAYPAL_SANDBOX_BUYER_PASSWORD=
MOLLIE_API_KEY=test_...
NEXT_PUBLIC_MOLLIE_ENABLED=true

# Printify (same shop the replica edge functions use)
PRINTIFY_API_TOKEN=
PRINTIFY_SHOP_ID=

# Analytics (Suite L)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXX

# Suite behaviour
E2E_RUN_AI_GENERATION=true      # false skips A-2 (coins + model calls)
E2E_PAYPAL=true                 # false skips the PayPal sandbox login (Suite D)
E2E_STRIPE_WEBHOOKS=true        # false skips webhook-dependent assertions (F-1, H-7)
E2E_KEEP_DATA=false             # true skips cleanup for debugging
```

### 2.3 Test user

`global.setup.ts` ensures the user exists and is confirmed, and resets coins so the generation tests are deterministic:

```ts
const admin = adminDb();
const { data } = await admin.auth.admin.listUsers();
let user = data.users.find(u => u.email === TEST_USER_EMAIL);
if (!user) {
  ({ data: { user } } = await admin.auth.admin.createUser({
    email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD, email_confirm: true,
    user_metadata: { first_name: "E2E", last_name: "Tester" },
  }));
}
await admin.from("profiles").update({ coins: 5, coins_reset_at: new Date().toISOString() }).eq("id", user!.id);
```

### 2.4 Real Printify orders — how the suite stays safe

The app submits orders to Printify with `is_test: false`, and `create-printify-order` only calls `POST /shops/{shop}/orders.json`; it never calls `send_to_production`. A created order therefore sits in Printify as **on hold / awaiting approval** and nothing is manufactured until someone approves it. The suite relies on that:

- **Every order the suite creates is cancelled in the same run**, through the app's own `cancel-order` edge function (Printify `POST /orders/{id}/cancel.json` → DB `cancelled` → `process-refund`). C-7, D-4, E-4 and G-4 do this and verify the Printify status is `canceled`.
- **Safety net.** Each checkout suite's `afterAll` and the global teardown read `RunState.orderIds`, look up `orders.printify_order_id`, and call Printify's cancel endpoint directly for anything not already `canceled` (§20). If a cancel is rejected because the order was already sent to production, the run fails loudly with the Printify order id so a human can act.
- **Shop requirement.** The replica's Printify shop must have **manual order approval** (no automatic "send to production after N hours") so that an order left behind by a crashed run cannot be produced before the next teardown. Confirm this in Printify → Settings → Order approval before the first run.
- Printify orders are placed with the run's address (`E2E <runId>`, Amsterdam) so they are recognisable in the Printify dashboard.

### 2.5 Stripe webhook forwarding

Invoices for Stripe orders and credit balances are written by `stripe-webhook`. When the app runs locally, forward events to the replica function and set the printed secret on the function:

```bash
stripe listen --forward-to https://<replica-ref>.supabase.co/functions/v1/stripe-webhook
```

With a deployed replica that has a Stripe webhook endpoint configured this is unnecessary. Set `E2E_STRIPE_WEBHOOKS=false` to skip the dependent assertions.

### 2.6 Fixtures

- `src/tests/fixtures/e2e-design-1024.png` — real 1024×1024 PNG with an opaque design on a transparent background (Printify rejects tiny images).
- `src/tests/fixtures/e2e-design-alt.png` — a second, visually different PNG for the "replace image" and "merge vs. new row" tests.
- `src/tests/fixtures/e2e-photo.jpg` — a JPEG, to cover the accepted-type list.

---

## 3. Suite architecture

```
src/tests/e2e/
├── README.md                           (existing — link here)
├── global.setup.ts                     ensure user, reset coins, promo row, purge stale e2e data
├── global.teardown.ts                  Printify safety net + cleanupRun
├── helpers/
│   ├── db.ts                           adminDb(), userSession(), pollUntil(), invokeFunction()
│   ├── printify.ts                     printifyGet(), printifyCancel(), waitForPrintifyStatus()
│   ├── providers.ts                    stripeGet(), paypalToken()/paypalGet(), mollieGet()
│   ├── state.ts                        RunState read/write (playwright/.state/run.json)
│   ├── stamp.ts                        page helpers for /stamp
│   ├── cart.ts                         page helpers for /cart
│   ├── checkout.ts                     page helpers for /checkout and return pages
│   ├── orders.ts                       page helpers for /orders
│   ├── gtag.ts                         analytics spy (Suite L)
│   └── selectors.ts                    central locator map
├── a-stamp.e2e.spec.ts                 Suite A (serial)
├── b-cart.e2e.spec.ts                  Suite B (serial, consumes A)
├── c-checkout-stripe.e2e.spec.ts       Suite C (serial, consumes B; places + cancels the Printify order)
├── d-checkout-paypal.e2e.spec.ts       Suite D (own product/cart)
├── e-checkout-mollie.e2e.spec.ts       Suite E (own product/cart)
├── f-post-payment.e2e.spec.ts          Suite F
├── g-orders.e2e.spec.ts                Suite G
├── h-account.e2e.spec.ts               Suite H
├── j-marketing.e2e.spec.ts             Suite J
├── k-responsive.e2e.spec.ts            Suite K (mobile + tablet projects)
├── l-analytics.e2e.spec.ts             Suite L
└── api/*.api.spec.ts                   Suite I
```

`playwright.config.ts` additions:

```ts
globalSetup: "./src/tests/e2e/global.setup.ts",
globalTeardown: "./src/tests/e2e/global.teardown.ts",
timeout: 180_000,
projects: [
  { name: "setup", testMatch: /auth\.setup\.ts/ },
  { name: "chain", testMatch: /[a-c]-.*\.e2e\.spec\.ts/, dependencies: ["setup"], fullyParallel: false, workers: 1,
    use: { ...devices["Desktop Chrome"], storageState: AUTH } },
  { name: "providers", testMatch: /[d-e]-.*\.e2e\.spec\.ts/, dependencies: ["setup"],
    use: { ...devices["Desktop Chrome"], storageState: AUTH } },
  { name: "post", testMatch: /[f-j]-.*\.e2e\.spec\.ts|l-.*\.e2e\.spec\.ts|api\/.*\.spec\.ts/, dependencies: ["chain", "providers"],
    use: { ...devices["Desktop Chrome"], storageState: AUTH } },
  { name: "mobile", testMatch: /k-.*\.e2e\.spec\.ts/, dependencies: ["setup"],
    use: { ...devices["Pixel 5"], storageState: AUTH } },
  { name: "tablet", testMatch: /k-.*\.e2e\.spec\.ts/, dependencies: ["setup"],
    use: { ...devices["iPad (gen 7)"], viewport: { width: 900, height: 1200 }, storageState: AUTH } },
],
```

Tests that must run **without** a session (guest redirects, register, login) create their own `browser.newContext()` with no `storageState`.

---

## 4. Shared helpers

### 4.1 `helpers/db.ts`

```ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** Service-role client: bypasses RLS. Verification and cleanup only. */
export function adminDb(): SupabaseClient<Database> {
  return createClient<Database>(URL, SERVICE, { auth: { persistSession: false } });
}

/** Real user session: for API tests that must respect RLS and auth. */
export async function userSession(email = process.env.TEST_USER_EMAIL!, password = process.env.TEST_USER_PASSWORD!) {
  const anon = createClient<Database>(URL, ANON, { auth: { persistSession: false } });
  const { data, error } = await anon.auth.signInWithPassword({ email, password });
  if (error || !data.session) throw error ?? new Error("no session");
  const db = createClient<Database>(URL, ANON, {
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
    auth: { persistSession: false },
  });
  return { db, userId: data.user.id, accessToken: data.session.access_token, email: data.user.email! };
}

export async function pollUntil<T>(read: () => Promise<T>, ok: (v: T) => boolean,
  { timeoutMs = 60_000, intervalMs = 2_000, label = "condition" } = {}): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  let last: T;
  do {
    last = await read();
    if (ok(last)) return last;
    await new Promise(r => setTimeout(r, intervalMs));
  } while (Date.now() < deadline);
  throw new Error(`pollUntil(${label}) timed out. Last value: ${JSON.stringify(last)}`);
}

export async function invokeFunction<T>(name: string, body: unknown, accessToken: string): Promise<T> {
  const res = await fetch(`${URL}/functions/v1/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}`, apikey: ANON },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`${name} ${res.status}: ${JSON.stringify(json)}`);
  return json as T;
}
```

### 4.2 `helpers/printify.ts`

```ts
const BASE = `https://api.printify.com/v1/shops/${process.env.PRINTIFY_SHOP_ID}`;
const H = { Authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}`, "Content-Type": "application/json" };

export async function printifyGet<T>(path: string): Promise<T> {
  const r = await fetch(`${BASE}${path}`, { headers: H });
  if (!r.ok) throw new Error(`Printify GET ${path} → ${r.status}`);
  return r.json();
}
export async function printifyCancel(orderId: string) {
  const r = await fetch(`${BASE}/orders/${orderId}/cancel.json`, { method: "POST", headers: H });
  return { ok: r.ok, status: r.status, body: await r.text() };
}
export async function printifyDeleteProduct(productId: string) {
  await fetch(`${BASE}/products/${productId}.json`, { method: "DELETE", headers: H });
}
export const waitForPrintifyStatus = (orderId: string, statuses: string[]) =>
  pollUntil(() => printifyGet<{ status: string }>(`/orders/${orderId}.json`), o => statuses.includes(o.status),
    { timeoutMs: 90_000, label: `printify ${orderId} ∈ ${statuses}` });
```

### 4.3 `helpers/state.ts`

```ts
export interface RunState {
  runId: string; userId: string;
  productId?: string; printifyProductId?: string; variantId?: string; unitPriceCents?: number;
  extraProductIds: string[];        // products.id for cleanup
  cartId?: string; cartItemIds?: string[]; selectedCartItemIds?: string[];
  stripePaymentIntentId?: string; paypalOrderId?: string; molliePaymentId?: string;
  orderIds: string[];               // every orders.id created by the run
  printifyOrderIds: string[];       // every Printify order id created by the run (safety net)
  extraUserIds: string[];
}
// loadState() / saveState(patch) / newRunId() as before (JSON file under playwright/.state/)
```

### 4.4 `helpers/selectors.ts`

Central locator map; labels come from `src/i18n/messages/en.json`. Only the entries used below are shown.

```ts
export const S = {
  stamp: {
    begin: /begin customization/i, fileInput: 'input[type="file"]', next: /^next step$/i,
    skipUpload: /skip upload/i, skipWithPhoto: /proceed without editing my photo/i,
    skipWithCached: /proceed with previous/i, generate: /stamp it/i, repeat: /^repeat$/i,
    useImage: /use this image/i, continueToCustomization: /continue to customization/i,
    removeProduct: /^remove$/i, continueToPreview: /continue to preview/i,
    createProduct: /create product/i, bagIt: /^bag it$/i, bagItCreateAnother: /bag it & create another/i,
    back: '[data-testid="back-button"]', coins: '[data-testid="coins-display"]',
    overlayLogin: '[data-testid="coins-overlay-login"]', overlayNoCoins: '[data-testid="coins-overlay-no-coins"]',
    placementPreview: '[data-testid="placement-preview"]', printArea: '[data-testid="print-area"]',
    designOverlay: '[data-testid="design-overlay"]', safeZone: '[data-testid="safe-zone"]',
    silhouette: '[data-testid="product-silhouette"]',
  },
  cart: { proceed: /proceed to checkout/i, remove: /^remove$/i, startCreating: /start creating/i,
          continueBrowsing: /continue browsing/i, selectAll: /select all|deselect all/i },
  checkout: { testMode: /test mode/i, shipElsewhere: /ship to a different address/i,
              payStripe: /^pay €/i, payPayPal: /pay with paypal/i, payIdeal: /pay with ideal/i,
              promoInput: /promo/i, promoApply: /^apply$/i, promoRemove: /remove promo code/i,
              trackOrder: /track your order/i, createAnother: /create another order/i,
              retry: /retry payment|try again/i, returnToCheckout: /return to checkout/i, backToCart: /back to cart/i },
  orders: { track: /track order|view design/i, trackShipment: /track shipment/i, cancel: /cancel order/i,
            reorder: /^reorder$/i, invoice: /download invoice|invoice/i, clearFilters: /clear filters/i },
} as const;
```

### 4.5 `helpers/stamp.ts` (the reusable journey)

```ts
export async function reachProductStepWithUpload(page: Page, fixture = FIXTURE) {
  await page.goto("/stamp");
  await page.getByRole("button", { name: S.stamp.begin }).click();
  await page.locator(S.stamp.fileInput).setInputFiles(fixture);
  await page.getByRole("button", { name: S.stamp.next }).click();
  await page.getByRole("button", { name: S.stamp.skipWithPhoto }).click();
  await expect(page.getByRole("button", { name: S.stamp.continueToCustomization })).toBeVisible();
}
export async function selectProduct(page: Page, title: RegExp) {
  const card = page.getByRole("button", { name: title }).first();
  await expect(card).toBeVisible({ timeout: 30_000 });
  await card.click();
  await expect(page.getByRole("button", { name: S.stamp.removeProduct })).toBeVisible();
  await page.getByRole("button", { name: S.stamp.continueToCustomization }).click();
}
export async function createProduct(page: Page) {
  const btn = page.getByRole("button", { name: S.stamp.createProduct });
  await expect(btn).toBeEnabled({ timeout: 30_000 });
  await btn.click();
  await expect(page.getByRole("button", { name: S.stamp.bagIt })).toBeVisible({ timeout: 150_000 });
}
/** Whole journey ending on /cart with a fresh product bagged. Used by Suites D, E, F, G. */
export async function bagFreshProduct(page: Page, title = /t-shirt|tee/i) {
  await reachProductStepWithUpload(page);
  await selectProduct(page, title);
  await createProduct(page);
  await page.getByRole("button", { name: S.stamp.bagIt }).click();
  await page.waitForURL(/\/cart$/);
}
```

---

## 5. Suite A — Stamp

File `a-stamp.e2e.spec.ts`, serial. Before all: `runId`, `userId`, `saveState`. Every test that creates a product appends `products.id` to `extraProductIds`.

### A-1 · Hero, upload, replace, remove, CTA variants (S-00, S-01)

Steps and assertions

1. `/stamp` → **Begin Customization**. Back button hidden on hero; visible afterwards with label "Start Here" (previous step label).
2. Upload `e2e-photo.jpg` → preview visible; file-info card shows the name and size in MB; CTA label **Next Step**.
3. Hover the preview → **REPLACE** overlay; upload `e2e-design-1024.png` → preview `src` changes (data URL differs).
4. Click **X** on the file card → preview gone; CTA label **Skip Upload**; the hidden input's `value` is empty.
5. Re-upload `e2e-design-1024.png` (same file again must be accepted) → **Next Step**.
6. **Next Step** → Describe step: prompt textbox, preservation slider at 50, remove-background checkbox checked, 15 suggestion cards + "No filter".
7. Click a suggestion card → it is highlighted; the prompt text is unchanged (documents S-02 note).
8. **Proceed without editing my photo** → Product step (S-02b).

DB: `profiles.coins` unchanged (read before/after). Browser: no `stamp:generated-images` key yet.

### A-2 · Prompt-only generation, repeat, gallery selection, cache (S-01c, S-02a, S-03, S-04)

Skipped when `E2E_RUN_AI_GENERATION=false`. Spends **2 coins**.

1. `/stamp` → Begin → **Skip Upload** → type `"${runId} minimalist line-art fox"`. Coins display reads `5 Coins available`.
2. **STAMP IT!** → Generation step: heading "Generating Your Design…", progress bar; no mobile action. Wait for **USE THIS IMAGE** (≤ 120 s).
3. DB: `get_user_coins(userId).coins === 4` (poll). UI: `4 Coins available` after returning to step 2.
4. **REPEAT** → back on Describe (prompt preserved) → change prompt slightly → **STAMP IT!** → Results.
5. Gallery visible with **2** thumbnails; the newest is selected (gold check, `aria-pressed=true`). Click the other → selection moves; hero image `src` changes.
6. Browser: `localStorage["stamp:generated-images"]` has 2 entries, newest first, each with `imageUrl`, `enhancedPrompt`, `createdAt` within the last 5 minutes. Both `imageUrl`s return HTTP 200.
7. DB: `coins === 3`.
8. **USE THIS IMAGE** → Product step.

### A-3 · Resume with cached images after reload (S-01b, S-02c, 3.5)

Depends on A-2 (cache present).

1. `page.reload()` → hero (state reset). **Begin** → step 1 CTA reads **Proceed with previous photos** (no upload). Click → Results step shows the 2 cached designs, first auto-selected.
2. Back → Describe (skips Generation). Secondary button reads **Proceed with previous generated photos** → Results.
3. Back button label from Results reads "Step 02 / Describe" (loading step skipped).

### A-4 · Out-of-coins overlay and its exits (S-02e)

1. Admin: `profiles.coins = 0`. Reload `/stamp` → Begin → upload fixture → Next.
2. Overlay `coins-overlay-no-coins` visible: "You're out of coins for today"; **STAMP IT!** disabled; the left filter grid is still clickable.
3. Overlay action **Proceed without editing my photo** → Product step.
4. Reload → Begin → Skip Upload → overlay action now reads **Proceed with previous generated photos** (cache from A-2) → Results step.
5. Admin: restore `profiles.coins = 3`. Reload → step 2 shows no overlay and `3 Coins available`.

### A-5 · Guest gating of /stamp (S-02d effective behaviour, 3.3)

Fresh context without auth: `goto("/stamp")` → response is a redirect and the final URL is `/`; header shows **Login** / **Register**. (The in-page login overlay is not reachable end to end; see §18.)

### A-6 · Product selection, remove, re-select (S-05)

1. `reachProductStepWithUpload` → grid shows **Apparel** and **Accessories** headings, no product with blueprint 12 (compare titles against `catalog_products` where `blueprint_id <> 12`), prices formatted `€x.xx` matching `selling_price_cents`.
2. Click a T-shirt → grid collapses to the selected card; spec bullets with **See more** when > 3; **CONTINUE** enabled.
3. **Remove** → grid returns; **CONTINUE** disabled.
4. Select the T-shirt again → **CONTINUE TO CUSTOMIZATION**.

### A-7 · Customization: colour, size, placement adjuster, create product, review (S-06, S-07, S-08 review)

1. Customization: colour `radiogroup` visible; click **Black** (`aria-pressed=true`); size select shows **M**; `[data-testid=placement-preview]`, `print-area`, `safe-zone`, `design-overlay` visible; position radios **Front** (checked) and **Back**.
2. Adjuster:
   - **→** once → `design-overlay.style.left` from `50%` to `60%`; **↓** once → `top` `60%`.
   - **Center** → `left` back to `50%`.
   - Scale **+** → readout **110%**, overlay `width` `110%`.
   - Rotation **90** → overlay transform contains `rotate(90deg)`.
   - Press **→** eight more times → the "safe print area" status appears and `left` stops increasing (clamped to the safe zone).
   - **Reset** → `left 50%`, `top 50%`, `width 100%`, `rotate(0deg)`, warning gone.
   - Scale **+** once more (final scale 1.1, unique idempotency key).
3. `createProduct(page)` → Production step shows "Creating Your Product Mockup…" then Final Review.
4. DB `products` (poll): newest row for `user_id`: `printify_product_id` set, `blueprint_id` of the chosen T-shirt, `print_provider_id` not null, `is_active = true`, `print_areas` includes `front`.
5. Printify: `GET /products/{printify_product_id}.json` → 200; `print_areas[0].placeholders` has `position: "front"` with `images[0].scale ≈ 1.1` (±0.01), `x ≈ 0.5`, `y ≈ 0.5`, `angle 0`; ≥ 1 enabled variant whose title contains `Black` and `M`.
6. Final Review: product title, "Color: Black", "Size: M", price = `selling_price_cents`; carousel shows ≥ 1 image (200 on fetch). **Next** arrow changes the image (when > 1); click the image → fullscreen modal; `Escape` closes it.
7. Browser: a `sessionStorage` key `stamp_product_*_scale1.10_completed === "true"`.
8. Save `productId`, `printifyProductId`, `unitPriceCents`.

### A-8 · Back navigation skips loading steps, idempotent re-create (3.1, 3.6)

1. From Final Review click back → Customization (step 7 skipped); back label reads "Step 06 / Customize" while on 8.
2. **CREATE PRODUCT** again without changes → toast "already created"; no new `products` row (count unchanged).
3. ⚠ `test.fixme`: the specified outcome is to land on Final Review; the current code stops on the Production step (USER_FLOWS §7). Assert the spec and mark fixme.
4. Navigate forward via back/CTA to Final Review for A-9.

### A-9 · Bag it, idempotent re-bag, redirect to /cart (S-08a)

1. **BAG IT** → URL `/cart`.
2. DB `carts`: one row `user_id = userId` → `cartId`. DB `cart_items`: one row `cart_id = cartId`, `product_id = printifyProductId`, `quantity 1`, `unit_price = unitPriceCents`, `variant_id` set → `variantId`, `product_name` non-empty, `custom_image_url` 200, `is_selected = true`.
3. Browser: `sessionStorage["stamp_cart_{printifyProductId}_{variantId}"] === "true"`.
4. `page.goBack()` (Final Review is gone — store reset on unmount → hero). Re-run `reachProductStepWithUpload` is *not* needed: instead call the RPC path via UI is impossible; so verify idempotency at the API level in I-5 and via UI in A-10 step 3.

### A-10 · Bag it & create another (S-08b)

1. `reachProductStepWithUpload` → `selectProduct(/tote/i)` → Customization: scale readout **50%** (tote default), single **Front** position → `createProduct`.
2. **BAG IT & CREATE ANOTHER** → stays on `/stamp`, Product step, nothing selected, Continue disabled; the selected design is still present (step 6 later shows it).
3. Select the same tote again → Customization → Create → toast "already created" → (fixme as A-8) → Final Review → **BAG IT** → toast "already in cart" → `/cart`. DB: still **two** `cart_items` rows.
4. DB: two `cart_items` (T-shirt + tote), both `quantity 1`; two `products` rows for the user. Save `cartItemIds` ordered by `created_at`.

### A-11 · Category-specific customization (S-06 table, 3.4)

Each row creates a product (no bagging) and asserts:

| Product | UI | DB / Printify |
|---|---|---|
| Mug (441 or 468) | no colour swatches; no `placement-preview`; size **11oz** static | `products` row exists; Printify product has ≥ 1 image |
| Socks (462 or 496) | position cards **Left Sock** and **Right Sock**, both `aria-pressed=true`; no swatches; no adjuster | Printify `print_areas` has both positions |
| Hoodie, **Back** selected | after choosing Back the silhouette `data-silhouette-key="apparel-back"`; Final Review's first carousel image differs from the front image of a front-only product | Printify product images include one with `camera_label` not `front` |
| Poster/canvas | choosing a portrait size makes the preview taller than wide; landscape size wider than tall (compare bounding boxes) | row exists |
| AOP tote (1389) or pillow (229) | only the scale slider is rendered (no arrows, no rotation) | Printify placeholder `x`/`y` equal the server-forced values (0.5/0.27 tote; 0.25/0.5 pillow) |

---

## 6. Suite B — Cart

File `b-cart.e2e.spec.ts`, serial, consumes `cartId`, `cartItemIds`.

### B-0 · Guest redirect (C-01)

Fresh context: `goto("/cart")` → skeleton then URL `/`.

### B-1 · Cart loads persisted items (C-02, C-05)

`/cart`: two `article` cards with names/prices from DB; header **2 of 2 selected**; subtotal = Σ; shipping **Free** iff subtotal ≥ 6000 cents else `€4.99`; total; footer "5–8 Business Days". RLS check: the same two rows are returned through the **user session** client.

### B-2 · Quantity up/down persists (C-10, C-11)

**+** on card 1 → live region `2`; DB `quantity = 2`; line total doubles. **−** → `1`; **−** disabled at 1.

### B-3 · Free shipping threshold crossing (4.3)

Increase card 1 until `Σ ≥ 6000` → shipping row **Free**, total = subtotal; DB quantity matches the count of clicks. Decrease back to 1 → `€4.99` returns.

### B-4 · Upsert merge vs. new row (4.5)

API (user session) `upsert_cart_item` with the same `(product, variant, custom_image_url)` → same `id`, `quantity 2`, still 2 rows. With a different `custom_image_url` (alt fixture uploaded to a public bucket) → **third** row. Reload `/cart` → three cards. Reset card 1 to `quantity 1` via **−**.

### B-5 · Remove (C-12)

**Remove** on the third card → DB row gone; two cards; header **2 of 2 selected**. Analytics `remove_from_cart` is asserted in Suite L.

### B-6 · Select / deselect and master checkbox (C-13, C-14)

1. Uncheck card 2 → **1 of 2 selected**; master checkbox `indeterminate`; summary shows only card 1 totals.
2. Click master → all selected (`2 of 2`).
3. ⚠ `test.fixme`: click master again → spec says **0 of 2 selected**, summary "Select items from your bag…", CTA disabled, mobile label "Select items to checkout". Current code re-selects everything (USER_FLOWS §7).
4. End state for the chain: uncheck card 2 (tote) → **1 of 2 selected**.

### B-7 · Reload behaviour (4.5)

`reload()` → selection is back to **2 of 2** (documented current behaviour; assert and reference the gap). Re-apply: uncheck card 2.

### B-8 · Continue browsing (C-15)

**Continue Browsing** → `/stamp`. Return to `/cart`, uncheck card 2 again.

### B-9 · Proceed to checkout persists selection (C-20)

**Proceed to Checkout** → URL `/checkout?cartId={cartId}`. DB: `is_selected` true for card 1, false for card 2 (poll). Save `selectedCartItemIds = [cartItemIds[0]]`.

---

## 7. Suite C — Checkout with Stripe, real Printify order, cancellation

File `c-checkout-stripe.e2e.spec.ts`, serial, consumes `cartId`, `selectedCartItemIds`.

### C-0 · Guest and not-found states (K-01, K-03)

1. Fresh context: `/checkout?cartId=…` → skeleton → `/`.
2. Authenticated: `/checkout` (no `cartId`) → **Cart Not Found** alert with **Back to Cart** → `/cart`. `/checkout?cartId=00000000-0000-0000-0000-000000000000` → same.

### C-1 · Checkout loads only selected items (K-02, K-04)

`/checkout?cartId=` → "Order items" list has **one** item (T-shirt); billing form; **Credit Card / PayPal / iDEAL** radios with Credit Card selected; **Test Mode** toggle visible; breakdown consistent (subtotal, shipping, total).

### C-2 · Address validation and ship-to-different-address (5.2)

1. Clear **First name** → inline `role=alert` "Please enter your first name"; **Pay** disabled. Refill → enabled (real-time validation).
2. Set email to `not-an-email` → "That email doesn't look right"; fix.
3. Fill billing with the run's data (first `E2E`, last `runId`, email `TEST_USER_EMAIL`, `Teststraat 1`, `Amsterdam`, `1012AB`, `NL`).
4. Check **Ship to a different address** → Shipping block appears; **Pay** disabled until filled ("Please add a shipping address"); fill with city **Rotterdam**, zip `3011AB`, `NL`; **Pay** enabled.

### C-3 · Promo code apply and remove (K-10)

Global setup guarantees `promocodes` row `E2E10` (percentage 10). Type `e2e10` → **Apply** → `/api/validate-promocode` 200 `isValid: true`, `discountValue = subtotal×0.10`; pill `E2E10`; Discount row `−€…`; total reduced. Click **×** → discount gone. (Pay without promo to keep the charged amount unambiguous; the persisted-discount gap is pinned in I-7.)

### C-4 · Pay with Stripe test card (K-20)

1. **Test Mode** on → **Visa**. Read `expectedTotalCents`.
2. **Pay €{total}** → `create-payment-intent` 200 → `paymentIntentId`; URL `/checkout/stripe-return?payment_intent=`.
3. Browser `stripe_checkout_data`: `paymentIntentId`, `cartId`, `lineItems.length 1`, `shippingAddress.city "Rotterdam"`.
4. DB `payment_transactions`: `stripe_payment_intent_id`, `payment_provider stripe`, `user_id`, `status ∈ {pending, succeeded}`, `currency eur`.
5. Stripe API: intent `status succeeded`, `metadata.user_id = userId`. ⚠ `amount === expectedTotalCents` — `test.fixme` until the ×100 defect is fixed.
6. Save `stripePaymentIntentId`.

### C-5 · Return page runs the pipeline and places the real Printify order (5.8, 5.9)

Wait for **Order Confirmed** (≤ 150 s). Then, in pipeline order:

1. `orders` (poll): one row `idempotency_key = "stripe_"+pi`; `status confirmed`, `payment_status paid`, `payment_method stripe`, `currency EUR`, `order_number ~ /^ORD-\d+-\d{3}$/`, `customer_email`, `customer_name "E2E <runId>"`, `shipping_address.city "Rotterdam"`, `subtotal = unit_price`. ⚠ `billing_address.city === "Amsterdam"` → `test.fixme` (billing not stored for Stripe). Save `orderId`.
2. `order_items`: **one** row (partial selection proven): `product_id`, `variant_id`, `quantity 1`, `unit_price`, `total_price`, `custom_image_url`, `design_config.custom_image_url`.
3. `payment_transactions.order_id = orderId`.
4. **Printify order (real).** `orders.printify_order_id` non-null (poll ≤ 120 s). Printify `GET /orders/{id}.json` → 200: `status ∈ {"pending","on-hold"}` (**not** `in-production`), `line_items.length 1`, `line_items[0].product_id = printifyProductId`, `address_to.city "Rotterdam"`, `address_to.first_name "E2E"`. Push to `printifyOrderIds`.
5. `order_status_history`: row `status confirmed`.
6. `payment_recovery`: `payment_intent_id`, `payment_provider stripe`, `recovery_status recovered`, `order_id`, `recovered_at`.
7. `cart_items`: **zero** rows for `cartId` (also removes the deselected tote — documented behaviour, referenced gap).
8. UI: order number = `orders.order_number`; "Paid via Stripe"; "7–10 business days"; **Track Your Order**; **Create Another Order**. Browser: `stripe_finalized_{pi} === "true"`, no `stripe_finalizing_*`, `stripe_checkout_data` removed.

### C-6 · Reload is idempotent (5.9 idempotency)

`reload()` → **Order Confirmed**; still one `orders` row for the key, one `order_items`, one `payment_recovery` row; Printify still has one order for the run (list `GET /orders.json?limit=50` filtered by `address_to.last_name = runId`).

### C-7 · Cancel the real Printify order from the orders page (O-04, 5.9 refunds)

1. **Track Your Order** → `/orders`; the order card shows `order_number` and **Processing**.
2. **Cancel order** → confirm modal → **Confirm**. Wait for `cancel-order` 200; the toast mentions Printify cancellation and the refund.
3. Printify: `waitForPrintifyStatus(printifyOrderId, ["canceled"])`.
4. DB `orders`: `status cancelled`, `cancelled_at`, `cancellation_reason "Cancelled by customer"`. `order_status_history` has a `cancelled` row.
5. DB `refunds`: `order_id`, `payment_provider stripe`, `amount > 0`, `provider_refund_id ~ /^re_/`, `status` succeeded/pending. `payment_transactions.status = "refunded"`.
6. Stripe API: `GET /v1/refunds?payment_intent={pi}` → one refund with the transaction amount.
7. UI: badge **Cancelled**; **Cancel order** replaced by **Reorder**; **Reorder** → `/stamp`.

### C-8 · Empty cart after purchase (C-03)

`/cart` → "Your bag's empty" → **Start Creating** → `/stamp`.

### C-9 · Declined test card shows the inline error and creates nothing (K-20 failure path)

New cart via `bagFreshProduct`. `/checkout?cartId=` → Test Mode → **Declined** → **Pay** → `create-payment-intent` responds with an error → inline `role=alert` under the button; URL unchanged; no `stripe_checkout_data`; DB: no `orders` row for the user created after the click; `payment_transactions` has no `succeeded` row for a new intent. Repeat once with **Insufficient funds**. Leave the cart for D/E? No — this cart is reused by C-10.

### C-10 · Return page recovery states (5.8, 5.11)

1. `/checkout/stripe-return` without params → **Something Went Wrong** "Payment information not found…" → **Return to Checkout** → `/checkout` → Cart Not Found (documented) → **Go to Dashboard** works.
2. `/checkout/paypal-return` without `token` → **Payment cancelled** screen "You cancelled the PayPal payment…"; **Retry Payment** → `/checkout`.
3. ⚠ 3-D Secure test card: spec says the user must complete verification; current code treats it as success → `test.fixme` asserting **no** order is created for that intent.

`afterAll`: cancel any Printify order in `printifyOrderIds` not yet `canceled` (§20).

---

## 8. Suite D — Checkout with PayPal

File `d-checkout-paypal.e2e.spec.ts`. Own product and cart via `bagFreshProduct`.

### D-1 · Redirect to PayPal creates a pending transaction (K-30 steps 1–2)

Fill billing; select **PayPal** (notice "We'll send you to PayPal…"); **Confirm Order • Pay with PayPal** → `create-paypal-order` 200 (`orderId`, `approvalUrl`) → URL on `sandbox.paypal.com`.

- Browser `paypal_checkout_data`: `paymentId`, `cartId`, `amount` cents, `lineItems.length 1`.
- DB `payment_transactions`: `paypal_order_id`, `payment_provider paypal`, `status pending`, `user_id`.
- PayPal API: order `status CREATED`, `intent CAPTURE`, `currency_code EUR`, amount = total.

### D-2 · Approve in the sandbox, capture, pipeline, real Printify order (K-30 steps 3–5)

Skipped when `E2E_PAYPAL=false`. `payWithPayPalSandbox(page)` (login + **Pay Now**) → URL `/checkout/paypal-return?token=&PayerID=` → `POST /api/paypal/capture-order` 200 (`captureId`, `status COMPLETED`) → **Order Confirmed**.

- `payment_transactions`: `status succeeded/captured`, `paypal_capture_id`, `paypal_payer_email` = buyer, `captured_at`.
- `orders`: `idempotency_key "paypal_"+orderId`, `confirmed`, `paid`, `payment_method paypal`; `order_items` 1; `payment_transactions.order_id`; `printify_order_id` set → Printify `status ∈ {pending, on-hold}` → push to `printifyOrderIds`; `payment_recovery recovered`; `cart_items` empty.
- PayPal API: order `status COMPLETED`.
- UI: order number, "Paid via PayPal".

### D-3 · PayPal cancel returns to checkout (K-30 cancel)

New cart. Start PayPal → on the sandbox page click **Cancel and return** → URL `/checkout` (no `cartId`) → **Cart Not Found** (documented). DB: `payment_transactions` for that PayPal order stays `pending`; no order. PayPal API: order `status CREATED` (never captured).

### D-4 · Cancel the PayPal order (O-04 for PayPal)

`/orders` → the D-2 order → **Cancel order** → confirm. Printify `canceled`; `orders.status cancelled`; `refunds.payment_provider paypal` with `provider_refund_id`; PayPal API `GET /v2/payments/captures/{captureId}` → `status REFUNDED`; `payment_transactions.status refunded`.

---

## 9. Suite E — Checkout with iDEAL (Mollie)

File `e-checkout-mollie.e2e.spec.ts`. Own product and cart.

### E-1 · Redirect to Mollie stores context and a pending transaction (K-40 steps 1–2)

Select **iDEAL** (notice "…via iDEAL…") → **Confirm Order • Pay with iDEAL** → `create-mollie-payment` 200 (`paymentId tr_…`, `checkoutUrl`).

- sessionStorage: `mollie_payment_id`, `mollie_cart_id`, `mollie_line_items` (1), `mollie_shipping_address.city`, `mollie_order_amount` (euros).
- DB `payment_transactions`: `mollie_payment_id`, `payment_provider mollie`, `status pending`, `mollie_status open`.
- Mollie API `GET /v2/payments/{id}`: `status open`, `method ideal`, `amount.currency EUR`, `redirectUrl` ends with `/checkout/mollie-return`.

### E-2 · Paid → pipeline, real Printify order, client-side invoice (K-40 steps 3–5)

On Mollie's test page choose issuer → status **Paid** → continue → `/checkout/mollie-return` → `verify-mollie-payment` 200 `isPaid true` → **Order Confirmed**.

- `payment_transactions`: `status succeeded`, `mollie_status paid`, `order_id`.
- `orders`: `idempotency_key "mollie_"+id`, `confirmed`, `paid`, `payment_method mollie`; `order_items` 1; `printify_order_id` → Printify `pending/on-hold` → `printifyOrderIds`; `payment_recovery recovered`; `cart_items` empty.
- **Invoice** (poll ≤ 60 s): `invoices` row `order_id`, `type invoice`, `invoice_number ~ /^INV-\d{4}-\d{5}$/`, `total_amount`, `customer_email`, `pdf_bucket invoices`, `pdf_path "{userId}/{invoice_number}.pdf"`; signed URL returns `application/pdf` > 1 KB; `invoice_counters` for the year +1 vs. before; `emailed_at` set (≤ 90 s) when an email key is configured.
- Browser: `mollie_*` keys removed; `mollie_finalized_{id} === "true"`.
- UI: order number, "Paid via Mollie".

### E-3 · Pending and failed return screens (5.8 Mollie states)

For each Mollie test status, start a fresh iDEAL payment on a new cart and choose the status on Mollie's page:

| Status chosen | Expected screen | DB |
|---|---|---|
| **Open** / **Pending** | **Payment Pending** card, **View Orders** → `/orders`; sessionStorage `mollie_*` kept | `payment_transactions.mollie_status = open/pending`, no order |
| **Canceled** | `PaymentError` "You canceled the payment. No charges have been made."; **Try Again** → `/checkout?cartId={cartId}` (cart preserved, form loads) | `mollie_status canceled`, `status canceled`, no order |
| **Expired** | "Your payment session has expired…" | `mollie_status expired`, `status failed` |
| **Failed** | "Sorry, your payment didn't go through…" | `mollie_status failed`, `status failed` |

Mollie API status matches each row.

### E-4 · Cancel the Mollie order (O-04 for Mollie)

`/orders` → E-2 order → **Cancel order**. Printify `canceled`; `orders cancelled`; `refunds.payment_provider mollie`, `provider_refund_id ~ /^re_/`; Mollie API `GET /v2/payments/{id}/refunds` → one refund; `payment_transactions refunded`; `invoices` for the order gains a credit-note row (`type` credit note, `related_invoice_id` = original) when the RPC issues one — assert when present.

---

## 10. Suite F — Post-payment: webhooks, invoices, recovery

File `f-post-payment.e2e.spec.ts`. Consumes order ids; API + DB, browser for F-3/F-4.

### F-1 · Stripe webhook links payment and issues the invoice (5.9 webhooks)

Skipped when `E2E_STRIPE_WEBHOOKS=false`. For the Stripe order (created in C-5, cancelled in C-7 — the webhook fired before cancellation): `webhook_events`/`is_webhook_event_processed` contains the `payment_intent.succeeded` event; `invoices` row exists for the order with a valid PDF; the webhook never changed `orders.status` away from the client-set value (history shows `confirmed` then `cancelled`, nothing else).

### F-2 · PayPal invoice path

`invoices` row for the PayPal order (from `capture-paypal-order` or `paypal-webhook`), same shape as E-2; `webhook_events` contains `PAYMENT.CAPTURE.COMPLETED` when the sandbox webhook is configured (else skip that line).

### F-3 · Payment recovery banner completes an interrupted payment (5.10)

Seeded because an interrupted-but-successful payment cannot be produced through the UI reliably:

1. User session: fresh cart with one item (`upsert_cart_item`), `create-payment-intent` in test mode with `pm_card_visa`, `confirm: true` → intent `succeeded`. Do **not** visit the return page.
2. RPC `record_payment_for_recovery` with the same shape the return page writes (`payment_status succeeded`, cart snapshot, line items, address).
3. `/dashboard` → banner **Incomplete Order Found**, amount, last 8 chars of the intent id → **Complete Order** → `process-payment-recovery` 200.
4. DB `orders`: `idempotency_key "stripe_"+pi`, `paid`, `status ∈ {pending, confirmed}`, `order_items` 1, `printify_order_id` set → push to `printifyOrderIds`; `payment_recovery recovered`, `recovery_attempts 1`.
5. ⚠ The banner then pushes `/orders/{id}` (404) → `test.fixme` on the navigation assertion; stop at the DB state.
6. Cancel this order through `cancel-order` (API) and assert Printify `canceled` (keeps the real-order count at zero after the run).

### F-4 · Dismiss a recovery (5.10)

Seed another recovery row (steps 1–2 above) → `/dashboard` → **Dismiss** → banner gone; DB `payment_recovery.recovery_status = "cancelled"`; no order created.

---

## 11. Suite G — Orders

File `g-orders.e2e.spec.ts`. Uses `orderIds` plus seeded orders for status mapping and pagination.

### G-1 · List, filters, view toggle, pills (O-01)

`/orders`: every run `order_number` visible; the cancelled ones show **Cancelled**, the F-3 order **Processing**. Status filter **Cancelled** → only cancelled; **Processing** → only processing; time **Last 30 Days** keeps them; filter pills appear and are removable; **Clear filters** resets; grid view renders the same count. RLS: user-session query returns the same rows.

### G-2 · Details modal matches the database (O-02)

Open the Mollie order: order number, item name/qty/unit price = `order_items`, delivery block city + email, payment method **Mollie**, status timeline entries = `order_status_history` rows (`confirmed`, `cancelled`), totals sidebar `subtotal = orders.subtotal`. Escape closes; click outside closes.

### G-3 · Invoice download (O-06)

Mollie order modal → **Download invoice** → popup URL is a signed URL for `invoices/{userId}/{invoice_number}.pdf`, 200, `application/pdf`. For an order without an invoice (seeded paid order from I-11) the click calls `generate-invoice` 200 and an `invoices` row appears.

### G-4 · Cancel flow cross-check and Reorder (O-04, O-05)

Already-cancelled order → **Cancel order** absent, **Reorder** present → `/stamp`. For the seeded I-12 order (real Printify order created with `is_test: true`): **Cancel order** → Printify `canceled`, DB cancelled, no refund row (order not paid via a provider) — toast reflects "no refund needed".

### G-5 · Track shipment (O-03)

Admin: set `tracking_url = "https://example.com/track/e2e"`, `tracking_number = "E2E123"` on the F-3 order → reload → **Track shipment** visible → click → new tab with that URL; modal shows the tracking number as a link.

### G-6 · Status badge mapping (6.4 table)

Seed six orders (I-11 pattern) and set, via admin, `(status, printify_status)` to: `(confirmed, pending)` → **Preparing**; `(confirmed, in-production)` → **In production**; `(confirmed, fulfilled)` → **Shipped**; `(delivered, fulfilled)` → **Delivered**; `(cancelled, canceled)` → **Cancelled**; `(confirmed, has-issues)` → **Needs attention**. Assert badges and that the **Delivered** row's primary button reads **View design**.

### G-7 · Pagination (O-01)

With the seeded orders the user has > 10 → pagination shows page 2; navigate → different order numbers; changing a filter resets to page 1.

### G-8 · Empty state (O-01)

Fresh confirmed user (from H-1) → `/orders` → empty state → CTA → `/stamp`.

---

## 12. Suite H — Auth, profile, dashboard, credits

File `h-account.e2e.spec.ts`. H-1 … H-4 use fresh contexts without stored auth.

### H-1 · Register (A-03)

`/` → **Register** → names, `e2e+${runId}@…`, password ×2 → **You're all set**. Admin: user exists, `email_confirmed_at null`, metadata names. Confirm via `updateUserById({ email_confirm: true })`; push to `extraUserIds`. Also: the login ↔ register footer links open the other dialog.

### H-2 · Login and redirect (A-01)

Guest `/stamp` → `/`. **Login** → credentials → toast "Welcome back" → URL `/stamp`; header **Logout**; admin `last_sign_in_at` updated. Login from `/catalog` also lands on `/stamp` (documented behaviour).

### H-3 · Password reset (A-04, A-05)

Login dialog → **Forgot password?** → email → toast. Admin `generateLink({type:"recovery"})` → open `action_link` → `/reset-password` → new password ×2 → **Your password is set** → auto-redirect `/` in 3 s. API: new password logs in, old fails.

### H-4 · Auth callback error page (A-02 error branch)

`/auth/callback` without `code` → `/auth/auth-code-error`: heading, **Return to Home** → `/`. ⚠ **Request a new reset link** targets `/auth/reset` (404) → `test.fixme` expecting a working destination.

### H-5 · Logout (A-06)

Authenticated `/orders` → **Logout** → toast → `/`; header shows **Login**; `/orders` now redirects to `/`.

### H-6 · Profile edits and cancel (P-01, P-02, P-03)

`/profile`: edit first name → save → toast → admin metadata updated; **Edit** again → change → **Cancel** → original restored in UI and metadata unchanged. Change password → toast → API login with new password; restore via admin. Add address (Amsterdam, NL) → toast → metadata `shipping_address.city`; card now reads **Edit address** and displays the address.

### H-7 · Dashboard content (D-01)

`/dashboard`: profile card email; **Edit profile** → `/profile`; quick access tiles → `/profile`, `/orders`; CTA → `/stamp`; recent orders ≤ 5 newest with run order numbers; row click opens the details modal (same as G-2); **View archive** → `/orders`. Error card **Retry**: covered in I-18 (health) only — no deterministic UI trigger.

### H-8 · Buy credits (B-01, B-02, B-03)

1. **Buy more** → packages 100/€9.99, 250/€19.99 (**popular**, preselected), 500/€34.99, 1000/€59.99. Custom: type `5` → inline min-10 error, **Continue** disabled; type `120` → price `€12.00`; select the 250 package again → custom cleared.
2. **Continue** → payment step; **Back** returns with the selection preserved; **PayPal** shows the "coming soon" placeholder; **Card** → Stripe `CardElement` iframe: `4242 4242 4242 4242`, `12/34`, `123`, `12345` → **Pay** → `create-credit-payment` 200 → dialog closes.
3. Stripe API: intent `succeeded`, `metadata.type credit_purchase`, `metadata.credits "250"`, `amount 1999`, `currency eur`.
4. With webhooks: `credit_transactions` row `amount 250`, `reference_id = intentId`; `user_credits.credits` +250.
5. ⚠ `test.fixme`: spec says the visible balance increases by 250 (dashboard card / stamp coins). Current code shows placeholders and reads `profiles.coins`.

---

## 13. Suite J — Homepage, catalog, static pages

File `j-marketing.e2e.spec.ts`.

### J-1 · Homepage CTAs (H-01)

For each: hero primary, every product card, product-of-the-month CTA, each promo CTA, process timeline button, bottom CTA primary → URL `/stamp` (`goBack` between). Hero secondary scrolls to `#products` (element in viewport). **View full catalog** → `/catalog`. FAQ contact link has `href^="mailto:"`. Products grid shows ≥ 1 card from `catalog_products`. ⚠ Bottom secondary CTA → `/products` (404) → `test.fixme` expecting `/catalog`. ⚠ Hero "free credits" link should open the auth modal → `test.fixme`.

### J-2 · Catalog (H-02)

`/catalog`: browse mode shows two showcase group cards; select **Apparel** → results mode, page scrolls to the group section (`#group-apparel` in viewport), **Back to showcase** returns. Search `zzz-no-match` → empty results + **Clear filters** → results. Sort changes the first card. Click a card → quick-view dialog: gallery, price (strike-through when `catalog_products` marks a sale), colours, specs; CTA → `/stamp`. Reload → browse mode again (filters not persisted).

### J-3 · Static pages (6.7)

Each of `/faq`, `/shipping`, `/returns`, `/terms`, `/privacy`, `/cookies`, `/security` responds 200 with an `h1` and a `mailto:` support link; FAQ `<details>` toggles open/closed; header and footer present. `/nonexistent` → 404 page renders.

---

## 14. Suite K — Responsive layouts

File `k-responsive.e2e.spec.ts`, run under the **mobile** (Pixel 5) and **tablet** (900 px) projects.

### K-1 · Mobile stamp flow (3.1 footer, S-06 sub-steps, S-08 polaroid)

Mobile only: hero has no footer; step 1 footer action **Skip Upload** / **Next Step**; step 2 footer **STAMP IT!** disabled without prompt; upload → skip → step 5 footer **CONTINUE TO CUSTOMIZATION** disabled until a product is picked (mobile grid is an `ExpandablePicker` with **Show N more**); step 6a: swatches + positions, footer **CONTINUE TO PREVIEW** → 6b: preview + adjuster in disclosures, footer **CREATE PRODUCT** → step 7 footer shows only back → step 8: `PolaroidPreview` instead of the carousel, footer **BAG IT** → `/cart`. Back button lives in the footer and skips loading steps. ⚠ Footer loading label `test.fixme` (missing `stamp.common.loading` key).

### K-2 · Mobile cart CTA (C-20 mobile)

Fixed bottom bar reads **Checkout · €{total}** with **1 item selected** text; tap → `/checkout?cartId=`. Deselect-all label variant is pinned by B-6's fixme.

### K-3 · Tablet product step (S-05 tablet layout)

At 900 px: **Apparel** disclosure open, **Accessories** closed; opening Accessories reveals mug/tote cards; the design adjuster sits inside a collapsed disclosure on step 6.

### K-4 · Checkout on mobile (K-04)

Single-column layout; summary below the form; **Pay** reachable; Test-Mode Visa payment completes (reuses C-4/C-5 assertions in compact form) and the resulting Printify order is cancelled via API in `afterAll`.

---

## 15. Suite L — Analytics events

File `l-analytics.e2e.spec.ts`. Requires `NEXT_PUBLIC_GA_MEASUREMENT_ID`. `addInitScript` defines `window.gtag = (...a) => window.__e2eGtag.push(a)` before any app script; events are asserted from `window.__e2eGtag`.

| Journey | Expected events (in order, with key params) |
|---|---|
| Login (H-2 steps) | `login {method: "email"}`; `page_view {page_path: "/stamp"}` |
| Stamp (A-1, A-7, A-9) | `step_change` per step; `stamp_image_upload {fileType}`; `select_item`; `color_select`; `size_select`; `stamp_create_product`; `add_to_cart {value, currency}` |
| Generation (A-2) | `stamp_generate_start`, `stamp_generate_complete {promptLength, usedReferenceImage:false}` |
| Cart (B-1, B-5, B-9) | `view_cart {value}`; `remove_from_cart {item_id}`; `begin_checkout {value, items}` |
| Checkout Stripe (C-4) | `purchase {value, currency, transaction_id = paymentIntentId}` |
| Logout | `logout` |

⚠ `currency` is `"USD"` today; spec says `"EUR"` → `test.fixme` on that param.

---

## 16. Suite I — API contract tests

`src/tests/e2e/api/*.api.spec.ts`; Playwright request-only, `userSession()` token, admin read-back. Pins every server contract the UI relies on.

| ID | Call | Assertions (response + DB) |
|---|---|---|
| I-1 | `get-catalog-blueprints` | 200; ≥ 1 item with `blueprint_id`, `print_provider_id`, prices; consistent with `catalog_products`. |
| I-2 | `get-blueprint-variants` (T-shirt) | `colors ∋ Black`, `sizes ∋ M`; equals `get_available_colors/sizes` RPCs. |
| I-3 | `upload-printify-image {image_url}` (fixture in a public bucket) | `id`, `previewUrl`, `width/height 1024`. |
| I-4 | `create-custom-product` (I-3 image, Black, M, front placement) | `product.id`, `images ≥ 1`, `selected_variant_id`; inserting into `products` via user session passes RLS; read back. Delete via Printify API in cleanup. |
| I-5 | `upsert_cart_item` ×2 identical | same `id`, `quantity 2`, row count unchanged. |
| I-6 | `update_cart_items_selection` | `is_selected` flags exactly match. ⚠ cross-user `p_cart_id` must be rejected → `test.fixme` (SECURITY DEFINER gap). |
| I-7 | `POST /api/validate-promocode` | `E2E10`/50 → `discountValue 5`; `" e2e10 "` normalised; unknown code → `isValid false` "Invalid promo code."; ⚠ persisted `orders.discount_amount` after a promo checkout → `test.fixme`. |
| I-8 | `create-payment-intent` with each success token (visa, visa_debit, mastercard, amex, discover) | 200; `payment_transactions pending`; Stripe `succeeded`. Declined tokens → error payload, no `succeeded` transaction. |
| I-9 | `create-paypal-order` | `orderId`, `approvalUrl` on sandbox; transaction row. |
| I-10 | `create-mollie-payment` → `verify-mollie-payment` | `open`, `isPaid false`; `mollie_status open`. |
| I-11 | Order creation via user session with `idempotency_key "e2e_"+runId`, twice | one `orders` row; second call returns the same id / is rejected by the unique key; items inserted. |
| I-12 | `create-printify-order {is_test: true}` for I-11's order | `printify_order_id`; `orders.status confirmed`; history row; Printify order exists. Cancelled in G-4. |
| I-13 | `generate-invoice` ×2 for a paid order | same `invoice_number`; one row; counter +1 once. Unpaid order → `INVOICE_ORDER_NOT_PAID`. |
| I-14 | `cancel-order` | `results` with Printify + refund outcome; `orders cancelled`; second call → "already cancelled" 200 with refund status. |
| I-15 | `process-refund` on an already refunded order | idempotent; no second `refunds` row. |
| I-16 | `get_user_coins` / `deduct_coin` | decrements by 1; `false` at 0; restore. |
| I-17 | `create-credit-payment {amount 999, credits 100, currency eur}` | `clientSecret`; Stripe `metadata.credits "100"`; `credits < 10` → 400. |
| I-18 | `/api/health` | 200. |
| I-19 | `record_payment_for_recovery` → `get_pending_payment_recoveries` → `mark_payment_recovered` | row appears in pending (24 h window), disappears after mark. |
| I-20 | `sync-blueprint` / `get-blueprint-variants` cache | second call faster and identical payload (catalog freshness contract). |

---

## 17. Traceability matrix

Every scenario in USER_FLOWS.md → tests. "Pinned" = asserted as specified with `test.fixme` because of a documented defect.

| Flow | Tests |
|---|---|
| 1.2 auth model, gating | A-5, B-0, C-0, H-2, H-5 |
| S-00 Hero | A-1, K-1 |
| S-01 Upload: validation types, replace, remove, CTA a/b/c | A-1, A-3, A-2 (skip), K-1 |
| S-02a Generate, coins display | A-2, L |
| S-02b Skip with my photo | A-1, A-7, D/E setups |
| S-02c Skip with cached images | A-3, A-4 |
| S-02d Not logged in | A-5 (effective redirect); §18 |
| S-02e Out of coins (both exits, dead-end variant) | A-4 |
| S-02 suggestion cards cosmetic | A-1 step 7 |
| S-03 Generation screen, coin deduction | A-2, I-16 |
| S-04 Results: auto-select, gallery, repeat, use image | A-2 |
| S-05 Product grid, grouping, exclusion, select, remove | A-6, K-3 |
| S-06 Colour/size rules, adjuster controls, safe zone, reset, per-family behaviour | A-7, A-11, K-1 |
| S-07 Creation pipeline, DB + Printify product, idempotency | A-7, A-8, A-10, I-3, I-4 |
| S-08 Review carousel/fullscreen/polaroid, Bag it, Bag it & create another, already-in-cart | A-7, A-9, A-10, K-1 |
| 3.1 Back skips loading steps, sidebar display-only | A-3, A-8 |
| 3.5 Persistence/resume | A-3, A-7 (session keys), A-9 |
| 3.6 Edge: identical product, identical bag | A-8, A-10 |
| C-01 Guest | B-0 |
| C-02/C-05 Load, view, RLS | B-1 |
| C-03 Empty | C-8, G-8 |
| C-10/C-11 Quantity, bounds | B-2 |
| 4.3 Free shipping threshold | B-3 |
| 4.5 Upsert merge | B-4, I-5 |
| C-12 Remove | B-5 |
| C-13/C-14 Select, master checkbox, nothing-selected state | B-6 (pinned), K-2 |
| 4.5 Reload resets selection | B-7 |
| C-15 Continue browsing | B-8 |
| C-20 Proceed to checkout, `is_selected` | B-9, K-2, I-6 |
| K-01 Guest, K-03 Cart not found | C-0 |
| K-02/K-04 Load selected items, layout | C-1, K-4 |
| 5.2 Validation, ship to different address | C-2 |
| K-10 Promo apply/remove/invalid | C-3, I-7 |
| 5.4 Method radios, Test Mode | C-1, C-4, C-9 |
| K-20 Stripe success | C-4, C-5, I-8 |
| K-20 Stripe declined / 3-DS | C-9, C-10 (pinned) |
| K-30 PayPal success / cancel | D-1, D-2, D-3, I-9 |
| K-40 iDEAL success / pending / canceled / expired / failed | E-1, E-2, E-3, I-10 |
| 5.8 Return-page states and actions | C-5, C-10, D-2, D-3, E-2, E-3 |
| 5.9 Pipeline: orders, items, Printify order, history, recovery, cart clear, idempotency | C-5, C-6, D-2, E-2, I-11, I-12 |
| 5.9 Invoices (client, webhook), credit notes | E-2, E-4, F-1, F-2, G-3, I-13 |
| 5.9 Refunds | C-7, D-4, E-4, I-15 |
| 5.10 Payment recovery complete / dismiss | F-3, F-4, I-19 |
| 5.11 Edge: reload during pipeline, retry without cartId, partial cart clears all | C-6, C-10, C-5 |
| A-01 … A-06 Auth | H-1 … H-5 |
| H-01 Homepage CTAs | J-1 |
| H-02 Catalog | J-2 |
| D-01 Dashboard | H-7, F-3, F-4 |
| O-01 List, filters, pagination, empty | G-1, G-6, G-7, G-8 |
| O-02 Details modal | G-2, H-7 |
| O-03 Track shipment | G-5 |
| O-04 Cancel (all providers, already cancelled) | C-7, D-4, E-4, G-4, I-14 |
| O-05 Reorder | C-7, G-4 |
| O-06 Invoice download / on-demand | G-3 |
| P-01 … P-03 Profile | H-6 |
| B-01 … B-03 Buy credits | H-8, I-17 |
| 6.7 Legal, FAQ, 404 | J-3 |
| Appendix B analytics | L |
| §7 defects | pinned in A-8, B-6, C-4, C-5, C-10, F-3, H-4, H-8, I-6, I-7, J-1, K-1, L |

---

## 18. Flows that cannot be automated end to end

| Flow | Why | Substitute |
|---|---|---|
| Google OAuth happy path (A-02) | Google blocks automated sign-in | H-4 covers the callback error branch; the redirect target is asserted at API level by reading `signInWithGoogle`'s `redirectTo` in a unit test |
| Login overlay on stamp step 2 (S-02d) | Guests are redirected by middleware before the overlay can render | A-5 asserts the effective guest flow; the overlay is covered by `CoinsOverlay.test.tsx` |
| Email delivery (verification, reset, invoice) | No mailbox in the loop | Admin `generateLink` for reset; `invoices.emailed_at` for invoice mail |
| Buy-credits PayPal | Placeholder UI | H-8 asserts the placeholder |
| Printify production/shipping statuses | Would require manufacturing | G-6 seeds `printify_status` values; the `sync-printify-orders` function is out of scope |

---

## 19. Running the suite

```bash
npx playwright install --with-deps
stripe listen --forward-to https://<replica-ref>.supabase.co/functions/v1/stripe-webhook   # keep running

npm run test:e2e                                  # everything: chain → providers → post, mobile/tablet
npx playwright test --project=chain               # revenue chain incl. real Printify order + cancel
npx playwright test src/tests/e2e/api             # API contracts (< 1 min)
npx playwright test --project=mobile --project=tablet
E2E_RUN_AI_GENERATION=false E2E_PAYPAL=false npm run test:e2e
```

CI: nightly `chain` + `providers` with `workers: 1` against the replica; `api/` on every PR.

---

## 20. Data lifecycle, cleanup and Printify safety net

`global.setup.ts` purges leftovers older than 24 h; each suite's `afterAll` and `global.teardown.ts` run the two steps below unless `E2E_KEEP_DATA=true`.

**Step 1 — Printify safety net (always runs, even with `E2E_KEEP_DATA`)**

```ts
export async function cancelLeftoverPrintifyOrders(state: RunState) {
  const db = adminDb();
  const { data } = await db.from("orders").select("id, printify_order_id, status")
    .in("id", state.orderIds).not("printify_order_id", "is", null);
  const failures: string[] = [];
  for (const o of data ?? []) {
    const remote = await printifyGet<{ status: string }>(`/orders/${o.printify_order_id}.json`);
    if (remote.status === "canceled") continue;
    const res = await printifyCancel(o.printify_order_id!);
    if (!res.ok) failures.push(`${o.printify_order_id} (${remote.status}): ${res.body}`);
  }
  for (const id of state.printifyOrderIds) { /* same for ids not linked to an order row */ }
  if (failures.length) throw new Error(`Printify orders could not be cancelled — act now:\n${failures.join("\n")}`);
  for (const p of state.extraProductIds) { /* printifyDeleteProduct(products.printify_product_id) */ }
}
```

**Step 2 — database cleanup (FK order)**

```ts
export async function cleanupRun(state: RunState) {
  const db = adminDb(); const orders = state.orderIds;
  await db.from("refunds").delete().in("order_id", orders);
  await db.from("invoices").delete().in("order_id", orders);
  await db.from("order_status_history").delete().in("order_id", orders);
  await db.from("payment_transactions").delete().in("order_id", orders);
  await db.from("payment_recovery").delete().eq("user_id", state.userId);
  await db.from("order_items").delete().in("order_id", orders);
  await db.from("orders").delete().in("id", orders);
  await db.from("cart_items").delete().eq("cart_id", state.cartId!);
  await db.from("carts").delete().eq("user_id", state.userId);
  await db.from("products").delete().eq("user_id", state.userId);
  await db.from("credit_transactions").delete().eq("user_id", state.userId);
  for (const id of state.extraUserIds) await db.auth.admin.deleteUser(id);
}
```

Stripe, PayPal and Mollie test objects are left in place (free and auditable). Invoice numbers are gapless by design, so the suite consumes numbers on the replica; never run it against production.
