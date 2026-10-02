# Acceptance suite — status report (2026-10-02, end of session)

Branch: `fix/acceptance-suite-env` (PR #111 → `implementingIntegrationTests`), 36 commits on top of the suite.
Environment: test Supabase project `tgccxydchvujhrqyzqao`, Printify shop 25847763, Stripe/PayPal sandbox.
Companion document with per-failure reasons: [`2026-10-02-acceptance-suite-findings.md`](./2026-10-02-acceptance-suite-findings.md).

## 1. What was achieved

### Desktop project (168 tests in 15 files)

| Category | Count | Detail |
|---|---|---|
| Verified passing after fixes | **~150** | 129 passed in one uninterrupted stop-on-first-failure sequence (analytics → settlement/ORDER-05), plus ORDER-06 and the full stamp flow (21/21) verified in isolation. No test that was fixed has regressed on rerun. |
| Not yet reached in a post-fix sequence | 4 | PAY-09 (duplicate Stripe webhook events), PAY-10 ×3 (forged webhooks). Both passed in the September 30 baseline; nothing touched since should affect them, but they are unverified on this branch. |
| Skipped — need your action | 14 | See §3. |

The run was stopped on request at 70/70 passing while repeating the sequence from the top after the last fix.

### Product bugs found by the suite and fixed (all on the branch, all deployed to the test project)

Severity order:

1. **Stripe charged 100× the displayed total** — checkout sent cents to a function that expects euros. In production since 2026-08-16 (`a7440ed3`). *Audit live Stripe payments.*
2. **Client-controlled payment amounts** — `create-payment-intent` validated prices only for blueprint items; normal product-id carts could pay any amount. Now priced from the caller's own cart with shipping rule and server-validated promo.
3. **PayPal orders failed for long emails / multi-item carts** — `custom_id` exceeded PayPal's 255-char cap.
4. **`cancel-order` claimed success while Printify rejected** — new orders are uncancellable for ~20 s; local order was marked cancelled while production continued. Now retries, verifies remotely, returns 409 if unconfirmed.
5. **Order totals excluded shipping; `payment_provider` never stored; order items / invoice lines named "Custom Product".**
6. **Analytics**: USD instead of EUR, cent values, `purchase.value` including shipping, Google login counted on button click.
7. **Stamp flow**: Bag it enabled before the product existed; "create another" landed on the wrong step (stale timer + scrolled slide track); off-screen steps reachable by assistive tech; coin-fetch failure shown as "0 coins".
8. **Checkout**: payable summary rendered for a cart with nothing selected.
9. **White-only color policy** for mugs, canvas, notebooks, pillows, socks, totes (UI + server + client validation); category detection fixed ("Pillow Case" was a phone case).
10. Rate limits (middleware auth/image generation, DB login limits) made env-overridable so one machine can drive the suite; production defaults unchanged.

### Harness fixes

CORS default for port 3107; fixtures regenerated from live shop products; CRLF-safe GA payload parsing; hydration-tolerant checkbox helper; fulfillment wait before asserting; Printify page size 50; cancellation waits for `pending`/`cost-calculation` to clear; 90 s client timeout for edge-function calls; 5-minute server start; `api-diagnostics` attachment (API calls, failed request/response bodies, console errors) on every failing test; several spec assertions aligned with the app's conventions (money in cents, `#`-prefixed order numbers, `left_leg`/`right_leg`, printed placeholders only, RPC parameter names).

### Test-project data corrected (test DB only)

Catalog providers for Ceramic Mug EU (441 → provider 30) and Spun Polyester Pillowcase (229 → 10); blueprints 462/534/558 deactivated (not in Printify); journal retitled "Spiral Journal Notebook EU"; `STRIPE_TEST_*` secrets set; exhausted auth rate-limit rows cleared.

## 2. What is missing

- **4 desktop tests not re-verified** on this branch: PAY-09, PAY-10 ×3.
- **14 desktop tests skipped** pending credentials/migration (§3).
- **Mobile project (168 tests) not run** after any fix. Expect mostly the same results, with the mobile-specific interactions (sticky footer actions, viewport assertions) as the likely differences.
- **Not merged to `dev`**: PR #111 targets `implementingIntegrationTests`; that branch itself is not in `dev` yet. Production is still running the pre-fix payment code.
- **Production edge functions not redeployed** with any of the fixes (only the test project was).
- Known flake: one 90 s timeout on `create-custom-product` (CUSTOM-04) in ~25 runs, latency on the Printify/edge side.

## 3. Next actions — Bruno

Ordered by impact.

1. **Audit live Stripe payments since 2026-08-16** for 100× charges and refund affected customers. Merge the fix path (#111 → `implementingIntegrationTests` → `dev`) and deploy edge functions to production (`npm run supabase:deploy` against the linked production project) as soon as reviewed; until then production still overcharges.
2. **Push migrations to the test project** (unblocks CHECK-05 ×2, CHECK-06 ×3):
   ```bash
   cd .claude/worktrees/acceptance-tests
   set -a; source .env.test.local; set +a
   SUPABASE_ACCESS_TOKEN="$TEST_PERSONAL_TOKEN" npx supabase link --project-ref tgccxydchvujhrqyzqao
   SUPABASE_ACCESS_TOKEN="$TEST_PERSONAL_TOKEN" npx supabase db push
   ```
   Confirm the plan includes `20260915000011_harden_promocodes` and `20261001000000_drop_stale_process_refund_atomic_overload`.
3. **Fix `.env.test.local`** (your copy; my working copy already has the first group):
   - `TEST_PRODUCT_NAME=Unisex Heavy Cotton Tee`, `TEST_SOCK_PRODUCT_NAME=Sublimation Crew Socks`, `TEST_MUG_PRODUCT_NAME=Ceramic Mug EU`
   - `TEST_PRINTIFY_PRODUCT_ID=6a9c5a973a288b0c610ede80`, `TEST_PRINTIFY_VARIANT_ID=103599`
   - `STRIPE_WEBHOOK_SECRET=<the test project's endpoint secret, whsec_Z1xU…>`
   - `PAYPAL_TEST_PASSWORD=<real sandbox buyer password>` (currently equals the email) → unblocks PayPal purchases ×2
4. **Add missing credentials** (each unblocks the listed tests): `MOLLIE_API_KEY` (Mollie purchases ×2); `TEST_GA_PROPERTY_ID` + `TEST_GA_READ_ACCESS_TOKEN` (GA-01 ingestion); `BREVO_API_KEY` + `TEST_EMAIL_TEMPLATE` + `TEST_IMAP_HOST/USER/PASSWORD` (AUTH-01/03/07); `TEST_GOOGLE_EMAIL/PASSWORD` (AUTH-06).
5. Decide the **white-only color policy** is really wanted for totes and notebooks (the scenario document asked for it; the code previously allowed black/natural totes). The change is in the branch; revert that commit if the policy is wrong.
6. Optional hardening seen along the way: `CREDIT_PRICE_CENTS` (default 10) does not match `CREDIT_PACKAGES` prices (100 credits = €9.99), so credit purchases would be rejected by the server's amount check; the customization step offers apparel sizes when a product has no size options.

## 4. Hand-off — next agent

**Where things are**
- Worktree: `.claude/worktrees/acceptance-tests`, branch `fix/acceptance-suite-env` (pushed). `.env.test.local` and `.acceptance/` (ledger, reports) live there and are gitignored. `node_modules` installed there (`npm ci`; the branch adds `imapflow`, `mailparser`).
- Memory notes: `stamp-acceptance-suite.md` and `stamp-e2e-test-project.md` in the Claude project memory hold the operational gotchas.

**How to run**
```bash
cd .claude/worktrees/acceptance-tests
npm run test:acceptance:preflight && npm run test:acceptance:contracts && npm run test:acceptance:unit
PLAYWRIGHT_JSON_OUTPUT_NAME=.acceptance/run.json npm run test:acceptance -- --project=desktop --reporter=list,json -x \
  --grep-invert "GA-01 ingestion|AUTH-01 |AUTH-03 |AUTH-07 |AUTH-06 Google sign-in|CHECK-05|CHECK-06|(paypal|mollie) (single item|selected subset) real purchase"
```
Drop entries from `--grep-invert` as Bruno's actions land. Read failures from `.acceptance/run.json` (each failing test carries an `api-diagnostics` attachment). Do **not** edit source while a run is active: the dev server recompiles mid-test and produces false failures.

**Suggested order**
1. Resume the desktop sequence to the end (settlement PAY-09, stamp, webhook-integrity are what remains unverified).
2. Run `--project=mobile` the same way; expect sticky-footer/viewport differences.
3. Once credentials/migration are in, remove the corresponding exclusions and run those tests.
4. After merge to `dev`, redeploy production functions and re-run the Stripe purchase against production keys in a controlled way (small real charge, then refund).

**Gotchas that cost time**
- Printify: new orders are uncancellable for ~20 s (`pending` → `cost-calculation` → `on-hold`); orders list page size max 50; shop product objects include an empty `all` placeholder; catalog provider ids must exist for the blueprint.
- If preflight reports unfinished accounts or unresolved ledger entries: `npm run test:acceptance:cleanup`; a stuck `.acceptance/printify/*.json` can be resolved by hand once the Printify order is cancelled (set `state: "canceled"`).
- Login rate limits: the acceptance server raises them via env; if a run was started without it, clear `auth_email_rate_limits` on the test DB.
- Money: everything in the app is in cents (`formatPrice` divides by 100); edge payment functions take euros.
- The harness Supabase client times out at 15 s except for `/functions/v1/` calls (90 s).
