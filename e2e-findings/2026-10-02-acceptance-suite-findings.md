# Acceptance suite findings — 2026-10-02

Branch under test: `implementingIntegrationTests` (merged with `dev` at #106), run against the parallel
test project `tgccxydchvujhrqyzqao` with `npm run test:acceptance -- --project=desktop -x`.
Fixes live on `fix/acceptance-suite-env`. Status at time of writing: the first 70 desktop tests and
the Stripe single-item purchase pass; the remaining groups are still being run with stop-on-first-failure.

## 1. Critical product bug: Stripe charged 100× the displayed total

- **Symptom**: a €44.97 cart created PaymentIntent `pi_3UM4v0…` for **449 700 cents (€4 497.00)**; a
  €24.98 cart produced €2 498.00.
- **Cause**: the checkout keeps amounts in cents (`totalInCents`) and passed them unchanged to the
  `create-payment-intent` edge function, which expects major units and multiplies by 100 itself.
  PayPal (`preparePayPalPayment`) and Mollie already divided by 100; only Stripe was wrong.
- **In production since** commit `a7440ed3` (2026-08-16, "Fix checkout pricing, shipping costs…").
- **Fix**: `usePaymentForm` sends `amount / 100` (commit `5f1e9e4`).
- **Action**: audit live Stripe payments since 2026-08-16 for overcharges.

## 2. Product bugs found by the suite and fixed

| Scenario | Reason the test failed | Fix |
|---|---|---|
| PAY-01, CUSTOM-02/04, CREATE-02, settlement | Edge functions rejected the browser origin `http://localhost:3107` (no `ALLOWED_ORIGINS` secret on the test project; defaults only allowed port 3000) → "Failed to send a request to the Edge Function". | `cors.ts` local defaults include port 3107. |
| GA-04, GA-05 | Ecommerce analytics reported `currency: "USD"` for a EUR store; `view_cart` / `begin_checkout` sent cent totals as the value (5697 instead of 56.97). | All ecommerce events report EUR; cart values converted to euros. |
| AUTH-06 / GA-02 | The "Continue with Google" button tracked a `login` event on click, so a canceled OAuth flow counted as a login. | Login is reported once when `/auth/callback` completes a non-email provider exchange. |
| BAG-01 / CUSTOM-02 | "Bag it" was enabled before product creation had stored `createdProductId` / `createdVariantId`; an early click logged `missing_created_product_id` and never navigated. | Bag actions disabled until both ids exist. |
| BAG-02 | "Bag it & create another" reset to product selection and a stale 1.5 s timer from product creation then pushed the flow to "Describe"; the slide track also kept a programmatic scroll offset that hid the new step. | Reset returns to the upload step without a preselected image; delayed advances only fire if still on their step; canvas resets window/track/slide scroll on step change. |
| CREATE-02 | After a failed creation, an off-screen "Bag it" (final review step is always mounted) was still reachable. | Inactive steps are wrapped with `inert` + `aria-hidden` (`StampSlide`). |
| GEN-14 | A failed coin-balance fetch rendered as "0 coins" with no error or retry. | `CoinsDisplay` shows an error with retry; generation disabled while the balance is unknown. |
| RES-03, AUTH-04, AUTH-02 | Middleware rate limits (auth 5/15 min, image generation 10/min) and the login route's database limits (3/email/h, 10/IP/h) are exhausted by one machine driving the suite. | Limits are env-overridable; the acceptance app server raises them. Production defaults unchanged. |
| AUTH-05 | The login ↔ register switches ("Create one now" / "Log in") had no accessible name matching "create account" / "login". | Explicit `aria-label`s. |
| CUSTOM-03 (6 cases) | White-only policy not implemented: mugs/socks/pillows/canvas showed no swatch, totes offered several colors, journals were not recognised as notebooks, "Pillow Case" was detected as a phone case. | Single white swatch for the six categories; longest-keyword category detection; notebook category; server + client color validation allow only white for totes and notebooks. |
| PAY-01 | `orders.payment_provider` was never written (return pages passed only `paymentMethod`). | Provider threaded through hook → service → mapper. |
| PAY-01 / ORDER-01 | Orders created from the cart recorded `shipping_cost 0` and a total excluding the €4.99 the customer paid. | `calculateOrderTotals` applies the cart's shipping rule. |

## 3. Harness / fixture problems fixed

- Cart fixtures referenced Printify products that no longer exist; regenerated from live shop products.
- `TEST_PRODUCT_NAME`, `TEST_SOCK_PRODUCT_NAME`, `TEST_MUG_PRODUCT_NAME` named products absent from the
  test catalog; `TEST_PRINTIFY_PRODUCT_ID=145` was a blueprint id, not a shop product id.
- GA payload parser split on `\n` only, leaving a trailing `\r` ("EUR\r").
- GEN-04 asserted filter guidance in the textarea; guidance is merged at submission, so the submitted
  prompt is asserted instead. GEN-13 called `get_user_coins(user_id)`; the RPC takes `p_user_id`.
- CART-03 locator broke when the master checkbox relabelled itself; `setCheckbox` now re-presses when a
  keypress landed before hydration (intermittent CART-02).
- Purchase verification read `printify_order_id` the instant the order turned paid; it now waits for the
  Printify order to be recorded. Order money columns are asserted in cents (the app convention).
- Printify order reconciliation paged with `limit=100`, which Printify rejects (max 50); every creation
  intent ended "cleanup failed" and blocked the next run's preflight.
- Printify keeps a new order in `pending` for a short period and rejects cancellation until it is `on-hold`;
  the cancel helper retried four times within seconds and reported otherwise-green purchases as failed in
  teardown (the shipping address, Damrak 1 / Amsterdam / 1012LG / NL, was valid). It now waits for a
  cancellable state first.
- Web server start timeout raised to 5 minutes (first compile after code changes exceeded 2 minutes).
- Failing tests now attach `api-diagnostics` (API calls, failed responses, console warnings/errors).

## 4. Environment actions required (cannot be done from the harness)

1. **Test project migrations**: `promocodes` lacks `is_active`, `expires_at`, `max_uses`, `used_count`
   (migration `20260915000011` only partially applied) → CHECK-05 / CHECK-06 are skipped until
   `supabase db push` runs against `tgccxydchvujhrqyzqao`. Also apply `20261001000000` (drops the stale
   4-argument `process_refund_atomic`).
2. **Missing credentials** in `.env.test.local` (tests skipped): `MOLLIE_API_KEY` (Mollie purchases),
   `TEST_GA_PROPERTY_ID` + `TEST_GA_READ_ACCESS_TOKEN` (GA-01 ingestion), `BREVO_API_KEY` +
   `TEST_EMAIL_TEMPLATE` + `TEST_IMAP_*` (AUTH-01/03/07), `TEST_GOOGLE_EMAIL/PASSWORD` (AUTH-06).
3. **Env file values** to update locally: product names above, `TEST_PRINTIFY_PRODUCT_ID=6a9c5a973a288b0c610ede80`,
   `TEST_PRINTIFY_VARIANT_ID=103599`, `STRIPE_WEBHOOK_SECRET` = the test project's endpoint secret.
4. Deploy edge functions to the test project after merging (`npm run supabase:deploy:test`).

## 5. Other observations

- `create-credit-payment` derives the charge from `CREDIT_PRICE_CENTS` (default 10) while
  `CREDIT_PACKAGES` prices 100 credits at €9.99; the server's amount check will reject these unless
  `CREDIT_PRICE_CENTS` matches. Not covered by the suite.
- The test project is missing the optional audit tables `amount_validation_failures` and
  `test_mode_violations` (cleanup reports and continues).
- `complete-user-journey.e2e.spec.ts` and the older stamp Playwright specs under `src/features/*/__tests__`
  predate the stamp redesign and fail on stale selectors; they are unrelated to this suite.
