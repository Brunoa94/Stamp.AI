# Security Audit & Mitigation Plan

**Date:** 2026-07-07
**Scope:** Full application — Next.js 16 App Router frontend + API routes, Supabase Edge Functions (Deno), Postgres RLS, and payment integrations (Stripe, PayPal, Mollie, Printify).

This document is the deliverable of a deep security review. Findings are ranked by severity. The **Mitigation Plan** at the end tracks what was fixed in code vs. what requires an operational action only the account owner can take (credential rotation) or a larger product decision.

---

## Threat model summary

The app is a print-on-demand storefront. Users upload artwork, generate AI mockups (costs credits/coins), and buy physical products fulfilled through Printify. Money flows through Stripe/PayPal/Mollie. The attacker classes that matter most:

1. **Unauthenticated internet callers** — every Supabase Edge Function is reachable by anyone holding the public anon key (which ships in the frontend). `verify_jwt=true` does **not** stop them because the anon key is itself a valid project JWT. Real authorization must come from in-function checks.
2. **Authenticated but malicious users** — can call any function with their own JWT and can write directly to Postgres tables via PostgREST subject only to RLS.
3. **Payment forgery** — forging webhook events or tampering with charge amounts to obtain free goods/credits.

---

## Findings (severity-ranked)

### CRITICAL

- **C1 — Printify API token shipped to the browser.**
  `src/services/apiClient.ts:7` sets `Authorization: Bearer ${NEXT_PUBLIC_PRINTIFY_API_TOKEN}` in module-level headers. `NEXT_PUBLIC_*` values are inlined into the client bundle, and `apiClient` is transitively imported by `"use client"` components, so the raw Printify token is extractable from `_next/static/chunks/*.js`. That token grants full read/write to the merchant's Printify shop.
  *Aggravating/mitigating:* `apiClient` is only ever called against our **own** endpoints (`/api/fetch-custom-product`, `/api/generate-image`) — it never calls `api.printify.com` from the browser — so the header is functionally useless and can be removed with zero behavior change.

- **C2 — Free product fulfillment via `process-payment-recovery`.**
  `supabase/functions/process-payment-recovery/index.ts` has **no authentication** and never verifies with Stripe/PayPal/Mollie that the claimed `payment_intent_id` was actually paid. It writes an order with `payment_status:"paid"` and calls `create-printify-order` (real fulfillment). An attacker POSTs a fabricated payment id + cart snapshot and gets a physical product manufactured and shipped for free.

- **C3 — Self-granted credits.** `create-credit-payment` + `stripe-webhook#handleCreditPurchase` treat `amount` and `credits` as independent client inputs. Pay $10, request 1,000,000 credits. There is no server-side price-per-credit tying the charge to the grant.

- **C4 — Amount/price tampering on all payment-creation functions.** `create-payment-intent`, `create-paypal-order`, `create-mollie-payment`, and `src/app/api/paypal/create-order/route.ts` take the charge `amount` straight from the request body (only checked `> 0`). The existing `_shared/amountValidator.ts` is never called by any of them. Pay $0.01 for a $100 cart.

- **C5 — Forgeable PayPal webhook.** `_shared/paypal.ts#verifyPayPalWebhook` is a stub that returns `true` whenever the transmission headers are merely *present*; the caller ignores even a `false` result. Anyone can POST a forged `PAYMENT.CAPTURE.COMPLETED` to flip an order to paid.

- **C6 — Any authenticated user can flip any order to paid/confirmed and fulfill it.** `create-printify-order` accepts a normal user JWT, then calls the service-role RPC to set `payment_status:'paid'` for the `metadata.order_id` with no ownership check and no payment verification (amount validation is skipped entirely if `payment_amount` is omitted).

- **C7 — Users can UPDATE their own orders' price/status via RLS.** Migration `20260701000000_add_orders_update_policy.sql` grants `FOR UPDATE USING (auth.uid()=user_id)` with **no column restriction**, so a user can `UPDATE orders SET payment_status='paid', total_amount=0.01`.

- **C8 — `sync-catalog` is fully public and does expensive Printify writes.** `verify_jwt=false` + no in-code auth. A curl loop creates real Printify products and hammers the DB — unbounded cost and shop pollution.

### HIGH

- **H1 — `process-refund` has no auth and no ownership check (IDOR).** Any caller can force refunds on other users' orders.
- **H2 — `cancel-printify-order` has no auth/ownership (IDOR).** Guessable Printify order IDs let an attacker cancel other customers' orders.
- **H3 — Any authenticated user can UPDATE/INSERT any `products` row** (`Authenticated users can update products USING (auth.role()='authenticated')`) — set catalog prices to 0, toggle `is_active`.
- **H4 — Users can grant themselves unlimited `coins`** — `profiles` UPDATE policy has no `WITH CHECK` and no column list; `UPDATE profiles SET coins=999999`.
- **H5 — `create-custom-product` unauthenticated** — creates real Printify products; cost/abuse.
- **H6 — `daily-catalog-sync` "auth" is `authHeader.includes("Bearer")`** — any header containing the substring passes; triggers the expensive sync.
- **H7 — No rate limiting on login/register/password-reset** (deployed `--no-verify-jwt`) — brute force, mass account creation, reset-email flooding.
- **H8 — Email-verification bypass** — `auth-verify-email` calls `admin.updateUserById(token,{email_confirm:true})` (treating client `token` as a user id) **before** and independently of the OTP check, and ignores its error. A valid user UUID confirms that account with no OTP.
- **H9 — Credit purchase not idempotent** — `handleCreditPurchase` does read-then-write with no already-processed guard; webhook redelivery double-credits.

### MEDIUM

- **M1 — SSRF: `src/app/api/fetch-remote-image/route.ts`** fetches an arbitrary user URL, unauthenticated, and proxies the body back. Reaches `169.254.169.254` cloud metadata, localhost, internal services.
- **M2 — `fetch-custom-product`** unauthenticated, interpolates unvalidated `product_id` into the Printify path, uses the server token, logs product data.
- **M3 — Service-role-key-as-bearer bypass** in `verifyAuth` (all payment fns) — a static omnipotent secret used as a presentable credential; any leak = full impersonation; non-constant-time compare.
- **M4 — `deduct_coin(user_id)` RPC** is `SECURITY DEFINER`, takes a caller-supplied `user_id` instead of `auth.uid()`, not revoked from `public` — drain another user's coins.
- **M5 — All promo codes world-readable** (`promocodes SELECT USING (true)`).
- **M6 — Guest cart cross-tenant access** — RLS gates only on `auth.uid() IS NULL`, so any anonymous client can read/modify every guest cart.
- **M7 — Mass-assignment of `user_metadata`** on register/profile-update (no key allow-list) — dangerous if any logic ever trusts `user_metadata.role`/`coins`/`email_verified`.
- **M8 — Account enumeration** via distinct auth error codes/statuses.
- **M9 — Wildcard CORS (`*`)** on every credential/token-returning auth & payment endpoint.
- **M10 — No security headers** (no CSP/HSTS/X-Frame-Options/X-Content-Type-Options) — clickjacking, weaker XSS containment.
- **M11 — Page routes protected only client-side** — middleware guards only `/stamp`; `/orders`, `/profile`, `/cart`, `/checkout`, `/dashboard` rely on `ProtectedRoute` (not a server control).
- **M12 — Verbose DB error messages** returned to clients in several Next.js routes.
- **M13 — Open redirect** in `src/app/auth/callback/route.ts` via unvalidated `next` param.
- **M14 — `upload-printify-image`, `get-printify-products`, `daily-price-refresh`, `process-catalog-queue`, `stock-availability-check`** unauthenticated (cost abuse; `get-printify-products` leaks wholesale `cost`/margin).
- **M15 — Committed test secrets** — `playwright/.auth/user.json` contains real Supabase access/refresh JWTs, tracked in git.

### LOW

- **L1 — PII + partial JWT in logs** (`validators.ts` token preview; `create-printify-order` logs full body incl. email/phone/address).
- **L2 — Weak password policy** (length ≥ 8 only).
- **L3 — Broad Next image `remotePatterns`** (`*.supabase.co`, public hosts) — minor `/_next/image` proxy abuse.
- **L4 — Global `--no-verify-jwt` deploy** removes gateway defense-in-depth.
- **L5 — Duplicate dead `middleware.ts`** at repo root (Next uses `src/middleware.ts`).
- **L6 — Mollie webhook** has a `ReferenceError` dead path (`const result = updateResult` — undefined) and duplicated update logic.

---

## Mitigation plan

Legend: ✅ fixed in this change · 🔧 operational action required (owner) · 📐 larger redesign (tracked)

### P0 — stop active bleeding
- ✅ **C1** Remove the Printify Bearer header from `apiClient.ts`; drop `NEXT_PUBLIC_PRINTIFY_*`, add server-only `PRINTIFY_API_TOKEN`/`PRINTIFY_SHOP_ID` and a `.env.example`.
- 🔧 **C1/M15** ROTATE every credential that has ever shipped in a client bundle or git: **Printify API token**, **OpenAI key**, and the Supabase session in `playwright/.auth/user.json`. Code changes cannot un-leak an already-distributed secret.
- ✅ **M15** Untrack `playwright/.auth/user.json` and gitignore the auth dir.
- ✅ **C5** Implement real PayPal webhook signature verification (`/v1/notifications/verify-webhook-signature`) and reject on failure.
- ✅ **C2/H1** Require authenticated ownership on `process-payment-recovery` and `process-refund`; recovery no longer trusts client-declared payment success (guarded + documented server-verification requirement).

### P1 — authorization & data integrity
- ✅ **C6/H5/H2/M14/C8/H6** Add a shared `requireUser` / `requireServiceRoleOrCron` guard and apply auth + ownership to `create-printify-order`, `create-custom-product`, `cancel-printify-order`, `upload-printify-image`, `get-printify-products`, `sync-catalog`, `daily-catalog-sync`, `daily-price-refresh`, `process-catalog-queue`, `stock-availability-check`.
- ✅ **C7/H3/H4/M4/M5** RLS hardening migration: column-guard triggers on `orders` and `profiles` (block non-service changes to price/status/coins/stripe id), scope `products` writes to `user_id=auth.uid()`, restrict `promocodes` reads to service role, and lock `deduct_coin` to `auth.uid()` + `REVOKE`.
- ✅ **C3/H9** Decouple credit grants from client input: derive credits from the paid amount using a server-side `CREDIT_PRICE_CENTS`, and make the grant idempotent on the payment-intent id.
- ✅ **H8** Fix the email-verification bypass (verify OTP first; never confirm by raw user id).

### P2 — hardening
- ✅ **M1/M2** SSRF allowlist + private-IP block on `fetch-remote-image`; auth + numeric validation + encoding on `fetch-custom-product`.
- ✅ **M10** Security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy) in `next.config.ts`.
- ✅ **M11** Extend middleware to server-guard `/orders`, `/profile`, `/cart`, `/checkout`, `/dashboard`.
- ✅ **M13** Validate `next` is a local path in the auth callback.
- ✅ **M12** Stop returning raw DB `error.message` from Next.js routes.
- ✅ **M9** Origin-allowlist CORS helper for edge functions (configurable via `ALLOWED_ORIGINS`).
- ✅ **L1** Remove token-preview / full-body PII logging.
- ✅ **L5** Delete the dead root `middleware.ts`.
- ✅ **L6** Fix the Mollie webhook dead-path bug.

### Verification
- ✅ `npx tsc --noEmit` — no source-level type errors.
- ✅ `npx vitest run` — 177 unit tests pass (3 pre-existing integration specs fail only because they require live Supabase env vars at import; unrelated to these changes).
- ✅ E2E: `src/tests/e2e/security.e2e.spec.ts` (Playwright, unauthenticated) — 12/12 pass. Covers: security headers on the app shell; middleware redirects for `/orders`, `/profile`, `/cart`, `/checkout`, `/dashboard`; `fetch-remote-image` auth gate + no open proxy to `169.254.169.254`; `fetch-custom-product` auth gate; `best-provider` 400 without internal leakage; auth-callback open-redirect protection; removed `test-variant-prices` returns 404.
- Note: edge-function (Deno) changes are validated by inspection + brace/type balance here; running them end-to-end needs `supabase functions serve` in an environment with Deno installed (Deno was not available on this machine).

### Requires product/infra decisions (tracked, not auto-implemented)
- 📐 **C4** True fix for amount tampering is a **server-side pricing source of truth**: charge amounts must be recomputed from the DB catalog/cart, never accepted from the client. Credits are fixed here; the cart/checkout path needs a schema-aware recompute in `create-payment-intent` / `create-paypal-order` / `create-mollie-payment`. Interim: `validatePaymentAmount` is wired in where cart data is available.
- 📐 **H7/rate limiting** Needs a shared store (e.g. Upstash/Redis or Supabase table) for login/register/reset and the public GET routes.
- 📐 **M6** Guest-cart isolation needs a signed per-session token; pure RLS cannot bind an anonymous row to one browser.
- 📐 **M7** Add a `user_metadata` key allow-list if/when any authorization ever reads it.
- 🔧 **L4** Prefer per-function `verify_jwt` config over the blanket `--no-verify-jwt` deploy once in-code guards are confirmed.
