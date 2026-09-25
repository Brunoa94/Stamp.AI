# Review of the 23 September 2026 security assessment

**Reviewed on:** 25 September 2026, branch `securityChat` at `3ecad13`.
**Verdict on the audit:** the findings are accurate. Every one of the 14 numbered findings was re-verified against the source, and none was a false positive. Several are worse than written. The audit's main weaknesses are in what it missed, in a few claims that cannot be checked, and in remediation advice that is correct but not prioritised by exploit chain.

This document records the verification, the criticism, what was changed in this branch, and what still has to happen before a sign-off.

---

## 1. Verification of each finding

| Finding | Verdict | Notes from re-verification |
|---|---|---|
| SEC-01 public SECURITY DEFINER RPCs | **Confirmed** | 17 definer functions had no REVOKE, no ownership check and no `search_path`. Only 7 were already hardened. Reproduced anonymous capture, payment reassignment and webhook-payload read on Postgres 17. |
| SEC-02 unpaid Printify orders | **Confirmed, worse** | `payment_intent_id` was never read at all. The amount check could never run because the client schema does not even allow `payment_amount`. Any logged-in user could ship arbitrary merchandise. |
| SEC-03 Next.js 16.1.6 / Sharp 0.35.3 | **Confirmed** | `npm audit --omit=dev` reported 2 critical and 6 high, with `next` and `sharp` as the only direct hits. |
| SEC-04 guest cart RLS | **Confirmed, wider** | In addition to the policies, `upsert_cart_item` was a public definer RPC that accepted any cart id and a caller-chosen `unit_price`. |
| SEC-05 owner RLS on financial tables | **Confirmed** | Owner UPDATE on `payment_transactions` had no WITH CHECK and no column guard. `printify_order_id` and `idempotency_key` were editable. |
| SEC-06 client-controlled pricing | **Confirmed, worse** | The client sends `variant_id`, the server looked for `printify_variant_id`, so server pricing was skipped on **every** real checkout. Even when it ran, the client amount was charged. |
| SEC-07 recovery trusts user snapshot | **Confirmed** | Not fixed in this branch. See section 4. |
| SEC-08 cancel authorises refund on manufacturer rejection | **Confirmed** | "does not allow cancellation" was treated as cancelled, and every other failure "continued". |
| SEC-09 alternate payment endpoints | **Confirmed** | Both edge endpoints discarded the `verifyAuth` result. `verify-mollie-payment` could also cancel a victim's order via attacker-created payment metadata. |
| SEC-10 custom products public | **Confirmed** | `products` now holds only custom products (catalog moved to `catalog_products`), so the "active products are public" policy exposed every customer design. |
| SEC-11 other definer RPCs | **Confirmed** | `get_user_coins` could read and reset any profile's balance. |
| SEC-12 webhook dedup | **Confirmed** | Mollie dedup by payment id suppressed the paid transition. Stripe acknowledged DB failures with 200. |
| SEC-13 CAPTCHA bypass via Supabase Auth | **Confirmed, incomplete** | See criticism 2.2: a far simpler bypass existed in our own routes. |
| SEC-14 upload/proxy bounds | **Confirmed** | As described. |

---

## 2. Criticism of the audit

### 2.1 Unverifiable provenance
The report says it reviewed commit `9f1f89a`. That object does not exist in this repository's history (611 commits checked). A security assessment must reference a commit the reader can check out. Treat the line-number evidence as approximate.

### 2.2 The CAPTCHA finding missed the real bypass
SEC-13 argues that Supabase Auth can be called directly with the anon key. True, but our own `/api/auth/login`, `/api/auth/signup` and `/api/auth/resend-confirmation` routes skipped verification whenever the request simply omitted `captchaToken`. No provider bypass needed. The two failing tests in `src/app/api/auth/*/route.test.ts` were already asserting the correct behaviour and had been failing since the "make CAPTCHA optional" commit. An audit that ran the test suite and reported "15 failed" should have looked at what those failures were.

### 2.3 The pricing finding under-reported the blast radius
SEC-06 describes validation being skipped when IDs are omitted. The field-name mismatch means it was skipped for every legitimate checkout too. The audit also missed that the Stripe path sent cents to a function that multiplies by 100 (PayPal had the same bug fixed in `a7440ed3`). That is not a security bug, but it is evidence that no end-to-end checkout with a real Stripe intent has been exercised, which is itself a finding.

### 2.4 Definer-function guidance was incomplete
The audit correctly notes that `current_user` inside a SECURITY DEFINER function is the owner, which is why the orders trigger accepted definer writes. It did not say the corollary: the project's own `is_privileged_writer()` helper is unusable inside definer bodies for the same reason. My first draft of the fix used it and the local harness caught it. This should be an explicit rule in the remediation section.

### 2.5 Severity ordering does not follow exploit chains
SEC-02 (free merchandise for any account) and SEC-06 (pay 50 cents for a 30 euro basket) are direct money loss with no preconditions beyond an account. SEC-01 needs a victim's provider reference. Ordering SEC-01 first is defensible from a "privilege" viewpoint, but a remediation plan should lead with the two findings any customer can exploit today.

### 2.6 The "not fixed alone by frontend" remark is correct but under-argued
The closing line is the most important sentence in the report and should have been the opening. The whole checkout is browser-orchestrated: the browser creates the order as paid, links the payment, and calls fulfilment. Every server-side check added now is a compensating control around a design that should be inverted (server quote, server order, verified capture, server fulfilment).

### 2.7 Things the audit got right that deserve emphasis
- Local Postgres reproduction instead of trusting policy text. This review reused the same approach.
- The explicit statement that `is_test` is not a financial safety barrier.
- The "migration drift" warning. Repository history includes edited historical migrations, so the live ACL inventory must be run before trusting any of this.

---

## 3. What was changed in this branch

Nothing has been applied to Supabase. The migration and edge functions are files only.

### 3.1 Database: `supabase/migrations/20260925000000_security_audit_rpc_and_rls_hardening.sql`
Validated on a disposable Postgres 17 with Supabase role and `auth.*` stubs (24 negative checks, 3 positive service-role checks, all pass).
- Service-role only: the three `atomic_*_payment_capture`, the three `upsert_*_payment_transaction`, `record_webhook_event_atomic`, `is_webhook_event_processed`, `get_order_by_idempotency_key`, `trigger_catalog_sync`.
- Ownership checks added: `upsert_cart_item`, `update_cart_items_selection` (via new `caller_owns_cart`), `get_user_coins`, `create_refund_failure_alert` (own order only, bounded inputs, retry count clamped).
- `search_path` pinned on every definer function; new `is_service_role_caller()` helper that is safe inside definer bodies.
- `payment_transactions`: owner INSERT policy dropped; owner UPDATE may only set `order_id` once, to an order the caller owns. All financial and provider columns are trigger-protected.
- `orders`: `printify_order_id` and `idempotency_key` added to the protected-column trigger.
- `products`: SELECT limited to owner (or ownerless legacy rows).
- `carts`: guest SELECT and UPDATE now require `user_id IS NULL`.
- Default privileges: functions created by future migrations in `public` are no longer executable by anon or authenticated unless granted.

### 3.2 Edge functions
- **create-printify-order**: requires an owned order id, a provider payment reference and provider; fetches the payment with server credentials and verifies owner, completed status, currency and exact amount against the order; requires the `payment_transactions` row to be unlinked or linked to this order; request line items must equal the order's items; atomic fulfilment claim on `printify_order_id`; stable `external_id` = order id; the function now writes `printify_order_id`; `auto_cancel`, `use_sample_order` and client amounts are ignored for users.
- **cancel-order**: no local cancel and no refund unless Printify confirms the cancellation or reports the order already cancelled. Otherwise 409 `ORDER_NOT_CANCELLABLE`.
- **capture-paypal-order**, **verify-mollie-payment**: provider-held owner must equal the caller; order writes scoped by owner; responses reduced to status fields.
- **stripe-webhook**, **mollie-webhook**, **paypal-webhook**: order writes scoped by the payment owner; Stripe and Mollie return 500 on internal failures so the provider retries; Mollie dedups on payment id plus status.
- **create-payment-intent / create-paypal-order / create-mollie-payment**: every line item must price from the catalog; the server total is charged; client amount must match within one cent; discount only via a server-validated `promo_code`; shipping computed server-side; client-supplied `order_id`, `user_id` and similar stripped from metadata.
- **upload-printify-image**: base64 size cap, file name validation, exact S3 host, timeout, minimal logging.
- **sync-printify-orders**: skips the `pending` claim marker.

### 3.3 Next.js
- Auth routes fail closed when CAPTCHA is configured and no token is sent (`CAPTCHA_REQUIRED`).
- PayPal capture route uses the service client for the capture RPC after its provider ownership check.
- `fetch-custom-product` checks ownership in `products` before using the merchant token.
- `generate-image`: size, prompt length, magic-byte MIME allowlist, timeout.
- `fetch-remote-image`: exact hosts, timeout, streaming byte cap, SVG rejected.
- `StructuredData`: JSON-LD escaped.
- Dead `/api/paypal/create-order` route removed.
- Return clients no longer write `printify_order_id` and do not refund on a duplicate-fulfilment 409.
- Checkout sends `promo_code`; Stripe amount unit bug fixed.
- Next.js 16.3.6, Sharp 0.35.4, eslint-config-next 16.3.6.
- `NEXT_PUBLIC_PRINTIFY_API_TOKEN` fallback removed from scripts; `.env.example` annotated.

---

## 4. Not fixed here, with reasons

| Item | Why it was left | Recommended path |
|---|---|---|
| SEC-04 guest session binding | Needs a product decision: Supabase anonymous sign-in or a server proxy with a signed cookie. Both change the guest flow. | Anonymous sign-in. It gives guests a real `auth.uid()` so the existing owner policies apply unchanged. |
| SEC-05 owner INSERT on `orders` / `order_items` | The browser creates the order after payment. Removing the policy breaks checkout until order creation moves server-side. | Server-created order from the priced quote at payment-intent creation; then drop both owner INSERT policies. The new fulfilment checks (verified payment amount equals order total, line items equal order items) close the money-loss path in the meantime. |
| SEC-07 recovery | Same root cause as above: it rebuilds an order from a user-writable snapshot. | Once orders are server-created, recovery becomes "resume order X", and `payment_recovery` needs no user-writable pricing fields. |
| Promo redemption | `redeem_promocode` is still not called; a code can be reused across orders. | Call it from the webhook/fulfilment path using the `promo_code` now stored in payment metadata. |
| SEC-13 Supabase Auth surface | Enabling CAPTCHA in `config.toml` / dashboard is a deployment change. | Enable Auth-level CAPTCHA (hCaptcha or Turnstile) and keep the route check as defence in depth. |
| Refund state machine, dispute handling | Larger design work. | Pending/completed refund states, provider reconciliation job. |
| `NEXT_PUBLIC_PRINTIFY_API_TOKEN` in local `.env` | Untracked file; not touched. | Rename to `PRINTIFY_API_TOKEN` and rotate the token in Printify. Check deployed env vars for the same name. |

---

## 5. Deployment checklist

1. Run `docs/security/live-access-inventory.sql` against staging and production and diff against this migration's assumptions (function signatures, policy names).
2. Apply the migration to staging. Deploy all edge functions in the same release. The browser and edge contracts changed together (`metadata.order_id`, `payment_intent_id`, `provider`, `promo_code`, server total).
3. Run one real checkout per provider on staging with a test card. Confirm: order created, `printify_order_id` written by the edge function, cart cleared, invoice generated.
4. Verify Stripe and Mollie webhook dashboards show no persistent 500s after the release.
5. Rotate the Printify token. Enable Auth-level CAPTCHA.
6. Re-run `npm audit --omit=dev`.

---

## 6. Local verification performed

- Migration: disposable Postgres 17 in Docker with role and `auth.*` stubs, replaying the relevant migrations then the new one. All 24 negative checks blocked; service-role operations succeed.
- `npx tsc --noEmit`: clean.
- `npx eslint` on changed files: 6 errors, all pre-existing on `3ecad13` (`any` types and a raw `<span>`), 0 new.
- Edge functions: syntax-checked with esbuild. Deno is not installed locally, so no Deno typecheck was run. This is the largest residual verification gap.
- Vitest: 1228 of 1238 tests pass. The 10 failures and the 4 integration suites that cannot initialise are all pre-existing on `3ecad13` (analytics, coins and product-customisation mocks, catalog rendering, AuthDialog providers, missing Supabase test env). The two CAPTCHA route tests that failed before this work now pass. 45 new tests were added (server pricing, fulfilment binding, remote-image proxy, generate-image bounds, ownership checks).
- `next build`: succeeds on Next.js 16.3.6.
- `npm audit --omit=dev`: 11 entries before, 6 after; no remaining direct runtime dependency is flagged (the only direct hit is the `supabase` CLI package, moderate, via `tar`).
