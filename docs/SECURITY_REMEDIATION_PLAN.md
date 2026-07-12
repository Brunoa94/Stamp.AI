# Security Remediation Plan — Stamp.AI

**Companion to:** [SECURITY_ANALYSIS.md](./SECURITY_ANALYSIS.md)
**Date:** 2026-07-12
**Status:** Planning only — **no code changed by this document.** Code/SQL below are *proposed sketches* to be reviewed, adapted to current signatures, and tested before applying.

## How to use this
Each ticket is sized to a single PR. Fields: **Fixes** (finding id) · **Files** · **Change** (sketch) · **Effort** · **Verify** (how to prove it's fixed). Effort is rough dev time: **S** ≤2h · **M** ≤1 day · **L** 2–3 days.

Suggested labels: `sec-critical`, `sec-high`, `sec-medium`, `sec-low`. Do the phases in order — later tickets assume earlier ones (e.g. server-side pricing must land before you can trust RLS `service_role`-only writes).

---

# Phase 1 — Stop the bleeding

### SEC-1 · Remove the browser-exposed Printify token + rotate  `sec-critical`
- **Fixes:** C1
- **Files:** `src/services/apiClient.ts`, `.env` / deployment env, `src/services/printifyService.ts`, `src/services/imageGenerationService.ts`
- **Change:**
  1. Delete the `Authorization` header from `apiClient` default headers (its calls go to first-party `/api/*` routes that already attach the server-side token):
     ```diff
     const DEFAULT_HEADERS = {
       "Accept": "*/*",
       "Content-Type": "application/json",
     - "Authorization": `Bearer ${process.env.NEXT_PUBLIC_PRINTIFY_API_TOKEN}`,
     };
     ```
  2. Remove `NEXT_PUBLIC_PRINTIFY_API_TOKEN` from `.env`, `.env.example`, and all deploy environments (Vercel/Supabase). Keep only server-side `PRINTIFY_API_TOKEN`.
  3. Grep for any remaining `NEXT_PUBLIC_PRINTIFY_API_TOKEN` reference and route those calls through a server `/api/*` handler instead.
  4. **Rotate the Printify token** in the Printify dashboard (assume compromised) and update the server-only var.
- **Effort:** S
- **Verify:** `npm run build && grep -r "PRINTIFY_API_TOKEN" .next/static` returns nothing; token no longer visible in DevTools → Sources/Network; Printify-backed features still work through `/api/*`.

### SEC-2 · Authenticate `process-refund` + derive amount from DB  `sec-critical`
- **Fixes:** C5
- **Files:** `supabase/functions/process-refund/index.ts`, `supabase/functions/_shared/validators.ts`
- **Change:** Require a `service_role` (or admin) caller; look up provider ids + amount from the `orders`/`payment_transactions` rows by `order_id` — never from the body.
  ```ts
  serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    // NEW: only service-role (this fn is called server-to-server by cancel-order)
    const auth = await verifyAuth(req.headers);           // throws if missing
    if (!auth.isServiceRole) throw ErrorCodes.FORBIDDEN();

    const { order_id, payment_provider } = await req.json();
    if (!order_id || !["stripe","paypal","mollie"].includes(payment_provider))
      throw ErrorCodes.INVALID_REQUEST_BODY();

    // NEW: fetch trusted amount + provider ids from DB, ignore body values
    const { data: tx } = await supabaseAdmin
      .from("payment_transactions")
      .select("amount,currency,stripe_payment_intent_id,paypal_capture_id,mollie_payment_id")
      .eq("order_id", order_id).eq("status","succeeded").single();
    if (!tx) throw ErrorCodes.NOT_FOUND();
    // ...refund using tx.amount / tx.<provider id>
  });
  ```
- **Effort:** M
- **Verify:** unauth `curl -X POST .../functions/v1/process-refund -d '{...}'` → 401/403; refund still works when invoked by `cancel-order`; body-supplied `amount` is ignored (log the amount actually refunded and confirm it equals the DB row).

### SEC-3 · Require ownership on `cancel-printify-order`  `sec-high`
- **Fixes:** H3
- **Files:** `supabase/functions/cancel-printify-order/index.ts`
- **Change:** Add `verifyAuth`; resolve the order in the DB by the internal order id, confirm `order.user_id === auth.userId` (or `service_role`) before calling Printify. Prefer accepting the internal `order_id` and looking up `printify_order_id` server-side rather than taking the raw Printify id from the body.
- **Effort:** S–M
- **Verify:** anonymous call → 401; user A cannot cancel user B's order (403); legitimate owner cancel still works.

### SEC-4 · Purge & revoke committed session tokens  `sec-high`
- **Fixes:** H9
- **Files:** `playwright/.auth/user.json`, `src/playwright/.auth/user.json`, `.gitignore`
- **Change:**
  ```bash
  git rm --cached playwright/.auth/user.json src/playwright/.auth/user.json
  printf '\n**/.auth/user.json\n' >> .gitignore   # keep only a .gitkeep
  # regenerate fixtures at test time via auth.setup.ts using TEST_USER_* env
  ```
  Then purge from history with `git filter-repo --path playwright/.auth/user.json --path src/playwright/.auth/user.json --invert-paths` (coordinate the force-push), and **revoke the test user's sessions** in the Supabase dashboard (Auth → Users → sign out / rotate password).
- **Effort:** M (history rewrite needs team coordination)
- **Verify:** `git ls-files | grep .auth/user.json` empty; `git log --all -- '**/.auth/user.json'` empty after rewrite; the old refresh token no longer mints a session (`POST /auth/v1/token?grant_type=refresh_token` → 400).

---

# Phase 2 — Payment integrity

### SEC-5 · Server-side price recomputation for all charges  `sec-critical`
- **Fixes:** C3
- **Files:** `src/app/api/paypal/create-order/route.ts`, `supabase/functions/create-payment-intent/index.ts`, `supabase/functions/create-paypal-order/index.ts`, `supabase/functions/create-mollie-payment/index.ts`, `supabase/functions/_shared/amountValidator.ts`
- **Change:** In each entry point, ignore any client `amount`. Load each `line_item`'s price from `products`/variants server-side, sum + shipping + validated discount, and charge that. Reuse `validatePaymentAmount`:
  ```ts
  // pseudo, per function
  const items = await loadPricedLineItems(supabaseAdmin, body.lineItems); // DB prices only
  const serverTotal = computeTotal(items, shipping, await validatedDiscount(body.promo_code));
  validatePaymentAmount(serverTotal, items);          // the existing guard, finally wired in
  const amountToCharge = Math.round(serverTotal * 100);
  ```
- **Effort:** L
- **Verify:** tamper the request `amount` to `0.01` in each flow → server charges the real total (assert via provider dashboard / returned intent amount); mismatched client amount is rejected or overridden.

### SEC-6 · Derive credits from amount (kill C4)  `sec-critical`
- **Fixes:** C4
- **Files:** `supabase/functions/create-credit-payment/index.ts`, `supabase/functions/stripe-webhook/index.ts`
- **Change:** Define one server-held price table; accept only ONE of `amount`/`credits` from the client and derive the other; store the derived pair in metadata; re-derive/verify in the webhook before crediting.
  ```ts
  const CREDIT_PACKS = { /* credits: priceUsd */ 100: 5, 500: 20, 1200: 40 } as const;
  const credits = validatePack(body.credits);         // must be a known pack key
  const amountUsd = CREDIT_PACKS[credits];             // price is server-owned
  // webhook: const expected = CREDIT_PACKS[meta.credits]; assert meta.amount_usd == expected
  ```
- **Effort:** M
- **Verify:** `{amount: 0.50, credits: 1000000}` → rejected (unknown pack) or credited only the pack amount; webhook refuses metadata whose amount≠pack price.

### SEC-7 · Real PayPal webhook signature verification  `sec-critical`
- **Fixes:** C2
- **Files:** `supabase/functions/_shared/paypal.ts`, `supabase/functions/paypal-webhook/index.ts`
- **Change:** Implement `verifyPayPalWebhook` via PayPal `POST /v1/notifications/verify-webhook-signature` using `PAYPAL_WEBHOOK_ID` + the transmission headers + raw body, and **reject** unless `verification_status === "SUCCESS"`. Remove the "continue on failure" branch.
  ```ts
  const res = await paypalRequest("/v1/notifications/verify-webhook-signature","POST",{
    auth_algo, cert_url, transmission_id, transmission_sig, transmission_time,
    webhook_id: Deno.env.get("PAYPAL_WEBHOOK_ID"), webhook_event: JSON.parse(rawBody),
  });
  if (res.verification_status !== "SUCCESS") return json(400, { error: "invalid signature" });
  ```
- **Effort:** M
- **Verify:** forged body with dummy headers → 400, order NOT marked paid; a genuine PayPal sandbox event still succeeds.

### SEC-8 · Gate Printify fulfillment on paid + owned order  `sec-high`
- **Fixes:** H2
- **Files:** `supabase/functions/create-printify-order/index.ts`
- **Change:** Resolve `metadata.order_id` in the DB; require `order.user_id === auth.userId` (or service_role) and `order.payment_status === 'paid'`; make amount validation mandatory and computed from the DB order total (drop the `if (payment_amount !== undefined)` guard).
- **Effort:** M
- **Verify:** authed user posting arbitrary `line_items` with no/invalid payment → rejected; only a paid, owned order fulfils; test-mode enforcement unaffected.

### SEC-9 · Stripe webhook idempotency + atomic credit  `sec-medium`
- **Fixes:** M5
- **Files:** `supabase/functions/stripe-webhook/index.ts`, new migration
- **Change:** Wrap handling in `is_webhook_processed(event.id)` / `record_webhook_event(event.id)` like PayPal/Mollie; replace the read-modify-write credit grant with an atomic RPC (`increment_credits(user_id, delta, reference_id)`); add `UNIQUE(reference_id)` on `credit_transactions`.
  ```sql
  ALTER TABLE credit_transactions ADD CONSTRAINT credit_tx_ref_unique UNIQUE (reference_id);
  ```
- **Effort:** M
- **Verify:** replay a captured signed `payment_intent.succeeded` twice → credited once; concurrent duplicate deliveries don't double-credit.

### SEC-10 · Server-side promo validation + limits  `sec-medium`
- **Fixes:** M4, plus RLS part in SEC-14
- **Files:** `src/services/promocodeService.ts`, `supabase/functions/create-*` (apply during pricing), new migration
- **Change:** Add `max_uses`, `used_count`, `expires_at`, and a `promo_redemptions(user_id, code)` table; validate+apply the discount **server-side** inside the pricing step (SEC-5), atomically incrementing usage; stop computing discounts in the browser.
- **Effort:** M–L
- **Verify:** reusing a single-use code twice fails; expired code rejected; discount value can't be overridden by the client (checked against SEC-5).

---

# Phase 3 — RLS lockdown (new migration `supabase/migrations/<ts>_security_rls_hardening.sql`)

### SEC-11 · Restrict `products` writes to service_role  `sec-high`
- **Fixes:** H1
  ```sql
  DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
  DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
  -- if user-authored products are a real feature, scope by ownership instead:
  -- CREATE POLICY products_owner_ins ON products FOR INSERT TO authenticated
  --   WITH CHECK (auth.uid() = user_id);
  -- CREATE POLICY products_owner_upd ON products FOR UPDATE TO authenticated
  --   USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  ```
- **Effort:** S · **Verify:** authed user `update(products).eq(id, other)` → 0 rows / RLS denied; catalog reads unaffected (`is_active=true`).

### SEC-12 · `orders` / `order_items` / `payment_transactions` writes → service_role only  `sec-high`
- **Fixes:** M1, M2
  ```sql
  DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
  DROP POLICY IF EXISTS "Users can insert their own order items" ON order_items;
  DROP POLICY IF EXISTS "Users can insert their own payment transactions" ON payment_transactions;
  -- SELECT (own rows) policies stay; ALL→service_role already exists and now owns writes
  ```
  Ensure the checkout flow inserts orders via an Edge Function using the service key (it largely does post-payment already).
- **Effort:** M (must confirm no client insert path breaks) · **Verify:** client `insert(orders,{payment_status:'paid'})` → denied; normal checkout (server-inserted) still creates orders.

### SEC-13 · Lock `profiles` column writes (coins/stripe_customer_id)  `sec-high`
- **Fixes:** H4
  ```sql
  -- Option A: column-level privileges
  REVOKE UPDATE ON profiles FROM authenticated;
  GRANT UPDATE (full_name, avatar_url /*, other user-editable cols */) ON profiles TO authenticated;
  -- Option B: trigger guard
  -- CREATE FUNCTION forbid_sensitive_profile_edits() ... RAISE if NEW.coins <> OLD.coins ...
  ```
  Add `WITH CHECK` to the existing UPDATE policy too. Mutate `coins` only via `service_role` / the definer RPC.
- **Effort:** M · **Verify:** `update(profiles,{coins:999999})` → denied; editing display name still works.

### SEC-14 · Fix `deduct_coin` + `promocodes` read + definer RPCs  `sec-high`
- **Fixes:** H5, M4 (read side), M12, L3, L4
  ```sql
  CREATE OR REPLACE FUNCTION deduct_coin()          -- no user_id param
  RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
  DECLARE uid uuid := auth.uid();
  BEGIN
    IF uid IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
    UPDATE profiles SET coins = coins - 1 WHERE id = uid AND coins > 0;
    RETURN FOUND;
  END $$;
  REVOKE EXECUTE ON FUNCTION deduct_coin() FROM PUBLIC, anon;
  GRANT  EXECUTE ON FUNCTION deduct_coin() TO authenticated;

  -- promocodes: stop exposing the full table
  DROP POLICY IF EXISTS "Anyone can read promocodes" ON promocodes;
  -- expose only a validating RPC: validate_promo(code) -> {valid, type, value} (SECURITY DEFINER, auth'd)

  -- lock definer helpers to service_role
  REVOKE EXECUTE ON FUNCTION create_refund_failure_alert FROM PUBLIC;
  REVOKE EXECUTE ON FUNCTION get_order_by_idempotency_key FROM PUBLIC;
  -- add `SET search_path = public` to every SECURITY DEFINER function
  ```
- **Effort:** M · **Verify:** `rpc('deduct_coin',{user_id:victim})` no longer accepts the arg / can't affect others; anon `select(promocodes)` → denied; `rpc('create_refund_failure_alert',...)` as anon → denied.

### SEC-15 · Recovery flow re-queries PSP, not stored amount  `sec-medium`
- **Fixes:** M3
- **Files:** `supabase/functions/process-payment-recovery/index.ts`, `src/services/paymentRecoveryService.ts`
- **Change:** When recovering a payment into an order, re-fetch the authoritative amount/status from Stripe/PayPal/Mollie by the payment id; never trust `payment_recovery.amount`/`line_items` written by the client.
- **Effort:** M · **Verify:** a self-inserted recovery row with inflated `amount` can't be "recovered" into a discounted/free order.

### SEC-16 · Audit out-of-band production functions  `sec-medium`
- **Fixes:** L9
- **Change:** Locate the definitions of `handle_new_user`, `set_order_number`, `expire_waiting_payment_orders`, `refill_min_3_coins_daily` (applied via dashboard, not in repo). Commit them as migrations, review SECURITY mode + auth, and apply SEC-14-style hardening if any are DEFINER writing coins/orders.
- **Effort:** M · **Verify:** all four exist as migrations; none are PUBLIC-callable DEFINER without an `auth.uid()` guard.

---

# Phase 4 — Platform hardening

### SEC-17 · Single server-side route guard  `sec-high`
- **Fixes:** H7
- **Files:** `middleware.ts` (root) or `src/middleware.ts` — keep exactly one; `src/lib/supabase/middleware.ts`
- **Change:** Consolidate into one middleware that calls `getUser()` and redirects unauthenticated requests for every protected prefix (`/dashboard`, `/profile`, `/orders`, `/cart`, `/checkout`, `/admin`, `/stamp`). Delete the no-op `updateSession`-only file. Keep `ProtectedRoute` only as UX sugar.
- **Effort:** M · **Verify:** logged-out `GET /profile` (JS disabled) → 307 to login, no page shell/data returned.

### SEC-18 · Admin role + gate admin surfaces  `sec-high`
- **Fixes:** H8
- **Files:** new migration (`profiles.is_admin` or an `admins` table), `src/app/admin/*`, `src/app/api/refresh-provider-catalog/route.ts` and other catalog routes
- **Change:** Add an admin flag (in `app_metadata`, not client-writable `user_metadata`); check it in middleware for `/admin/*` and in each admin/catalog API route; rate-limit `refresh-provider-catalog`.
- **Effort:** M · **Verify:** non-admin `POST /api/refresh-provider-catalog` → 403; admin still works.

### SEC-19 · SSRF allow-list on image proxy  `sec-high`
- **Fixes:** H6
- **Files:** `src/app/api/fetch-remote-image/route.ts`
- **Change:** Require auth; parse the URL, allow only `https`, allow-list hostnames (the CDN hosts already in `next.config.ts` `remotePatterns`), resolve DNS and reject private/loopback/link-local ranges (`10/8`, `172.16/12`, `192.168/16`, `127/8`, `169.254/16`, `::1`, `fc00::/7`), and cap response size + content-type to images.
- **Effort:** M · **Verify:** `?url=http://169.254.169.254/...` and `?url=http://localhost:...` → 400; an allow-listed CDN image still proxies.

### SEC-20 · Security headers / CSP + httpOnly session review  `sec-medium`
- **Fixes:** M7
- **Files:** `next.config.ts`
- **Change:** Add a `headers()` block: strict `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`. Evaluate moving to server-side (httpOnly cookie) sessions via `@supabase/ssr` server client.
- **Effort:** M · **Verify:** response headers present (securityheaders.com / curl -I); app still functions with CSP (fix violations iteratively via report-only first).

### SEC-21 · CORS allow-list on edge functions  `sec-medium`
- **Fixes:** M8
- **Files:** every `supabase/functions/*/index.ts` cors headers (centralize in `_shared`)
- **Change:** Replace `Access-Control-Allow-Origin: *` with a reflected value from an allow-list (`FRONTEND_URL`/`SITE_URL`); scope `Access-Control-Allow-Methods` per function.
- **Effort:** M · **Verify:** preflight from a disallowed origin is not granted; the real frontend origin works.

### SEC-22 · Rate limiting (auth + AI + reset)  `sec-medium`
- **Fixes:** M9
- **Files:** auth edge functions, `src/app/api/generate-image/route.ts`
- **Change:** Add IP+user rate limiting (Supabase edge KV / Upstash / a `rate_limits` table) on login/register/password-reset and image generation; re-enable and enforce `deduct_coin()` before any paid AI call (remove the commented block).
- **Effort:** L · **Verify:** N rapid login/reset/generate calls → 429 after the threshold; AI generation refuses when coins are 0.

### SEC-23 · Scrub PII/error leakage  `sec-medium`
- **Fixes:** M10, M11, L5
- **Files:** `auth-password-reset`, `stripe-webhook`, `create-paypal-order`, `mollie-webhook`; Next routes `best-provider`, `test-variant-prices`, `generate-image`, `refresh-provider-catalog`, `paypal/capture-order`
- **Change:** Remove/gate logs of emails, DB rows, provider metadata, token previews. Return generic message + stable code to clients (mirror `_shared/errors.ts`); delete or `NODE_ENV`-gate debug/test routes.
- **Effort:** M · **Verify:** grep for `console.log(email|result|metadata|token` in server code returns only gated logs; a triggered error returns a generic body, detail only in server logs.

### SEC-24 · Low-severity hardening batch  `sec-low`
- **Fixes:** L1, L2, L6, L7, L8
- **Change:** ownership check after provider re-fetch in `capture-paypal-order`/`verify-mollie-payment` (L1); rate-limit + linkage check on `mollie-webhook` (L2); unify password policy to ≥8 + complexity/breach check across `src/schemas/auth.ts` and `_shared/validators.ts` (L6); allow-list the `next` param in `auth/callback` (L7); allow-list `user_metadata` keys in profile update (L8).
- **Effort:** M · **Verify:** per item — cross-user capture blocked; weak password rejected on both layers; `?next=//evil` or unknown internal path rejected; unexpected metadata keys dropped.

---

## Dependency / sequencing notes
- **SEC-5 before SEC-12:** move order/payment writes to `service_role` only *after* the server computes and inserts trusted amounts, or checkout breaks.
- **SEC-6 before SEC-9:** fix credit derivation before adding idempotency, else you make a wrong grant idempotent.
- **SEC-14 `deduct_coin` before SEC-22:** the AI rate-limit ticket re-enables `deduct_coin`; it must be the hardened version.
- **SEC-18 admin role before SEC-17 finalization:** middleware needs the admin flag to guard `/admin/*`.
- **SEC-20 CSP:** ship as `Content-Security-Policy-Report-Only` first, watch reports, then enforce.

## Regression coverage to add alongside
- Edge-function auth tests: unauth call → 401/403 for `process-refund`, `cancel-printify-order`, `create-printify-order`.
- Payment-tamper tests: low `amount` / bogus `credits` rejected (extend existing `*.test.ts` in `supabase/functions/`).
- RLS tests: cross-user `update`/`insert`/`select` denied for `products`, `orders`, `payment_transactions`, `profiles.coins`, `promocodes`, `deduct_coin`.
- Webhook replay + forged-signature tests for all three providers.

---

# Phase 5 — E2E test suite (Playwright)

**Goal:** every security fix ships with e2e coverage that proves **(a)** the attack is now blocked *and* **(b)** the legitimate flow still works. This prevents both regressions and "fixed by breaking the feature."

**Setup notes (match the existing project):**
- Runner: Playwright (`playwright.config.ts`); auth fixture via `src/features/auth/auth.setup.ts` using `TEST_USER_EMAIL`/`TEST_USER_PASSWORD` (a *storageState* file — regenerate at runtime per SEC-4, never commit).
- Add a **second** authenticated fixture (`user-b`) so cross-user/IDOR tests have a real victim. Create a `secondUser` project + `user-b.setup.ts` producing a separate storageState.
- Put specs under `tests/security/*.spec.ts`. Use `request` (API testing context) for edge-function/route calls and `page` for UI flows.
- Test against a **seeded, non-production** Supabase project. Payment providers in sandbox/test mode; assert against provider test dashboards or mocked webhooks — never charge real money.
- Tag security specs (`test.describe('@security ...')`) so CI can run them as a gate.

### E2E-1 · Printify token not in the client (SEC-1)
- **Negative:** load the app, capture all served JS (`page.on('response')` for `*.js`), assert none contains the Printify token value or `NEXT_PUBLIC_PRINTIFY_API_TOKEN`; assert no browser request goes directly to `api.printify.com` with an `Authorization` header.
- **Positive:** product catalog / customization pages that use Printify data still render and load images (via `/api/*`).

### E2E-2 · Refund requires service-role (SEC-2)
- **Negative:** `request.post('/functions/v1/process-refund', { data:{order_id, payment_provider:'stripe', amount:9999} })` with (i) no auth and (ii) `user-b`'s JWT → both non-2xx; assert no refund created (query provider test API / DB `refund_failures` unchanged).
- **Negative (amount):** even as service-role, a body `amount` larger than the DB amount is ignored — refund equals the stored transaction amount.
- **Positive:** the `cancel-order` UI flow on a paid order still produces exactly one refund of the correct amount.

### E2E-3 · Cancel Printify order ownership (SEC-3)
- **Negative:** `user-b` (and anon) POST `cancel-printify-order` for user-A's order id → 401/403; order remains active.
- **Positive:** owner cancels own in-progress order via UI → order transitions to cancelled once.

### E2E-4 · Price tampering blocked (SEC-5) — the flagship test
- **Negative:** drive checkout to the point of the create-order/intent request, intercept it (`page.route`) and rewrite `amount` to `0.01` while keeping real `lineItems`; complete sandbox payment; assert the created PaymentIntent/PayPal order amount equals the **server-computed total**, not `0.01` (read back via the returned intent or provider test API), and the order's `total_amount` matches the cart.
- Repeat per provider: Stripe, PayPal, Mollie.
- **Positive:** an untampered checkout completes, order marked paid with the correct total, and fulfillment proceeds.

### E2E-5 · Credit purchase can't be inflated (SEC-6)
- **Negative:** call `create-credit-payment` with `{amount:0.50, credits:1000000}` → rejected (unknown pack) OR only the pack's credits granted; after webhook, the user's balance increased by the pack amount, not 1,000,000 (assert via `user_credits`/profile).
- **Positive:** buying a valid pack in sandbox grants exactly that pack's credits, once.

### E2E-6 · Forged PayPal webhook rejected (SEC-7)
- **Negative:** POST a `PAYMENT.CAPTURE.COMPLETED` body for an unpaid order with dummy `paypal-transmission-*` headers → 400; order stays unpaid.
- **Positive:** a genuine PayPal sandbox capture webhook marks the matching order paid exactly once.

### E2E-7 · Fulfillment gated on paid+owned order (SEC-8)
- **Negative:** authed `user-b` POSTs `create-printify-order` with arbitrary `line_items` and no valid payment / for user-A's order → rejected; no Printify order created (assert via Printify test API / no `printify_order_id` written).
- **Positive:** completing a real (sandbox-paid) order for the owner creates exactly one Printify order.

### E2E-8 · Webhook idempotency / no double credit (SEC-9)
- **Negative:** replay the same signed Stripe `payment_intent.succeeded` twice (and fire two concurrent deliveries) → credits/order updated once; `webhook_events` shows one processed row; `credit_transactions.reference_id` unique constraint holds.
- **Positive:** a first-time event credits normally.

### E2E-9 · Promo codes: server-enforced, limited (SEC-10)
- **Negative:** harvest a code (should no longer be possible to list all — see E2E-11), apply a single-use code twice → second checkout rejects it; attempt to override `promo_value` in the request → server recomputes and ignores it; expired code rejected.
- **Positive:** a valid code applies the correct discount once and the charged total reflects it.

### E2E-10 · RLS write-lockdown (SEC-11/12/13) — via anon+JWT Supabase client
Use `@supabase/supabase-js` with the anon key + `user-b`'s access token inside the test (mirrors what a browser attacker can do):
- **Negative:** `update(products).eq('id', <A's product>)` → 0 rows/denied; `insert(orders,{payment_status:'paid',total_amount:0})` → denied; `insert(payment_transactions,{status:'succeeded'})` → denied; `update(profiles,{coins:999999}).eq('id', selfId)` → denied.
- **Positive:** user can still `select` their own orders/cart/profile; can update allowed profile fields (name/avatar); catalog `select` of active products works; checkout (server-side insert) still creates orders.

### E2E-11 · `deduct_coin` + promocodes read hardening (SEC-14)
- **Negative:** `rpc('deduct_coin', { user_id: <A's id> })` as `user-b` → errors / can't affect A's balance; `rpc('deduct_coin')` as anon → denied; anon/`user-b` `select('*').from('promocodes')` → denied (RLS) — only the `validate_promo(code)` RPC returns a single code's rule for authed users.
- **Positive:** an authed user generating an image spends exactly one of *their own* coins; `validate_promo('VALIDCODE')` returns its discount.

### E2E-12 · Route protection server-side (SEC-17)
- **Negative:** with a fresh (unauthenticated) context and **JavaScript disabled** (`javaScriptEnabled:false`), `goto('/profile')`, `/orders`, `/checkout`, `/admin` → redirected to login (assert final URL), and the protected page's data/markup is not in the response body.
- **Positive:** authenticated context reaches each page and sees its own data.

### E2E-13 · Admin gating (SEC-18)
- **Negative:** non-admin authed user `goto('/admin/refresh-catalog')` → redirected/403; `request.post('/api/refresh-provider-catalog')` as non-admin/anon → 403.
- **Positive:** an admin-flagged user reaches the page and the refresh succeeds (rate-limited).

### E2E-14 · SSRF proxy locked down (SEC-19)
- **Negative:** `request.get('/api/fetch-remote-image?url=http://169.254.169.254/latest/meta-data/')`, `...?url=http://localhost:3000/`, `...?url=file:///etc/passwd`, and a non-allow-listed public host → all 400/403; unauth call → 401.
- **Positive:** `?url=<allow-listed CDN image>` returns the image with an image content-type.

### E2E-15 · Headers / CORS (SEC-20/21)
- **Positive/assert:** top-level document response includes `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`.
- **Negative:** edge-function preflight (`OPTIONS` with `Origin: https://evil.example`) does **not** return that origin in `Access-Control-Allow-Origin`; the real `FRONTEND_URL` origin does.

### E2E-16 · Rate limiting (SEC-22)
- **Negative:** loop N+1 rapid `auth-login` (bad password), `auth-password-reset`, and `generate-image` calls → 429 after the threshold; AI generation refuses when the user's coins are 0.
- **Positive:** a normal single login / reset / generation succeeds; note this spec must reset limiter state between runs (use a per-test IP/user or a test-only limiter bypass token).

### E2E-17 · No PII/error leakage (SEC-23)
- **Negative:** trigger a handled error on `best-provider` / `paypal/capture-order` / `generate-image` → response body is a generic message + stable code, contains no stack trace, table name, or upstream provider text.
- **Positive:** happy-path responses of those endpoints are unchanged.

## E2E execution & CI
- Add `test:e2e:security` script scoped to `tests/security/`; wire it as a **required CI gate** on PRs touching `supabase/`, `src/app/api/`, or auth/payment services.
- Run against ephemeral seeded data; reset DB + limiter state in `globalSetup`/`beforeEach`.
- Keep provider calls in sandbox; prefer signed-fixture webhooks (store the provider test signing secret in CI secrets) so signature-verification tests are deterministic.
- Gate merges on the `@security`-tagged suite passing; treat any negative-case regression as a release blocker.
