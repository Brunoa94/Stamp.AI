# Security Analysis — Stamp.AI (imaginary-builderai)

**Date:** 2026-07-12
**Scope:** Full application — Next.js 16 (App Router) frontend, `src/app/api/*` route handlers, Supabase Edge Functions (`supabase/functions/*`), and the Supabase Postgres schema + RLS (`supabase/migrations/*`).
**Method:** Static read-only review of source, git history, migrations, and the built client bundle. No code was modified; no live exploitation was performed. Findings marked **✔ verified** were reproduced/confirmed directly against the code or artifacts; the rest are code-review assessments.

---

## 1. Executive summary

The application has **systemic authorization and payment-integrity weaknesses**. The dominant root causes are:

1. **Edge Functions are deployed with `--no-verify-jwt`** (`package.json:21`), so every function is a public HTTP endpoint that must authenticate callers itself — and several do not (`process-refund`, `cancel-printify-order`), while others trust client-supplied identity, prices, and credit amounts.
2. **Payment amounts and credit grants are taken from the client** rather than recomputed server-side from trusted DB prices. The one server-side guard that exists (`_shared/amountValidator.ts`) is never wired into the charge path.
3. **RLS policies on financial/catalog tables are ownership-only or overly permissive** — users can write rows (`products`, `orders`, `payment_transactions`, `profiles.coins`) whose *values* are never constrained.
4. **A full Printify API token is shipped to the browser** via a `NEXT_PUBLIC_*` variable.
5. **Route protection is client-side only**; server-side middleware does not guard authenticated pages.

### Severity counts

| Severity | Count |
|---|---|
| Critical | 5 |
| High | 9 |
| Medium | 12 |
| Low / hardening | 9 |

### Top priorities (do these first)
1. **Rotate the Printify API token** and remove `NEXT_PUBLIC_PRINTIFY_API_TOKEN` (C1).
2. **Recompute all charge amounts and credit grants server-side** from DB prices (C3, C4).
3. **Add authentication + ownership checks** to `process-refund` and `cancel-printify-order` (C5, H3).
4. **Implement real PayPal webhook signature verification and reject on failure** (C2).
5. **Lock down RLS**: move `products`/`orders`/`payment_transactions` writes to `service_role`; add `WITH CHECK` / column scoping on `profiles`; gate `deduct_coin` on `auth.uid()` (H1, H4, H5, plus M-series).
6. **Purge and revoke the committed Playwright session tokens** (H9).

---

## 2. Critical findings

### C1 — Full Printify API token shipped to the browser ✔ verified
**Files:** `src/services/apiClient.ts:7`, consumed by `src/services/printifyService.ts`, `src/services/imageGenerationService.ts`.

`apiClient` sets `Authorization: Bearer ${process.env.NEXT_PUBLIC_PRINTIFY_API_TOKEN}` in its default headers. `NEXT_PUBLIC_*` variables are inlined into the client JS bundle by Next.js. `apiClient` is imported by `printifyService`/`imageGenerationService`, which are in turn imported by **client-side React Query hooks** (`src/queries/productQueries.ts`, `printifyOrderQueries.ts`, `imageGenerationQueries.ts`, using `useQuery`/`useMutation`). The token therefore reaches the browser.

The token in `.env` is a Printify JWT with expiry `iat/exp` reaching **year ~2036** — effectively non-expiring — granting full access to the merchant's Printify shop (read all orders incl. customer PII, create/cancel orders, mutate products).

**Impact:** Any visitor can extract the token from the JS bundle / network tab and take over the merchant's Printify account.
**Fix:** Delete `NEXT_PUBLIC_PRINTIFY_API_TOKEN` everywhere; keep only the server-only `PRINTIFY_API_TOKEN`. Remove the `Authorization` header from `apiClient` (its calls target first-party `/api/*` routes, which already proxy Printify server-side). **Rotate the token** — assume it is compromised.

### C2 — PayPal webhook signature verification is a no-op; forged "paid" events accepted
**Files:** `supabase/functions/_shared/paypal.ts:212-231`, `supabase/functions/paypal-webhook/index.ts:23-27`.

`verifyPayPalWebhook` only checks that three `paypal-transmission-*` headers are *present* and returns `true` (`// TODO: Implement full signature verification`). The webhook handler then **continues processing even when verification returns `false`** ("Continue processing in sandbox mode"). The event body is fully attacker-controlled and drives an order to `payment_status: 'paid'`.

**Exploit:** POST to the public `/functions/v1/paypal-webhook` with dummy transmission headers and a `PAYMENT.CAPTURE.COMPLETED` body referencing your own order id → order marked paid with no money moving. Chains with H2 for free physical fulfillment.
**Fix:** Implement PayPal `POST /v1/notifications/verify-webhook-signature` using `PAYPAL_WEBHOOK_ID`; reject (400) on anything other than `SUCCESS`. Never "continue on failure."

### C3 — Charged amount is taken from the client (price tampering) ✔ verified (code path)
**Files:** `src/app/api/paypal/create-order/route.ts:29-71`; `supabase/functions/create-payment-intent/index.ts:79-128`; `supabase/functions/create-paypal-order/index.ts:30-76`; `supabase/functions/create-mollie-payment/index.ts:66-106`.

Every payment-creation path charges the client-supplied `amount` (validated only as `> 0`). `line_items` are stored in metadata but **never priced server-side**. The dedicated guard `_shared/amountValidator.ts::validatePaymentAmount` is imported by **no** payment-creation function (only `create-printify-order`).

**Exploit:** Intercept the checkout request, set `amount: 0.01` while keeping the real `line_items`/`order_id`. Pay one cent; the webhook then marks the real order paid.
**Fix:** Recompute the total server-side from DB product/variant prices + shipping + server-validated promo discount; reject if the client amount differs. Wire in `validatePaymentAmount`/`validateCurrency`.

### C4 — Credits are decoupled from amount paid ✔ verified
**Files:** `supabase/functions/create-credit-payment/index.ts:106-134`, `supabase/functions/stripe-webhook/index.ts:31-141`.

`create-credit-payment` accepts `amount` and `credits` as **two independent client fields**, validated independently (`amount > 0`; `credits >= 10`) with **no relationship check**, and writes both into Stripe metadata. The (correctly signature-verified) Stripe webhook then grants whatever `metadata.credits` says.

**Exploit:** Call with `{ amount: 0.50, credits: 1000000 }`; complete the real $0.50 charge; receive 1,000,000 credits.
**Fix:** Derive `credits` from `amount` (or vice-versa) against a fixed server-held price table; never accept both from the client; re-derive in the webhook before crediting.

### C5 — `process-refund` has no authentication ✔ verified
**File:** `supabase/functions/process-refund/index.ts:119-208`.

The handler goes straight to `await req.json()` — **no `verifyAuth`, no `getUser`** — and is deployed `--no-verify-jwt`. Provider ids (`stripe_payment_intent_id`, `paypal_capture_id`, `mollie_payment_id`) and `amount` come from the request body and are passed straight to the provider refund APIs. The only guard is a per-`order_id` `isAlreadyRefunded` check.

**Exploit:** Any anonymous caller POSTs `{ order_id, payment_provider, <provider id>, amount }` → triggers real refunds. Mass abuse = direct financial loss; a buyer can self-refund after receiving goods.
**Fix:** Require authentication; restrict to `service_role`/admin (it is called server-to-server by `cancel-order` with the service key). Look up the refund amount and provider ids from the DB by `order_id` — never trust the body.

---

## 3. High findings

### H1 — Any authenticated user can INSERT/UPDATE any product ✔ verified
**File:** `supabase/migrations/20260413100000_allow_users_insert_products.sql:9-20`.
INSERT `WITH CHECK (auth.role() = 'authenticated')` and UPDATE `USING (auth.role() = 'authenticated')` — **no row-ownership predicate, no `WITH CHECK` on UPDATE**. `products` has a `user_id` column that neither policy references. Any logged-in user can rewrite every product row directly from the browser (`supabase.from('products').update({ base_price: 0 })`). The migration comment says "useful for development/testing" — likely shipped to prod inadvertently. Chains with C3 (mutable prices).
**Fix:** Restrict product writes to `service_role`; if user-authored products are needed, scope by `auth.uid() = user_id` on both `USING` and `WITH CHECK`.

### H2 — Printify fulfillment without payment or ownership
**File:** `supabase/functions/create-printify-order/index.ts:79-131`.
`verifyAuth` accepts any logged-in user; the function never checks that `metadata.order_id` belongs to the caller, nor that `payment_status = 'paid'`. Amount validation runs only `if (payment_amount !== undefined)` and even then compares against **client-supplied** subtotal/shipping/discount. In prod, `validateAndEnforceTestMode` forces a **real** order.
**Exploit:** Authenticated user POSTs arbitrary `line_items` + address, omitting `payment_amount` → real product manufactured and shipped, no payment.
**Fix:** Resolve the order server-side; require `order.user_id === caller` and `payment_status === 'paid'` and DB-derived amount match before calling Printify.

### H3 — `cancel-printify-order` has no authentication
**File:** `supabase/functions/cancel-printify-order/index.ts:23-47`.
No `verifyAuth`; reads `order_id` and cancels via the shop's Printify token. Public + `--no-verify-jwt`. Bypasses the ownership check that the sibling `cancel-order` enforces.
**Exploit:** Anyone who knows/guesses a Printify order id cancels legitimate customers' in-progress fulfillment (denial of fulfillment).
**Fix:** Authenticate, resolve order in DB, verify ownership/admin — or make it `service_role`-only.

### H4 — Users can directly rewrite `profiles.coins` ✔ verified
**Files:** `supabase/migrations/20260115000000_create_core_tables.sql:347-348`; coins column `20260314000000_add_coins_and_deduct_coin_rpc.sql:9-11`.
The `profiles` UPDATE policy scopes by row (`auth.uid() = id`) but has **no `WITH CHECK` and no column restriction**. `coins` (and `stripe_customer_id`) live in that row, and the client already uses the browser Supabase client against `profiles` (`src/services/coinsService.ts`).
**Exploit:** `supabase.from('profiles').update({ coins: 999999 }).eq('id', myId)` → unlimited AI generations, defeating the paid-credit model.
**Fix:** Column-level `GRANT`s (or a `BEFORE UPDATE` trigger / `WITH CHECK`) forbidding client edits of `coins`/`stripe_customer_id`; mutate coins only via `service_role` / a definer RPC that validates the caller.

### H5 — `deduct_coin` RPC: SECURITY DEFINER, PUBLIC-callable, trusts arbitrary `user_id` ✔ verified
**File:** `supabase/migrations/20260314000000_add_coins_and_deduct_coin_rpc.sql:20-63`.
`SECURITY DEFINER`, parameter `user_id UUID`, **no `auth.uid() = user_id` check**, **no `GRANT`** (grep: 0 → defaults to `EXECUTE` for PUBLIC), **no `SET search_path`**.
**Exploit:** Anyone (even anon key) calls `rpc('deduct_coin', { user_id: '<victim>' })` in a loop to drain any user's coin balance (griefing/DoS of the free tier).
**Fix:** Derive the target from `auth.uid()` (don't accept `user_id`); `REVOKE ... FROM PUBLIC` / `anon`; add `SET search_path = public`.

### H6 — SSRF via unauthenticated image proxy ✔ verified
**File:** `src/app/api/fetch-remote-image/route.ts`.
`GET /api/fetch-remote-image?url=<anything>` fetches an arbitrary URL server-side — **no auth, no allow-list, no scheme/host validation** — and returns the body. (`next.config.ts` `remotePatterns` governs only `next/image`, not this route.)
**Exploit:** `?url=http://169.254.169.254/latest/meta-data/...` (cloud metadata / IMDS), `http://localhost:<port>/` internal services, or use as a general open proxy.
**Fix:** Require auth; allow-list hostnames (the CDN hosts in `next.config.ts`); reject non-`https` and private/loopback/link-local IPs after DNS resolution; cap response size.

### H7 — Server-side route protection is effectively absent ✔ verified
**Files:** `middleware.ts` (root), `src/middleware.ts`, `src/features/auth/ProtectedRoute.tsx`.
Two middleware files exist. The root `middleware.ts` (broad matcher) only calls `updateSession()`, which does **no redirect / no protection**. `src/middleware.ts` guards **only `/stamp`**. Next.js uses a single middleware; `/dashboard`, `/profile`, `/orders`, `/cart`, `/checkout`, `/admin` are guarded only by the client component `ProtectedRoute` (a post-render `useEffect` redirect) — bypassable by disabling JS or reading the initial payload.
**Mitigating factor:** RLS scopes the *data* to `auth.uid()`, so anonymous users still can't read others' records — the exposure is page structure/logic + defense-in-depth loss.
**Fix:** Consolidate to one middleware that calls `getUser()` and redirects unauthenticated requests for every protected prefix; delete the no-op root middleware.

### H8 — `/admin/refresh-catalog` and catalog APIs have no auth/admin check
**Files:** `src/app/admin/refresh-catalog/page.tsx`, `src/app/api/refresh-provider-catalog/route.ts`, plus `best-provider`, `get-catalog-blueprints`, `get-provider-catalog`, `get-blueprint-variants`, `test-variant-prices`.
No admin role exists in the schema; the admin page is an unguarded client component; `POST /api/refresh-provider-catalog` accepts no auth and drives upstream Printify fetches + DB writes.
**Exploit:** `curl -X POST .../api/refresh-provider-catalog` in a loop → resource/cost DoS from any anonymous client.
**Fix:** Introduce an admin role; gate admin page + route behind it; rate-limit the refresh endpoint.

### H9 — Real Supabase session tokens committed to git ✔ verified
**Files (git-tracked):** `playwright/.auth/user.json`, `src/playwright/.auth/user.json`.
Both contain a `sb-timbqoxngnhoetbofdiq-auth-token` cookie whose base64 value decodes to a session object with a real JWT `access_token` **and a `refresh_token`** (project ref `timbqoxngnhoetbofdiq`, the one linked in `package.json`), plus the account email. Present throughout git history (incl. commit `9f19a05` "Security hardening", which claims to have untracked them but did not).
**Impact:** The refresh token mints new access tokens indefinitely until revoked → persistent takeover of the test account on the linked project. Because RLS trusts `auth.uid()`, a valid session for any user is meaningful given the RLS gaps above.
**Fix:** `git rm --cached` both files; add `**/.auth/user.json` to `.gitignore`; purge from history (git-filter-repo/BFG); **revoke the session and rotate the test user's credentials**.

---

## 4. Medium findings

| # | Finding | Location | Fix |
|---|---|---|---|
| M1 | Client-INSERT of "paid" orders — `orders`/`order_items` INSERT policies check only ownership, not field values (`payment_status='paid'`, `total_amount=0`) | `20260115000000_create_core_tables.sql:425-426`; `20260118000000_allow_user_order_items.sql:5-13` | Insert orders only via `service_role`; drop client INSERT on financial tables |
| M2 | Fabricated `succeeded` `payment_transactions` rows — INSERT checks only ownership; `status`/`amount`/provider ids attacker-chosen | `20260101015400_create_payment_transactions.sql:33-34` | `service_role`-only writes |
| M3 | `payment_recovery` INSERT/UPDATE allow client-controlled `amount`/`cart_snapshot`/`line_items` (ownership correctly enforced) | `20260418090000_fix_payment_recovery_rls_for_authenticated.sql:16-28` | Recovery→order flow must re-query PSP, not trust stored amounts |
| M4 | Promo codes world-readable + no usage limits + client-side discount + unlimited reuse | `20260402000000_add_promocodes_support.sql:20-23`; `src/services/promocodeService.ts` | Validate/apply server-side; add `max_uses`, per-user redemption, expiry; don't expose full table |
| M5 | Stripe webhook lacks idempotency (PayPal/Mollie have it) → replayed signed event double-credits | `stripe-webhook/index.ts:143-292` | Gate on `is_webhook_processed`/`record_webhook_event` by `event.id`; unique constraint on `credit_transactions.reference_id` |
| M6 | `auth-verify-email` confirm passes caller-supplied `token` as user id to `admin.updateUserById(..., {email_confirm:true})` before OTP check | `auth-verify-email/index.ts:96-99` | Delete unused legacy `auth-*` fns, or remove the `updateUserById(token,...)` call |
| M7 | Session in non-`httpOnly` cookies + no CSP/security headers → XSS = token theft | `src/lib/supabase/client.ts`; `next.config.ts` (no `headers()`) | Add CSP, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy` |
| M8 | Wildcard `Access-Control-Allow-Origin: *` on all `auth-*` edge functions (incl. profile DELETE → `admin.deleteUser`) | `supabase/functions/auth-*/index.ts` | Reflect an allow-listed origin; scope methods |
| M9 | No rate limiting on auth (brute force), password reset (email bombing), or AI generation (cost DoS) | `auth-login`, `auth-password-reset`, `src/app/api/generate-image/route.ts` | Add IP+user rate limits; enforce `deduct_coin` before paid AI calls |
| M10 | PII / full payment rows logged in edge functions (emails, `payment_transactions` rows, Stripe metadata, customer ids) | `auth-password-reset:26,46`; `stripe-webhook:116,246,315,392`; `create-paypal-order:28` | Remove/gate debug logs; never log rows, metadata, emails, provider ids |
| M11 | Internal error messages (`error.message`, upstream text) returned to clients | `best-provider`, `test-variant-prices`, `generate-image:81`, `refresh-provider-catalog:35`, `paypal/capture-order:105-116` | Return generic message + stable code; log detail server-side only (edge fns already do this via `_shared/errors.ts`) |
| M12 | `create_refund_failure_alert` SECURITY DEFINER, PUBLIC-callable with attacker-controlled fields | `20260412000000_add_idempotency_and_refund_failures.sql:185-225` | `service_role`-only; `REVOKE FROM PUBLIC` |

---

## 5. Low / hardening

- **L1** — IDOR on `capture-paypal-order` / `verify-mollie-payment`: authenticate *a* user but don't bind the acted-on order to the caller. Mitigated because both re-fetch authoritative state from the provider (a forged "paid" can't be minted). Add a caller-ownership check after fetch. (`capture-paypal-order/index.ts:110-232`, `verify-mollie-payment/index.ts:23-102`)
- **L2** — `mollie-webhook` unauthenticated but protected by source-of-truth fetch + idempotency; residual arbitrary-id spam (minor outbound-amplification DoS). (`mollie-webhook/index.ts`)
- **L3** — `get_order_by_idempotency_key` SECURITY DEFINER, PUBLIC; predictable key format `{provider}_{payment_id}` → order-UUID oracle (UUID alone low-impact). (`20260412000000_...:170-182`)
- **L4** — `deduct_coin` (and other definer fns) lack `SET search_path` — search-path-hijack hardening gap.
- **L5** — Debug/test API routes shipped in prod (`test-variant-prices`, `best-provider`, `fetch-custom-product` debug logs). Remove or guard by `NODE_ENV`+auth.
- **L6** — Weak/inconsistent password policy: client schema min 6 (`src/schemas/auth.ts:6`) vs edge validator min 8 (`validators.ts:101`); no complexity/breach checks.
- **L7** — Open-redirect surface: `src/app/auth/callback/route.ts` redirects to `next` param (resolved against request origin, so same-host only) — validate against an allow-list of internal paths.
- **L8** — Latent mass-assignment: `auth-profile` PUT / `AuthService.updateProfile` do `Object.assign` into `user_metadata`. Harmless today (no role/`is_admin` column; nothing trusts `user_metadata` for authz) but becomes escalation if that changes — allow-list metadata keys now. (`auth-profile/index.ts:88-90`)
- **L9** — Undefined production functions: `handle_new_user`, `set_order_number`, `expire_waiting_payment_orders`, `refill_min_3_coins_daily` are referenced (`20260414100002_drop_unused_functions.sql:10-15`) but **not defined in any migration in the repo** — applied out-of-band. Their SECURITY mode couldn't be audited; if any are DEFINER and write coins/orders, audit them like H5.

---

## 6. RLS matrix (final effective state)

Applying migrations in timestamp order (later overrides earlier). Roles: policy without `TO` = `public` (anon + authenticated).

| Entity | RLS | Effective policies (op → role → condition) | Verdict |
|---|---|---|---|
| profiles | ✅ | SELECT auth `uid()=id`; UPDATE public `uid()=id` (**no WITH CHECK / no column scope**); ALL service_role | **GAP (H4 coins self-write)** |
| user_credits | ✅ | SELECT public `uid()=user_id`; ALL service_role | Secure |
| credit_transactions | ✅ | SELECT public `uid()=user_id`; ALL service_role | Secure |
| user_uploads | ✅ | SELECT/INSERT/DELETE public `uid()=user_id` | Secure |
| ai_generations | ✅ | SELECT/INSERT/UPDATE public `uid()=user_id`; ALL service_role | Secure |
| user_designs | ✅ | CRUD public `uid()=user_id` | Secure |
| carts | ✅ | SELECT + ALL public `uid()=user_id` | Secure |
| cart_items | ✅ | ALL public via parent-cart ownership EXISTS | Secure |
| products | ✅ | SELECT public `is_active=true`; INSERT public `role()='authenticated'`; UPDATE public `role()='authenticated'` (**no row scope / no WITH CHECK**); ALL service_role | **OVERLY-PERMISSIVE (H1)** |
| orders | ✅ | SELECT public `uid()=user_id`; INSERT public WITH CHECK `uid()=user_id` (**values unchecked**); ALL service_role | **GAP (M1)** |
| order_items | ✅ | SELECT/INSERT public via order ownership; ALL service_role | **GAP (M1)** |
| payment_transactions | ✅ | SELECT public `uid()=user_id`; INSERT public WITH CHECK `uid()=user_id` (**status/amount unchecked**); ALL service_role | **GAP (M2)** |
| promocodes | ✅ | SELECT public `USING (true)`; ALL service_role | **OVERLY-PERMISSIVE (M4)** |
| payment_recovery | ✅ | SELECT public `uid()=user_id`; INSERT/UPDATE authenticated `uid()=user_id` (USING+CHECK) | Mostly secure; client-set amount (M3) |
| provider_catalog | ✅ | SELECT public `expires_at>NOW()`; ALL service_role | Secure (public catalog by design) |
| refund_failures | ✅ | ALL service_role; SELECT `USING(false)` | Secure (locked) |
| order_status_reconciliation | ✅ | ALL service_role only | Secure (locked) |
| webhook_events | ✅ | ALL service_role; SELECT `USING(false)` | Secure (locked) |
| amount_validation_failures | ✅ | ALL service_role only | Secure (locked) |

**SECURITY DEFINER RPCs:** `deduct_coin` (H5 — no auth check, PUBLIC), `create_refund_failure_alert` (M12 — PUBLIC), `get_order_by_idempotency_key` (L3 — PUBLIC oracle). The atomic payment/recovery/webhook RPCs (`process_refund_atomic`, `update_order_payment_status_atomic`, `record_payment_for_recovery`, `is_webhook_processed`, `record_webhook_event`, …) are SECURITY INVOKER and RLS-gated to `authenticated`+`service_role` — OK.

---

## 7. Checked and OK (no action)

- **`.env` is not committed** and is correctly ignored (`.gitignore` `.env*`); no real secret env file in git history (only `.env.example`). ✔ verified
- **No hardcoded secrets** in `src/` or `supabase/functions/` (no `sk_live`/`whsec_`/private keys). 
- **Server-only secrets stay server-only** — `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PAYPAL_CLIENT_SECRET`, `OPENAI_API_KEY`, `GOOGLE_GEMINI_API_KEY`, `RESEND_API_KEY`, `PRINTIFY_API_TOKEN` (non-public copy) never appear in client-reachable code. The service-role key is **not** in the client bundle (a naive prefix match false-positives on the shared JWT header; confirmed clean with distinctive-fragment search). ✔ verified
- **Stripe webhook signature IS verified** (unlike PayPal). Mollie is protected by source-of-truth re-fetch + idempotency.
- **Edge-function error envelope is safe** — `_shared/errors.ts` maps unknown exceptions to generic `INTERNAL_ERROR`, no stack traces to clients.
- **No `dangerouslySetInnerHTML`** anywhere; `htmlUtils.ts` only strips tags → no direct HTML-injection sink found.
- **AI keys are gated** behind the server route `generate-image` (`runtime = "nodejs"`, auth'd) — though quota enforcement is currently commented out (M9).
- **Legitimately public client vars:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_PAYPAL_CLIENT_ID`, `NEXT_PUBLIC_MOLLIE_ENABLED`.

---

## 8. Remediation roadmap

**Phase 1 — stop the bleeding (this week)**
- Rotate Printify token; remove `NEXT_PUBLIC_PRINTIFY_API_TOKEN` and the `apiClient` Authorization header (C1).
- Add auth + DB-driven amounts to `process-refund`; require ownership on `cancel-printify-order` (C5, H3).
- Purge + revoke committed Playwright tokens (H9).

**Phase 2 — payment integrity (next sprint)**
- Server-side price recomputation in all `create-*` payment functions; wire in `validatePaymentAmount` (C3).
- Derive credits from amount server-side (C4).
- Real PayPal webhook signature verification, reject on failure (C2).
- Stripe webhook idempotency (M5); server-side promo validation with usage limits (M4).
- Gate `create-printify-order` on paid + owned order (H2).

**Phase 3 — RLS lockdown**
- Move `products`/`orders`/`order_items`/`payment_transactions` writes to `service_role` (H1, M1, M2).
- `WITH CHECK` / column scope on `profiles`; fix `deduct_coin` to use `auth.uid()` + `REVOKE FROM PUBLIC` (H4, H5).
- `service_role`-only for `create_refund_failure_alert`; review the out-of-band prod functions (M12, L9).

**Phase 4 — platform hardening**
- Server-side route protection in a single middleware (H7); admin role + gating (H8).
- Auth allow-list CORS; rate limiting; security headers/CSP (M7, M8, M9).
- Allow-list SSRF proxy; scrub PII logging; generic client errors (H6, M10, M11).

---

*Generated by an automated security review. Findings marked "✔ verified" were confirmed directly; others are code-review assessments and should be validated before remediation. No production exploitation was performed.*
