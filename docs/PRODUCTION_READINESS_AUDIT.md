# Production Readiness Audit

**Original audit:** 2026-09-08 against `dev` at `2185b9a`
**Re-verified:** 2026-09-15 against `dev` at `559affe` (61 commits later, including the merged `fixing_security` PR #17, the email-confirmation PR #75 and the CSP fixes PR #42)
**Scope:** Security & auth, payments, operations & CI/CD, testing, observability, reliability, legal/compliance, dependencies, SEO.

Every finding carries a status from the re-verification:

- **OPEN** — unchanged since the original audit
- **PARTIAL** — materially improved, but a residual gap remains (described under "Remaining")
- **FIXED** — verified closed; kept for the record

Items are grouped by original severity. A suggested order of work, updated for what is left, is at the end.

---

## Executive summary

The `fixing_security` work has landed and closed most of the *authentication* gaps: refunds, payment recovery, the PayPal webhook, the credit purchase path, the SSRF proxy, the Printify token leak, the open redirect and route protection are all fixed. The product is **still not safe to take real payments**, for a smaller set of reasons:

1. **Orders are still minted by the browser.** The UPDATE hole on `orders` is closed by a trigger, but the INSERT path is unguarded: the client still inserts `payment_status = "paid"` with client-computed totals, and both webhooks still poll for that row. `payment_transactions` still has no `WITH CHECK`. Server-side pricing now exists but can be bypassed by omitting `blueprint_id`, and discounts/shipping are still taken from the request body.
2. **Delivery pipeline is unchanged.** No CI, no deploy pipeline, no staging, build still broken (`openai` not installed), tests still red.
3. **EU legal compliance is unchanged.** No cookie consent, placeholder entity data, no account deletion, invoices with zero tax.

**One regression:** the Playwright session file is tracked again at `src/playwright/.auth/user.json` and the `.gitignore` rule does not cover that path (H9).

### Toolchain state

| Check | 2026-09-08 | 2026-09-15 |
|---|---|---|
| `npx vitest run` | 8 files / 10 tests failed, 909 passed | 9 files / 15 tests failed, 76 files passed |
| `npx tsc --noEmit --incremental false` | 1 error: `Cannot find module 'openai'` | same (declared in `package.json:54`, absent from `node_modules`) |
| `npx eslint .` | 873 errors, 541 warnings | 866 errors, 541 warnings |
| `npm audit --omit=dev` | 12 vulns: 1 critical, 8 high | 11 vulns: 2 critical (`tar`, `sharp`), 6 high, 2 moderate, 1 low |
| `.github/workflows/` | Claude bot only | Claude bot only |

### Status at a glance

| | FIXED | PARTIAL | OPEN |
|---|---|---|---|
| Critical (C1–C18) | C2 C3 C4 C5 C8 C9 | C1 C6 C7 C10 C13 | C11 C12 C14 C15 C16 C17 C18 |
| High (H1–H15) | H1 H2 | H4 H5 H6 H7 H8 H13 H14 H15 | H3 H9 H10 H11 H12 |
| Medium (M1–M12) | M4 M6 | M2 M3 M7 M8 M9 | M1 M5 M10 M11 M12 |

---

## Fix PRs and what is still missing (2026-09-15)

Five backend PRs against `dev` implement the fixes for the findings below. **None is merged yet**, and none has been deployed to Supabase; the statuses in the sections that follow describe `dev` *before* these PRs.

| PR | Branch | Findings addressed | Suggested merge order |
|---|---|---|---|
| #93 | `fix/delivery-pipeline` | C11, C13, C14, all 15 failing unit tests | 1 — gives every later PR a CI run |
| #94 | `fix/legal-compliance` | C15 (backend), C16 (backend), C17 | 2 |
| #96 | `fix/security-hardening` | C10, H4, H5, H8, H9, M1, M2, M5 | 3 |
| #95 | `fix/reliability-observability` | H10, H12, H13, H14, M8 | 4 |
| #97 | `fix/payment-integrity` | C1, C6, C7, C18, H3, H6 | 5 — touches the same webhooks as #95 and #96; expect small additive conflicts |

### Still missing after those PRs merge

**Needs a human decision or information nobody in the repo has**

- **C16 real legal entity data.** `legalEntity.ts` still carries `null` for registered address, KvK and VAT. #94 only removes the contradiction with `business.ts` and stops the placeholders reaching JSON-LD. Blocked on legal.
- **C17 invoice scrubbing on account deletion.** #94 anonymises customer data on issued invoices and deletes the PDFs. Whether Dutch invoice law (Wet OB art. 35a) permits this needs a legal answer; the alternative is a one-line change described in `docs/GDPR.md`.
- **Secret rotation.** The Playwright test account token is still in git history (#96 untracks the file; a history rewrite is optional). Printify token rotation for C8 cannot be confirmed from the repo.
- **C12 staging environment and deploy pipeline.** Not started. Needs a second Supabase project and Vercel environment; `supabase:setup` still hardcodes the production project ref.
- **M12 Dutch locale.** Deliberately not started.

**Frontend work (out of scope of the backend PRs)**

- **C15 cookie banner.** #94 gates GA behind a consent cookie and sends Consent Mode v2 defaults, but no banner writes that cookie. Until it exists, GA never loads. Spec in `docs/GDPR.md` (`buildConsentCookieString`, `CONSENT_UPDATED_EVENT`).
- **C17 profile UI.** Delete-account and export-data buttons calling `POST /api/account/delete` (with the `DELETE MY ACCOUNT` phrase, password re-entry, and 409 open-orders handling) and `POST /api/account/export`. The FAQ's "from your profile" is false until this ships.
- **H11 `error.tsx` / `loading.tsx`** per route group. Not started.
- **Return-client cleanup after #97.** `StripeReturnClient`, `PaypalReturnClient`, `MollieReturnClient` still call the now no-op `linkPaymentTransactionToOrder` and pass `paymentStatus`/`orderStatus` the server ignores; `useCreateOrderFromCart` callers should surface the new `AMOUNT_MISMATCH`, `PAYMENT_NOT_COMPLETED`, `INVALID_ORDER_SOURCE` codes.
- **M9 iDEAL parity.** `HomePaymentMethods.tsx` still filters iDEAL out while `PaymentMethodsBanner.tsx` shows it; checkout has it live.

**Verification that could not happen locally (no Deno, no Supabase CLI)**

- Seven new migrations (`20260915000000`, `…10`, `…11`, `…20`, `…21`, `…30`, `…31`) are unapplied and untested against Postgres. Apply on staging first; then regenerate `src/types/database.types.ts` (#94 hand-wrote its entries).
- Edge function handlers (`finalize-order`, the reworked webhooks, `process-payment-recovery`, Sentry Deno SDK wiring, email senders) were checked by reading and through the pure `_shared` modules only. Run `supabase functions serve` and a full Stripe, PayPal and Mollie checkout on staging with the tab closed after payment.
- `supabase/config.toml` changes (#96 auth defaults, #95 SMTP) take effect only after `supabase config push` with `NEXT_PUBLIC_SITE_URL`, `AUTH_ADDITIONAL_REDIRECT_URL` and `SMTP_*` set.
- New environment variables must exist before deploy: `ALLOWED_ORIGINS`, `ADMIN_API_SECRET`, `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `BREVO_*`, `SUPPORT_EMAIL`, `ORDER_VAT_RATE` and related `ORDER_*` pricing config, `SMTP_*`. All are listed in `.env.example` on the respective branches.

**Findings that remain PARTIAL even with every PR merged**

- **C6** shipping is a server constant, not carrier-computed; fine for free shipping, revisit when shipping is charged.
- **H5** GoTrue-level JWT verification stays off for every function by design (the project uses publishable/secret keys, pg_cron and server routes); authorization is enforced in-function. CAPTCHA in GoTrue stays off because the app uses reCAPTCHA v3, which GoTrue does not support; password reset therefore has no CAPTCHA.
- **H8** the rate-limit store is still per-instance memory; a shared store (Upstash/Redis or Postgres) is needed for multi-replica deployments.
- **H15** the webhook handlers themselves, and `stripeService`, `paypalService`, `mollieService`, `promocodeService`, `invoiceService`, `authService` still have no dedicated tests.
- **M3** `'unsafe-inline'` remains in `script-src` by design.
- **M7** `npm audit` still reports 11 vulnerabilities; duplicate Google SDK and `supabase` CLI in `dependencies` untouched.
- **M10** no server-side purchase analytics event.
- **M11** sitemap is static and placeholder image hosts remain allowed.
- **Pre-existing Mollie bug** found during #95: the first upsert branch in `mollie-webhook` sets `payment_status = 'paid'` regardless of `isPaid`. Not fixed in any PR.
- **ESLint backlog** of ~866 errors; #93 makes full-repo lint non-blocking and lints only changed files strictly.

---

## CRITICAL

### Payment integrity

#### C1. Client declares its own orders "paid" — PARTIAL
- **Fixed:** `supabase/migrations/20260707000000_security_hardening_rls.sql:32-67` adds `enforce_orders_protected_columns()` as a `BEFORE UPDATE` trigger blocking non-service-role changes to `total_amount`, `payment_status`, `status`, promo fields (re-issued in `20260908000000_fix_security_review.sql:3-32`).
- **Remaining:** there is no `BEFORE INSERT` guard. The only INSERT policy is still `WITH CHECK (auth.uid() = user_id)` (`20260115000000_create_core_tables.sql:426`). `src/services/orderService.ts:398-457` still defaults `paymentStatus = "paid"` (`:401`), computes totals client-side (`:437`) and inserts with the browser client (`:220-227`), called from `StripeReturnClient.tsx:304-311`, `PaypalReturnClient.tsx:308`, `MollieReturnClient.tsx:443`. The new `verifyPaidPayment` helper is used only by `process-refund` and `process-payment-recovery`, not on this path.

**Impact:** an authenticated user can still *create* a `paid`/`confirmed` order with `total_amount: 0` and never pay.

#### C2. `process-refund` unauthenticated — FIXED
- `supabase/functions/process-refund/index.ts:143` `requireUser`; ownership check `:163-165`; `authorizeRefund` (`process-refund/authorization.ts:41-71`) re-checks caller/order/payment linkage, eligibility, amount, currency; payment re-verified against the provider at `:188-193`.

#### C3. `process-payment-recovery` unauthenticated — FIXED
- `index.ts:34` requires a user; `user_id`, `cart_snapshot`, `shipping_address`, `line_items` are loaded from the `payment_recovery` row (`:48-63`) with ownership check (`:59-61`); payment verified with the provider (`:65`) and the recovered total must equal the amount charged (`:126-137`).

#### C4. PayPal webhook signature stub — FIXED
- `_shared/paypal.ts:240-301` pins the cert URL host, requires `PAYPAL_WEBHOOK_ID`, calls `/v1/notifications/verify-webhook-signature`, fails closed. `paypal-webhook/index.ts:86-93` returns 401 on failure.

#### C5. Free credits via independent `amount`/`credits` — FIXED
- `create-credit-payment/index.ts:21,129,134-136` computes `credits * CREDIT_PRICE_CENTS` server-side and rejects a mismatched client amount. `stripe-webhook/index.ts:113-131` calls `grant_stripe_purchase_credits`, which recomputes credits from `amount_received` (`20260908000000_fix_security_review.sql:66-69`).

#### C6. Payment-intent amounts client-controlled — PARTIAL
- **Fixed:** `create-payment-intent/index.ts:95-123`, `create-paypal-order/index.ts:42-70`, `create-mollie-payment/index.ts:60-88` call `validatePricingAgainstDatabase` (`_shared/serverPriceService.ts:84-88`, source of truth `product_variants.price_cents`).
- **Remaining:**
  - Validation is skipped entirely when `line_items` is absent or no item carries `blueprint_id` / `printify_variant_id` (`create-payment-intent/index.ts:96-105`).
  - `shipping_cost_cents` and `discount_cents` come from the request body and are added to the "server" total (`serverPriceService.ts:174-179`); an inflated discount passes.
  - `src/app/api/paypal/create-order/route.ts:34-54` still uses the raw client `amount`.
  - `create-printify-order/index.ts:125-138` still validates the body against itself via `_shared/amountValidator.ts:57-63`, which returns `isValid: true` with no pricing data (`:70-78`).

#### C7. Browser-driven order creation; webhooks poll — OPEN
- `stripe-webhook/index.ts:13-16,21-82,274` and `paypal-webhook/index.ts:15-16,21-66` still poll up to 30 s (`maxAttempts=6, delayMs=5000`) for the browser to create the order. Root cause is C1.

### Other security

#### C8. Printify token under `NEXT_PUBLIC_` — FIXED
- `src/services/apiClient.ts:9-12` holds no secret; no `NEXT_PUBLIC_PRINTIFY_*` in `src/`, `next.config.ts` or `.env.example`. `.env.example:11-13` declares server-only `PRINTIFY_API_TOKEN`. **Token rotation cannot be verified from the repo — confirm it was done.**

#### C9. Unauthenticated SSRF — FIXED
- `src/app/api/fetch-remote-image/route.ts:39-83` requires a user, allowlists hosts, rejects non-HTTPS / IP literals / internal names, `redirect: "error"`, `image/*` content-type check, 15 MB cap. `upload-printify-image/index.ts:43,51-53` requires a user and allowlists `image_url` hosts.

#### C10. `deduct_coin` trusts caller `user_id` — PARTIAL
- **Fixed:** `20260707000000_security_hardening_rls.sql:125-144,176-177` rejects non-service-role callers whose `auth.uid()` differs from `user_id`; revoked from `PUBLIC, anon`.
- **Remaining:** server-side deduction in `src/app/api/generate-image/route.ts:21-39` is **still commented out**. The only deduction is client-side (`src/services/coinsService.ts:64-80`). Calling the route directly still gives unmetered AI generation.

### Delivery pipeline

#### C11. No CI — OPEN
- `.github/workflows/claude.yml` remains the only workflow (on-demand `@claude` responder). Nothing runs lint, typecheck, `vitest`, Playwright or `next build`.

#### C12. No deploy pipeline / environment separation — OPEN
- No `vercel.json`, no deploy workflow. `package.json:18` still hardcodes `--project-ref timbqoxngnhoetbofdiq`; `package.json:22` still `functions deploy --no-verify-jwt`.

#### C13. Build broken — PARTIAL
- `openai@^7.5.0` is declared (`package.json:54`) and imported by `src/services/openaiImageService.ts:1`, but `node_modules/openai` (and `@google/genai`) are absent, so `tsc` fails. A clean `npm ci && next build` is still needed to prove the build. 866 ESLint errors; `eslint.config.mjs` has no `no-console`, unused vars are `warn`.

#### C14. `npm test` cannot pass outside a developer machine — OPEN
- `vitest.config.ts:9` still sweeps in `src/tests/integration/*` (4 live-Supabase suites). `package.json:14-15` still only `test` / `test:watch`. See Appendix B for the current failures.

### Legal / compliance (EU shop)

#### C15. No cookie consent; GA fires unconditionally — OPEN
- `src/features/analytics/GoogleAnalytics.tsx:10-32` unchanged; rendered unguarded in `src/app/layout.tsx:98`. No consent component or `gtag('consent', …)` anywhere in `src/`.
- Now directly contradicted by published copy: `src/i18n/messages/en.json:2230` says GA cookies are set "only after you consent".

#### C16. Legal entity placeholders — OPEN
- `src/features/legal/lib/constants/legalEntity.ts:18-21` still bracketed placeholders for address / KvK / VAT, rendered on `/terms`, `/privacy`, `/cookies`, `/security`.
- `src/features/seo/config/business.ts:6,18` still `"Stamp AI Design Inc."` / `addressCountry: "US"` vs `"Stamp AI B.V."` in `legalEntity.ts`. The file's own TODO (`:5-15`) acknowledges the conflict. Also tracked as P0 in `docs/DESIGN_TRUSTWORTHINESS_PLAN.md:24-28`.

#### C17. No GDPR account deletion or export — OPEN
- FAQ still promises it (`en.json:2724-2725`). `src/features/profile/ui/ProfileContent.tsx:12-14` renders only UserInformation / PasswordReset / Address. No delete/anonymise RPC in migrations, no edge function, no export.

#### C18. Invoices legally wrong — OPEN
- `src/mappers/services/orderServiceMapper.ts:59-63` still `taxRate = 0`, `shippingCost = 0`. `docs/invoicing.md:44` still "Setup (not yet applied)"; `:92-101` keeps both caveats (zero tax, dollars-vs-cents on `order_items`).

---

## HIGH

### Security

#### H1. No server-side route protection — FIXED
- `src/middleware.ts:141-164` guards `/stamp`, `/orders`, `/profile`, `/cart`, `/checkout`, `/dashboard` and redirects with `redirectedFrom`. `ProtectedRoute` is explicitly demoted to UX (`:138-140`).

#### H2. Open redirect + cookie-attribute loss in auth callback — FIXED
- `src/app/auth/callback/route.ts:11-19` requires a leading `/` and matching origin; `:39-45` passes cookie `options` through. New `src/app/auth/confirm/route.ts:6-18,26-53` has an equivalent sanitizer, an OTP-type allowlist, and writes cookies directly on the redirect response.

#### H3. `payment_transactions` UPDATE has no `WITH CHECK` — OPEN
- `20260715000000_add_payment_transactions_update_policy.sql:10-11` unchanged; no later migration or protected-column trigger touches the table. A user can still rewrite `amount`, `status`, `order_id`, `user_id` on their own rows.

#### H4. Service-role key on unauthenticated Next routes — PARTIAL
- **Fixed:** `src/app/api/fetch-custom-product/route.ts:7-21,43-45` requires a user, validates `product_id`, returns a generic 502.
- **Remaining:** `src/app/api/sync-blueprint/route.ts:12-47` and `src/app/api/get-blueprint-variants/route.ts:4-25` are still fully unauthenticated and use `SUPABASE_SERVICE_ROLE_KEY`.

#### H5. Edge functions without auth; `--no-verify-jwt` — PARTIAL
- **Fixed:** `_shared/authGuard.ts` (rejects the anon key, constant-time compare, `requireServiceRoleOrCron`). `requireUser` now on `create-custom-product`, `process-refund`, `process-payment-recovery`, `upload-printify-image`; `verifyAuth` on `cancel-order`, `create-mollie-payment`, `create-paypal-order`, `generate-invoice`, `sync-printify-orders`, `verify-mollie-payment`, `capture-paypal-order`, `create-credit-payment`, `create-payment-intent`, `create-printify-order`. Stripe and PayPal webhooks are signature-verified.
- **Remaining:** still zero auth in `sync-blueprint/index.ts:43-50`, `get-blueprint-variants/index.ts:26-33`, `get-catalog-blueprints/index.ts:49-58`, `sync-cheapest-providers/index.ts:191-203` (the two sync jobs also hold the service-role key). `mollie-webhook` has no signature check (mitigated by re-fetching from Mollie). Deploy still `--no-verify-jwt` (`package.json:22`); `supabase/config.toml:385-403` `verify_jwt = false`. **All 21 functions still send `Access-Control-Allow-Origin: *`**; `ALLOWED_ORIGINS` exists in `.env.example:35` but nothing consumes it.

#### H6. Credit grants not idempotent — PARTIAL
- **Fixed:** unique index `credit_purchase_reference_unique` on `credit_transactions(reference_id)` plus claim-first `ON CONFLICT DO NOTHING` in `grant_stripe_purchase_credits` (`20260908000000_fix_security_review.sql:36-38,73-85`).
- **Remaining:** `stripe-webhook/index.ts` still never calls `record_webhook_event_atomic`; non-credit Stripe events are reprocessed on every retry.

#### H7. CAPTCHA decorative — PARTIAL
- **Fixed:** `verifyCaptchaForAction` enforced in `src/app/api/auth/login/route.ts:45-56`, `signup/route.ts:54-65`, `resend-confirmation/route.ts:60-66`.
- **Remaining:** `supabase/config.toml:191-193` `[auth.captcha]` still commented out, so Supabase-native flows (password reset, OTP) are uncovered. Captcha is a silent no-op in non-production without keys.

#### H8. Rate limiter per-instance and thin on auth — PARTIAL
- **Fixed:** `getRateLimitType` (`src/middleware.ts:17-56`) now covers `/api/auth`, password paths, `/api/generate-image`, payments, webhooks and a generic `/api` bucket. Auth email routes have a DB-backed limiter (`src/lib/security/authEmailProtection.ts:7-52`, `consume_auth_email_rate_limit` in `20260910000000_harden_auth_email_flows.sql:3-16`).
- **Remaining:** `store.ts:11` is still a per-process `Map`; `middleware.ts:74` still passes no `userId`.

#### H9. Session JWTs in git — OPEN, REGRESSED
- `git ls-files` returns **`src/playwright/.auth/user.json`** (3.7 KB, contains a `sb-…-auth-token` cookie with an access token). `.gitignore:18` is `/playwright/.auth/` — root-anchored, so it does not match the new location. Still present in history (`5e9d46c7`, `f5006775`, `9f19a05c`, …).

**Action:** `git rm --cached src/playwright/.auth/user.json`, change the ignore rule to `**/playwright/.auth/`, rotate the test account.

### Reliability / observability

#### H10. No timeouts / retries / limits on the AI image path — OPEN
- `src/app/api/generate-image/route.ts`: no `maxDuration` (`:6` only `runtime`), no `AbortController`, size checked only for zero (`:67,83`), MIME sniffed but not allowlisted (unknown defaults to `image/jpeg`, `:108`), `err.message` still echoed in non-production (`:164`). No retry logic in `geminiImageService.ts` or `openaiImageService.ts`. Improved: errors mapped to user-friendly messages and routed through `captureError` (`:138-158`).

#### H11. No route-level `error.tsx` / `loading.tsx` — OPEN
- Still only `src/app/global-error.tsx` and `not-found.tsx`.

#### H12. Edge functions uninstrumented — OPEN
- No `Sentry` reference in `supabase/functions`. `stripe-webhook` 37 `console.*`, `paypal-webhook` 33. `_shared/testModeSafeguard.ts:70` TODO unchanged. **A failed webhook is still a silently lost order.**

#### H13. Duplicate Sentry configs; wrong one live — PARTIAL
- **Fixed:** server/edge wired via `src/instrumentation.ts:5,9` at 10 % traces; `sentry.client.config.ts:20-29` now has replay with masking.
- **Remaining:** `sentry.client.config.ts` is still dead — Next 16 loads `src/instrumentation-client.ts`, which has `tracesSampleRate: 1` (`:11`), no replay, no masking. No `environment`, `release` or `beforeSend` in any of the five files; DSN hardcoded in all four init sites.

#### H14. Transactional email — PARTIAL
- **Fixed:** signup / resend confirmation emails via `src/lib/email/brevo.ts` + `confirmationEmailTemplate.ts`; missing key logs `console.error` (`brevo.ts:31-34`).
- **Remaining:** edge-side `_shared/brevoEmail.ts:38-41` still returns silently when `BREVO_API_KEY` is unset. No order confirmation or shipping/tracking email. `supabase/config.toml:213-216` SMTP still commented out.

#### H15. Test coverage on the money paths — PARTIAL
- **Added since audit:** `cartService.test.ts`, `cartServiceMapper.test.ts`, `cartQueries.test.tsx`, `checkoutDataBuilder.test.ts`, `src/tests/payment-security.test.ts` (proof verification + refund authorization), `src/tests/security-review.test.ts`, `paypal-server.test.ts`, 5 edge-function shims, `tests/security_database_test.py`.
- **Remaining:** no tests for `stripeService`, `paypalService`, `mollieService`, `paymentRecoveryService`, `promocodeService`, `invoiceService`, `authService`; nothing under `src/features/cart` or `src/features/buy-credits`; the webhook handlers themselves are untested. `payment-security.test.ts` exercises re-implemented local helpers rather than the shipped modules.

---

## MEDIUM

#### M1. Promo codes world-readable, never expire — OPEN
- `20260402000000_add_promocodes_support.sql:3-9,20-23` unchanged (`FOR SELECT USING (true)`, no `expires_at` / `max_uses`). `validate-promocode/route.ts:38-42` checks none; discount clamp at `:72` remains the only guard.

#### M2. Token / PII in edge logs — PARTIAL
- **Fixed:** `_shared/validators.ts:190-204` logs only status and user id; `create-mollie-payment` has no `console.log`.
- **Remaining:** `sync-cheapest-providers/index.ts:203` still logs the first 20 chars of the Printify token.

#### M3. CSP `'unsafe-inline'` and defined twice — PARTIAL
- **Fixed:** `src/lib/security/headers.ts` deleted; `next.config.ts:15-33` is the single source.
- **Remaining:** `script-src` still `'unsafe-inline'` (`next.config.ts:18`), documented as intentional because nonces conflict with ISR/static rendering.

#### M4. `/api/revalidate` env-var name mismatch — FIXED (with a note)
- `REVALIDATION_SECRET` is now consistent across `route.ts:22,29`, `.env.example:32` and scripts; errors no longer echoed (`:51-54`). **Note:** nothing under `supabase/` calls the endpoint any more, so cron catalog syncs never bust the Next cache. Secret still travels in the query string (`:20`).

#### M5. Weak auth defaults in `supabase/config.toml` — OPEN
- `:169` `minimum_password_length = 6`, `:203` `enable_confirmations = false`, `:191-193` captcha commented out, `:148` localhost `site_url`. Mitigation: the app now bypasses Supabase's own signup via `src/app/api/auth/signup/route.ts` and blocks unconfirmed logins (`login/route.ts:83-87,111-116`), but this file still governs any `db reset` / self-hosted deploy.

#### M6. Catalog `FOR ALL USING (true)` policies — FIXED (as written)
- `20260713000000_final_catalog_cleanup.sql:293-310` and `20260813000001_add_product_seo_table.sql:47-52` scope `FOR ALL` `TO service_role`; public is read-only.

#### M7. Dependency hygiene — PARTIAL
- **Fixed:** `@imgly/background-removal-node` removed.
- **Remaining:** both `@google/genai` and `@google/generative-ai` declared (`package.json:26-27`), only the deprecated one imported; `supabase` CLI still in `dependencies` (`:57`); `@ai-hero/sandcastle` plus 13 committed files under `.sandcastle/` / `.superdesign/`; `overrides.sharp` still present; `npm audit --omit=dev` 11 vulns (critical `tar`, `sharp`; high `next`, `ws`, `nanoid`, `postcss`, `fast-uri`, `browserslist`).

#### M8. Nothing consumes the health endpoint or watches cron — PARTIAL
- `/api/health` is solid. Still no uptime monitor, no Sentry cron check-ins, no `vercel.json` crons.

#### M9. Backlog and iDEAL inconsistency — PARTIAL
- **Fixed:** iDEAL is live in checkout (`CheckoutIdealButton.tsx:17,36,42` → Mollie `checkoutUrl`); no "Soon" strings remain.
- **Remaining (inverted):** `HomePaymentMethods.tsx:17-18` filters iDEAL *out* ("not live yet") while `PaymentMethodsBanner.tsx:65` shows it. `MISSING_STEPS.md` still lists homepage design and legal pages as open.

#### M10. No server-side purchase analytics — OPEN
- No Measurement Protocol / `mp/collect` usage in `supabase/functions` or `src/app/api`. Redirect-based (PayPal/Mollie) purchases remain under-reported.

#### M11. SEO / images — OPEN
- `src/app/sitemap.ts:8-15` static routes only. `next.config.ts:99-132` still allows `picsum.photos`, the DALL·E CDN, `*.supabase.co`, `placehold.co`, `images.unsplash.com`.

#### M12. Single locale — OPEN
- Only `en.json`; `src/i18n/request.ts:13-21` hardcodes `en`. Fine for launch.

---

## What is already solid (preserve this)

Everything listed in the original audit still holds, plus the following landed since:

- **`_shared/authGuard.ts`** — rejects the anon key, constant-time secret compare, cron/service-role guard.
- **`_shared/serverPriceService.ts`** — catalog-sourced pricing for Stripe, PayPal and Mollie intents.
- **`_shared/verifyPaidPayment.ts` / `paymentProof.ts`** — provider-side proof before refunds and recovery.
- **Real PayPal webhook signature verification**, failing closed.
- **`enforce_orders_protected_columns` trigger** and `deduct_coin` ownership check (`20260707000000`, `20260908000000`).
- **Idempotent credit grants** via unique `reference_id`.
- **Server-side route guards** in middleware for all six authenticated prefixes.
- **Email confirmation flow** with DB-backed per-IP and per-email rate limits and CAPTCHA on login/signup/resend.
- **SSRF allowlists** on both image-fetch paths.
- **Single CSP source** in `next.config.ts`.
- **`.env.example`** committed; `SECURITY_AUDIT.md` documents the hardening work.

Unchanged from the original list: Stripe signature verification fails closed; Mollie webhook re-fetches from Mollie; `.env` never tracked; ownership checks in `cancel-order` / `generate-invoice` / `sync-printify-orders`; atomic RPCs for capture/refund/cancel; idempotency keys on orders; private invoices bucket; Vault-backed cron secrets; RLS on all tables; `src/lib/observability/*`; security headers; EU-region Sentry with tunnel; substantial legal copy; `/api/health`; Playwright config; migration discipline.

---

## Suggested order of work (updated)

1. **Immediate hygiene (an hour):** untrack `src/playwright/.auth/user.json`, fix the ignore rule to `**/playwright/.auth/`, rotate the test account (H9). Confirm the Printify token was rotated (C8). Remove the token-preview log in `sync-cheapest-providers` (M2).
2. **Finish order integrity (the remaining payment blocker):** move order creation into the webhooks (or a service-role edge function that verifies the payment first) and drop the client `insert` with `paymentStatus: "paid"`; add a `BEFORE INSERT` guard on `orders` so non-service-role inserts cannot set `payment_status`/`total_amount`; add `WITH CHECK` to `payment_transactions`; remove the webhook polling (C1, C7, H3).
3. **Close the pricing gaps:** reject intents whose items lack catalog ids instead of skipping validation; compute shipping and discount server-side; price the Next PayPal route and `create-printify-order` from the catalog (C6). Re-enable server-side coin deduction in `generate-image` (C10).
4. **Auth-guard the last four edge functions** and the two service-role Next routes; add `webhook_events` idempotency to the Stripe path; replace `Access-Control-Allow-Origin: *` with an `ALLOWED_ORIGINS` helper; drop `--no-verify-jwt` from the default deploy script (H4, H5, H6).
5. **CI:** GitHub Actions running `eslint`, `tsc --noEmit`, unit `vitest`, `next build` on every PR. Run `npm ci` to fix `openai`, split integration tests behind a `test:integration` script, fix the 15 failing tests so the pipeline starts green (C11, C13, C14).
6. **Legal:** cookie consent banner with Consent Mode v2 (the cookie policy already claims consent gating); real entity data reconciled between `legalEntity.ts` and `business.ts`; account deletion + export; invoice tax handling (C15–C18).
7. **Observability:** delete or wire `sentry.client.config.ts`, fix `instrumentation-client.ts` sample rate and masking, add `environment` / `release`; Sentry Deno SDK in edge functions, starting with the webhooks; cron monitors and an uptime check on `/api/health` (H12, H13, M8).
8. **Reliability:** `error.tsx` / `loading.tsx` per route group; `maxDuration`, timeouts, size cap and MIME allowlist on `generate-image`; order-confirmation and shipping emails; production SMTP (H10, H11, H14).
9. **Staging environment** and a deploy pipeline for migrations and edge functions; harden `supabase/config.toml` defaults (C12, M5).
10. **Cleanup:** duplicate Google SDK, `supabase` to devDependencies, `.sandcastle` / `.superdesign`, placeholder image hosts, promo-code expiry and RLS, `npm audit`, iDEAL homepage parity (M1, M7, M9, M11).

---

## Appendix A: the `fixing_security` branch (historical)

The original audit noted that commit `9f19a05c` ("Security hardening: fix critical auth, payment, SSRF and RLS issues") on `fixing_security` had never been merged. It has since landed on `dev` via PR #17 (`74db685`), followed by `79fa1d9` ("add server-side price validation and remove PII logging") and the `20260908000000_fix_security_review.sql` migration. The FIXED and PARTIAL statuses above reflect that work. This appendix is kept only so earlier references to it resolve.

## Appendix B: failing tests on `dev` (2026-09-15)

```
FAIL src/features/auth/components/__tests__/AuthDialog.test.tsx               (4 tests)
FAIL src/features/catalog/ui/__tests__/CatalogPageContent.test.tsx           (2 tests)
FAIL src/services/__tests__/customProductService.printAreas.test.ts          (5 tests)  ← new since 09-08
FAIL src/services/analyticsService.test.ts > should not call gtag in development
FAIL src/services/coinsService.test.ts                                       (3 tests)
FAIL src/tests/integration/coins.integration.test.ts                         [suite failed to load]
FAIL src/tests/integration/database-direct.integration.test.ts               [suite failed to load]
FAIL src/tests/integration/order-creation.integration.test.ts                [suite failed to load]
FAIL src/tests/integration/schema-verification.integration.test.ts           [suite failed to load]

Test Files  9 failed | 76 passed (85)
```
