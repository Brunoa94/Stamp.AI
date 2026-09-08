# Stamp.AI — End-to-End Test Suite Specification

This document specifies a complete end-to-end (E2E) suite for the flows described in [USER_FLOWS.md](./USER_FLOWS.md). It covers the **successful scenarios** of every flow, drives the real UI with Playwright, calls the **real APIs and edge functions**, and verifies every write by **reading it back from the database**.

The suite is designed to run against the **production-replica Supabase project** plus test-mode payment providers. Nothing is mocked.

Contents

1. [Principles](#1-principles)
2. [Environment and prerequisites](#2-environment-and-prerequisites)
3. [Suite architecture](#3-suite-architecture)
4. [Shared helpers](#4-shared-helpers)
5. [Suite A — Stamp: design, product creation, add to bag](#5-suite-a--stamp-design-product-creation-add-to-bag)
6. [Suite B — Cart](#6-suite-b--cart)
7. [Suite C — Checkout with Stripe](#7-suite-c--checkout-with-stripe)
8. [Suite D — Checkout with PayPal](#8-suite-d--checkout-with-paypal)
9. [Suite E — Checkout with iDEAL (Mollie)](#9-suite-e--checkout-with-ideal-mollie)
10. [Suite F — Post-payment: webhooks, invoices, recovery](#10-suite-f--post-payment-webhooks-invoices-recovery)
11. [Suite G — Orders](#11-suite-g--orders)
12. [Suite H — Auth, profile, dashboard, credits](#12-suite-h--auth-profile-dashboard-credits)
13. [Suite I — API contract tests (edge functions and routes)](#13-suite-i--api-contract-tests-edge-functions-and-routes)
14. [Traceability matrix](#14-traceability-matrix)
15. [Running the suite](#15-running-the-suite)
16. [Data lifecycle and cleanup](#16-data-lifecycle-and-cleanup)

---

## 1. Principles

1. **Write, then read back.** Every user action that must persist is followed by a database query (service-role client) asserting the exact row and columns. UI assertions alone never count as verification.
2. **One chain, real state.** The core journey is a single serial chain: create product → bag it → cart → checkout → payment → order → invoice → orders page. Each step consumes the ids produced by the previous one (product id, cart id, cart item ids, payment id, order id). No step seeds its own shortcut data when the previous step can produce it.
3. **Real APIs.** Printify (test shop), Stripe test mode, PayPal sandbox, Mollie test mode, the Next.js API routes and every Supabase edge function are called for real. Only the AI model call is limited to one dedicated test because it costs money and coins.
4. **Isolation by identity.** Every run uses a unique `runId` (`e2e-<timestamp>-<rand>`) embedded in prompt text and product names, and a dedicated test user, so cleanup can target the run precisely.
5. **Happy paths only.** Failure, cancel and timeout paths are out of scope for this suite (they are enumerated in USER_FLOWS.md for a future negative suite).
6. **Poll, don't sleep.** Asynchronous effects (webhooks, invoices, Printify sync) are verified with a `pollUntil` helper against the database with explicit timeouts.

---

## 2. Environment and prerequisites

### 2.1 Services

| Service | Mode | Notes |
|---|---|---|
| Supabase | production replica project | service-role key required for verification and cleanup. Edge functions deployed on the replica. |
| Next.js app | `npm run dev` or a deployed replica URL (`BASE_URL`) | Playwright starts the dev server when `BASE_URL` is unset. |
| Printify | **test shop** | See 2.4. |
| Stripe | test mode | `pk_test_`/`sk_test_`; webhook forwarding needed for invoice tests (2.5). |
| PayPal | sandbox | business + personal sandbox accounts. |
| Mollie | test API key | Mollie's hosted test page lets the test pick the final status. |
| OpenAI / Gemini | live | Used by exactly one test (A-2). |
| Email (Brevo/Resend) | test/sandbox key | Invoice email is only asserted through `invoices.emailed_at`. |

### 2.2 Environment variables

All variables live in `.env.local` (loaded by `playwright.config.ts` via `@next/env`). Never commit credentials; the existing `src/tests/integration/setup-auth.ts` hardcodes a real login and must be migrated to these variables.

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

# Printify test shop
PRINTIFY_API_TOKEN=
PRINTIFY_SHOP_ID=

# Suite behaviour
E2E_RUN_AI_GENERATION=true                  # set false to skip A-2 (costs coins + model calls)
E2E_KEEP_DATA=false                         # true to skip cleanup for debugging
```

### 2.3 Test user

The global setup ensures the user exists and is confirmed, using the admin API:

```ts
const admin = adminDb();
const { data } = await admin.auth.admin.listUsers();
if (!data.users.some(u => u.email === TEST_USER_EMAIL)) {
  await admin.auth.admin.createUser({
    email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD, email_confirm: true,
    user_metadata: { first_name: "E2E", last_name: "Tester" },
  });
}
```

Before each run the setup also resets the user's coins so the generation test is deterministic:

```ts
await admin.from("profiles").update({ coins: 5, coins_reset_at: new Date().toISOString() }).eq("id", userId);
```

### 2.4 Printify safety (read before running checkout suites)

The return pages send `is_test: false` to `create-printify-order`, and the edge function honours an explicit `false` outside production (`supabase/functions/_shared/testModeSafeguard.ts`). **On a non-production replica the checkout suites will therefore create real Printify orders on whatever shop the replica's `PRINTIFY_API_TOKEN` points to.** Requirements:

- The replica's Printify credentials must point to a **dedicated test shop** with no connected fulfilment, **or**
- the replica edge function environment must set `IS_PRODUCTION=false` **and** the client must send `is_test: true` in E2E runs. The smallest safe change is an env flag read by the three return clients (`NEXT_PUBLIC_PRINTIFY_TEST_ORDERS=true` → `is_test: true`). Until such a flag exists, use option one.

Suite G additionally cancels the orders it creates, which removes them from Printify when the shop supports cancellation of unpaid/test orders.

### 2.5 Stripe webhook forwarding

Invoices for Stripe are created by `stripe-webhook`. When the app runs locally, forward events to the replica function:

```bash
stripe listen --forward-to https://<replica-ref>.supabase.co/functions/v1/stripe-webhook
```

and set the printed `whsec_` as `STRIPE_WEBHOOK_SECRET` on the replica function. When `BASE_URL` points to a deployed replica with a configured Stripe webhook endpoint, this step is unnecessary. Suite F tests are skipped automatically when `E2E_STRIPE_WEBHOOKS=false`.

### 2.6 Fixtures

- `src/tests/fixtures/e2e-design-1024.png` — a real 1024×1024 PNG (opaque design on transparent background). The existing 1×1 fixture is too small for Printify's image upload.
- The `runId` is embedded as text in the prompt and in nothing else that Printify validates.

---

## 3. Suite architecture

```
src/tests/e2e/
├── README.md                      (existing — link to this document)
├── global.setup.ts                ensure test user, reset coins, purge stale e2e data > 24 h
├── helpers/
│   ├── db.ts                      adminDb(), userSession(), pollUntil(), cleanupRun()
│   ├── state.ts                   RunState read/write (playwright/.state/<runId>.json)
│   ├── stamp.ts                   page helpers for /stamp steps
│   ├── cart.ts                    page helpers for /cart
│   ├── checkout.ts                page helpers for /checkout and return pages
│   └── selectors.ts               central locator map
├── a-stamp.e2e.spec.ts            Suite A  (serial)
├── b-cart.e2e.spec.ts             Suite B  (serial, consumes A)
├── c-checkout-stripe.e2e.spec.ts  Suite C  (serial, consumes B)
├── d-checkout-paypal.e2e.spec.ts  Suite D  (own product + cart via A helpers)
├── e-checkout-mollie.e2e.spec.ts  Suite E  (own product + cart)
├── f-post-payment.e2e.spec.ts     Suite F  (consumes C/D/E order ids)
├── g-orders.e2e.spec.ts           Suite G
├── h-account.e2e.spec.ts          Suite H
└── api/
    ├── cart.api.spec.ts           Suite I
    ├── products.api.spec.ts
    ├── payments.api.spec.ts
    └── orders.api.spec.ts
```

Playwright configuration additions (`playwright.config.ts`):

```ts
projects: [
  { name: "setup", testMatch: /global\.setup\.ts|auth\.setup\.ts/ },
  { name: "chain", testMatch: /[a-c]-.*\.e2e\.spec\.ts/, dependencies: ["setup"], fullyParallel: false, workers: 1,
    use: { ...devices["Desktop Chrome"], storageState: "playwright/.auth/user.json" } },
  { name: "providers", testMatch: /[d-e]-.*\.e2e\.spec\.ts/, dependencies: ["setup"],
    use: { ...devices["Desktop Chrome"], storageState: "playwright/.auth/user.json" } },
  { name: "post", testMatch: /[f-h]-.*\.e2e\.spec\.ts|api\/.*\.spec\.ts/, dependencies: ["chain", "providers"],
    use: { ...devices["Desktop Chrome"], storageState: "playwright/.auth/user.json" } },
],
timeout: 180_000,
```

- Suites A → B → C run **serially in one worker** and pass state through `RunState`.
- Suites D and E each build their own product and cart (via the Suite A helpers) so they can run in parallel with the chain.
- Suites F, G, H and the API suite run after all orders exist.

---

## 4. Shared helpers

### 4.1 `helpers/db.ts`

```ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** Service-role client: bypasses RLS. Used ONLY for verification and cleanup. */
export function adminDb(): SupabaseClient<Database> {
  return createClient<Database>(URL, SERVICE, { auth: { persistSession: false } });
}

/** Real user session: used for API-level tests that must respect RLS and auth. */
export async function userSession() {
  const anon = createClient<Database>(URL, ANON, { auth: { persistSession: false } });
  const { data, error } = await anon.auth.signInWithPassword({
    email: process.env.TEST_USER_EMAIL!, password: process.env.TEST_USER_PASSWORD!,
  });
  if (error || !data.session) throw error ?? new Error("no session");
  const db = createClient<Database>(URL, ANON, {
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
    auth: { persistSession: false },
  });
  return { db, userId: data.user.id, accessToken: data.session.access_token, email: data.user.email! };
}

/** Poll a query until the predicate passes. Fails with the last value on timeout. */
export async function pollUntil<T>(
  read: () => Promise<T>,
  predicate: (v: T) => boolean,
  { timeoutMs = 60_000, intervalMs = 2_000, label = "condition" } = {},
): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  let last: T;
  do {
    last = await read();
    if (predicate(last)) return last;
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

### 4.2 `helpers/state.ts`

```ts
import fs from "fs";
import path from "path";

export interface RunState {
  runId: string;
  userId: string;
  productId?: string;          // products.id (uuid)
  printifyProductId?: string;  // products.printify_product_id == cart_items.product_id
  variantId?: string;
  unitPriceCents?: number;
  cartId?: string;
  cartItemIds?: string[];
  selectedCartItemIds?: string[];
  stripePaymentIntentId?: string;
  paypalOrderId?: string;
  molliePaymentId?: string;
  orderIds: string[];
}

const FILE = path.resolve(process.cwd(), "playwright/.state/run.json");

export function loadState(): RunState { return JSON.parse(fs.readFileSync(FILE, "utf8")); }
export function saveState(patch: Partial<RunState>) {
  const cur = fs.existsSync(FILE) ? loadState() : ({ orderIds: [] } as RunState);
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify({ ...cur, ...patch }, null, 2));
}
export function newRunId() { return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }
```

### 4.3 `helpers/selectors.ts`

Central map so a UI change is fixed in one place. Labels come from `src/i18n/messages/en.json`.

```ts
export const S = {
  stamp: {
    begin: { role: "button", name: /begin customization/i },
    fileInput: 'input[type="file"]',
    next: { role: "button", name: /^next step$/i },
    skipUpload: { role: "button", name: /skip upload/i },
    skipWithPhoto: { role: "button", name: /proceed without editing my photo/i },
    skipWithCached: { role: "button", name: /proceed with previous/i },
    prompt: { role: "textbox" },
    generate: { role: "button", name: /stamp it/i },
    useImage: { role: "button", name: /use this image/i },
    continueToCustomization: { role: "button", name: /continue to customization/i },
    createProduct: { role: "button", name: /create product/i },
    bagIt: { role: "button", name: /^bag it$/i },
    bagItCreateAnother: { role: "button", name: /bag it & create another/i },
    back: '[data-testid="back-button"]',
    coins: '[data-testid="coins-display"]',
    placementPreview: '[data-testid="placement-preview"]',
  },
  cart: {
    proceed: { role: "button", name: /proceed to checkout/i },
    remove: { role: "button", name: /remove/i },
    itemCard: "article",
  },
  checkout: {
    testMode: { role: "checkbox", name: /test mode/i },
    payStripe: { role: "button", name: /^pay €/i },
    payPayPal: { role: "button", name: /pay with paypal/i },
    payIdeal: { role: "button", name: /pay with ideal/i },
    promoInput: { role: "textbox", name: /promo/i },
    promoApply: { role: "button", name: /^apply$/i },
    trackOrder: { role: "link", name: /track your order/i },
  },
} as const;
```

### 4.4 `helpers/stamp.ts` (excerpt — the reusable product-creation journey)

```ts
import { Page, expect } from "@playwright/test";
import path from "path";
import { S } from "./selectors";

export const FIXTURE = path.resolve(process.cwd(), "src/tests/fixtures/e2e-design-1024.png");

/** Hero → Upload → Describe(skip) → Product. Ends on step 5 with the uploaded image selected. */
export async function reachProductStepWithUpload(page: Page) {
  await page.goto("/stamp");
  await page.getByRole("button", S.stamp.begin).click();
  await page.locator(S.stamp.fileInput).setInputFiles(FIXTURE);
  await expect(page.getByRole("button", S.stamp.next)).toBeVisible();
  await page.getByRole("button", S.stamp.next).click();
  await page.getByRole("button", S.stamp.skipWithPhoto).click();
  await expect(page.getByRole("button", S.stamp.continueToCustomization)).toBeVisible();
}

/** Picks the first product whose title matches, waits for the selected card, continues. */
export async function selectProduct(page: Page, titlePattern: RegExp) {
  const card = page.getByRole("button", { name: titlePattern }).first();
  await expect(card).toBeVisible({ timeout: 30_000 });
  await card.click();
  await expect(page.getByRole("button", { name: /remove/i })).toBeVisible();
  await page.getByRole("button", S.stamp.continueToCustomization).click();
}

/** Step 6 → 7 → 8. Returns when the review step is visible. */
export async function createProduct(page: Page) {
  const btn = page.getByRole("button", S.stamp.createProduct);
  await expect(btn).toBeEnabled({ timeout: 30_000 });
  await btn.click();
  await expect(page.getByRole("button", S.stamp.bagIt)).toBeVisible({ timeout: 150_000 });
}
```

---

## 5. Suite A — Stamp: design, product creation, add to bag

File: `a-stamp.e2e.spec.ts`, `test.describe.configure({ mode: "serial" })`. Covers S-00 … S-08.

Before all: `runId = newRunId()`, resolve `userId` via `userSession()`, `saveState({ runId, userId, orderIds: [] })`.

### A-1 · Hero → Upload → skip generation → Product step (S-00, S-01a, S-02b)

Steps

1. `reachProductStepWithUpload(page)`.
2. Assert the back button is visible and labelled with the previous step ("Step 04 / Results" is skipped; label reads "Step 02 / Describe").

Verifications

- UI: product grid shows the **Apparel** and **Accessories** headings; at least one product card.
- No coin was spent: `profiles.coins` for the user is unchanged (read before and after).

### A-2 · AI generation with a prompt deducts one coin and caches the result (S-02a, S-03, S-04)

Skipped when `E2E_RUN_AI_GENERATION=false`.

Steps

1. `/stamp` → Begin → Skip Upload (prompt-only) → type prompt `"${runId} minimalist line-art fox"`.
2. Read `coinsBefore = get_user_coins(userId).coins` (via the admin client RPC).
3. Click **STAMP IT!**; wait for the Results step: **USE THIS IMAGE** visible (timeout 120 s).

Verifications

- DB: `get_user_coins(userId).coins === coinsBefore - 1` (poll ≤ 10 s).
- UI: coins display shows `${coinsBefore - 1} Coins available`.
- Browser: `localStorage["stamp:generated-images"]` parses to an array of length ≥ 1 whose first item has `imageUrl` and `enhancedPrompt`.
- Result image `src` returns HTTP 200 when fetched by the test (`page.request.get`).

### A-3 · Full product creation on a T-shirt writes a Printify product and a `products` row (S-05, S-06, S-07)

Steps

1. `reachProductStepWithUpload(page)`.
2. `selectProduct(page, /t-shirt|tee/i)`.
3. On Customization: assert colour swatches (`radiogroup`) are visible; click the swatch named **Black**; assert the size selector shows a default (M); assert `[data-testid="placement-preview"]` and `[data-testid="print-area"]` are visible.
4. Nudge the scale once with the "+" button so the placement differs from the default (and produces a unique idempotency key).
5. `createProduct(page)`.

Verifications

- DB `products`: poll for the newest row where `user_id = userId` created after the test start.
  - `printify_product_id` is a non-empty string.
  - `blueprint_id` equals the blueprint of the selected card (read from the product grid's data or from `catalog_products` by title).
  - `print_provider_id` not null; `is_active = true`; `print_areas` JSON contains the `front` position.
- Printify API (real call, test shop): `GET https://api.printify.com/v1/shops/{PRINTIFY_SHOP_ID}/products/{printify_product_id}.json` returns 200 with `images.length ≥ 1` and a variant whose `is_enabled` is true.
- UI: Final Review shows the product title, "Color: Black", "Size: M", a price matching `selling_price_cents` of the catalog product, and the mockup carousel with ≥ 1 image whose `src` returns 200.
- Browser: `sessionStorage` has a key starting with `stamp_product_` ending in `_completed` with value `"true"`.
- Save state: `productId`, `printifyProductId`, `variantId` (from the mockup/`products` row and the later `cart_items.variant_id`), `unitPriceCents`.

### A-4 · Bag it creates the cart and the cart item, then redirects to /cart (S-08a)

Steps

1. Continue from A-3 (same page). Click **BAG IT**.
2. Wait for URL `/cart`.

Verifications

- DB `carts`: exactly one row with `user_id = userId` (poll). Save `cartId`.
- DB `cart_items`: one row with `cart_id = cartId` and `product_id = printifyProductId`:
  - `quantity = 1`
  - `unit_price = unitPriceCents` (integer, > 0)
  - `variant_id` non-empty → save `variantId`
  - `product_name` non-empty
  - `custom_image_url` starts with `https://` and returns 200
  - `is_selected = true` (column default)
- Browser: `sessionStorage["stamp_cart_{printifyProductId}_{variantId}"] === "true"`.
- UI: `/cart` lists one article with the same product name and the unit price formatted as `€{unitPriceCents/100}`.

### A-5 · Bag it & create another on a second product (S-08b)

Steps

1. `reachProductStepWithUpload(page)` → `selectProduct(page, /tote/i)`.
2. Customization: assert the preview is visible and the scale slider reports **50%** (tote default 0.5). Create product.
3. Click **BAG IT & CREATE ANOTHER**.

Verifications

- UI: the page stays on `/stamp` and shows the **Product** step with no product selected (Continue disabled).
- DB `cart_items`: now **two** rows for `cartId`; the new row has a different `product_id`; `quantity = 1`.
- DB `products`: a second row for the user with the tote `blueprint_id`.
- Save `cartItemIds` (both ids, ordered by `created_at`).

### A-6 · Category-specific customization (S-06 table)

Run for the products in the table; each creates a product and asserts DB + UI, without bagging (to keep the chain cart at two items).

| Product | UI assertions | DB assertions (`products` row) |
|---|---|---|
| Mug (blueprint 441/468) | no colour swatches, no placement preview, size shows `11oz` | `print_areas` present; product exists in Printify |
| Socks (462/496) | two position cards **Left Sock** / **Right Sock**, both pressed; no swatches | `print_areas` contains both positions |
| Hoodie with **Back** position | select the Back radio before creating | Printify product images include a back camera view; first mockup on the review step is the back image |
| Poster/canvas | size select drives orientation (portrait size → preview taller than wide) | row exists |

Each created product id is appended to `RunState.extraProductIds` for cleanup.

---

## 6. Suite B — Cart

File: `b-cart.e2e.spec.ts`, serial, consumes `cartId`, `cartItemIds` from Suite A. Covers C-02, C-05, C-10 … C-14, C-20.

### B-1 · Cart loads the persisted items (C-02, C-05)

Steps: `page.goto("/cart")`.

Verifications

- UI: two `article` cards; names and unit prices match the two `cart_items` rows; selection header reads **2 of 2 selected**; summary subtotal equals `Σ unit_price × quantity` formatted; shipping reads **Free** when subtotal ≥ 6000 cents, else `€4.99`; total = subtotal + shipping.
- DB read: the query used by the page (`carts` with `cart_items`) returns the same two rows via the **user session** client (RLS check).

### B-2 · Increase quantity persists (C-10)

Steps: on the first card click **+** once; wait for the quantity live region to read `2`.

Verifications

- DB `cart_items.quantity = 2` for `cartItemIds[0]` (poll ≤ 10 s).
- UI: line total = `unit_price × 2`; summary subtotal updated accordingly.

### B-3 · Decrease quantity persists (C-11)

Steps: click **−** on the same card.

Verifications: `cart_items.quantity = 1`; **−** button disabled at 1.

### B-4 · Add the same product again merges quantity (C-4.5 upsert)

Steps (API, user session): call the RPC the stamp page uses:

```ts
await db.rpc("upsert_cart_item", {
  p_cart_id: cartId, p_product_id: printifyProductId, p_variant_id: variantId,
  p_quantity: 1, p_unit_price: unitPriceCents, p_product_name: "E2E merge", p_custom_image_url: sameImageUrl,
});
```

Verifications: still **two** `cart_items` rows for the cart; the matching row has `quantity = 2`. Then reset it to 1 via the UI (**−**) and assert `quantity = 1` in DB.

### B-5 · Remove an item deletes the row (C-12)

Steps

1. Via the API (user session) add a third throwaway item with `upsert_cart_item` (distinct `p_custom_image_url` so it does not merge). Reload `/cart` and assert three cards.
2. Click **Remove** on the throwaway card.

Verifications

- DB: `cart_items` row id no longer exists (poll); the two original rows are intact.
- UI: two cards, selection header **2 of 2 selected**.

### B-6 · Deselect one item and proceed to checkout persists `is_selected` and navigates (C-13, C-20)

Steps

1. Uncheck the checkbox on the **second** card (tote). Assert header reads **1 of 2 selected**, summary shows only the first item's subtotal.
2. Click **Proceed to Checkout**.
3. Wait for URL `/checkout?cartId={cartId}` (assert the query param equals the DB `cartId`).

Verifications

- DB `cart_items`: `is_selected = true` for `cartItemIds[0]`, `false` for `cartItemIds[1]` (poll).
- Save `selectedCartItemIds = [cartItemIds[0]]`.

> Partial selection is deliberately used so Suite C can prove that only the selected item becomes an order item.

---

## 7. Suite C — Checkout with Stripe

File: `c-checkout-stripe.e2e.spec.ts`, serial, consumes `cartId`, `selectedCartItemIds`. Covers K-02, K-04, K-10, K-20 and pipeline 5.9.

### C-1 · Checkout loads only the selected items (K-02, K-04)

Steps: `page.goto("/checkout?cartId=" + cartId)`.

Verifications

- UI: "Order items" list has **one** item (the T-shirt), not the deselected tote; billing form present with the country select; payment method radios **Credit Card / PayPal / iDEAL**; **Credit Card** selected.
- Price breakdown: subtotal = item unit price; shipping `€4.99` or Free per threshold; total consistent.

### C-2 · Apply a promo code shows the discount (K-10)

Preconditions: global setup inserts a `promocodes` row `{ code: "E2E10", type: "percentage", value: 10 }` if absent (admin client).

Steps: type `e2e10` in the promo input; click **Apply**.

Verifications

- Network: `POST /api/validate-promocode` responded 200 with `isValid: true` and `discountValue = subtotal × 0.10` (use `page.waitForResponse`).
- UI: input value is uppercased `E2E10`; green pill with the code; **Discount** row `−€x.xx`; total reduced by the same amount.
- Then click the pill's **×**: Discount row disappears, total restored. (The remaining steps pay without a promo so the amount charged is unambiguous.)

### C-3 · Fill the address and pay with a Stripe test card (K-20)

Steps

1. Replace the prefilled billing fields with the run's data: first name `E2E`, last name `runId`, email `TEST_USER_EMAIL`, address1 `Teststraat 1`, city `Amsterdam`, zip `1012AB`, country `NL` (select by option). Leave "Ship to a different address" unchecked.
2. Toggle **Test Mode** on; choose **Visa** in the test-card selector.
3. Read the total from the breakdown → `expectedTotalCents`.
4. Click **Pay €{total}**; wait for `POST …/functions/v1/create-payment-intent` response (200) and capture `paymentIntentId` from the JSON.
5. Wait for URL to match `/checkout/stripe-return?payment_intent=`.

Verifications (immediately)

- Browser: `localStorage["stripe_checkout_data"]` JSON has `paymentIntentId === captured`, `cartId === cartId`, `lineItems.length === 1`, `shippingAddress.first_name === "E2E"`.
- DB `payment_transactions`: row with `stripe_payment_intent_id = paymentIntentId`, `payment_provider = "stripe"`, `user_id = userId`, `status ∈ {"pending","succeeded"}`, `currency = "eur"`.
- Stripe API (real, `sk_test_`): `GET /v1/payment_intents/{id}` → `status === "succeeded"`, `metadata.user_id === userId`.
- ⚠ `amount` assertion: the intended value is `expectedTotalCents`. The current edge function multiplies by 100 again (see USER_FLOWS §7), so assert `amount === expectedTotalCents` and mark the test `test.fixme` for the amount line until the fix lands. Do not silently accept the ×100 value.
- Save `stripePaymentIntentId`.

### C-4 · Return page runs the order pipeline (5.9) and shows the confirmation (K-20, 5.8)

Steps: remain on `/checkout/stripe-return`; wait for heading **Order Confirmed** (timeout 150 s).

Verifications — database, in pipeline order

1. `orders` (poll): exactly one row with `idempotency_key = "stripe_" + paymentIntentId`:
   - `user_id = userId`, `status = "confirmed"`, `payment_status = "paid"`, `payment_method = "stripe"`, `currency = "EUR"`
   - `order_number` matches `/^ORD-\d+-\d{3}$/`
   - `customer_email = TEST_USER_EMAIL`, `customer_name = "E2E " + runId`
   - `shipping_address.city = "Amsterdam"`, `billing_address` not null
   - `subtotal = unit_price` (cents, one item) — record `total_amount` as-is (known to exclude shipping)
   - Save `orderId` → `orderIds.push(orderId)`.
2. `order_items`: **one** row for `order_id` (proves partial selection):
   - `product_id = printifyProductId`, `variant_id = variantId`, `quantity = 1`
   - `unit_price = unitPriceCents`, `total_price = unit_price × quantity`
   - `custom_image_url` equals the cart item's image; `design_config.custom_image_url` present
3. `payment_transactions.order_id = orderId` for the intent row (linked by `linkPaymentTransactionToOrder`).
4. `orders.printify_order_id` becomes non-null (poll ≤ 120 s). Printify API: `GET /shops/{shop}/orders/{printify_order_id}.json` → 200, `line_items.length === 1`, `address_to.city === "Amsterdam"`.
5. `order_status_history`: ≥ 1 row for `order_id` with `status = "confirmed"`.
6. `payment_recovery`: row with `payment_intent_id = paymentIntentId`, `payment_provider = "stripe"`, `recovery_status = "recovered"`, `order_id = orderId`, `recovered_at` not null.
7. `cart_items`: **zero** rows for `cartId` (cart cleared — note this also removed the deselected tote; record it as expected current behaviour).

Verifications — UI

- Order number on the page equals `orders.order_number`.
- "Paid via Stripe", "7–10 business days", **Track Your Order** link → `/orders`, **Create Another Order** button.
- Browser: `sessionStorage["stripe_finalized_" + paymentIntentId] === "true"` and no `stripe_finalizing_*` key; `localStorage["stripe_checkout_data"]` removed.

### C-5 · Reloading the return page is idempotent

Steps: `page.reload()` on the same URL.

Verifications: heading **Order Confirmed** again; `orders` count for the idempotency key is still **1**; `order_items` count still **1**; no new `payment_recovery` row.

### C-6 · Track your order lands on /orders with the new order (bridge to Suite G)

Steps: click **Track Your Order**.

Verifications: URL `/orders`; a card/list row showing `order_number`; status badge **Processing**.

---

## 8. Suite D — Checkout with PayPal

File: `d-checkout-paypal.e2e.spec.ts`. Builds its own product and cart with the Suite A helpers (T-shirt, Bag it), then covers K-30 and the pipeline.

### D-1 · Prepare a fresh cart

Steps: `reachProductStepWithUpload` → `selectProduct(/t-shirt/i)` → `createProduct` → **BAG IT** → `/cart` → **Proceed to Checkout**.

Verifications: `carts`/`cart_items` rows as in A-4; `is_selected = true`; URL `/checkout?cartId=`.

### D-2 · Redirect to PayPal sandbox creates a pending transaction (K-30 steps 1–2)

Steps

1. Fill the billing address (as C-3); select **PayPal**; assert the notice "We'll send you to PayPal to pay securely".
2. Click **Confirm Order • Pay with PayPal**; wait for `create-paypal-order` response (200) → capture `orderId` (`paypalOrderId`) and `approvalUrl`.
3. Wait for navigation to a `paypal.com` URL.

Verifications

- Browser (before leaving): `localStorage["paypal_checkout_data"]` has `paymentId === paypalOrderId`, `cartId`, `amount` in cents, `lineItems.length === 1`.
- DB `payment_transactions`: row with `paypal_order_id = paypalOrderId`, `payment_provider = "paypal"`, `status = "pending"`, `user_id = userId`.
- PayPal API (client-credentials token from `PAYPAL_CLIENT_ID/SECRET`, sandbox): `GET /v2/checkout/orders/{id}` → `status === "CREATED"`, `intent === "CAPTURE"`, `purchase_units[0].amount.currency_code === "EUR"`, amount equals total in euros.

### D-3 · Approve in the sandbox and capture (K-30 steps 3–5)

Steps

1. On the PayPal sandbox page: log in with `PAYPAL_SANDBOX_BUYER_EMAIL/PASSWORD` (email → Next → password → Log In) and click **Pay Now**. Handle the optional "Continue" interstitial.
2. Wait for URL `/checkout/paypal-return?token={paypalOrderId}&PayerID=`.
3. Wait for `POST /api/paypal/capture-order` response (200) → `captureId`, `status === "COMPLETED"`.
4. Wait for heading **Order Confirmed** (≤ 150 s).

Verifications

- DB `payment_transactions` for `paypal_order_id`: `status ∈ {"succeeded","captured","completed"}` per `atomic_paypal_payment_capture`, `paypal_capture_id = captureId`, `paypal_payer_email` = sandbox buyer email, `captured_at` not null.
- DB `orders`: one row with `idempotency_key = "paypal_" + paypalOrderId`, `status = "confirmed"`, `payment_status = "paid"`, `payment_method = "paypal"`; `order_items` = 1 row; `payment_transactions.order_id = orderId`; `printify_order_id` set (poll); `payment_recovery.recovery_status = "recovered"`; `cart_items` empty for the cart.
- PayPal API: `GET /v2/checkout/orders/{id}` → `status === "COMPLETED"`; capture id matches.
- UI: order number, "Paid via PayPal", `#`-prefixed fallback not used (real `order_number` shown).
- Save `orderIds.push(orderId)`, `paypalOrderId`.

> Sandbox login pages change often. Keep the PayPal interaction in one helper (`payWithPayPalSandbox(page)`) and allow `E2E_PAYPAL=false` to skip Suite D in CI.

---

## 9. Suite E — Checkout with iDEAL (Mollie)

File: `e-checkout-mollie.e2e.spec.ts`. Own product and cart. Covers K-40 and the pipeline incl. client-side invoice generation.

### E-1 · Prepare a fresh cart — as D-1.

### E-2 · Redirect to Mollie creates a pending transaction and session context (K-40 steps 1–2)

Steps

1. Fill the billing address; select **iDEAL**; assert the notice "We'll send you to your bank via iDEAL".
2. Click **Confirm Order • Pay with iDEAL**; wait for `create-mollie-payment` (200) → capture `paymentId` (`tr_…`) and `checkoutUrl`.
3. Before navigation completes, read sessionStorage (use `page.evaluate` right after the response).

Verifications

- Browser sessionStorage: `mollie_payment_id === paymentId`, `mollie_cart_id === cartId`, `mollie_line_items` parses to 1 item, `mollie_shipping_address.city === "Amsterdam"`, `mollie_order_amount` equals the total in euros.
- DB `payment_transactions`: `mollie_payment_id = paymentId`, `payment_provider = "mollie"`, `status = "pending"`, `mollie_status = "open"`, `user_id = userId`.
- Mollie API (`Authorization: Bearer MOLLIE_API_KEY`): `GET /v2/payments/{id}` → `status === "open"`, `method === "ideal"`, `amount.currency === "EUR"`, `redirectUrl` ends with `/checkout/mollie-return`.

### E-3 · Mark the payment as paid on Mollie's test page and finish the order (K-40 steps 3–5)

Steps

1. On the Mollie hosted test page (`checkoutUrl`): pick any issuer if prompted, choose status **Paid**, continue.
2. Wait for URL `/checkout/mollie-return`.
3. Wait for `verify-mollie-payment` (200) with `isPaid: true`.
4. Wait for heading **Order Confirmed** (≤ 150 s).

Verifications

- DB `payment_transactions`: `status = "succeeded"`, `mollie_status = "paid"`, `order_id = orderId` (after link).
- DB `orders`: `idempotency_key = "mollie_" + paymentId`, `status = "confirmed"`, `payment_status = "paid"`, `payment_method = "mollie"`; `order_items` = 1; `printify_order_id` set (poll); `payment_recovery` row `recovered`.
- **Invoice (client-side `generate-invoice`)** — poll ≤ 60 s:
  - `invoices`: one row with `order_id = orderId`, `type = "invoice"`, `status` issued/paid, `invoice_number` matches `/^INV-\d{4}-\d{5}$/`, `total_amount` = order total, `customer_email = TEST_USER_EMAIL`, `pdf_bucket = "invoices"`, `pdf_path = "{userId}/{invoice_number}.pdf"`.
  - Storage: `admin.storage.from("invoices").createSignedUrl(pdf_path, 60)` succeeds and the URL returns `content-type: application/pdf` with size > 1 KB.
  - `invoice_counters` for the current year incremented by exactly 1 compared to the value read before the payment.
  - `emailed_at` not null (poll ≤ 90 s) when an email provider key is configured; otherwise skip this line.
- `cart_items` empty for the cart.
- Browser: `mollie_*` sessionStorage keys removed; `mollie_finalized_{paymentId} === "true"`.
- UI: order number, "Paid via Mollie".
- Save `orderIds.push(orderId)`, `molliePaymentId`.

---

## 10. Suite F — Post-payment: webhooks, invoices, recovery

File: `f-post-payment.e2e.spec.ts`. Consumes the three order ids. API + DB only (no browser except F-3).

### F-1 · Stripe webhook links the payment and issues the invoice

Preconditions: webhook forwarding active (2.5). Skipped when `E2E_STRIPE_WEBHOOKS=false`.

Verifications (poll ≤ 120 s from the Stripe order's `created_at`)

- `webhook_events` (or `is_webhook_event_processed` RPC) contains the `payment_intent.succeeded` event id for `stripePaymentIntentId`.
- `orders.payment_status = "paid"` and **`orders.status` still `"confirmed"`** (webhooks must not change order status).
- `invoices` row for the Stripe `orderId` exists with `pdf_path` and a valid signed URL, as in E-3.

### F-2 · PayPal webhook/capture path issued the invoice

Verifications: `invoices` row for the PayPal `orderId` (created by `capture-paypal-order` or `paypal-webhook`), same shape as E-3; `webhook_events` contains a PayPal `PAYMENT.CAPTURE.COMPLETED` event for the capture id when the sandbox webhook is configured (skip the event check otherwise).

### F-3 · Payment recovery banner completes an interrupted payment

This is the one scenario that seeds state directly, because a successful interrupted payment cannot be produced reliably through the UI.

Steps

1. Admin client: create a fresh cart with one item for the user (reuse `upsert_cart_item`), then create a real Stripe PaymentIntent via `create-payment-intent` (user session, test mode `pm_card_visa`, `confirm: true`) — do **not** visit the return page.
2. Insert the recovery record exactly as the return page would: `record_payment_for_recovery` RPC with `p_payment_intent_id`, `p_payment_provider = "stripe"`, `p_payment_status = "succeeded"`, amount, currency, `cart_snapshot` (cart id + items), `line_items`, `shipping_address`.
3. Browser: `page.goto("/dashboard")`. Assert the banner **Incomplete Order Found** shows the amount and the last 8 chars of the intent id.
4. Click **Complete Order**; wait for `process-payment-recovery` (200).

Verifications

- DB `orders`: row with `idempotency_key = "stripe_" + intentId`, `payment_status = "paid"`, `status ∈ {"pending","confirmed"}`; `order_items` = 1.
- DB `payment_recovery`: `recovery_status = "recovered"`, `order_id` set, `recovery_attempts = 1`.
- `orderIds.push(orderId)`.
- ⚠ The banner then pushes `/orders/{id}`, which does not exist; assert only up to the successful response and the DB state.

---

## 11. Suite G — Orders

File: `g-orders.e2e.spec.ts`. Uses `orderIds`. Covers O-01 … O-06.

### G-1 · Orders list shows every run order with the right status (O-01)

Steps: `page.goto("/orders")`.

Verifications

- Each `orders.order_number` from the run is visible; badge **Processing** for `confirmed` orders.
- DB cross-check via the **user session** client: `orders` select with `order_items(*)` for `user_id` returns ≥ `orderIds.length` rows (RLS allows the owner).
- Filter **Processing** keeps the run orders; filter **Cancelled** hides them; **Clear filters** restores; grid toggle renders the same count.

### G-2 · Details modal matches the database (O-02)

Steps: open the Stripe order (**Track order**).

Verifications: modal shows order number, item name/quantity/unit price equal to `order_items`, delivery block with `shipping_address` city and `customer_email`, payment method **Stripe**, status timeline with ≥ 1 entry (from `order_status_history`), totals sidebar subtotal = `orders.subtotal`.

### G-3 · Invoice download returns a signed PDF URL (O-06)

Steps: in the modal of the **Mollie** order (which already has an invoice) click **Download invoice**; capture the popup.

Verifications

- Popup URL is a Supabase signed URL for `invoices/{userId}/{invoice_number}.pdf`; `page.request.get(url)` → 200, `content-type: application/pdf`.
- For an order **without** an invoice row (F-3's recovery order): clicking the button calls `generate-invoice` (200) and afterwards an `invoices` row exists for that order.

### G-4 · Cancel an order triggers Printify cancellation and a refund record (O-04)

Steps: open the Stripe order → **Cancel order** → confirm in the modal; wait for `cancel-order` (200) and the success toast.

Verifications

- DB `orders`: `status = "cancelled"`, `cancelled_at` not null, `cancellation_reason = "Cancelled by customer"`.
- DB `refunds`: row with `order_id`, `payment_provider = "stripe"`, `amount > 0`, `status` succeeded/pending, `provider_refund_id` starting with `re_`.
- DB `payment_transactions`: `status = "refunded"` for the intent.
- Stripe API: `GET /v1/refunds?payment_intent={id}` → one refund with matching amount.
- Printify API: order `status` is `canceled` (poll ≤ 60 s) when the test shop allows cancellation.
- UI: badge **Cancelled**; **Cancel order** replaced by **Reorder**; **Reorder** navigates to `/stamp`.
- Repeat for the PayPal and Mollie orders (cleanup + coverage of the other refund providers): `refunds.payment_provider` = `paypal` / `mollie`, provider refund ids present, `invoices` for the order gets a related credit-note row when the RPC issues one (assert `related_invoice_id` when present).

---

## 12. Suite H — Auth, profile, dashboard, credits

File: `h-account.e2e.spec.ts`. Uses a **fresh browser context without stored auth** for H-1/H-2.

### H-1 · Register a new user (A-03)

Steps: `/` → **Register** → fill first/last name, `e2e+${runId}@yourdomain.test`, password ×2 → submit → success message **You're all set**.

Verifications: admin `auth.admin.listUsers()` contains the email with `email_confirmed_at = null` and `user_metadata.first_name = "E2E"`. Then confirm via admin `updateUserById({ email_confirm: true })` for H-2. Append the id to `RunState.extraUserIds`.

### H-2 · Login with email redirects to /stamp (A-01, S-00 gating)

Steps: guest visits `/stamp` → assert redirect to `/`. Open **Login**, fill the H-1 credentials, submit.

Verifications: toast "Welcome back"; URL `/stamp`; header shows **Logout**; `admin.auth.admin.getUserById(id).last_sign_in_at` updated.

### H-3 · Password reset end to end (A-04, A-05)

Steps

1. Login dialog → **Forgot password?** → email → **Send Reset Link** → toast "Password reset email sent".
2. Instead of reading mail, generate the link with `admin.auth.admin.generateLink({ type: "recovery", email })` and open `properties.action_link` in the browser. Expect to land on `/reset-password`.
3. Set a new password ×2 → **Your password is set** → auto redirect `/` after 3 s.

Verifications: `signInWithPassword` with the **new** password succeeds and with the old one fails (API).

### H-4 · Google OAuth callback error page renders (A-02 negative-free check)

Steps: visit `/auth/callback` without a code → expect redirect to `/auth/auth-code-error` with heading **Something went wrong** and a **Return to Home** link. (No credentials needed; the happy Google path cannot be automated.)

### H-5 · Profile edits persist to auth metadata (P-01, P-02, P-03)

Steps (authenticated project): `/profile`.

1. **Edit** user information → first name `E2E-${runId}` → save → toast.
2. **Change password** → new password ×2 → save → toast. Log in again via API with the new password (and restore the original password at the end via admin `updateUserById`).
3. **Add address** → fill the checkout address schema → save.

Verifications: `admin.auth.admin.getUserById(userId).user_metadata` has `first_name = "E2E-…"`, `shipping_address.city = "Amsterdam"`, `shipping_address.country = "NL"`.

### H-6 · Dashboard shows recent orders and quick links (D-01)

Steps: `/dashboard`.

Verifications: profile card shows the user's email; recent orders section lists ≤ 5 rows including run order numbers (from `orders` ordered by `created_at desc`); clicking a row opens the same details modal as G-2; **View archive** → `/orders`; **Edit profile** → `/profile`.

### H-7 · Buy credits with a Stripe card (B-01, B-02, B-03)

Steps

1. `/dashboard` → **Buy more** → dialog: select **250** package (default) → **Continue** → card form: fill the Stripe `CardElement` iframe with `4242 4242 4242 4242`, `12/34`, `123`, `12345` → **Pay**.
2. Wait for `create-credit-payment` (200) → capture intent id; wait for the dialog to close.

Verifications

- Stripe API: intent `status === "succeeded"`, `metadata.type === "credit_purchase"`, `metadata.credits === "250"`, `amount === 1999`, `currency === "eur"`.
- DB (requires webhook forwarding; poll ≤ 120 s): `credit_transactions` row with `user_id`, `amount = 250`, `transaction_type` purchase, `reference_id = intentId`; `user_credits.credits` increased by 250 vs the value read before.
- ⚠ Do **not** assert the dashboard balance or `profiles.coins`; they are not wired to this purchase (USER_FLOWS §7).

---

## 13. Suite I — API contract tests (edge functions and routes)

File group: `src/tests/e2e/api/*.api.spec.ts`. Playwright `request`-only tests using `userSession()` tokens; every call is followed by a DB read with the admin client. These pin the server contracts the UI depends on and run in seconds.

| ID | Call | Assertions (response + DB) |
|---|---|---|
| I-1 | `get-catalog-blueprints` | 200; array length ≥ 1; each item has `blueprint_id`, `print_provider_id`, price fields; matches `catalog_products` rows with `is_active`. |
| I-2 | `get-blueprint-variants {blueprint_id, print_provider_id}` for the T-shirt | 200; `colors` includes `Black`; `sizes` includes `M`; consistent with `get_available_colors` / `get_available_sizes` RPCs. |
| I-3 | `upload-printify-image {image_url}` with the fixture hosted URL (upload the fixture to a public bucket first) | 200; `id`, `previewUrl`, `width = 1024`, `height = 1024`. |
| I-4 | `create-custom-product` with the I-3 image, T-shirt blueprint, `selected_color: "Black"`, `selected_size: "M"`, `print_positions: [{position:"front", placement:{x:.5,y:.5,scale:1,angle:0}}]` | 200; `product.id`, `product.images.length ≥ 1`, `selected_variant_id`; then `ProductService.savePrintifyProduct` equivalent: insert into `products` via user session succeeds under RLS; read back by `printify_product_id`. |
| I-5 | RPC `upsert_cart_item` twice with identical keys | second call returns the same `id` with `quantity = 2`; `cart_items` count unchanged. |
| I-6 | RPC `update_cart_items_selection` | `is_selected` flags match the passed ids exactly. |
| I-7 | `POST /api/validate-promocode {code:"E2E10", subtotal: 50}` | 200 `isValid: true`, `discountValue = 5`; uppercase normalisation with `"e2e10 "`. |
| I-8 | `create-payment-intent` (test mode `pm_card_visa`, `confirm: true`) | 200 `clientSecret`, `paymentIntentId`; `payment_transactions` row `pending` with the id; Stripe intent `succeeded`. |
| I-9 | `create-paypal-order` | 200 `orderId`, `approvalUrl` on `sandbox.paypal.com`; `payment_transactions` row. |
| I-10 | `create-mollie-payment` then `verify-mollie-payment` | first: `paymentId`, `checkoutUrl`; second: `status: "open"`, `isPaid: false`; transaction row `mollie_status = "open"`. |
| I-11 | `OrderService.createOrderFromCart` equivalent via user session: insert `orders` + `order_items` for a seeded cart with `idempotency_key = "e2e_" + runId`, then repeat | second insert is rejected or returns the same order (unique key); exactly one `orders` row for the key. |
| I-12 | `create-printify-order` with `is_test: true` for I-11's order (explicit test order) | 200 `printify_order_id`; `orders.status = "confirmed"`; `order_status_history` row; Printify order exists with `is_test`/status appropriate. |
| I-13 | `generate-invoice {order_id}` for a paid order, called twice | same `invoice_number` both times; one `invoices` row; `invoice_counters` incremented once. |
| I-14 | `cancel-order {order_id}` for I-12's order | 200 with `results` containing Printify cancel and refund outcome; `orders.status = "cancelled"`. |
| I-15 | `process-refund` for an already refunded order | 200 idempotent response; no second `refunds` row. |
| I-16 | RPC `get_user_coins` / `deduct_coin` | `deduct_coin` returns `true` and decrements `coins` by 1; returns `false` at 0 (set via admin first, then restore). |
| I-17 | `create-credit-payment {amount: 999, credits: 100, currency: "eur"}` | 200 `clientSecret`; Stripe intent `metadata.credits = "100"`. |
| I-18 | `/api/health` | 200. |

---

## 14. Traceability matrix

| Flow (USER_FLOWS.md) | Tests |
|---|---|
| S-00 Hero | A-1 |
| S-01 Upload (a: with image, c: skip) | A-1, A-2 |
| S-02a Generate | A-2, I-16 |
| S-02b Skip with my photo | A-1, A-3, D-1, E-1 |
| S-03 Generation | A-2 |
| S-04 Results | A-2 |
| S-05 Product selection | A-3, A-5, A-6, I-1 |
| S-06 Customization, placement, categories | A-3, A-6, I-2 |
| S-07 Product creation | A-3, A-5, A-6, I-3, I-4 |
| S-08a Bag it | A-4, D-1, E-1, I-5 |
| S-08b Bag it & create another | A-5 |
| C-02/C-05 Cart load and view | B-1 |
| C-10/C-11 Quantity | B-2, B-3, B-4 |
| C-12 Remove | B-5 |
| C-13 Select / deselect | B-6, I-6 |
| C-20 Proceed to checkout | B-6 |
| K-02/K-04 Checkout load | C-1 |
| K-10 Promo code | C-2, I-7 |
| K-20 Stripe | C-3, C-4, C-5, I-8 |
| K-30 PayPal | D-2, D-3, I-9 |
| K-40 iDEAL | E-2, E-3, I-10 |
| 5.9 Order pipeline | C-4, D-3, E-3, I-11, I-12 |
| Invoices | E-3, F-1, F-2, G-3, I-13 |
| 5.10 Payment recovery | F-3 |
| O-01 … O-06 Orders | C-6, G-1 … G-4, I-14, I-15 |
| A-01 … A-05 Auth | H-1 … H-4 |
| P-01 … P-03 Profile | H-5 |
| D-01 Dashboard | H-6, F-3 |
| B-01 … B-03 Buy credits | H-7, I-17 |

---

## 15. Running the suite

```bash
# one-off
npx playwright install --with-deps
stripe listen --forward-to https://<replica-ref>.supabase.co/functions/v1/stripe-webhook   # keep running

# whole suite (chain → providers → post)
npm run test:e2e

# only the revenue chain
npx playwright test --project=chain

# a single suite
npx playwright test src/tests/e2e/c-checkout-stripe.e2e.spec.ts --headed

# skip expensive/flaky external steps
E2E_RUN_AI_GENERATION=false E2E_PAYPAL=false npm run test:e2e
```

CI: run `chain` and `providers` with `workers: 1` on a nightly schedule against the replica; the API suite (`api/`) can run on every PR since it finishes in under a minute and only touches rows tagged with the run id.

---

## 16. Data lifecycle and cleanup

`global.setup.ts` purges leftovers older than 24 h; each suite's `afterAll` removes what it created unless `E2E_KEEP_DATA=true`. Deletion order respects foreign keys:

```ts
export async function cleanupRun(state: RunState) {
  const db = adminDb();
  const orders = state.orderIds;
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
  for (const id of state.extraUserIds ?? []) await db.auth.admin.deleteUser(id);
}
```

Printify products and orders created in the test shop are deleted/cancelled through the Printify API in the same hook (`DELETE /shops/{shop}/products/{id}.json`; orders are cancelled in G-4 / I-14). Stripe, PayPal and Mollie test objects are left in place (they are free and auditable).

Invoice numbers are gapless by design; the suite therefore consumes numbers on the replica. Do not run it against production.
