# Security assessment — 23 September 2026

**Decision: the application is not ready for a security sign-off.** The reviewed code permits unpaid fulfillment, anonymous access across guest carts, and privileged database operations through publicly executable functions. Payment-provider signatures and ownership checks exist in several paths, but other paths bypass them.

Reviewed repository commit: `9f1f89a`. This is an assessment of the checked-out source, migration history, local configuration structure, dependencies, and isolated tests. It is not a claim that the deployed database matches the repository, nor a guarantee against undiscovered vulnerabilities. No production records were queried or changed, and no real payments, refunds, uploads, or Printify orders were initiated. Application code and migrations were left unchanged; the additions are audit artifacts.

## Evidence and limits

- Reviewed database policies and security-definer functions, including later replacements and table drops; Next.js API and authentication routes; Supabase functions; Stripe, PayPal and Mollie creation, callbacks, recovery, cancellation and refunds; invoice/storage access; secrets handling, logging, uploads, headers and dependencies.
- Reproduced key access failures on a disposable **PostgreSQL 15** instance using actual repository policies/functions and synthetic fixtures. The project targets PostgreSQL 17; this validates the relevant PostgreSQL authorization behavior, not a full migration replay or deployed PostgREST configuration. Table grants were explicitly modeled after standard Supabase defaults; function execution used PostgreSQL defaults. The instance was stopped afterward.
- Offline execution of the actual TypeScript pricing, fulfillment and cancellation modules with synthetic adapters reproduced an unverified 2,950-cent discount on a 3,000-cent basket, creation of a manufacturing order without any payment/order reference, and refund initiation after explicit provider cancellation rejection. No network calls were made.
- Local reproduction proved anonymous cross-cart reads and writes, anonymous payment capture bypassing an order protection trigger, anonymous payment-owner reassignment, anonymous webhook-payload disclosure, anonymous modification of another user's cart selection, owner insertion of a fabricated paid/cancelled order, owner removal of a fulfillment identifier, and owner edits to payment amount/status.
- `npm test -- --reporter=dot`: **85 files passed, 9 failed; 1,147 tests passed, 15 failed**. Four failed suites could not initialize because Supabase test environment variables were missing; other failures involved analytics, coins mocks, product customization mocks, catalog rendering and AuthDialog providers. Production credentials were not injected to make integration tests run.
- Focused security/auth/payment tests: **12 files, 188 tests passed**. Passing unit tests do not negate the SQL reproductions. `vitest.config.ts` includes only `src/**`; standalone files under `supabase/functions/**` are not automatically run by `npm test` (some shared helpers are tested through imports from `src/tests`).
- Registry audit: **21 vulnerable package entries** overall (2 critical, 13 high, 5 moderate, 1 low); `--omit=dev`: **11** (2 critical, 6 high, 2 moderate, 1 low). Counts are package entries, not distinct exploitable application vulnerabilities. CLI/build dependencies can appear in the production dependency tree without being remotely reachable.
- A pattern scan of tracked text files found no matching private-key blocks, long Stripe/OpenAI secret formats or JWTs. This is a limited scan, not proof of absence or a full Git-history/bundle scan. Environment values were not printed or copied into this report.

Artifacts: [reproduction instructions](README.md), [offline payment reproductions](reproduce-payment-boundaries.cjs), [payment reproduction results](payment-boundary-results.txt), [local SQL generator](build-local-repro.py), [local results](local-postgres-results.txt), [full npm audit](npm-audit-2026-09-23.json), [production dependency audit](npm-audit-production-2026-09-23.json), [read-only deployed access inventory](live-access-inventory.sql), [definer declaration candidates](definer-declarations.json). The declaration list includes historical versions and is not an effective live ACL inventory.

## Findings, ordered by remediation priority

### SEC-01 — Critical: public security-definer RPCs bypass RLS and payment protections

**Evidence:** [supabase/migrations/20260625000001_add_atomic_payment_capture.sql:12](../../supabase/migrations/20260625000001_add_atomic_payment_capture.sql#L12), [supabase/migrations/20260714000008_add_order_id_to_stripe_upsert.sql:15](../../supabase/migrations/20260714000008_add_order_id_to_stripe_upsert.sql#L15), [supabase/migrations/20260625000002_add_payment_upsert_functions.sql:209](../../supabase/migrations/20260625000002_add_payment_upsert_functions.sql#L209), [supabase/migrations/20260707000000_security_hardening_rls.sql:17](../../supabase/migrations/20260707000000_security_hardening_rls.sql#L17).

The three `atomic_*_payment_capture` functions, provider upsert functions, and webhook event functions run as their owner without caller authorization. The migrations do not revoke their default PUBLIC execution privilege. Granting execution to a narrower role elsewhere does not remove PUBLIC access. [PostgreSQL documents both the default PUBLIC grant and the privileges of SECURITY DEFINER functions](https://www.postgresql.org/docs/16/sql-createfunction.html); [Supabase recommends explicit execution restrictions](https://supabase.com/docs/guides/database/functions).

`atomic_stripe_payment_capture` accepts caller-supplied amount/currency, updates the transaction, and marks its linked order paid. The order trigger accepts the update because `current_user` inside the definer call is the trusted function owner. `upsert_stripe_payment_transaction` can overwrite `user_id` and `order_id` for a known payment reference, allowing an attacker to reassign a payment and then read it through ordinary owner RLS. These routines never contact a payment provider.

`record_webhook_event_atomic` returns an existing **entire webhook row** on conflict, including its payload, without verifying the caller. It also permits pre-inserting an event to interfere with later processing. Relevant reference IDs must be known for targeted attacks; new forged rows do not require a victim reference.

**Verified locally:** an anonymous caller saw zero payment rows through ordinary RLS, yet marked a victim order paid through the capture RPC; reassigned the payment to another user; and retrieved a synthetic victim payer email from a webhook payload.

**Fix:** revoke execution from PUBLIC, anon and authenticated for each privileged function signature; grant only service_role. Set a fixed safe search path and qualify table names. Move internal helpers out of exposed schemas where practical. Update the Next.js PayPal capture route to use a service client *after* its provider-owner check, since it currently invokes the privileged RPC using a user client. Do not simply revoke execution and leave checkout broken.

**Acceptance:** anonymous/user execution must return permission denied; a user cannot fabricate capture, change another account's payment, read/preclaim webhook events, or change protected orders through any RPC. Service operations must still succeed.

### SEC-02 — Critical: authenticated users can create unpaid Printify orders

**Evidence:** [supabase/functions/create-printify-order/index.ts:106](../../supabase/functions/create-printify-order/index.ts#L106), [supabase/functions/create-printify-order/index.ts:122](../../supabase/functions/create-printify-order/index.ts#L122), [supabase/functions/create-printify-order/index.ts:276](../../supabase/functions/create-printify-order/index.ts#L276), [supabase/functions/create-printify-order/index.ts:156](../../supabase/functions/create-printify-order/index.ts#L156).

The endpoint accepts any valid user and caller-supplied products, quantities and shipping address. An order ID is optional; ownership is checked only when it is supplied. No paid-payment verification occurs. The optional amount check compares request-supplied values to other request-supplied values. Omitting `payment_amount` skips it entirely. The function then creates a merchant Printify order using the private merchant token. Repeated requests use new timestamp-based external IDs; there is no durable fulfillment claim preventing duplicate orders.

The `is_test` flag changes an external-ID prefix and logging; the outbound order payload does not establish a separate test merchant or sandbox. It must not be treated as a financial safety barrier. The actual handler created a synthetic provider order in the offline reproduction without an order ID, payment ID or amount; actual production/charging depends on Printify approval settings and was not exercised.

**Fix:** make fulfillment internal, or accept only an owned immutable order ID and perform all checks server-side. Require captured, unrefunded payment tied to that order's exact quote, currency, products, quantities and destination. Build the payload from server-owned records. Atomically claim fulfillment and use a stable provider external ID/reconciliation strategy. Remove user-accessible sample/auto-cancel flags.

**Acceptance:** omitted payment, unpaid payment, someone else's payment, changed items/address/quantity, refunded payment and duplicate/concurrent requests cannot create a new manufacturing order.

### SEC-03 — Critical dependency exposure: Next.js and Sharp versions have relevant advisories

**Evidence:** lockfile resolves Next.js `16.1.6`, Sharp `0.35.3`; [package.json:5](../../package.json#L5), [next.config.ts:99](../../next.config.ts#L99), [src/app/api/generate-image/route.ts:77](../../src/app/api/generate-image/route.ts#L77). See saved registry results.

The Next.js maintainer reports an AVIF image-optimization RCE affecting versions below `16.3.3`, related to the native image library. The configured image optimizer accepts remote images, including arbitrary Supabase project hosts; image-generation code also processes uploads. These are relevant ingestion surfaces, although no exploit was attempted and deployed native binaries were not inspected. [Next.js advisory](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4). Sharp `0.35.3` also matches the maintainer's vulnerable range. [Sharp advisory](https://github.com/lovell/sharp/security/advisories/GHSA-rgj7-g3m4-5g8c).

**Fix:** update Next.js and the direct/overridden Sharp dependency to patched compatible releases (at least Next.js `16.3.3` and Sharp `0.35.4` for these advisories), regenerate the lockfile, rebuild/redeploy, and rerun the current advisory scan. Triage remaining runtime/build findings individually. Do not assume every registry finding is remotely exploitable or that a `package.json` range updates an existing lockfile.

### SEC-04 — High: guest-cart RLS exposes and permits modification across sessions

**Evidence:** [supabase/migrations/20260621000004_fix_guest_cart_and_product_rls.sql:24](../../supabase/migrations/20260621000004_fix_guest_cart_and_product_rls.sql#L24), [supabase/migrations/20260621000004_fix_guest_cart_and_product_rls.sql:100](../../supabase/migrations/20260621000004_fix_guest_cart_and_product_rls.sql#L100), [supabase/migrations/20260215000000_add_email_to_carts.sql:2](../../supabase/migrations/20260215000000_add_email_to_carts.sql#L2).

Guest SELECT checks only `auth.uid() IS NULL AND session_id IS NOT NULL`. It never compares the row with a trusted session identity. It also omits `user_id IS NULL`, exposing authenticated users' cart rows if a session ID remains attached. Guest writes and cart-item access allow any guest-owned session cart, not just the caller's. A frontend `.eq('session_id', ...)` filter is not authorization: a caller can remove it.

**Verified locally:** anon read all three fixture carts, including an authenticated user's session-bearing cart; read both unrelated guest carts' items; and changed another guest's email. Exposed fields include cart email, user UUID, session token, product/quantity selections and custom artwork URLs where present. Deletion and item modification follow the same unrestricted policy conditions.

**Fix:** use Supabase anonymous users with a real per-user `auth.uid()`, or proxy guest-cart operations through a server that validates a signed opaque session cookie. Remove broad anonymous table access. Do not trust an arbitrary user-supplied header or a session identifier whose entire table can be listed.

### SEC-05 — High: owner RLS allows financial-state forgery and fulfillment/refund manipulation

**Evidence:** [supabase/migrations/20260115000000_create_core_tables.sql:426](../../supabase/migrations/20260115000000_create_core_tables.sql#L426), [supabase/migrations/20260101015400_create_payment_transactions.sql:36](../../supabase/migrations/20260101015400_create_payment_transactions.sql#L36), [supabase/migrations/20260715000000_add_payment_transactions_update_policy.sql:10](../../supabase/migrations/20260715000000_add_payment_transactions_update_policy.sql#L10), [supabase/migrations/20260908000000_fix_security_review.sql:3](../../supabase/migrations/20260908000000_fix_security_review.sql#L3), [supabase/functions/process-refund/authorization.ts:48](../../supabase/functions/process-refund/authorization.ts#L48).

Owner INSERT into orders can set price, `payment_status='paid'` and `status='cancelled'`. The protection trigger runs only on UPDATE. Payment transactions permit owner INSERT and unrestricted owner UPDATE of amount, status, provider references, metadata and order linkage. Order UPDATE still permits `printify_order_id`, `idempotency_key`, customer/shipping fields and other fulfillment attributes not listed in the trigger. Order-item INSERT remains available for owned orders.

**Verified locally:** an owner inserted an already-paid/cancelled order, cleared the Printify identifier on an existing order and changed a payment's amount/status.

**Concrete refund consequence:** a customer with a genuine paid order can create a second, synthetic cancelled/paid order and relink their genuine payment transaction to it. The refund endpoint's ownership, provider-amount and cancelled-state checks can all pass for this fabricated local state. The original manufacturing order need not be cancelled. Separately, clearing a Printify identifier lets cancellation skip contacting the manufacturer. Provider ownership checks prevent using an unrelated payer's payment, but do not prevent refunding one's own still-fulfillable purchase.

**Fix:** reserve order/payment/order-item creation and financial/fulfillment updates for trusted server operations. Offer narrow owner operations for genuinely editable fields, with state restrictions. Bind each provider payment to one server-created order immutably and validate relational ownership. Prevent extra items from being inserted after a quote/payment is finalized. Keep customer-editable preferences separate from accounting/fulfillment state.

### SEC-06 — High: prices, discounts and payment-to-order binding remain client-controlled

**Evidence:** [supabase/functions/create-payment-intent/index.ts:91](../../supabase/functions/create-payment-intent/index.ts#L91), [supabase/functions/create-paypal-order/index.ts:39](../../supabase/functions/create-paypal-order/index.ts#L39), [supabase/functions/create-mollie-payment/index.ts:57](../../supabase/functions/create-mollie-payment/index.ts#L57), [supabase/functions/_shared/serverPriceService.ts:192](../../supabase/functions/_shared/serverPriceService.ts#L192), [src/app/api/paypal/create-order/route.ts:31](../../src/app/api/paypal/create-order/route.ts#L31), [supabase/functions/stripe-webhook/index.ts:186](../../supabase/functions/stripe-webhook/index.ts#L186).

All three edge creation flows only validate pricing when a nonempty subset of items contains particular pricing IDs. Omit the items/IDs and validation is skipped. Shipping and discount values remain caller-controlled even when product-price validation runs. For example, a 3,000-cent basket with a supplied 2,950-cent discount passes a 50-cent total check without any valid promotional code; this was reproduced with the actual pricing module and a synthetic catalog adapter. The separate Next.js PayPal creation route accepts the submitted positive amount without catalog pricing.

Stripe and Mollie accept client-provided order identifiers in metadata. Subsequent webhook/verification logic uses those identifiers for service-role order updates without checking that the order belongs to the payment owner or that its amount/currency/items match. A signed webhook authenticates the provider message, not the application's earlier client-supplied metadata. Thus a small real payment can mark an unrelated or more expensive order paid when its ID is known.

`redeem_promocode` exists as a service-only atomic function, but no application call site was found. The public validation API checks eligibility for display; it does not reserve or consume a redemption at payment finalization.

**Fix:** create a persisted server quote from owned cart IDs, active products/variants, validated integer quantities, destination-specific shipping/tax and an authorized promotion. Require the entire basket to price successfully. Save a server-created order/payment association and validate it on every provider event. Atomically reserve/redeem promotions with a documented rollback/expiry policy.

### SEC-07 — High: recovery verifies the payment but trusts a writable basket and fulfillment payload

**Evidence:** [supabase/migrations/20260701000002_verify_and_fix_payment_recovery_rls.sql:25](../../supabase/migrations/20260701000002_verify_and_fix_payment_recovery_rls.sql#L25), [supabase/functions/process-payment-recovery/index.ts:58](../../supabase/functions/process-payment-recovery/index.ts#L58)}, [supabase/functions/process-payment-recovery/index.ts:111](../../supabase/functions/process-payment-recovery/index.ts#L111), [supabase/functions/process-payment-recovery/index.ts:206](../../supabase/functions/process-payment-recovery/index.ts#L206).

A user can insert/update their recovery record, including snapshot prices, quantities, address and `line_items`. Recovery verifies payment ownership and currency against the provider, then compares the real amount to prices from that user-writable snapshot. The independent `line_items` are forwarded to Printify without tying them to the priced snapshot. A genuine small payment plus an equally small fabricated snapshot can therefore authorize a substantially different fulfillment request. Successful runtime execution also depends on schema/default compatibility of order creation; the unsafe trust boundary is present regardless.

**Fix:** recovery should resume an immutable server quote/order/payment association. Do not accept user-written payment proof, cart prices, fulfillment items or shipping facts as authoritative. Keep only explicitly user-editable recovery preferences writable. Add concurrent-recovery tests and reconciliation for an order created before a provider/network failure.

### SEC-08 — High: cancellation authorizes refunds even if manufacturer cancellation fails

**Evidence:** [supabase/functions/cancel-order/index.ts:197](../../supabase/functions/cancel-order/index.ts#L197), [supabase/functions/cancel-order/index.ts:209](../../supabase/functions/cancel-order/index.ts#L209), [supabase/functions/cancel-order/index.ts:217](../../supabase/functions/cancel-order/index.ts#L217), [supabase/functions/cancel-order/index.ts:230](../../supabase/functions/cancel-order/index.ts#L230).

A “does not allow cancellation” response is treated as effectively cancelled. Other rejected responses and exceptions also continue to local cancellation and refund. A locally confirmed order that has already entered production remotely, or one experiencing a transient provider failure, may be refunded while still manufactured/shipped. The actual cancellation handler was executed offline with a synthetic provider 400 rejection and still requested the refund. This is independent of the direct-database attacks above. [Printify distinguishes orders not yet in production from cancellation requests after production starts](https://help.printify.com/hc/en-us/articles/4483630248465-How-do-I-cancel-or-edit-an-order).

**Fix:** require authoritative successful cancellation or a fetched terminal cancelled state before an automatic refund for fulfilled orders. Otherwise record cancellation-pending/manual review, retry safely and reconcile. Never infer successful cancellation from an error-message substring. Persist a cancellation operation and coordinate it with fulfillment.

### SEC-09 — High: alternate payment endpoints omit ownership checks

**Evidence:** [supabase/functions/capture-paypal-order/index.ts:110](../../supabase/functions/capture-paypal-order/index.ts#L110), [supabase/functions/capture-paypal-order/index.ts:246](../../supabase/functions/capture-paypal-order/index.ts#L246), [supabase/functions/verify-mollie-payment/index.ts:23](../../supabase/functions/verify-mollie-payment/index.ts#L23), [supabase/functions/verify-mollie-payment/index.ts:124](../../supabase/functions/verify-mollie-payment/index.ts#L124).

The PayPal edge capture endpoint authenticates a user but discards their identity before capturing the supplied order ID. It returns payer email. The Next.js PayPal capture endpoint has a provider-held ownership check, but that does not protect the separate public edge URL. The Mollie verification endpoint similarly permits any logged-in user with a payment ID to fetch it, trigger synchronization and receive metadata, including user/email/shipping/item information populated at creation.

**Preconditions:** a valid account and another user's provider reference; a PayPal order must already meet provider approval/capture requirements. This is not a claim that arbitrary cards can be charged without payer approval.

**Fix:** fetch provider-held ownership and compare it to the authenticated caller before capture or disclosure; validate reference formats; use shared authorization code across both endpoint implementations. Return only necessary checkout status fields. Remove redundant publicly deployed endpoints if unused.

### SEC-10 — High privacy issue: custom products are publicly readable

**Evidence:** [supabase/migrations/20260115000000_create_core_tables.sql:390](../../supabase/migrations/20260115000000_create_core_tables.sql#L390), [src/shared/mappers/services/productServiceMapper.ts:63](../../src/shared/mappers/services/productServiceMapper.ts#L63), [src/app/api/fetch-custom-product/route.ts:16](../../src/app/api/fetch-custom-product/route.ts#L16).

Custom user products are saved with `is_active=true`; the public products SELECT policy allows all such rows, including creator UUID, Printify product ID and print-area configuration. The authenticated `fetch-custom-product` route accepts any valid merchant product ID and returns the full provider response without checking the product owner. Public product enumeration supplies IDs for that second route. Depending on provider response/image availability, users can view other customers' private designs/mockups and configuration. This is distinct from the intentionally public standard catalog.

**Fix:** separate public catalog data from private customer products. Read custom products only for their owner or internal service role. Authorize before the privileged Printify fetch, and return a minimal projection. Track image ownership before allowing references to existing merchant images/products.

### SEC-11 — Medium: other definer functions bypass ownership and can trigger privileged work

**Evidence:** [supabase/migrations/20260804000000_fix_cart_items_image_index.sql:82](../../supabase/migrations/20260804000000_fix_cart_items_image_index.sql#L82), [supabase/migrations/20260810000000_add_is_selected_to_cart_items.sql:12](../../supabase/migrations/20260810000000_add_is_selected_to_cart_items.sql#L12), [supabase/migrations/20260807000000_add_get_user_coins_rpc.sql:15](../../supabase/migrations/20260807000000_add_get_user_coins_rpc.sql#L15), [supabase/migrations/20260818100000_fix_all_cron_jobs_use_vault.sql:86](../../supabase/migrations/20260818100000_fix_all_cron_jobs_use_vault.sql#L86), [supabase/migrations/20260412000000_add_idempotency_and_refund_failures.sql:172](../../supabase/migrations/20260412000000_add_idempotency_and_refund_failures.sql#L172).

Cart upsert/selection accept arbitrary cart UUIDs without verifying ownership. Coins lookup accepts arbitrary profile IDs and may reset their balance. Order-idempotency lookup reveals an order UUID for a known key. Refund-alert creation permits untrusted operational records. Catalog trigger invokes a Vault-authenticated HTTP request with no caller guard; the target `sync-catalog` is not present among the checked-in function directories, so actual workload depends on deployment.

**Verified locally:** anon changed selection for a cart belonging to a logged-in user. Other listed routines were verified by source review, not invoked against external systems.

**Fix:** user RPCs must derive identity from `auth.uid()` and verify cart ownership (or use SECURITY INVOKER where sufficient); internal RPCs must be service-only. Explicitly revoke PUBLIC access and set search paths. Inventory every deployed overload, including retired functions that may persist from edited historical migrations.

### SEC-12 — Medium: webhook deduplication/retry logic can lose payment transitions

**Evidence:** [supabase/functions/mollie-webhook/index.ts:70](../../supabase/functions/mollie-webhook/index.ts#L70), [supabase/functions/mollie-webhook/index.ts:82](../../supabase/functions/mollie-webhook/index.ts#L82), [supabase/functions/mollie-webhook/index.ts:243](../../supabase/functions/mollie-webhook/index.ts#L243), [supabase/functions/paypal-webhook/index.ts:119](../../supabase/functions/paypal-webhook/index.ts#L119), [supabase/functions/stripe-webhook/index.ts:204](../../supabase/functions/stripe-webhook/index.ts#L204).

Mollie deduplicates by payment ID before re-fetching provider state. A callback for an open/pending payment can suppress its later paid transition. An unauthenticated caller with that payment ID can prompt an early callback; it cannot forge paid status, but may interfere with later handling. Errors are acknowledged with HTTP 200. PayPal inserts an event record before processing and treats age over five seconds as completion; a retry after partial failure may be skipped while concurrent deliveries within that window both run. Stripe breaks out and acknowledges some database failures instead of requesting retry. Stripe handling also lacks a complete external refund/dispute reconciliation path.

**Fix:** persist received/processing/completed/failed states with a recoverable lease and transactional completion. Deduplicate provider events appropriately; for Mollie, reconcile current payment/refund state rather than treating the first payment-ID notification as final. Return retryable failure for incomplete durable processing. Handle refund/dispute transitions and run scheduled reconciliation. Deduplication must remain inaccessible to clients (SEC-01).

### SEC-13 — Medium: custom auth CAPTCHA/rate controls can be bypassed through Supabase Auth

**Evidence:** [supabase/config.toml:203](../../supabase/config.toml#L203), [supabase/config.toml:173](../../supabase/config.toml#L173), [src/app/api/auth/login/route.ts:40](../../src/app/api/auth/login/route.ts#L40), [src/lib/security/rate-limiter/store.ts:11](../../src/lib/security/rate-limiter/store.ts#L11).

The application checks Google reCAPTCHA and database-backed limits in its Next.js login/signup routes. Supabase Auth remains independently reachable with the public API key, and its own CAPTCHA is explicitly disabled in the checked-in configuration. Calling provider signup/password-token endpoints directly bypasses the application's controls, although Supabase's separate native limits and email confirmation still apply. Deployment configuration must be checked before claiming live exploitability. [Supabase documents native CAPTCHA protection at the Auth layer](https://supabase.com/docs/guides/auth/auth-captcha).

Next.js middleware rate limits are per-process. They do not cover directly invoked Supabase edge functions. Paid/expensive merchant uploads and product/payment creation need their own abuse controls; valid user authentication alone does not limit repeated work.

**Fix:** enforce CAPTCHA/abuse policy at the reachable Auth service, using a supported provider or enforceable server architecture. Add shared durable user/IP/account quotas on expensive edge operations. Verify production forwarding-header trust and Auth limits. Keep email confirmation and generic error responses.

### SEC-14 — Medium: upload/proxy resource bounds are incomplete

**Evidence:** [src/app/api/generate-image/route.ts:40](../../src/app/api/generate-image/route.ts#L40), [src/app/api/generate-image/route.ts:77](../../src/app/api/generate-image/route.ts#L77), [src/app/api/fetch-remote-image/route.ts:80](../../src/app/api/fetch-remote-image/route.ts#L80), [supabase/functions/upload-printify-image/index.ts:43](../../supabase/functions/upload-printify-image/index.ts#L43).

Image generation parses/reads the upload without an application size limit or dimension/pixel limit at this route; supplied nonempty MIME types are trusted, and unknown bytes can default to JPEG. The image proxy checks its 15 MB cap only after buffering the full response and sets no explicit timeout. Printify base64 upload has no local body/decoded-size limit. Hosting/provider limits may reduce impact, but are not encoded here. This enables memory/bandwidth/processing abuse by authenticated clients, especially when combined with direct edge access.

**Fix:** enforce request limits before buffering, stream/count remote response bytes with cancellation, impose timeouts and concurrency quotas, validate actual image formats and dimensions, and narrow remote hosts to the specific project/bucket/CDNs required. Continue rejecting redirects and non-HTTPS URLs. Broad `*.amazonaws.com`/`*.supabase.co` allowlists include attacker-controlled tenants; they are not proof that content is trusted.

## Additional hardening and unverified risks

- **JSON-LD injection sink:** [src/features/seo/ui/StructuredData.tsx:9](../../src/features/seo/ui/StructuredData.tsx#L9) uses raw `JSON.stringify` in a script tag. A string containing `</script>` can break out of the element; serialize with `<` escaped as `\u003c` (or a safe JSON serializer). Current homepage data comes from service-managed catalog/translations; an ordinary-user write path to those catalog fields was not established. Treat this as a dangerous sink with conditional exploitability, not a confirmed public stored-XSS exploit. `script-src 'unsafe-inline'` would weaken containment if such content became writable.
- **Sensitive diagnostics:** image generation logs raw prompts and filenames; Printify upload logs URLs/full provider responses; error capture explicitly attaches user email and accepts contextual data. Sentry replay masks text/media, which is useful, but is not comprehensive server-log redaction. Minimize data, redact tokens/signed URLs/address fields, document retention and restrict operator access. No PAN/CVC storage was identified in reviewed persistence code; do not interpret that as a payment compliance certification.
- **Secret configuration:** ignored local env files contain a variable named `NEXT_PUBLIC_PRINTIFY_API_TOKEN`. No current frontend source reference was found; therefore browser disclosure is **not confirmed** merely from its name. Remove the public-prefixed secret, inspect previous/deployed bundles and CI outputs, and rotate if exposed. Only `.env.example` is tracked among root `.env*`; no secret values were included in artifacts.
- **Refund completion:** refund helpers return a provider refund ID, then immediately mark local refunds completed/payment refunded and void invoices. A created refund may require a later provider status transition; add pending/failed refund reconciliation. Existing provider idempotency keys are a useful control, but local “already refunded” checks depend on currently user-writable payment rows.
- **Migration drift:** repository history includes cleanup, replacement functions and comments that historical definitions were removed by editing old migrations. Already-applied database objects do not disappear because an old file changes. Catalog RLS is explicitly re-enabled after table recreation in the final cleanup migration; it was not incorrectly treated as missing. Obtain the live inventory before producing a deployment migration.
- **Deployment checks still required:** hosted function versions and JWT configuration, actual ACL/default privileges, storage buckets and object policies, production key mode, webhook secrets/subscriptions, Printify approval policy, auth settings, service-role exposure, HTTPS/CDN headers, backup/restore testing, access to dashboards/logs, account deletion/retention, and monitoring/alert response. Config file settings alone do not prove hosted settings.

## Who can access what

This describes intended direct RLS behavior from repository migrations plus confirmed exceptions. Actual table grants and deployed policies must be checked with `live-access-inventory.sql`. Service-role clients bypass RLS and must remain server-only.

| Resource | Anonymous | Authenticated customer | Service/internal | Material exception |
|---|---|---|---|---|
| Profiles | No direct row reads | Own profile read/update; coin/email/id protection on updates | All | `get_user_coins` exposes another profile's coin state by UUID |
| User credits / credit transactions | No direct access | Own read only | Accounting writes | Credit grant RPC explicitly service-only; broader payment RPCs still unsafe |
| User uploads / AI generation rows | No direct access | Own upload read/insert/delete; own generation read/insert/update | Privileged client | Row isolation does not establish privacy of externally hosted image URLs |
| Carts | Reads all session-bearing rows; writes all guest session carts | Own CRUD | All | No session binding; authenticated rows with retained session ID leak to anon |
| Cart items | All guest-session cart items | Own cart items | All | Definer cart RPCs bypass ownership for arbitrary carts |
| Standard catalog / variants / product SEO | Active/available public data; public SEO | Same public reads | Catalog writes | Available variant policy does not itself require an active parent product; assess whether that matters for unpublished data |
| Custom `products` | All active custom product rows | Public active reads plus own writes | All | Creator UUID/design configuration public; privileged product-fetch route lacks ownership |
| Orders | No direct rows | Own SELECT/INSERT/UPDATE | All | INSERT can fabricate financial state; UPDATE can change unprotected fulfillment fields; definer payment RPCs bypass protection |
| Order items | No direct rows | Own order items read/insert | All | Client can append arbitrary items; needs immutable finalized basket |
| Payment transactions | No direct rows | Own SELECT/INSERT/UPDATE | All | Owner controls financial fields/linkage; public definer functions can cross users |
| Payment recovery | No direct rows | Own SELECT/INSERT/UPDATE | All | Snapshot/items/payment context are not trustworthy server records |
| Invoices | No direct rows | Own SELECT | Create/update | Source order/payment records can be forged; correct invoice RLS does not validate accounting truth |
| Invoice PDFs | Private bucket in migration | SELECT where first folder is own user UUID; signed URLs supported | Generate/upload | Verify existing bucket is private: migration uses `ON CONFLICT DO NOTHING` |
| Refunds | No direct rows | Read refunds attached to own orders | Accounting writes | Refund eligibility can be fabricated upstream |
| Order history | No direct rows | Read history of owned order | Writes | Original order mutations can corrupt business truth |
| Webhook events | No intended direct rows | No intended direct rows | Read/write | Public definer event function returns full existing payload and permits event preclaim |
| Refund failures / reconciliation | No intended direct access | No intended direct access | Operational handling | Definer alert function allows fabrication of refund alerts |
| Promocodes | No direct table grants | No direct table grants | Read/write/redeem | Validation API reveals a supplied code's result; redemption routine is not integrated |
| Auth email rate limits | No table privileges | No table privileges | Rate-limit operations | Service-only RPCs correctly revoked from user/public roles |

`user_designs`, `product_images`, old provider/analytics tables and several legacy columns are dropped by later migrations; they are not treated as current customer-facing resources here. Confirm no stale copies survive in the deployed schema.

## Payment assessment by stage

| Stage | Safeguards observed | Remaining gap |
|---|---|---|
| Payment creation | Real user validation; provider secret stays server-side | Optional pricing; client discount/shipping/metadata; duplicate endpoint divergence |
| Stripe callback | Raw-body signature verification; atomic credit grant/dedup | Unvalidated order association; some DB failures acknowledged; incomplete reversal handling |
| PayPal callback | Provider signature verification; approval alone not considered paid | Public event RPC and age-based dedup; weak local order association |
| Mollie callback | Re-fetches payment using merchant credentials, rather than trusting status in request | Payment-ID-only dedup, early notification suppression, error 200s |
| PayPal capture | Next.js route verifies provider ownership | Alternate edge route skips ownership |
| Fulfillment | User authentication; optional order ownership | No required payment proof; request-supplied items; no durable duplicate protection |
| Recovery | Provider payment ownership, currency and refunded-state checks | User-writable price snapshot and separate manufacturing items |
| Cancellation | Initial local owner/status check | Editable manufacturer ID; provider rejection still proceeds |
| Refund | Provider re-fetch, amount/currency/owner checks; provider idempotency keys | Local eligibility/linkage forgeable; manufacturing cancellation not authoritative; asynchronous completion |
| Invoice | Private bucket/owner RLS; service-only invoice creation | Correctly signed/invoiced data may still derive from fabricated order/payment state |

## Recommended implementation order and release gates

1. **Contain privileged exposure:** restrict financial/webhook/internal RPC execution; patch Next.js/Sharp; restrict Printify fulfillment to trusted server calls; close guest-cart policies. Change dependent callers in the same release so legitimate checkout remains functional.
2. **Rebuild checkout authority:** server quote → server order → immutable provider association → verified capture → atomic fulfillment claim. Remove user writes to financial/fulfillment tables and validate promotion usage atomically.
3. **Correct cancellation/refunds/recovery:** authoritative provider status, immutable quote data, durable operations and retry-safe reconciliation. Separate created/pending/completed refund states.
4. **Close privacy and abuse gaps:** custom product ownership, alternate payment endpoints, Auth-service CAPTCHA, shared edge quotas, bounded image processing, redacted diagnostics and safe JSON-LD.
5. **Verify staging and deployment:** apply new forward migrations to a staging copy, run the live inventory, and exercise real Supabase/PostgREST roles with synthetic users. Run provider sandbox tests before release; inspect deployed artifacts and key modes.

Required negative tests: anon cannot list/mutate other carts; user A cannot access user B's private data or RPC resources; direct REST cannot set price/status/provider link; no payment/underpayment/forged discount cannot fulfill; provider metadata cannot link another user's order; one payment cannot fulfill twice; failed manufacturer cancellation cannot auto-refund; refund cannot be diverted through a fabricated cancelled order; a pending callback followed by paid is processed; DB failure after callback is recoverable; duplicate/concurrent webhook/recovery/cancel calls cannot duplicate accounting/fulfillment; unknown image format/oversized stream is rejected within resource limits.

The current code contains useful security controls, but those controls are not consistently enforced at every public boundary. Fixing the frontend alone will not resolve the database and edge-function bypasses.
