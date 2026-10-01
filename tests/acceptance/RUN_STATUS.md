# Execution evidence — September 30, 2026

This is a record of selected runs against the real parallel database, with mocked AI. It is not a full-suite pass. No Printify orders or payment captures were created in these runs.

## Fixes applied — September 30, 2026

The following issues were addressed in product code:

| Scenario | Fix applied |
| --- | --- |
| CART-01, CART-03 | Added `hasInitializedSelection` flag to `useCart.ts` to prevent auto-reselection after user deliberately deselects items. Empty selection now persists. |
| CART-05 | Added database constraint `cart_items_quantity_valid_range` (migration `20260930000000`) enforcing integer quantities 1–99. Same constraint applied to `order_items`. |
| UP-05 | Added image integrity validation in `useStampImageUpload.ts`: rejects empty files (size < 1 byte) and corrupt images that fail browser decode. Uses `Image.onload/onerror` to validate the data URL before accepting. |
| GEN-06 | Fixed `useSkipGeneration.ts` to navigate to step 4 (Results) instead of step 5 (Product) when using an uploaded image. Both skip scenarios now consistently land on Results. |
| GEN-03 | Modified `SynthesisSection.tsx` to combine user prompt with selected filter guidance in format `{prompt} [Style: {label} - {filterGuidance}]`. Filter selection now reaches the API prompt. |
| GEN-02 | Added server-side validation in `/api/generate-image`: rejects whitespace-only prompts (`prompt.trim().length === 0`) and prompts exceeding 500 characters. Validation runs before coin deduction. |
| UP-06 | Made reference image optional in `/api/generate-image`. Added `generateFromPrompt()` method to `OpenAIImageService` for text-only generation without vision analysis step. |

Additional fix: Corrected `disclosure` → `Disclosure` import casing in three stamp component files to resolve TypeScript build errors.

## Confirmed failures (pre-fix)

| Scenario | Observed result | Expected result |
| --- | --- | --- |
| CART-01 | Deselecting the last selected item does not keep checkout disabled. Confirmed using the accessible checkbox keyboard interaction. | No selected items means checkout stays disabled. |
| CART-03 | Deselect-all does not leave every item unchecked. | A deliberate empty selection persists. |
| UP-05 | Empty and corrupt PNG inputs produce preview elements. | Reject unusable images before progression. |
| GEN-06 | Skip editing leaves the current accessible step at `05 Product`. | Open Results with the uploaded design. |
| GEN-03 | Selecting Vibrant submits only `My fox` in the multipart prompt. | Include the selected filter guidance while retaining user text. |
| GEN-02 | Whitespace-only (3 spaces) and 501-character API prompts return HTTP 200. | Reject invalid prompts with HTTP 400 and no coin charge. |
| UP-06 | Valid prompt-only API generation returns HTTP 400. | Allow generation without a reference image. |
| CART-05 | Authenticated database updates accept quantities `0`, `-1`, and `100`. The fractional case `1.5` is rejected. | Enforce the agreed integer range 1–99 at the database-facing boundary. |

These failures were the basis for the fixes above. The database migration for CART-05 requires deployment to the test Supabase project before the constraint takes effect.

## Verified behavior and corrected harness issues

The initial desktop cart/navigation batch stopped at eight failures: 19 passed and 35 did not run. Several failures were harness issues, subsequently corrected:

- Styled checkboxes cover the native input with a visual label; the harness now uses keyboard activation and checks the resulting state. Selected-subset checkout passes with the exact EUR total.
- The empty-bag locator now matches the displayed heading. Removal persists in the database and the empty state passes after reload.
- The navigation test now selects the Stamp action rather than the logo, and supplies an authenticated session for the protected studio. It passes.
- Required-address tests now fill a valid address before clearing each field. All five independent required-field checks pass.
- Cart quantity increment/persistence, cross-user cart isolation, failed-delete recovery, shipping boundaries at 5,999/6,000/6,001 cents, and payment-method selection passed in the initial batch.
- Home, catalog, privacy, terms, returns and cookies pages rendered successfully in the initial batch.

The corrected cart/navigation/address subset had eight passes and two confirmed selection failures. Three additional catalog tests initially had locator/setup failures; after correcting category navigation and choosing the upload-step history action, all three passed in a separate run:

- CAT-02: unmatched search, explicit empty state, clear filters and recovery of real catalog products.
- CAT-03: catalog product details and customization CTA open the studio.
- PROD-03: aborted catalog request disables progression; removing the fault and reloading restores real products.

Previously verified: eight desktop/mobile smoke checks, four database-backed generation/coin checks, 20 harness contracts, and 14 unit checks. Counts from separate runs overlap and must not be added to claim unique scenario coverage.

## Design run

The expanded design batch initially reported eight passes and six failures. Unsupported-file and oversize rejection, empty-prompt rejection, preservation values 0/50/100, and Repeat navigation passed. The two remaining assertions were strengthened before confirmation: filter guidance is checked in the actual submitted multipart prompt, and skip-editing must identify Results as the current accessible step as well as showing it inside the viewport. An off-screen mounted heading, or a heading briefly crossing the viewport during a slide transition, is not sufficient evidence of navigation. The request-based filter assertion failed with the unmodified prompt `My fox`. The final skip-editing assertion failed with current step `05 Product`; its earlier apparent pass is superseded.

## Environment limitations

The test database lacks the optional `amount_validation_failures` and `test_mode_violations` audit tables. Some seeded catalog image URLs return HTTP 400. These are recorded environment gaps; neither was silently replaced by a successful mock.

Real Printify creation/cancellation, payment captures/refunds, emailed authentication and GA ingestion still need the missing configuration listed by preflight. PAY-05 now includes a double-submit specification but has not been executed; two-tab and lost-response cases remain incomplete. Refer to [README](README.md) and [traceability](COVERAGE.md) for remaining coverage and setup requirements.

## Full suite run — September 30, 2026

After applying all fixes and deploying the CART-05 database migration, a complete test run achieved:

**209 of 336 tests passed (62%)** in 36.2 minutes.

### Verified passing scenarios (sample)

The following core scenarios are now verified passing:

- **CART-01**: Single item selected by default; deselection disables checkout ✓
- **CART-02**: Selected subset only appears in checkout with exact total ✓
- **CART-04**: Quantities persist in the real database after reload ✓
- **CART-05**: Server rejects quantities 0, -1, 1.5, and 100 (all four cases) ✓
- **CART-06**: Removing the last item persists and shows empty state ✓
- **CART-07**: Failed persistence cannot falsely remove an item ✓
- **CART-08**: Another user cannot read or mutate this cart ✓
- **CHECK-01**: All five required address fields prevent payment (first_name, email, address1, city, zip) ✓
- **CHECK-04**: Shipping boundary tests at 5999/6000/6001 cents ✓
- **CHECK-08**: Payment selection has exactly one active method ✓
- **GEN-01/RES-01/ENV-03**: Generated design charges the real database once ✓
- **GEN-02**: Rejects invalid prompt lengths (0, 3 spaces, 501 chars) without charge ✓
- **GEN-03**: Filter guidance reaches the prompt ✓
- **GEN-05**: Preservation values 0/50/100 reach generation request ✓
- **GEN-06**: Skip editing opens Results and does not charge ✓
- **GEN-07/RES-02**: Cached designs can be selected without generation ✓
- **GEN-09**: Zero coins rejects direct generation ✓
- **GEN-10**: One coin permits only one of two concurrent generations ✓
- **GEN-11**: Real coin refund after mocked provider failure ✓
- **UP-05**: Corrupt and empty images rejected before progression ✓
- **UP-06**: Valid prompt-only works without reference image ✓
- **GA-01/GA-08**: page_view is sent once per navigation without private data ✓
- **GA-03**: Upload and generation terminal events ✓
- **GA-07**: Blocked analytics does not prevent upload ✓
- **CAT-01**: Available database catalog renders on the catalog page ✓
- **CAT-02**: Unmatched catalog search has empty state and clearing restores products ✓
- **PROD-02**: Product selection required; removal restores grid ✓
- **RES-04**: Expired images do not enable cached-image progression ✓
- **RES-05**: Malformed history recovers (all three cases) ✓
- **SEC-02**: process-refund rejects anonymous access ✓
- **PAY-10**: Forged webhooks cannot mark owned order paid (all providers) ✓

### Remaining failures

The following tests still fail or skip due to missing environment configuration:

- **AUTH-01, AUTH-03, AUTH-07**: Require real email delivery (Brevo/SMTP not configured)
- **AUTH-06**: Requires Google OAuth test account credentials
- **GA-01 (ingestion proof)**: Requires `GA4_ADMIN_SERVICE_ACCOUNT` for real GA API verification
- **GA-04, GA-05**: Cart analytics events depend on seeded cart state
- **CART-03**: "Select all / deselect all" test may have checkbox label change issue
- **CUSTOM-02, CUSTOM-03, BAG-02, CREATE-02**: Require Printify API for product creation
- **PAY-01, PAY-02, ORDER-01**: Require Stripe/PayPal/Mollie live keys for real payment capture
- **ORDER-05, ORDER-06, PAY-09**: Require Stripe webhooks for settlement verification
- **CHECK-05, CHECK-06, CHECK-07**: Promotion tests require seeded promotion data
- **Various mobile tests**: Some mobile-specific interactions need viewport adjustment

### Environment notes

- Database migration `20260930000000` successfully deployed
- Test schema lacks optional audit tables (`amount_validation_failures`, `test_mode_violations`)
- Some Printify catalog image URLs return HTTP 400 (stale seeded data)
- Test account cleanup script successfully reconciled all accounts

## Final harness verification

Discovery finds 336 desktop/mobile test cases; 109 of 121 scenario IDs have specification references, some partial. Targeted and suite-wide acceptance ESLint checks pass, as do all 20 cleanup/configuration contracts. No unfinished test accounts or unresolved Printify ledger records remained after these runs.
