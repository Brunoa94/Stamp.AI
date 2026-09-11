# Production Readiness Audit

**Date:** 2026-09-08
**Branch audited:** `dev` at `2185b9a`
**Scope:** Security & auth, payments, operations & CI/CD, testing, observability, reliability, legal/compliance, dependencies, SEO.

This document consolidates a full read-through of the codebase, the Supabase migrations and edge functions, and the results of running `vitest`, `tsc`, `eslint`, and `npm audit` on a clean checkout. Every finding cites the file and line where it was observed. Items are grouped by severity, and a suggested order of work is at the end.

---

## Executive summary

The product is feature-complete for an MVP but **is not yet safe to take real payments**. The blockers fall into three groups:

1. **Payment integrity.** Order totals, payment status, and credit amounts are all trusted from the browser. Several edge functions that move money have no authentication. The PayPal webhook signature check is a stub whose result is ignored.
2. **Delivery pipeline.** There is no CI, no deploy pipeline, no staging environment, and the build is currently broken (`openai` package missing). Migrations and edge functions are pushed by hand to a single hardcoded production project.
3. **EU legal compliance.** Google Analytics fires without cookie consent, the legal pages render bracketed placeholders for the company's registered address / KvK / VAT, and the FAQ promises an account-deletion feature that does not exist.

**Key fact:** a security-hardening commit that fixes the majority of the security findings already exists — `9f19a05c` ("Security hardening: fix critical auth, payment, SSRF and RLS issues") on branch `fixing_security`. It was never merged. `dev` is now 304 commits past its base, so it must be re-applied rather than merged, but the design work is done. See [Appendix A](#appendix-a-the-unmerged-fixing_security-branch).

### Current state of the toolchain (clean checkout, 2026-09-08)

| Check | Result |
|---|---|
| `npx vitest run` | 8 files failed, 61 passed · 10 tests failed, 909 passed |
| `npx tsc --noEmit --incremental false` | 1 error: `Cannot find module 'openai'` |
| `npx eslint .` | 873 errors, 541 warnings |
| `npm audit --omit=dev` | 12 vulnerabilities: 1 critical, 8 high, 2 moderate, 1 low |
| `.github/workflows/` | 1 workflow (Claude bot only); no lint/test/build/deploy |

---

## CRITICAL — fix before any real customer pays

### Payment integrity

#### C1. Client declares its own orders "paid"; RLS lets it stick
- `src/services/orderService.ts:400` — `createOrderFromCart({ paymentStatus = "paid", ... })`. Totals are computed client-side at `:429` via `OrderServiceMapper.calculateOrderTotals` and inserted with the **browser** Supabase client (`:224-225`).
- `supabase/migrations/20260115000000_create_core_tables.sql:426` — `orders` INSERT policy is `WITH CHECK (auth.uid() = user_id)` with no column guard.
- `supabase/migrations/20260701000000_add_orders_update_policy.sql:12-16` — users may UPDATE **any column** of their own orders, including `payment_status`, `total_amount`, `status`.

**Impact:** an authenticated user can create or flip an order to `paid` + `confirmed` with `total_amount: 0` and never pay. Fulfillment triggers off order state.

#### C2. `process-refund` has no authentication and no ownership check
- `supabase/functions/process-refund/index.ts:140-158` — handler goes from `req.json()` straight to issuing a real Stripe/PayPal/Mollie refund. No `verifyAuth`, no `order.user_id` check.
- Deployed with `--no-verify-jwt` (`package.json` → `supabase:deploy`).

**Impact:** anyone with an `order_id` + payment reference can trigger refunds.

#### C3. `process-payment-recovery` has no auth and mints paid orders from a client snapshot
- `supabase/functions/process-payment-recovery/index.ts:23-110` — no auth. `user_id`, `cart_snapshot`, totals, and `payment_status: "paid"` (`:110`) all come from the request body and are written with the service-role key.

#### C4. PayPal webhook signature verification is a stub, and its result is ignored
- `supabase/functions/_shared/paypal.ts:212-231` — returns `true` if three headers merely exist. Contains `// TODO: Implement full signature verification`.
- `supabase/functions/paypal-webhook/index.ts:83-88` — `if (!isValid) { console.warn(...) }` then **continues processing**.

**Impact:** any unauthenticated caller can forge `PAYMENT.CAPTURE.COMPLETED` and mark orders paid.

#### C5. Free credits: `create-credit-payment` trusts `amount` and `credits` independently
- `supabase/functions/create-credit-payment/index.ts:105-135` — client sends both. `validateCredits` only enforces `credits >= 10` (`:81-87`); `amount` only has to be `> 0` (`_shared/validators.ts:118-126`).
- `supabase/functions/stripe-webhook/index.ts:111` — webhook grants credits verbatim from PaymentIntent metadata.

**Impact:** pay €0.01, receive 1,000,000 credits.

#### C6. Every payment-intent amount is client-controlled
- Stripe: `supabase/functions/create-payment-intent/index.ts:86-107` — `amount` from `req.json()`, only `> 0` validated, never recomputed from cart/catalog.
- PayPal: `src/app/api/paypal/create-order/route.ts:31-36` — same.
- Mollie: `supabase/functions/create-mollie-payment/index.ts:62+` — same.
- The "server-side amount validation" in `supabase/functions/create-printify-order/index.ts:113-127` calls `validatePaymentAmount({ paymentAmount, subtotal, shippingCost, discount })` where **all four values come from the same request body** (`_shared/amountValidator.ts:37-58`). It returns `isValid: true` when data is absent (`:70-78`).

#### C7. Order creation is browser-driven; webhooks poll for it
- `supabase/functions/stripe-webhook/index.ts:13-83` and `paypal-webhook/index.ts:13-67` poll for up to 30 s (`maxAttempts=6, delayMs=5000`) waiting for the **browser** to create the order, blocking the webhook response (`stripe-webhook/index.ts:362-365`).

**Impact:** if the tab closes after payment, money is captured with no order. Root cause is C1: order creation should be server/webhook-driven.

### Other security

#### C8. Printify API token shipped under a `NEXT_PUBLIC_` name
- `src/services/apiClient.ts:7` — `Authorization: Bearer ${process.env.NEXT_PUBLIC_PRINTIFY_API_TOKEN}`.
- `.env` contains a real token under that name. `apiClient.ts` currently has **no importers** so it is not bundled today, but the variable and the file are one import away from leaking full Printify account access (orders, customer PII, cancellations).

**Action:** rotate the token, delete `apiClient.ts`, remove the `NEXT_PUBLIC_PRINTIFY_*` vars.

#### C9. Unauthenticated SSRF in `/api/fetch-remote-image`
- `src/app/api/fetch-remote-image/route.ts:3-34` — arbitrary `?url=` is fetched and proxied back verbatim. No scheme/host allowlist, no auth. Reaches cloud metadata endpoints and internal services.
- Same class: `supabase/functions/upload-printify-image/index.ts:19-47` — no auth, arbitrary `image_url` handed to Printify with the API token.

#### C10. `deduct_coin` is `SECURITY DEFINER` with a caller-supplied `user_id`
- `supabase/migrations/20260314000000_add_coins_and_deduct_coin_rpc.sql:20-24` — no `auth.uid()` check. Any authenticated user can drain any other user's coin balance.
- Related: the server-side deduction in `src/app/api/generate-image/route.ts:22-40` is **commented out**. The only deduction happens in the browser (`src/features/stamp/lib/hooks/useStampImageGeneration.ts:115`), so calling the route directly gives **unmetered AI generation**.

### Delivery pipeline

#### C11. There is no CI
- `.github/workflows/claude.yml` is the only workflow. It triggers on issue comments / PR reviews to run the Claude bot. Nothing runs lint, typecheck, `vitest`, Playwright, or `next build` on push or PR. Nothing gates merges.
- The bot prompt at `claude.yml:63` references "CI failures" that cannot occur.

#### C12. No deploy pipeline, no environment separation
- No `vercel.json`, no deploy workflow, no staging config. `supabase/config.toml` is local-dev only.
- `package.json` → `supabase:setup` is `supabase link --project-ref timbqoxngnhoetbofdiq && supabase db push` — a **hardcoded production project ref** deployed from a laptop.
- `supabase:deploy` is `functions deploy --no-verify-jwt` — deploys all 22 functions with JWT verification disabled.

#### C13. The build is broken
- `src/services/openaiImageService.ts:1` imports `openai`. It is declared in `package.json:50` (`^7.5.0`) but **not present in `node_modules`**. `tsc` fails; `/api/generate-image` cannot compile. A clean `npm ci && next build` has not been run since `package.json` last changed.
- 873 ESLint errors on a clean checkout. The rules in `eslint.config.mjs` (no barrel exports, no raw HTML outside `src/features/ui`, no `any`) are unenforced.

#### C14. `npm test` cannot pass outside a developer machine
- `vitest.config.ts:9` includes `src/**/*.{test,spec}.{ts,tsx}`, which pulls in `src/tests/integration/*` — four suites that hit a **live Supabase project** via `src/tests/integration/setup-auth.ts`. They fail to load without credentials. There is no `test:unit` / `test:integration` split.
- Currently failing: `AuthDialog.test.tsx` (4), `CatalogPageContent.test.tsx` (2), `analyticsService.test.ts` (1), `coinsService.test.ts` (3), plus the four integration suites failing to load.

### Legal / compliance (EU shop)

#### C15. No cookie consent; GA fires unconditionally
- `src/features/analytics/GoogleAnalytics.tsx:24-32` injects gtag.js and calls `gtag('config', …)` whenever `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set. No Consent Mode v2, no banner, no opt-in gate. A repo-wide search for `consent` / `analytics_storage` / `ad_storage` finds only a type union.
- `/cookies` and `/privacy` promise opt-out (`src/i18n/messages/en.json:2227`).

**Impact:** ePrivacy / GDPR violation for a Dutch/EU shop.

#### C16. Legal entity data ships as visible placeholders
- `src/features/legal/lib/constants/legalEntity.ts:17-20`:
  ```
  address: "[registered address — pending legal review]",
  registration: "[KvK number — pending legal review]",
  vat: "[VAT number — pending legal review]",
  ```
  These render literally on `/terms`, `/privacy`, `/cookies`, `/security`.
- `src/features/seo/config/business.ts:6,18` declares `legalName: "Stamp AI Design Inc."` / `addressCountry: "US"` in the Organization JSON-LD, while the legal pages assume a Dutch B.V. The two public statements contradict each other. (Already noted in `docs/DESIGN_TRUSTWORTHINESS_PLAN.md:26`.)

#### C17. No GDPR account deletion or data export
- FAQ (`src/i18n/messages/en.json:2711-2713`): *"How do I delete my account? From your profile."*
- `src/features/profile/ui/sections/` contains only `AddressSection`, `PasswordResetSection`, `UserInformationSection`. No delete-account UI, RPC, or edge function. No data export.

#### C18. Invoices are legally wrong out of the box
- Per `docs/invoicing.md` "Known caveats": `OrderServiceMapper.calculateOrderTotals` hardcodes tax and shipping to `0`, so every invoice prints `Tax: 0.00`. `order_items.unit_price` / `total_price` have an unreconciled dollars-vs-cents mismatch. The doc also states the invoicing migration/functions/secrets are "not yet applied".

---

## HIGH

### Security

#### H1. No server-side route protection for authenticated pages
- `src/middleware.ts:135-142` guards **only** `/stamp`. `/dashboard`, `/profile`, `/orders`, `/checkout`, `/cart` are thin server shells delegating to client components wrapped in `src/features/auth/ProtectedRoute.tsx:26-30` — a `useEffect` + `router.push`. That is a UX redirect, not a control. Data safety rests entirely on RLS, which has the gaps above.

#### H2. Open redirect and cookie-attribute loss in the auth callback
- `src/app/auth/callback/route.ts:7,51` — `next` is unvalidated; `//evil.com` resolves to an external host.
- `:55-57` copies cookies with `redirectResponse.cookies.set(name, value)` — **dropping `options`**, so `HttpOnly`, `Secure`, `SameSite`, `Max-Age` are lost on the freshly minted session cookies.

#### H3. `payment_transactions` UPDATE policy has no `WITH CHECK`
- `supabase/migrations/20260715000000_add_payment_transactions_update_policy.sql:10-11` — `FOR UPDATE USING (auth.uid() = user_id)` only. A user can rewrite `amount`, `status → succeeded`, `order_id`, and reassign `user_id`.

#### H4. Service-role key on unauthenticated, user-reachable Next.js routes
- `src/app/api/sync-blueprint/route.ts:25,40` — no auth; forwards the **service-role key** to an edge function for any anonymous POST.
- `src/app/api/get-blueprint-variants/route.ts:16,25` — service-role client, no auth (read-only but bypasses RLS).
- `src/app/api/fetch-custom-product/route.ts:5-36` — no auth, exposes arbitrary Printify products; `catch(e){ throw e }` rethrows into the framework handler.

#### H5. Edge functions deployed with `--no-verify-jwt` and lacking in-function auth
- `supabase/config.toml:386,397,403` set `verify_jwt = false`; `package.json` deploy script disables it globally.
- Functions with **zero** auth check in-handler: `process-refund`, `process-payment-recovery`, `upload-printify-image`, `create-custom-product` (takes `user_id` from body, `index.ts:53`), `sync-blueprint`, `sync-cheapest-providers`, `get-blueprint-variants`, `get-catalog-blueprints`. All also set `Access-Control-Allow-Origin: *`.

#### H6. Credit grants are not idempotent
- `supabase/functions/stripe-webhook/index.ts:109-219` — `handleCreditPurchase` does read-modify-write on `user_credits` with no check against `reference_id` / prior `credit_transactions`. Stripe retries `payment_intent.succeeded` on non-2xx or timeout; each redelivery re-adds credits. The Stripe path also has no `webhook_events` idempotency guard (PayPal and Mollie do: `paypal-webhook/index.ts:96-121`, `mollie-webhook/index.ts:60-71`).

#### H7. CAPTCHA is decorative
- `src/lib/security/captcha/verify.ts` (`verifyCaptcha`, `verifyCaptchaForAction`) is never imported outside its own test. The client obtains a token (`src/features/auth/login/useLoginForm.ts:24`) and passes it to `signInWithPassword` (`src/services/authService.ts:36`), but `[auth.captcha]` is commented out in `supabase/config.toml`, so Supabase does not check it either.

#### H8. Rate limiter is per-instance memory and mostly misses auth
- `src/lib/security/rate-limiter/store.ts:11` — a module-level `Map`; the file's own comment (`:6-9`) concedes it is per-replica on serverless.
- `src/middleware.ts:71` calls `checkCombinedRateLimit` with no `userId`, so only the IP bucket applies. The path mapping (`:19-58`) only covers `/auth*`, not the direct Supabase GoTrue calls the browser actually makes for login.

#### H9. Session JWTs in git history
- `playwright/.auth/user.json` was committed across 10+ commits (e.g. `git show f500677:playwright/.auth/user.json`) before being gitignored in `89ebd55`. Rotate the test account; consider a history rewrite.

### Reliability / observability

#### H10. No timeouts, retries, or `maxDuration` on the AI image path
- `src/app/api/generate-image/route.ts:6` sets `runtime = "nodejs"` but no `export const maxDuration`. On Vercel this caps at the plan default, far below generation + `sharp` + background removal.
- No `AbortSignal` / `AbortController` anywhere in `src/app/api` or `src/services`. No retry/backoff in `geminiImageService.ts` or `openaiImageService.ts`. The only retry logic in the app is `src/services/refundService.ts:26-45`.
- No file-size or MIME allowlist server-side: `image.size` is only checked for `0` (`route.ts:67`). The 10 MB / type limit in `src/features/stamp/lib/hooks/useStampImageUpload.ts:20-21` is **client-only**. Whole buffers are passed to `sharp` (`geminiImageService.ts:38-58`). `route.ts:141-146` echoes `error.message` to the client in non-production.

#### H11. No route-level `error.tsx` or `loading.tsx`
- Only `src/app/global-error.tsx` and `src/app/not-found.tsx` exist. Every server-component throw in `/checkout`, `/cart`, `/orders`, `/stamp`, `/catalog` escalates to the full-page global boundary. No streaming loading states. `src/components/ErrorBoundary/ErrorBoundary.tsx` exists but is not used at feature level.

#### H12. Supabase edge functions are completely uninstrumented
- `grep -rln "Sentry" supabase/functions` → no matches. All 22 functions — including `stripe-webhook` (46 `console.*` calls), `paypal-webhook` (33), `process-refund`, `create-printify-order` — log only to `console`. No structured logging, error aggregation, or alerting. **A failed webhook is a silently lost order.**
- `supabase/functions/_shared/testModeSafeguard.ts:70` — `// TODO: Send alert to monitoring system`.

#### H13. Duplicate, conflicting Sentry client configs; the wrong one is live
- `sentry.client.config.ts` (tracesSampleRate `0.1`, session replay, `maskAllText`) is **imported by nothing**.
- Next 16 loads `src/instrumentation-client.ts`, which sets `tracesSampleRate: 1` (100% of traces) with **no replay and no PII masking**.
- Across all four Sentry files: no `environment`, no `release`, no `beforeSend`, no enable/disable gate. Localhost errors pollute production issues. DSN is hardcoded in every file rather than env-driven. `dataCollection.userInfo` / `httpBodies` are left at defaults, so customer PII and request bodies flow to Sentry, in tension with the privacy policy.

#### H14. Transactional email covers invoices only, and fails silently
- `supabase/functions/_shared/brevoEmail.ts:36-40` — if `BREVO_API_KEY` is unset it `console.log`s and returns success.
- No order confirmation, shipping/tracking, or payment-failure emails.
- `supabase/config.toml:213-219` — production SMTP block is commented out, so Supabase's rate-limited default sender is used for auth mail.

#### H15. Zero test coverage on the money paths
- `src/features/checkout/**`, `src/features/cart/**`, `src/features/buy-credits/**` — **0 test files**.
- No tests for `stripeService`, `paypalService`, `mollieService`, `cartService`, `paymentRecoveryService`, `promocodeService`, `invoiceService`, `authService`.
- Of 22 edge functions only 4 have shims in `src/tests/edge-functions/`. `stripe-webhook`, `paypal-webhook`, `mollie-webhook`, `capture-paypal-order`, `process-refund`, `create-printify-order` are entirely untested.
- `orderService.test.ts`, `refundService.test.ts`, `printifyService.test.ts` largely *document* gaps rather than assert behaviour (e.g. `orderService.test.ts:148` "EXPECTED SOLUTION: Implement retry logic with exponential backoff").

---

## MEDIUM

#### M1. Promo codes table is world-readable and codes never expire
- `supabase/migrations/20260402000000_add_promocodes_support.sql:20-23` — `FOR SELECT USING (true)`. Anyone can harvest every code and discount.
- No `expires_at`, `max_uses`, or `used_count` columns; `src/app/api/validate-promocode/route.ts:38-42` checks none. (Positive: discount is clamped at `:72`.)

#### M2. Token and PII in edge-function logs
- `supabase/functions/_shared/validators.ts:194-202` logs failed-auth response bodies and a token preview; `create-mollie-payment/index.ts:44-58` logs JWT prefixes/suffixes; `sync-cheapest-providers/index.ts:203` logs the first 20 chars of the Printify token.

#### M3. CSP allows `'unsafe-inline'` scripts and is defined twice
- `next.config.ts:13` and `src/lib/security/headers.ts:66-70`. Documented as intentional but it removes most of the CSP's XSS value.
- The two definitions have already drifted (`next.config.ts:15` includes `api.dicebear.com`; `headers.ts:21-30` does not). Middleware runs last and wins.

#### M4. `/api/revalidate` reads an env var that does not exist
- Route checks `REVALIDATION_SECRET` (`src/app/api/revalidate/route.ts:22,29`); `.env` defines `REVALIDATE_SECRET`. Fails closed with a 500, but cache revalidation from edge functions is silently broken. `:50-55` echoes raw error messages.

#### M5. Weak auth defaults in `supabase/config.toml`
- `minimum_password_length = 6`, `enable_confirmations = false`, `[auth.captcha]` disabled, `site_url = "http://127.0.0.1:3000"`. If pushed to the linked project these become production settings.

#### M6. Catalog tables with permissive `FOR ALL USING (true)` policies
- `20260713000000_final_catalog_cleanup.sql:295-310`, `20260813000001_add_product_seo_table.sql:49-52`. Verify the `TO` role. If not restricted to `service_role`, anonymous clients can rewrite catalog pricing, which feeds the (client-trusted) checkout totals.

#### M7. Dependency hygiene
- Both `@google/genai@^2.18.0` and `@google/generative-ai@^0.24.1` are dependencies; only the **deprecated** `@google/generative-ai` is imported (`geminiImageService.ts:1`).
- `supabase` CLI (`^2.92.1`) is a runtime dependency, shipping a ~40 MB binary into production installs.
- `@ai-hero/sandcastle` plus committed `.sandcastle/` and `.superdesign/` scratch directories.
- `overrides: { "sharp": "^0.35.3" }` is a blunt force-resolution combined with `serverExternalPackages` and a dynamic `import("sharp")`; a native-binary mismatch surfaces only at runtime.
- `@imgly/background-removal-node` drags in vulnerable `zod<=3.22.2` and `lodash`.
- `npm audit --omit=dev`: critical `tar`; high `next` (request smuggling in rewrites, unbounded `next/image` disk cache), `ws`, `nanoid`, `postcss`, `fast-uri`, `browserslist`.
- Stale `tsconfig.tsbuildinfo` (Aug 21) produces phantom typecheck errors locally.

#### M8. Nothing consumes the health endpoint or watches the cron jobs
- `src/app/api/health/route.ts` is a well-designed probe (DB latency, memory, 503 semantics) but no uptime monitor is configured. No Sentry/Vercel cron monitors for the 7 `pg_cron` jobs. A silently failing `sync-printify-orders` or `process-payment-recovery` would go unnoticed.

#### M9. Team backlog and inconsistencies
- `MISSING_STEPS.md` still lists "Improve the homepage design" and "Additional pages, for legal and stuff" as open.
- iDEAL is marked done, but `docs/DESIGN_TRUSTWORTHINESS_PLAN.md:41` documents that checkout still shows it disabled/"Soon" (`CheckoutPaymentMethods.tsx:120-142`) while `HomePaymentMethods.tsx:31` advertises it.

#### M10. Analytics plan vs reality
- `docs/ANALYTICS_TRACKING_PLAN.md` is largely implemented (`analyticsService.ts`, `useAnalytics.ts`, mappers, page-view tracker, button `trackingId`). One of its tests currently fails. There is no server-side / Measurement Protocol `purchase` event, so purchases confirmed by webhook rather than in-browser will be under-reported.

#### M11. SEO / images
- `src/app/sitemap.ts` emits static routes only; no product/catalog detail pages.
- `next.config.ts:78-108` `images.remotePatterns` and the CSP `img-src` still allow `picsum.photos`, `placehold.co`, `images.unsplash.com`, the unused DALL·E CDN, and a wildcard `*.supabase.co`. No `formats` / `deviceSizes` / `minimumCacheTTL` tuning.

#### M12. i18n
- Single locale (`en`) with 1,940 message keys and no hardcoded UI strings found. Locale routing is deliberately absent (`src/i18n/request.ts`). Fine for launch, but a Dutch storefront will want `nl` before marketing spend.

---

## What is already solid (preserve this)

- **Stripe webhook signature verification is correct and fails closed** — `stripe-webhook/index.ts:247-256` uses `constructEventAsync` with `SubtleCryptoProvider`; a missing signature throws.
- **Mollie webhook uses the right pattern** — ignores the payload and re-fetches from Mollie (`mollie-webhook/index.ts:74`).
- **`.env` is not tracked and never was**; `.gitignore` covers `.env*`.
- **Ownership checks where present are correct** — `cancel-order/index.ts:103`, `generate-invoice/index.ts:62`, `sync-printify-orders/index.ts:187`.
- **Atomic RPCs** for payment capture, refund, cancellation, and PayPal webhook idempotency (`atomic_paypal_payment_capture`, `process_refund_atomic`, `upsert_stripe_payment_transaction`, `record_webhook_event_atomic`).
- **Error responses never leak internals** in the PayPal capture route (`capture-order/route.ts:100-110`) or edge functions (`_shared/errors.ts:29-39`).
- **Idempotency keys on orders** with fail-closed semantics (`orderService.ts:206-213`).
- **Invoice storage bucket is private** with an owner-scoped policy (`20260709000000_add_invoices.sql:108-115`).
- **Cron jobs use Supabase Vault** for the service-role key (`20260818100000_fix_all_cron_jobs_use_vault.sql`).
- **RLS is enabled on all ~33 surviving tables.**
- **`src/lib/observability/`** is well-built and tested: structured JSON logger, provider-agnostic `errorCapture`, request-ID correlation through middleware, `webVitals`.
- **Security headers** in `next.config.ts` are comprehensive: CSP, HSTS with preload, `nosniff`, `Permissions-Policy`, `frame-ancestors`, `object-src 'none'`; `X-XSS-Protection: 0` is the correct modern value.
- **Sentry ingests to the EU region** with `tunnelRoute` and `automaticVercelMonitors` configured.
- **Legal copy is real and substantial** (~38K characters across Terms, Privacy, Security, Shipping, Returns). Only the entity constants are placeholders.
- **`/api/health`** is a correct probe with latency thresholds and 503 semantics.
- **909 passing unit tests** with strong coverage of stamp-editor internals, SEO mappers, catalog mappers, and `src/lib/security/*`.
- **Playwright config is production-grade** (`forbidOnly` in CI, retries, traces, storageState auth, desktop + mobile projects, 12 e2e specs). It just never runs automatically.
- **Migration discipline** — 60+ timestamped migrations with a README.
- **`docs/DESIGN_TRUSTWORTHINESS_PLAN.md` and `docs/invoicing.md`** are unusually honest about their own defects.

---

## Suggested order of work

1. **Re-apply the `fixing_security` work onto `dev`** (see Appendix A). It addresses C1, C4, C5, C8, C9, H1, H2, H5 and more.
2. **Add CI** — a GitHub Actions workflow running `eslint`, `tsc --noEmit`, `vitest run` (unit only), and `next build` on every PR. Split integration tests into a separate script gated on credentials. Fix the `openai` dependency and the 10 failing tests first so the pipeline starts green.
3. **Move order creation and amount computation server-side**, driven by webhooks. Recompute totals from catalog + cart in the payment-intent functions. Add column-guard triggers on `orders`, `WITH CHECK` on `payment_transactions`, and `auth.uid()` checks in `deduct_coin`. Re-enable server-side coin deduction in `generate-image`.
4. **Auth-guard every edge function** that lacks it; drop `--no-verify-jwt` from the default deploy script; add `webhook_events` idempotency to the Stripe path.
5. **Rotate secrets**: Printify token, Playwright test account, anything exposed via `playwright/.auth/user.json`.
6. **Fix observability**: delete the dead `sentry.client.config.ts` or make `instrumentation-client.ts` match it; set `environment`, `release`, sample rates, PII masking; instrument edge functions with Sentry Deno SDK; register cron monitors.
7. **Legal**: cookie consent banner with Consent Mode v2, real entity data in `legalEntity.ts` reconciled with `business.ts`, account deletion + data export, invoice tax handling.
8. **Reliability**: `error.tsx` / `loading.tsx` per route group, `maxDuration` + timeouts + server-side size/MIME validation on `generate-image`, order confirmation and shipping emails, production SMTP.
9. **Staging environment** and a deploy pipeline for Supabase migrations and edge functions.
10. **Hygiene**: remove the duplicate Google SDK, move `supabase` to devDependencies, delete `.sandcastle` / `.superdesign` / `apiClient.ts`, prune placeholder image hosts, resolve `npm audit`.

---

## Appendix A: the unmerged `fixing_security` branch

```
$ git log --oneline -1 origin/fixing_security
9f19a05 Security hardening: fix critical auth, payment, SSRF and RLS issues

$ git merge-base --is-ancestor 9f19a05c HEAD ; echo $?
1   # NOT an ancestor of dev

$ git rev-list --count 9f19a05c..HEAD
304  # commits on dev since the branch point
```

Files touched by that commit include:

- `SECURITY_AUDIT.md` (the original findings)
- `supabase/functions/_shared/authGuard.ts` (shared auth guard for edge functions)
- `supabase/functions/_shared/paypal.ts` (real PayPal signature verification)
- `supabase/migrations/20260707000000_security_hardening_rls.sql` (RLS column guards)
- `src/app/api/fetch-remote-image/route.ts` (SSRF allowlist)
- `src/app/auth/callback/route.ts` (open-redirect fix)
- `src/middleware.ts` (server-side route guards)
- `src/services/apiClient.ts` (removal of `NEXT_PUBLIC_` token)
- `src/tests/e2e/security.e2e.spec.ts`
- Auth guards added to `process-refund`, `process-payment-recovery`, `upload-printify-image`, `create-custom-product`, `create-credit-payment`, `stripe-webhook`, `paypal-webhook`, and others.
- Removal of `playwright/.auth/user.json` from the tree and `.env.example` added.

Because `dev` has diverged by 304 commits (several of the touched functions have since been renamed or removed), the practical approach is to cherry-pick or hand-port each fix rather than merge the branch.

## Appendix B: failing tests on `dev` (2026-09-08)

```
FAIL src/features/auth/components/__tests__/AuthDialog.test.tsx            (4 tests)
FAIL src/features/catalog/ui/__tests__/CatalogPageContent.test.tsx        (2 tests)
FAIL src/services/analyticsService.test.ts > should not call gtag in development
FAIL src/services/coinsService.test.ts                                    (3 tests)
FAIL src/tests/integration/coins.integration.test.ts                      [suite failed to load]
FAIL src/tests/integration/database-direct.integration.test.ts            [suite failed to load]
FAIL src/tests/integration/order-creation.integration.test.ts             [suite failed to load]
FAIL src/tests/integration/schema-verification.integration.test.ts        [suite failed to load]
```
