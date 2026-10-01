# Stamp acceptance suite

Executable specifications for [the agreed scenarios](../../docs/TEST_SCENARIOS.md). Browser tests use the real parallel Supabase project `tgccxydchvujhrqyzqao`, real sandbox payments, and actual Printify orders. AI generation alone is replaced by a deterministic server adapter. Network aborts exercise failure handling; they never count as successful database, payment or fulfillment integration.

## Run

Use Node 22+ and `npm ci`. The ignored `.env.test.local` holds local test credentials and overrides optional `.env.test` values; either file can stand alone. Neither production files nor shell credentials fill missing values. Public PayPal client/webhook IDs are accepted as server aliases. Fill missing entries using [environment.example](environment.example). Never copy `.env.local` into it. Install browsers with `npx playwright install chromium`.

```sh
npm run test:acceptance:preflight
npm run test:acceptance:contracts
npm run test:acceptance:unit
npm run test:acceptance:list
npm run test:acceptance
```

Run the verified smoke subset without the missing administrator/provider credentials:

```sh
npm run test:acceptance -- --grep 'callback cannot redirect|upload is optional|upload/remove/reselect|guest generation is blocked'
```

Run one project with `npm run test:acceptance -- --project=desktop`. Optional Firefox/WebKit/mobile Safari projects use `ACCEPTANCE_CROSS_BROWSER=1 npm run test:acceptance`; install `firefox webkit` first. Mobile projects emulate devices; physical-device acceptance remains a separate check.

Always use the wrapper for execution: it performs preflight and final cleanup even when Playwright fails. Direct Playwright invocation is for discovery only. Tests run serially with no automatic test retries. The dedicated app listens on port 3107 and refuses reuse of another server. Reports and durable cleanup ledgers live under ignored `.acceptance/`; treat them as private operational records.

## Environment setup

- **Supabase:** supply a service-role key belonging to the parallel project. The production key is deliberately rejected. Apply the project's reviewed migrations and deploy Edge Functions explicitly to this test project; existing root `supabase:setup` links production and must not be used for this suite. Configure Edge secrets for the test database, `APP_ENV=test`, sandbox payment providers and shop `25847763`. Only then set `TEST_EDGE_ENVIRONMENT_VERIFIED` to the exact test URL. Local `.env.test` does not configure deployed functions. Enable password and Google auth as needed; allow `http://localhost:3107` confirmation/recovery/OAuth redirects. Supply controlled Google credentials for the OAuth test; challenges are reported as failures, never bypassed.
- **Printify:** configure manual order approval in the authorized shop and disable automatic production submission for acceptance orders before setting `TEST_PRINTIFY_MANUAL_APPROVAL=confirmed`. The flag is an operator assertion, not an API verification of shop settings. Provide an existing real test product and enabled variant for order integration tests, and available catalog names for normal/sock/mug customization. Supply [cart-fixtures.example.json](cart-fixtures.example.json) with real product/variant IDs matching the listed prices and quantities; set its path in `.env.test`. Fake product IDs are used only in non-fulfillment cart tests. Keep provider tokens server-side under `PRINTIFY_API_TOKEN`; the runner blanks the public alias.
- **Payments:** Stripe test keys plus the test Edge webhook signing secret; PayPal sandbox merchant client ID/secret, webhook ID and buyer credentials; Mollie test API key with iDEAL enabled. Configure actual provider callbacks/webhooks to the parallel project. Provider proof checks amount, currency and completed status using actual sandbox APIs.
- **Email:** configure Brevo and a verified sender for the test app/Edge Functions, plus Supabase recovery-email delivery. Provide a controlled catch-all or plus-address template containing `{id}`, and TLS IMAP host/user/password for that inbox. Email tests read only messages matching the run's recipient and never delete inbox mail.
- **Analytics:** use a dedicated GA4 test measurement ID (`G-…`), `TEST_GA_PROPERTY_CONFIRMED=true`, numeric property ID and a short-lived OAuth read token authorized for that property. Business-event tests assert real collection requests and successful HTTP responses. A unique marker queried through the realtime Data API separately proves ingestion. This does not prove every business event is present in finalized GA reports. Disable internal/developer filters that would exclude the ingestion marker.
- **AI:** no keys required. The adapter only activates with `STAMP_ACCEPTANCE_TESTS=1` and the exact parallel database URL. Success returns a checked-in image; explicit failure/timeout prompts exercise real coin deduction/refund behavior. Browser requests to real AI providers and other Supabase projects are blocked. The app server blanks production environment fallbacks before loading test values.

Missing settings fail the relevant tests instead of silently skipping them. Preflight verifies real login, exact user ID and table access, and prints configuration names with presence status; it does not claim all service credentials have been validated.

## Cancellation and recovery

Each isolated test account has a durable ledger. Before creating an order, the harness records an intent; after creation, it records the provider ID. Browser fulfillment requests also record the application order ID before leaving the machine. Teardown discovers persisted provider IDs even if the browser lost a response, then immediately cancels every known Printify order.

Cancellation means a fresh provider GET reports `canceled`/`cancelled`. A successful local response alone is insufficient. The harness makes an initial cancellation attempt and up to **three retries**, with 1/2/4-second backoff. Four unsuccessful attempts fail the test and run. Automatic finalizers cannot restart an exhausted retry budget or turn an earlier failure into a pass. A lost creation response is reconciled by the durable correlation ID; an unresolved intent blocks further runs.

```sh
npm run test:acceptance:cleanup
```

This explicit recovery command starts a new cancellation budget for outstanding records, retains previous failure evidence, discovers orders from unfinished test accounts, and removes run-owned database/auth data only after remote cancellation succeeds. It never changes the previous failed test result. Do not delete `.acceptance` to clear a failure. Investigate ambiguous intents in the shop; absence from one listing is not enough to assume an order never existed. Cleanup never submits an order to production, and cannot cancel an order once the provider disallows it. [Printify order API](https://developers.printify.com/)

Database cleanup removes run-owned invoices/PDFs, refunds, order/cart records and temporary identities. Sandbox provider payments/refunds and custom Printify products remain available for audit; orders must be canceled. A machine crash or SIGKILL can prevent immediate teardown: retain the ledger, run recovery promptly, and block new purchases until it clears.

## TDD and execution status

See [the latest execution evidence and confirmed failures](RUN_STATUS.md) for the expanded real-database runs.

Requirements determine expected results: exact fixture amounts/quantities, identity, ownership, coin balances, provider state and event payloads. Tests do not import production monetary calculations as their oracle. Pure helper contracts and unit checks are supplementary harness verification; they do not replace real-database acceptance evidence.

For each product change: run the relevant requirement test against the real test environment; save its meaningful failing assertion; implement the smallest fix; rerun it; refactor while green. A missing key, unavailable deployment or broken selector is a setup/harness failure, not a demonstrated product red. Keep intended expectations when current behavior disagrees. Existing implementation was inspected to locate controls/endpoints, not to redefine requirements.

Verified in this implementation session:

- Real supplied login and exact ID; authenticated access to six core tables. The supplied test service-role key was subsequently verified through the administrator API (September 30, 2026).
- 20 cleanup/environment contracts passed, including test-local loading and isolation. Initial failures were observed before the safety/recovery fixes, including cancellation-budget reuse.
- 14 unit checks passed for AI isolation, Edge environment classification and cached-image storage.
- Targeted ESLint passed. Repository-wide TypeScript checking is blocked by the existing `disclosure/Disclosure` versus `Disclosure/Disclosure` import casing conflict; no errors were reported in the new acceptance TypeScript files.
- 8 browser smoke checks passed across desktop and mobile Chromium. Test catalog image URLs returned HTTP 400 in server logs and need valid seed assets.
- Four additional desktop checks passed against the real database: generation coin deduction, refund on mocked generation failure, zero-balance rejection, and concurrent spending of one coin. Temporary accounts were cleaned up. Isolated fixtures explicitly seed profiles because administrator-created users in this test project do not automatically receive one. The optional `amount_validation_failures` and `test_mode_violations` tables are missing; cleanup reports this and continues only for these two absent tables. Other cleanup errors remain fatal.
- Full payment, email, GA ingestion and real Printify execution **have not passed or been run** with complete configuration. No actual provider order/payment was created during the verified smoke run.

The remainder is implemented specification, not a green regression baseline. These acceptance tests may expose product gaps (for example prompt-only generation, skip-editing destination, cart continuation and GA monetary semantics). Diagnose a failure before assigning it to the product.

[Coverage traceability](COVERAGE.md) is generated with `npm run test:acceptance:coverage`. It reports ID references, not assertion completeness. Remaining unautomated or partial requirements include:

- Catalog empty/stale/availability races and every category's portrait/landscape/square visual quality; changed-preview invalidation.
- Full card authentication challenge outcomes, two-tab payment races and lost responses, webhook reordering/transient failures, browser-closed settlement, interrupted persistence and paid-but-unfulfilled recovery.
- Full shipping/tracking lifecycle, ineligible/concurrent cancellation, PayPal/Mollie refunds and refund failure/pending states; confirmation-email/invoice content reconciliation beyond the PDF/database snapshot.
- Account-private image-history policy (RES-06) remains explicitly undecided in the scenario document; shipped locale matrix and physical-device visual checks require review.

These are explicit coverage gaps, not skipped passing tests. Passing the current suite is not sufficient to mark all 121 scenarios complete.

Provider-reference contracts: [PayPal capture](https://developer.paypal.com/api/payments/v2?mark=payer_id), [Mollie payment](https://docs.mollie.com/reference/get-payment), [GA realtime report](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runRealtimeReport).
