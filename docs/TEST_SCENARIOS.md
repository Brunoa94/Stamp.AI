# Stamp AI: enhanced test scenarios

Reviewed against the repository on 2026-09-28. This document expands the supplied homepage → Stamp → cart → checkout scenarios into a regression and acceptance suite. It is a test specification, not a test execution report. Existing test files were inspected; no application tests or provider transactions were run for this review.

## Evaluation of the original suite

The original suite has good coverage of the main purchase journey, selected cart items, quantity propagation, and product customization. Retain those checks. The main improvements are:

- Replace “works as expected” and “updates state” with observable UI, request, database, and provider assertions.
- Give each case an ID, priority, prerequisites, action, and measurable outcome. Separate invalid input from a provider declining an otherwise valid payment request.
- Cover failures, retries, duplicate submissions, concurrency, stale data, and session expiry alongside successful actions.
- Add catalog browsing, password recovery, coin refunds, promotions, order history, cancellation, invoices, accessibility, and mobile purchase flows.
- Verify payment, order creation, and fulfillment separately. Returning from a provider does not prove payment; payment success does not prove fulfillment.
- Distinguish implemented behavior, desired acceptance requirements, and unresolved product decisions. Code is evidence for locating gaps only. Acceptance expectations come from the user requirements and approved product contracts; they must not be rewritten to make current code pass.

## Corrections and decisions to resolve

These differences should be reviewed before turning the corresponding cases into release gates. Keep the original requested behavior visible until the product decision is recorded.

| Topic | Original expectation | Repository evidence and treatment |
|---|---|---|
| Registration | Register, then log in | [Auth schemas](../src/shared/schemas/auth.ts) start signup with email; the password is chosen after email confirmation. Test the entire verification/password flow before signing out and logging back in. |
| Filters | Selected guidance becomes part of the generation prompt | [SynthesisSection](../src/features/stamp/ui/sections/SynthesisSection/SynthesisSection.tsx) updates `selectedSuggestionId`, but generation sends `prompt`, `preservation`, and `removeBackground` without using that ID. Suspected implementation gap: retain GEN-03 as the requested acceptance behavior and verify the outgoing request. |
| Preservation | Append slider information to the final prompt | The generation hook sends a separate `preservation` field. Assert its value and downstream use, without requiring literal text concatenation. |
| Skip editing | Always navigate to Results | [useSkipGeneration](../src/features/stamp/lib/hooks/useSkipGeneration.ts) prioritizes an uploaded image and goes to product selection; cached images alone go to Results. GEN-06 retains the requested Results destination as the acceptance requirement; the shortcut is an implementation discrepancy, not the test oracle. |
| Coins | Deduct a coin when generation is requested | [Generation API](../src/app/api/generate-image/route.ts) deducts server-side before paid generation and attempts a refund on generation failure. Validation failures must not cost a coin. A browser timeout alone does not establish a server failure. |
| Image history | Show all locally stored images | [Image storage](../src/features/stamp/lib/services/generatedImagesStorage.ts) retains up to 20 images for 24 hours. Test expiry, eviction, and unusable storage. |
| Product colors | White only for mugs, canvas, notebooks, pillows, socks, and totes | [Server color validation](../supabase/functions/_shared/colorValidation.ts) permits black/white/natural totes and imposes no notebook color restriction. Mugs/canvas/socks/pillows are white-only there. CUSTOM-03 enforces the requested white-only policy; current code is a discrepancy unless the user explicitly changes the requirement. |
| Placement | “Store statically the current number positioning” | Interpret this as versioned, approved placement fixtures per blueprint/provider/print area, checked against preview and outgoing payload. Record actual approved values; do not invent universal coordinates. [Customization handlers](../src/features/stamp/lib/hooks/useCustomizationHandlers.ts) intentionally omit client placement for automatic-placement products such as mugs. |
| Create another | Return to the first step | [Flow store](../src/features/stamp/lib/stores/stampFlowStore.ts) retains the selected design and resets product/customization state at product selection. BAG-02 retains the requested first/upload-step destination as the acceptance requirement; current routing is an implementation discrepancy. |
| Payment test mode | Enable test mode in all cases | [Test-mode safeguard](../supabase/functions/_shared/testModeSafeguard.ts) can force `is_test=false` in environments it identifies as production, including hosted `supabase.co` URLs. A client flag is insufficient. Verify effective provider mode and block real fulfillment before transactional tests. |

## Execution contract

**Priority:** P0 = purchase, money, access, or data-integrity release gate; P1 = core regression; P2 = extended quality coverage.

**Level:** B = browser/UI test; I = API/database/provider integration test; U = unit/component test; M = manual visual or assistive-technology check. Multiple levels mean complementary checks, not that every combination needs a full browser purchase.

Every row supplies setup/actions and an expected result. The mandatory requirements below supersede earlier implementation observations and any conflicting legacy test-guide instructions. Expand listed variants into independent runs with their own outcome. All new cases begin **Not run**. Desired behavior may reveal a missing feature or defect; no row implies that the application already passes it. Mark unresolved business-policy variants **Blocked: product decision**, never Passed or silently skipped.

### Mandatory database and TDD approach

- **All tests run in the environment backed by the real parallel test database:** `https://tgccxydchvujhrqyzqao.supabase.co`. It runs alongside production, in a separate Supabase project; never repoint tests at production or use a mocked/in-memory database to pass acceptance checks. Pure calculation/component tests need not perform artificial database writes, but any database interaction must use this real test project.
- Apply the matching schema migrations, RLS policies, functions, storage configuration, auth redirects, and fixture data to the test project. Check actual schema/configuration parity before runs. Exercise ordinary requests with real user sessions so service-role reads cannot hide RLS failures; reserve privileged access for setup, inspection, and cleanup.
- Preflight must assert the exact allowed test project for browser, Next.js server, Edge Functions, callback handlers, and cleanup tools. Environment-file precedence must not redirect one layer elsewhere. Reject a production or unknown project. Independent run IDs prevent parallel tests from affecting each other.
- **Every new or changed test follows requirement-led TDD:** write the acceptance example first, observe a meaningful failing assertion (red), implement the smallest application change that satisfies it (green), then refactor while keeping the assertions passing. Record red and green evidence. A missing secret, network outage, or syntax error is a setup failure, not the required red evidence.
- Derive expected results from the user requirements, approved event contracts, and independently calculated fixtures. Do not follow internal function calls, mirror branching, copy implementation calculations, or weaken expectations to match existing flows. The repository map helps locate changes; it does not define correctness.
- Existing tests can be retained as supplemental regression coverage, but do not claim they were written with TDD retroactively. Implement missing cases test-first. UI assertions focus on outcomes; integration assertions establish persistence, access, financial, and provider invariants.
- The hosted-project production heuristic in `testModeSafeguard.ts` is a **preflight blocker to fix test-first**: explicitly distinguish the allowed parallel test project from production while preserving real production protection. A production-mode app build for browser testing must not accidentally switch payment/fulfillment behavior to live mode.

### Mandatory real Printify orders and cancellation

Every scenario that creates an order must create and verify a real order in Printify shop `25847763`. Merely creating a product/mockup or inserting a local order is insufficient. Negative scenarios that must not create an order must instead prove that no corresponding Printify order exists. Keep the shop on manual approval/no automatic production; verify this before creation. Tests must not intentionally send physical products into production, even when exercising simulated production/shipping status handling.

1. Register every real Printify order ID immediately after creation in a durable, run-owned cleanup ledger, with shop ID, test ID, and application order ID. Include orders from retries and partially failed tests. Use a stable external correlation identifier so a lost creation response can be reconciled rather than silently leaking an order.
2. At the end of **each test**, immediately enter a guaranteed `finally`/fixture teardown and attempt cancellation for every created order. Do this whether the assertions passed, failed, or timed out; do not defer normal cancellation until the end of the suite. An order intentionally canceled during its scenario still needs provider-state verification during cleanup.
3. **Retry policy: one initial cancellation attempt plus up to three retries, four attempts total per order.** A failure includes rejected cancellation, transport errors, timeout, or inability to verify the canceled provider state. Retry only unresolved orders, using bounded request timeouts and short backoff (for example 1, 2, and 4 seconds); respect a provider retry delay within a configured teardown deadline. Exhausting the deadline is a failure, not success.
4. After each attempt, read the real order from Printify and verify cancellation. A 2xx response, local `cancelled` row, `auto_cancel` flag, generic “cannot cancel” error, or assumed already-canceled status is insufficient. If a response was lost but provider state confirms cancellation, cleanup succeeds without another mutation.
5. If cancellation remains unverified after the retries, **fail the test and the overall run**, even if its functional assertions passed. Preserve the original assertion failure as well as cleanup errors. Report the unresolved order/shop IDs, attempt count, and redacted responses. Continue attempting cleanup for every other registered order.
6. Do not delete unresolved orders from the cleanup ledger or remove the records needed to reconcile them. Verify cancellation first, then clean up run-owned database/product artifacts where appropriate. A later successful cleanup must not erase the failed run result.
7. Give teardown its own timeout budget. Because a killed process cannot run `finally`, use the durable ledger with an out-of-process run finalizer and a startup orphan check. An aborted run or remaining unverified order cannot be reported as passed. Automatic whole-test retries must not conceal a cancellation failure or generate additional orders before reconciliation.

The existing `auto_cancel` branch in `create-printify-order` performs a single attempt and returns a cancellation result; it does not satisfy this protocol. The existing cancellation endpoint can treat some non-cancellable states as canceled locally. Tests must verify Printify directly rather than inherit those assumptions.

### Credential and environment readiness

No secret values belong in this document, fixtures, logs, or committed files. The following is a configuration inventory, **not credential validation**: no remote connection or transaction was attempted in this review. Locally present keys may point at another project/account or be placeholders and must be verified against the parallel environment before use.

| Service | Supplied / found | Additional requirement or verification |
|---|---|---|
| Supabase | User supplied test URL and anon key for `tgccxydchvujhrqyzqao`. | `SUPABASE_SERVICE_ROLE_KEY` for **this exact test project** is not supplied in the message; a local entry exists but its association is unverified. Test Edge Functions also need matching `SUPABASE_URL`/`SUPABASE_ANON_KEY` and server secrets. Verify schema, policies, functions, storage, and auth redirect setup. |
| Test users | `TEST_USER_EMAIL` / `TEST_USER_PASSWORD` entries exist locally. | Verify/provision run-owned users in the parallel project, with the required coin/account states. Do not assume existing users belong to this database. |
| Stripe | User supplied test publishable and secret keys. `STRIPE_WEBHOOK_SECRET` exists locally. | Verify webhook signing secret belongs to a reachable endpoint for this test deployment and matching Stripe test account; configure all server/Edge Function secrets. |
| Printify | User supplied token and shop ID `25847763`; server-named entries also exist locally. | Edge Functions expect `PRINTIFY_API_TOKEN` and `PRINTIFY_SHOP_ID`, not just `NEXT_PUBLIC_*` names. Provision token server-side; verify shop ownership, required scopes, available fixtures, and manual approval settings. Keep the privileged token out of browser bundles. |
| PayPal | Client/secret/mode entries and public client ID exist across local env files; none supplied in this message. | Verify matching sandbox `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE=sandbox`, and browser client ID. `PAYPAL_WEBHOOK_ID` and sandbox buyer credentials were not found among checked entries; supply/configure them for webhook and browser payment cases. |
| Mollie / iDEAL | No `MOLLIE_API_KEY` found in checked local env files or supplied message. | Supply a Mollie test API key and configure the test profile/method plus reachable return/webhook endpoints required by the integration. |
| Google Analytics | `NEXT_PUBLIC_GA_MEASUREMENT_ID` exists locally. | Verify or supply a dedicated **test** GA4 web stream measurement ID, separate from production reporting, plus read access to its DebugView/Realtime for receipt evidence. Browser gtag delivery does not require a Measurement Protocol API secret. |
| Email / Google login | No test inbox access or Google OAuth test-account setup supplied. No `BREVO_API_KEY` found in checked entries. | Configure the parallel project's Google OAuth client/callbacks and a controlled Google test account. Provide automated inbox access for signup/reset tests; configure test mail delivery and Brevo credentials/sender where that application's email path requires them. Dashboard-managed secrets may already exist but were not inspected. |
| AI images | No AI credentials supplied or expected. | Mock the external generation adapter in every test; deterministic valid images plus failure/timeout variants. Keep the real database and coin accounting active. |

A missing/unverified prerequisite blocks the affected real integration cases and is reported explicitly; it must not silently switch them to mocks or label them passing. The user-supplied Stripe secret and Printify token have been shared in chat; rotate those credentials before execution and provide replacements through local/server secret configuration, retaining only names in tracked files.

### Shared setup and fixtures

1. Record commit, build URL, browser, viewport, locale, and effective service configuration. Run the suite against the real parallel test Supabase project specified below, a controlled mail inbox, payment-provider test credentials, and the real configured Printify shop with automatic production disabled. Confirm effective server/payment mode and shop settings before any order. Do not rely on `is_test` alone or weaken the safeguard to make tests run.
2. Provision independent users: verified user A with a known balance, verified user B for ownership checks, unverified signup, and users with exactly zero and one coin. Allocate users/carts per worker; parallel tests must not share mutable balances or carts. Use supported auth provisioning, not direct inserts into auth internals.
3. Seed explicit blueprint/provider/variant fixtures for apparel, mug, canvas, notebook, pillow, socks, and tote. Include available/unavailable variants, one-size and size-only products, and approved placement fixtures with normalized coordinates, scale, angle, print-area IDs, image dimensions, and a reference preview.
4. Prepare valid JPEG/PNG/GIF images, transparent PNG, portrait/landscape/square images, a high-resolution image under the byte limit, corrupt and empty images, unsupported files, and files at `10 * 1024 * 1024 - 1`, exactly that limit, and one byte over. Current client upload types are JPEG/PNG/GIF and the limit is 10 MiB; exercise downstream compatibility too.
5. Prepare prompts of 0, whitespace-only, 1, 499, 500, and 501 characters, plus Unicode and line breaks. Current synthesis UI limit is 500 characters. Freeze time for expiry/reset boundaries.
6. Prepare empty, single-item, and three-item carts with different variants and prices; valid/invalid/expired promotions; equal/different billing and shipping addresses; and provider success, decline, cancel, pending, and timeout responses. Use fixtures approved by each configured provider rather than guessed card numbers or statuses.
7. Mock all external AI image generation with deterministic success/error/timeout responses; no AI keys are supplied or required. Inject the mock at the external model adapter, keeping application authentication, validation, coin deduction/refund, and persistence real. Block accidental outbound AI-provider requests and fail if attempted. Printify order creation and verified cleanup must be real; a fake order ID or intercepted success cannot satisfy an order case. Controlled fault injection may exercise failures without replacing the real database or the mandatory Printify lifecycle.
8. Track created record IDs and provider IDs per run. Immediately execute the mandatory Printify cancellation protocol below at the end of each test, including failed/timed-out tests, before deleting database records. Preserve redacted evidence and reset browser storage, cookies, and time between isolated cases.

### Financial and identity assertions

For every successful purchase, reconcile the selected cart-item IDs, product/variant IDs, design/placement, quantities, unit-price snapshots, currency, subtotal, discount, shipping, and final total across UI → trusted server calculation → provider transaction → order items → fulfillment payload. Check exact sets and values, not merely “at least one item exists.” Use integer minor units for expected money values.

Concrete fixture with no promotion: A = 1,999 cents × 2; B = 2,501 cents × 1; C = 1,200 cents × 1. Select A and C only: subtotal 5,198; shipping 499; total 5,697 cents. B must remain unpurchased in the cart. Select A and B instead: subtotal/total 6,499 with free shipping. These expectations use the current [checkout pricing](../src/features/checkout/lib/hooks/useCheckoutPricing.ts): €4.99 below €60 after discounts, otherwise free. Independently verify that each server/provider path agrees; the UI calculation is not the trusted oracle.

For async checks, wait for the correlated operation to reach its expected state with a bounded timeout. Capture a failure if it never does. Do not use fixed sleeps or accept a redirect/spinner as proof of completion.

## Homepage, navigation, and authentication

| ID | Priority / level | Setup and actions | Expected result |
|---|---|---|---|
| HOME-01 | P1 B/M | Visit homepage logged out and logged in; scroll through all sections at desktop and mobile sizes. | Expected sections, imagery, headings, CTAs, and footer render; no broken images, clipped content, or blocking overlays. |
| HOME-02 | P1 B | Activate catalog and Stamp navbar links, then the logo; repeat from mobile navigation. | Routes are `/catalog`, `/stamp`, and `/`; mobile menu closes and browser back/forward navigation works. |
| HOME-03 | P2 B | Open displayed footer/help/legal links and an unknown route. | Links reach their intended pages; unknown route shows a usable not-found page with a route home. |
| AUTH-01 | P0 B/I | In a fresh context, register a unique email, follow its confirmation link, choose a valid password, sign out, and immediately sign in with it. | One usable account exists; email is confirmed; password setup succeeds; new login establishes the correct user's session and survives refresh. |
| AUTH-02 | P1 B/I | Submit malformed/empty email; complete password setup with 7 characters, 8 characters, and mismatched confirmation. | Invalid submissions show field-specific errors and create no usable session; an otherwise valid 8-character password meets the current minimum. Password setup is tested at the verification stage. |
| AUTH-03 | P1 B/I | Repeat signup for existing and unverified emails; resend confirmation; use expired, malformed, and already-used links. | No duplicate account or takeover; responses follow the intended privacy policy; invalid links offer recovery; resend obeys configured throttling. |
| AUTH-04 | P0 B | Sign in with valid credentials; independently try incorrect password, unknown email, empty fields, and unverified account. | Valid user signs in; rejected attempts remain signed out, show a friendly error, and do not expose credentials or backend details. |
| AUTH-05 | P1 B | Switch between login, signup, and password reset; close/reopen the dialog. | Correct form appears, focus is managed, and stale errors/passwords do not bleed into another form. |
| AUTH-06 | P0 B/I | Complete Google sign-in in a controlled account; separately deny consent, cancel, and fail the callback. | Success resolves to the correct account; other variants do not create a false authenticated state and provide a retry path. |
| AUTH-07 | P1 B/I | Request password reset, follow a valid link, choose a new password, and attempt login with old/new passwords; repeat with an expired link. | New password works, old password fails, invalid link cannot change credentials, and recovery remains available. |
| AUTH-08 | P0 B/I | Sign out; refresh or directly access protected routes/APIs; expire a session during Stamp/cart/checkout. | Private data remains protected; reauthentication is offered; no generation/payment/cart write is attributed to the wrong or absent user. |
| AUTH-09 | P0 I | Exercise configured rate limits/CAPTCHA on login, signup, and resend; test a malicious external callback `next` URL. | Server enforces protections even if UI validation is bypassed; rate-limit response is recoverable; callback cannot redirect off-site. |

## Catalog and Stamp entry

| ID | Priority / level | Setup and actions | Expected result |
|---|---|---|---|
| CAT-01 | P1 B/I | Open catalog with the seeded categories/products; exercise exposed category controls and product galleries. | Product/category grouping, images, descriptions, and displayed prices match the fixture; controls show the intended products. |
| CAT-02 | P1 B | Return empty data, unavailable variants, slow loading, and a failed catalog request; retry. | Loading, empty, and error states are distinct; retry recovers; stale or unavailable products cannot create an invalid selection. |
| CAT-03 | P1 B | Use each catalog customization CTA and the homepage Stamp CTA. | Destination preserves any product context promised by the CTA; no unrelated previous product silently carries over. |
| FLOW-01 | P1 B | Enter `/stamp`; click Begin Customization. | Upload is the active step and the corresponding progress/navigation state is correct. |
| FLOW-02 | P1 B/U | Navigate backward/forward at each step and attempt to jump ahead without required image/product/variant data. | Valid prior choices remain consistent; inaccessible steps are blocked; changing upstream inputs invalidates dependent product/mockup data. |
| FLOW-03 | P1 B | Refresh and use browser back/forward during upload, generation, customization, and final review. | Flow restores a consistent state or returns to a valid recovery step; no duplicate request, endless spinner, or stale purchasable product. Full draft persistence needs a product decision if not already specified. |

## Upload image

| ID | Priority / level | Setup and actions | Expected result |
|---|---|---|---|
| UP-01 | P1 B | Choose each valid JPEG/PNG/GIF fixture through Upload Image. | File picker opens; selected image renders; Remove Image appears; success feedback appears only after successful reading; Next Step becomes available. |
| UP-02 | P1 B | Cancel the picker with no image, then with an existing image. | No false success/error; prior selection is unchanged; without an image the action retains skip behavior. |
| UP-03 | P1 B/U | Remove the image, reselect the same file, then replace it with a different file. | Preview and downstream source reference update correctly; removal restores the empty/skip state; same-file reselection works. |
| UP-04 | P1 B/I | Upload each byte-limit boundary and unsupported file type, including misleading extension/MIME variants. | Supported valid files at/below 10 MiB pass client validation; oversized/unsupported data is rejected with a clear message. Downstream processing must not trust extension/MIME alone. |
| UP-05 | P1 B/I | Try empty/corrupt images, a file read failure, high-resolution content, and a transparent PNG. | Invalid content never becomes a usable design; loading clears on error; valid content preserves aspect ratio/transparency and remains usable downstream. |
| UP-06 | P1 B | Skip upload with no cached history; then type a valid prompt and generate. | Prompt-only creation is available to an eligible authenticated user; no nonexistent reference image is sent. |

## Describe design, generation, and coins

| ID | Priority / level | Setup and actions | Expected result |
|---|---|---|---|
| GEN-01 | P0 B/I | User A has a known positive balance; submit a valid prompt with a reference image and complete generation. | Exactly one request carries the chosen prompt/image; generating state appears; successful output is selected and Results opens; server balance decreases by exactly one. |
| GEN-02 | P1 B/U/I | Enter each prompt boundary fixture and attempt generation, including direct invalid API submissions. | Empty/whitespace submissions do no paid work; UI permits up to 500 characters and prevents overflow; valid Unicode/newlines survive. API validation cannot be bypassed to submit unusable input. |
| GEN-03 | P1 B/I | Enter a prompt, select each suggested filter, switch filters, and inspect the generated request. | **Original acceptance requirement / suspected gap:** selected guidance reaches generation once, user text is retained, and switching removes stale guidance. Record a defect if selection is only visual. |
| GEN-04 | P1 B/I | Select a filter, then No filter; generate with a valid prompt. | No previously selected filter guidance remains. “No filter” does not itself mean bypassing AI; explicit skip editing is a separate action. |
| GEN-05 | P1 B/U/I | Set preservation to 0, 50, and 100; toggle background removal; submit with/without a reference. | Request fields match controls and downstream generation receives them; unsupported/out-of-range API values are rejected or normalized according to an explicit contract. No requirement for exact AI pixels. |
| GEN-06 | P1 B/I | Upload an image, optionally also seed history, and choose Proceed without editing. | Requested acceptance behavior: Results opens with the uploaded image selected; no AI call and no coin change. The current product-selection shortcut must fail this test until the requirement is explicitly changed. |
| GEN-07 | P1 B | With no upload and valid history, choose skip editing. | Results opens with the newest cached image selected and other unexpired history available; no charge. |
| GEN-08 | P1 B/I | No upload, history, or usable prompt; attempt normal progression and bypass the UI guard. | No usable design/product is created and no coin deducted; skip is unavailable or safely returns to upload. |
| GEN-09 | P0 B/I | Use a zero-coin account and a logged-out context; attempt generation through UI and API. | Appropriate overlay blocks paid generation; server independently rejects it. An available upload/history can still follow the intended non-generation path. |
| GEN-10 | P0 B/I | Double-click Stamp It while a request is pending; with one coin, issue concurrent requests from two tabs. | UI prevents duplicate pending submission; atomic server deduction permits at most one paid generation with one available coin; balance never goes negative. Do not infer server retry deduplication from a UI lock. |
| GEN-11 | P0 B/I | Inject a generation failure after deduction; separately fail validation before deduction. | First variant refunds exactly one coin and exposes recovery; second deducts none; UI balance refreshes. If refund persistence fails, the original failure remains visible and reconciliation is observable. |
| GEN-12 | P1 B/I | Delay a response beyond the current 90-second client timeout; then deliver a late success/failure and retry. | Loading terminates and recovery is possible; late responses cannot corrupt a new attempt or double-navigate. Reconcile the server result and coin balance; do not assume a timed-out browser request was canceled/refunded. |
| GEN-13 | P1 U/I/B | Test coin reset just before, at, and after the configured reset boundary; refresh and query concurrently. | Reset occurs once per configured period and uses server time; UI balance/countdown reconcile with the server; concurrent reset/deduction does not grant extra coins. |
| GEN-14 | P1 B/I | Fail balance fetching and then restore connectivity. | Loading/error is distinguishable from a confirmed zero balance; no unauthorized generation; retry updates the displayed balance and controls. |

## Results and image history

| ID | Priority / level | Setup and actions | Expected result |
|---|---|---|---|
| RES-01 | P1 B | Finish generation with a known image response. | Main preview shows that image; selecting Use this image passes its identity to product selection. |
| RES-02 | P1 B/U | Seed several valid cached images; select another; inspect the history and continue. | Main preview, selected state, and downstream design all match the choice; prior valid alternatives remain accessible without unintended duplication. Include an uploaded alternative when present in the flow. |
| RES-03 | P1 B | Click Repeat, change the prompt, and generate again. | Describe step opens; a new request uses the new input; prior successful images remain available; one additional successful generation costs one coin. |
| RES-04 | P1 U/B | Reload with saved history; advance a fake clock to just before, exactly at, and after 24 hours. | Current storage expires entries when age is greater than 24 hours; valid entries remain and expired entries disappear from history and skip eligibility. |
| RES-05 | P1 U/B | Save a 21st result; inject invalid JSON, malformed entries, full storage, denied storage, and a broken image URL. | Valid history is newest-first with at most 20 entries; bad/unavailable storage does not crash the flow; broken assets have recovery; successful current output remains usable when persistence fails. |
| RES-06 | P1 B | Sign out of A and sign into B in the same browser with A's history present. | Record the privacy requirement explicitly: current storage key is browser-scoped. If account-private history is required, B must not see A's images. Until decided, treat this policy-dependent assertion as blocked. |

## Product selection, customization, and creation

| ID | Priority / level | Setup and actions | Expected result |
|---|---|---|---|
| PROD-01 | P1 B/I | Load product selection against seeded available products/categories. | Cards match database availability and category grouping; no unsupported product appears as purchasable. |
| PROD-02 | P1 B | Select a product, remove it, select a different product, and continue. | Selected card and Remove action behave correctly; no selection disables continuation; selected blueprint/provider is passed to customization. |
| PROD-03 | P1 B/I | Fail product loading, return no products, or remove availability after selection. | Clear recoverable state; stale selections cannot produce an invalid product; retry/reselection is possible. |
| CUSTOM-01 | P1 B/M | Customize each seeded category, including portrait/landscape/square designs. | Preview template and print areas represent the selected product; aspect ratio and design identity are preserved; front/back or other supported surfaces are labeled correctly. |
| CUSTOM-02 | P0 B/I | Accept default color/size, then change each; exercise unavailable color-size combinations and size-only/one-size variants. | Defaults resolve to a valid variant; only valid combinations proceed; variant ID, price, color, and size remain consistent through creation, cart, order, and Printify. Size strings such as `11oz` are not treated as colors. |
| CUSTOM-03 | P1 B/I | Exercise mugs/canvas/notebooks/pillows/socks/totes against the requested white-only policy, including direct requests for disallowed colors. | Requested acceptance policy allows only white for all six categories. UI/database/server/Printify must agree; the current tote/notebook exceptions must fail these assertions unless the user explicitly changes this policy. |
| CUSTOM-04 | P0 U/I/B | For each manually adjustable print area, apply approved center/edge/min/max scale and rotation fixtures; continue immediately after the final adjustment. | Latest supported position, scale, and angle match the reference preview and serialized Printify payload within fixture tolerances; out-of-bounds values cannot create an invalid print area. |
| CUSTOM-05 | P0 U/I/B | Adjust multiple surfaces independently, switch active surface, disable one where supported, and create socks with both leg areas. | Active editing does not overwrite other surfaces; only enabled intended areas are submitted; required paired sock areas and variant associations remain correct. |
| CUSTOM-06 | P1 U/I/B | Switch from apparel to mug or another automatic-placement product after making manual adjustments. | Old placement is cleared; automatic-placement products use approved server fitting, without stale generic client scale/position overrides. |
| CUSTOM-07 | P1 B | Change product, image, or variant after a successful preview/product creation, then create again. | New preview/product reflects the new configuration; prior created-product IDs cannot be purchased as if they represented the changed design. |
| CREATE-01 | P0 B/I | Create a valid customized product with delayed Printify completion. | Production/loading state persists until confirmed creation; final review contains the correlated product ID, variant, mockups, and price; no premature success. |
| CREATE-02 | P1 B/I | Fail image upload, variant resolution, product creation, and mockup loading independently; retry. | Clear stage-appropriate error; pending state clears; usable inputs survive; retry cannot silently purchase a partial/wrong product. |
| CREATE-03 | P0 I/B | Double-submit product creation; simulate provider success followed by a lost response, then retry. | Same logical request resolves to one usable product or explicitly reconciles prior creation; no duplicate cart insertion or unexpected orphan product is hidden by UI success. |

## Final review and adding to cart

| ID | Priority / level | Setup and actions | Expected result |
|---|---|---|---|
| BAG-01 | P0 B/I | Review created mockups/details/price and click Bag It. | Preview matches created variant; successful write precedes navigation to `/cart`; exactly the intended product/variant/design and unit price are present after reload. |
| BAG-02 | P1 B/I | Click Bag it & Create another. | One item is persisted, then the flow returns to the first/upload step with product/customization/creation state reset. The current product-selection destination must fail this acceptance test; retention of reusable history must not silently preselect a new upload. |
| BAG-03 | P0 B/I | Rapidly click either add action; revisit the completed review; then remove the item from cart and intentionally add it again. | Accidental duplicate submission does not add extra quantity; legitimate re-add after removal succeeds. A stale session-storage completion marker must not falsely claim the removed item is still in cart. |
| BAG-04 | P1 B/I | Fail the cart write or omit a created product/variant ID. | No success feedback or premature navigation/reset; clear error and retry; database and cart count do not falsely show success. |

## Cart

| ID | Priority / level | Setup and actions | Expected result |
|---|---|---|---|
| CART-01 | P0 B/I | Load one item, deselect it, reselect it, and proceed. | Single item is initially selected per the original requirement; no selection disables checkout; checkout contains only that item with the correct quantity and price. |
| CART-02 | P0 B/I | Use the three-item monetary fixture; select A and C only; complete a test purchase. | Summary, payment, order, and fulfillment contain exactly A/C with total 5,697 cents; B remains in cart after completion. |
| CART-03 | P1 B | Select all/deselect all, then remove a selected item and repeat. | All controls and totals reflect existing selected items; indeterminate state is accurate; zero selection disables checkout. |
| CART-04 | P0 B/I | Increase/decrease quantity, reload, then complete checkout. | Quantity persists; exact line totals and all downstream quantities agree; rapid updates cannot commit a stale quantity. |
| CART-05 | P1 B/I | Try zero, negative, fractional, nonnumeric, and above-limit quantities through UI and API. | Only supported positive integer quantities are accepted; invalid input cannot create negative totals or bypass server limits. Record the configured maximum in the fixture. |
| CART-06 | P1 B/I | Remove one item, then the last; refresh. | Removed rows stay removed; count/selection/totals update; empty state provides a useful next action and cannot initiate checkout. |
| CART-07 | P1 B/I | Fail quantity/removal persistence and retry; edit the same cart from two tabs. | UI rolls back or reconciles to persisted state with a clear error; checkout validates current data rather than silently charging stale content. |
| CART-08 | P0 I/B | Tamper with cart IDs, selected-item IDs, variant, unit price, totals, or user ID in storage/request payloads. | Server rejects unauthorized/invalid inputs or recalculates from trusted records; user B cannot read or mutate A's cart; no underpriced charge results. |
| CART-09 | P1 B/I | Revisit checkout after selections/availability/prices change; expire saved selection storage. | Missing/stale selections prompt recovery or fresh confirmation; checkout never silently broadens a subset purchase to the entire cart. |

## Checkout, pricing, and promotions

| ID | Priority / level | Setup and actions | Expected result |
|---|---|---|---|
| CHECK-01 | P1 B/U | Clear defaults, fill every required field, then blank or invalidate each independently, including whitespace-only input. | Field-specific feedback appears; payment remains unavailable until schema-valid data exists; correcting a field updates validity without losing other inputs. |
| CHECK-02 | P1 B/I | Use equal billing/shipping addresses, then distinct addresses; toggle separate shipping off/on. | Request and persisted order use the intended addresses; hidden stale shipping values cannot override the active choice; required address validation follows the toggle. |
| CHECK-03 | P1 B/I | Use accented names, apartment lines, long values, malformed email/postcode, and supported/unsupported country fixtures. | Supported data is preserved; invalid/unsupported addresses are rejected according to configured rules; no truncation silently changes the shipping destination. |
| CHECK-04 | P0 U/I/B | Test selected post-discount subtotals of 5,999, 6,000, and 6,001 cents. | Shipping is respectively 499, 0, and 0 cents under current pricing; UI/server/provider agree; unselected items do not count toward the threshold. |
| CHECK-05 | P0 U/I/B | Apply/remove valid fixed and percentage discounts, including rounding and a discount crossing the shipping threshold. | Exactly one intended discount is applied; total and shipping recalculate consistently; discount cannot produce a negative payable amount or exceed its configured scope. |
| CHECK-06 | P1 B/I | Submit invalid, expired, not-yet-active, exhausted, or ineligible promotions; change cart after applying; race final allowed redemption. | Clear feedback; eligibility/limits are revalidated server-side; stale discount is removed or corrected; concurrent purchases cannot exceed redemption rules. |
| CHECK-07 | P0 B/I | Inspect test checkout defaults and complete real-address fixture overrides; submit tampered amount/currency/discount values directly. | Test placeholder addresses do not silently replace the user's data; server/provider use the authorized cart, currency, discount, and amount. |
| CHECK-08 | P1 B | Switch payment method repeatedly; visit checkout with empty/missing cart and with an expired session. | Only the selected method is active; no stale provider widget submits; invalid context offers recovery and cannot create a charge. |

## Payments and asynchronous confirmation

Run PAY-01–08 separately for Stripe, PayPal, and iDEAL through Mollie where applicable. Use Stripe authentication challenges only on the card path; use redirect/popup cancellation and return checks on the relevant provider path. Provider integration tests must verify actual sandbox records; intercepted browser responses only prove UI behavior.

| ID | Priority / level | Setup and actions | Expected result |
|---|---|---|---|
| PAY-01 | P0 B/I | Pay a single-item order successfully using the selected provider's test environment. | Payment is verified server-side; exactly one matching paid transaction/order exists; confirmation references the correct order; amount, currency, provider ID, and items reconcile. |
| PAY-02 | P0 B/I | Pay selected A/C from the monetary fixture with multiple quantities and an unselected B. | Same financial/identity assertions as CART-02 for each provider; no unselected item is charged, fulfilled, or removed. |
| PAY-03 | P1 B/I | Submit malformed card fields, then separately a syntactically valid test instrument configured to decline. | Malformed data gives validation feedback without a successful charge; provider decline leaves no paid order, exits loading, and offers retry/another method. A loading state is not required for local validation failure. |
| PAY-04 | P1 B/I | Exercise required card authentication success, failure, and abandonment; cancel PayPal/iDEAL at the provider. | Only verified success finalizes; cancellation/challenge failure preserves recoverable checkout and cannot mark the order paid. |
| PAY-05 | P0 B/I | Double-click Pay, submit from two tabs, and retry after a lost create/capture response. | One logical purchase cannot capture twice or create duplicate orders/fulfillment; reconciliation identifies an existing completed payment before another charge is attempted. |
| PAY-06 | P0 B/I | Return before webhook arrival; close the browser before return; deliver delayed confirmation. | Pending/processing remains truthful; verified payment can finish without browser return; reopening shows eventual accurate state and no repeat capture. |
| PAY-07 | P0 B/I | Refresh/back/reopen a return URL; remove, alter, or substitute payment/order identifiers belonging to B. | Repeat valid returns are safe; malformed/unowned identifiers cannot disclose or finalize another user's order; URL parameters alone cannot prove payment. |
| PAY-08 | P1 B/I | Leave provider payment pending; expire it; fail return-page verification transiently. | UI distinguishes pending, failed, canceled/expired, and verification error; retry is bounded and available; no endless loading or false success. |
| PAY-09 | P0 I | Deliver duplicate valid provider events, out-of-order events, and a transient webhook processing failure followed by retry. | Processing is idempotent; retry converges; older events cannot regress a final paid/refunded state or repeat fulfillment/refund. |
| PAY-10 | P0 I | Forge/replay events or mismatch provider amount, currency, merchant context, payment ownership, or order reference. | Provider authenticity and authoritative payment details are checked by the relevant provider mechanism; mismatches cause no paid transition or fulfillment. |
| PAY-11 | P0 I/B | Succeed payment, then fail order persistence or Printify submission; run recovery/retry. | Paid-but-unfulfilled condition remains visible and traceable; recovery uses the existing payment; no duplicate charge/order; supported compensation/refund path records its actual outcome. |
| PAY-12 | P0 I | Fail midway through order/item/transaction persistence. | Atomic operation rolls back or leaves an explicit recoverable state; no apparent successful order with missing items, inconsistent totals, or orphan transaction. |

## Orders, fulfillment, cancellation, and invoices

| ID | Priority / level | Setup and actions | Expected result |
|---|---|---|---|
| ORDER-01 | P0 B/I | Open confirmation and order history after purchase; refresh and view details. | Correct owned order appears once with exact purchased variants/quantities/totals and distinct truthful payment/fulfillment states. Paid does not automatically mean produced or delivered. |
| ORDER-02 | P1 B/I | Seed enough orders for pagination; use available search/filter/view controls; return empty/error responses. | Filtering and counts agree; pages neither duplicate nor omit matching orders; empty/error/loading states are recoverable. |
| ORDER-03 | P0 I/B | Inspect fulfillment payload and simulate production/shipping/tracking updates, including duplicates and delayed status updates. | Payload preserves design, variant, placement, quantity, and shipping address; status history/tracking reconcile without duplicate submission or backward status corruption. |
| ORDER-04 | P0 B/I | Cancel an eligible order; double-submit cancellation; separately attempt cancellation after an ineligible fulfillment state and after a concurrent state change. | Server rechecks eligibility, ownership, and current state; permitted cancellation occurs once; production/shipped orders are not falsely canceled by UI state alone. |
| ORDER-05 | P0 I/B | Complete a supported refund; inject refund failure/pending response; retry and replay notification. | Actual provider refund and persisted status/amount agree; no double refund or amount above captured funds; UI never claims completion while only initiated/pending. |
| ORDER-06 | P1 B/I | Download invoice and inspect confirmation email for a completed test order; repeat after refresh. | Invoice/email refer to the right order, currency, line items, quantities, discounts, shipping, and addresses; invoice opens; retries do not duplicate business actions. |
| ORDER-07 | P0 I/B | As B and unauthenticated, directly access A's order, invoice, cancellation, and refund endpoints. | No private details disclosed and no mutation allowed; IDs or hidden UI controls cannot bypass ownership checks. |

## Cross-cutting quality

| ID | Priority / level | Setup and actions | Expected result |
|---|---|---|---|
| UX-01 | P1 B/M | Complete upload → skip generation → customize → cart → test checkout at 320px and representative phone/tablet/desktop widths. | Critical actions stay reachable; sticky footer, keyboard, dialogs, and provider UI do not obscure required controls; no unintended horizontal scrolling. |
| UX-02 | P1 B/M | Navigate forms, dialogs, image/product selectors, placement controls, and cart using keyboard and a screen reader. | Logical focus order; visible focus; accessible names and selected/disabled states; dialogs manage/restore focus; loading/errors/success are announced; core tasks do not require a mouse. |
| UX-03 | P2 B/M | Check 200% zoom, contrast, reduced motion, slow networks, and loading layouts. | Content and actions remain readable/reachable; essential state is not conveyed by color alone; reduced motion is respected where supported; no blocking layout shift. |
| UX-04 | P1 B/M | Run the core flow in Chromium, Firefox, and WebKit plus representative mobile Safari/Chrome checks. | Upload, local storage, dialogs, placement, authentication, and checkout work across supported browsers. Current Playwright config only defines desktop/mobile Chromium; these additional runs need configuration or manual execution. |
| UX-05 | P1 B | Repeat core screens in each shipped locale with long labels; change locale during a valid flow. | No untranslated keys, clipped critical controls, or unexpected state loss; decimal/date/currency presentation is appropriate while underlying amounts remain unchanged. |
| SEC-01 | P0 I/B | Submit script/HTML payloads in prompts, names, address fields, and other rendered user content. | Content is rejected or safely rendered as text; no script execution in app, order view, email, or invoice. |
| SEC-02 | P0 I | Attempt protected APIs without auth and fetch remote images through internal, loopback, metadata, and redirect-to-private URLs. | Server rejects unauthorized access and unsafe remote fetches; user-controlled URLs cannot expose internal resources. |
| OBS-01 | P1 I/B | Induce generation, cart, payment, and fulfillment errors; inspect UI and test logs. | Friendly recovery message plus correlated diagnostic event; no passwords, tokens, complete payment data, or unnecessary personal information in logs/screenshots. |

## Test infrastructure and mandatory cleanup acceptance

Write these harness tests first as well. Cancellation-failure variants may inject transport failures around a real created order, but must leave its ID in the durable ledger and run genuine recovery cleanup. A harness contract test asserts that the child test run fails on cleanup exhaustion; that must not mark the failed child run successful.

| ID | Priority / level | Setup and actions | Expected result |
|---|---|---|---|
| ENV-01 | P0 I | Start with the allowed real parallel project, then separately configure an unknown/production project in any layer. | Matching test configuration passes preflight; mismatches fail before writes or provider requests. Browser, server, Edge Functions, and cleanup all target the same test project. |
| ENV-02 | P0 I | Run against the hosted test URL with production-mode app build; separately exercise the production configuration. | Test environment remains test-only with real DB/Printify integration and sandbox payments; production protection remains intact. Current URL heuristic must not redefine the test project as production. |
| ENV-03 | P0 I/B | Generate with deterministic AI success/error/timeout fixtures and no AI keys. | No external AI traffic; real test database records the correct coin deduction/refund. An accidental AI-provider call fails the test. |
| CLEAN-01 | P0 I/B | Complete an order scenario successfully, then repeat with assertion failure and test timeout after real Printify creation. | Each scenario registers its actual order ID and immediately attempts verified cancellation in teardown; success of application assertions never bypasses cleanup. |
| CLEAN-02 | P0 I | For independent real orders, inject failure on the first 1, 2, and 3 cancellation attempts, then allow the next attempt to reach Printify. | Exactly the needed retries occur, up to four total attempts; real canceled status is read back; resolved orders receive no further cancellation mutation. |
| CLEAN-03 | P0 I | Keep cancellation/verification failing through initial attempt plus three retries; include a second order whose cancellation works. | Test and run fail with four recorded attempts for the unresolved order; second order is still cleaned up; ledger/evidence remain; no warning-only or skipped result. Perform real recovery after the harness assertion. |
| CLEAN-04 | P0 I | Lose a creation response, lose a cancellation response, and receive a local success while remote order remains uncanceled in separate runs. | Correlation locates the created order; remote canceled status resolves a lost cancellation response; local-only success never passes cleanup. |
| CLEAN-05 | P0 I | Interrupt a worker after real creation and restart the run finalizer; enable ordinary test retries. | Durable ledger enables actual cancellation outside the dead worker; orphan check blocks new order work until reconciled; an aborted/cleanup-failed attempt cannot be hidden by a later passing retry. |

## Google Analytics event delivery

Use a dedicated test GA4 property/web stream for real delivery. Derive an explicit event contract from the product actions below before writing implementation: event name, trigger, allowed parameters, units, cardinality, and privacy rules. The existing event-name type is a compatibility inventory; it does not prove a business event is emitted at the correct time. Existing tracking-plan comments about development logging must not substitute for observing network delivery.

For each event case, record three distinct evidence levels: (1) expected event/payload in the browser, (2) an outbound GA collection request with the correct test measurement ID and payload, and (3) receipt in the test property's DebugView/Realtime for the real-delivery run. A gtag spy, console log, queued event, or HTTP response alone does not establish ingestion. Use an approved non-personal test-run marker to correlate receipt. Bound the receipt wait; unavailable property access or ingestion timeout is reported, not counted as delivery success. Intercepted transport is useful for failure tests but cannot satisfy the real-delivery cases.

| ID | Priority / level | Setup and actions | Expected result |
|---|---|---|---|
| GA-01 | P1 B/I | Load homepage and navigate catalog → Stamp → cart → checkout; observe script loading and collection requests. | Only the dedicated test measurement ID is used; one `page_view` per intended route view with correct `page_path`; script initialization and route tracker do not double-count the initial page. Verify receipt. |
| GA-02 | P1 B/I | Complete signup, email/Google login, and logout; separately fail or cancel these actions. | `sign_up`, `login`, and `logout` occur on successful outcomes with the approved method parameters; failed/canceled actions emit no false success; no credentials/email are sent. Verify outbound delivery and receipt. |
| GA-03 | P1 B/I | Upload image, change steps, generate mocked success and failure, then create a real customized product; separately skip AI. | `stamp_image_upload`, `step_change`, `stamp_generate_start`, `stamp_generate_complete` or `stamp_generate_failed`, and `stamp_create_product` match their approved triggers and metadata; exactly one terminal event per generation attempt; skip emits no generation success. Timeout/late response cannot double-count. Verify delivery and receipt. |
| GA-04 | P1 B/I | Select a product, change color/size, successfully add/remove a cart item, and view the cart; inject failed cart writes separately. | `select_item`, `color_select`, `size_select`, `add_to_cart`, `remove_from_cart`, and `view_cart` describe the intended product/variant and quantities. Failed persistence produces no successful mutation event. Verify delivery and receipt. |
| GA-05 | P0 B/I | Begin checkout with A/C only, choose each payment method, and finish a real test payment/order. | `begin_checkout`, `add_payment_info`, and `purchase` use the selected items only; approved currency, item IDs, variant, quantities, and monetary units reconcile with the order. Define `purchase.value` explicitly (recommended merchandise amount after discounts, shipping separately); fixture A/C is 51.98 EUR merchandise and 4.99 shipping, charged total 56.97. Verify outbound events and receipt; cancel the real Printify order in teardown. |
| GA-06 | P0 B/I | Refresh/back/reopen payment return, replay provider confirmation, and retry a delayed response; separately decline/cancel payment. | One logical `purchase` per verified paid order with stable `transaction_id`; no duplicate from callback/webhook/browser races and no purchase event for decline/cancellation/unverified pending status. Cleanup cancellation must not create another purchase. |
| GA-07 | P1 B/U | Delay gtag loading, emit several actions, then release loading; repeat with blocked/failed analytics transport and missing configuration. | Intended queued events flush once in order when available; errors do not block purchase or leak into the production property; missing configuration fails the delivery preflight but the standalone resilience variant proves usable UI. |
| GA-08 | P0 B/I | Inspect all analytics URLs/payloads during auth, prompt entry, checkout, errors, and test cleanup. Exercise the approved consent preference if provided by the app. | No email, address, password, token, uploaded image, full prompt, or sensitive callback query reaches GA. Collection follows the documented consent policy; an unspecified consent contract is a decision to record, not a behavior copied from code. |

## Existing automation: reuse and gaps

This is a file-level starting map, not a claim of passing or exhaustive coverage. Review assertions before assigning a case “automated.”

| Area | Existing examples | Enhancement focus |
|---|---|---|
| Authentication | `src/app/api/auth/*/route.test.ts`, `src/app/auth/confirm/route.test.ts`, `src/shared/schemas/auth.test.ts`, `src/features/auth/components/__tests__/AuthDialog.test.tsx` | Complete real email-verification/password/login journey, OAuth cancellation, and expired sessions. |
| Generation/coins | `src/app/api/generate-image/route.test.ts`, `src/shared/services/coinsService.test.ts`, `src/tests/e2e/coins-flow.e2e.spec.ts` | Filter propagation, one-coin concurrency, failed refunds, late responses, and storage boundaries. |
| Placement/catalog | `src/features/stamp/lib/hooks/__tests__/useCustomizationHandlers.test.tsx`, `src/shared/services/__tests__/customProductService.printAreas.test.ts`, `src/features/catalog/ui/__tests__/CatalogPageContent.test.tsx` | Approved per-product visual/payload fixtures and actual variant propagation through purchase. |
| Cart/pricing | `src/tests/cart-selection.test.ts`, `src/tests/price-conversion.test.ts`, `src/shared/services/cartService.test.ts`, `src/app/api/validate-promocode/route.test.ts` | Exact selected-item reconciliation for every provider, stale selections, shipping/discount boundaries, and legitimate re-add after removal. |
| Payments/orders | `src/tests/e2e/complete-user-journey.e2e.spec.ts`, `src/tests/e2e/data-integrity.e2e.spec.ts`, `src/tests/e2e/payment-cancellation-refund.e2e.spec.ts`, provider webhook tests under `supabase/functions/` | True browser/provider/server confirmation, lost responses, fulfillment failure, and exact item/value assertions. Some “E2E” files exercise database operations directly; that is integration coverage, not a complete UI journey. |
| Analytics | `src/shared/services/analyticsService.test.ts`, `src/features/analytics/__tests__/useAnalytics.test.tsx`, `src/features/analytics/__tests__/buttonTracking.test.tsx` | Requirement-led event timing/payload assertions, real outbound GA requests, test-property receipt, and purchase deduplication. |
| Security | `src/tests/e2e/security.e2e.spec.ts`, `src/tests/payment-security.test.ts`, `src/tests/security-review.test.ts` | Cross-user access, payment proof, replay, and direct API bypasses on the complete purchase flow. |

The existing complete-journey file explicitly skips mobile and has AI generation commented out in the Stripe journey. Do not count either as covered by that scenario. Its broad order/item assertions should be strengthened to compare exact run-owned IDs and expected values. The [E2E guide](../src/tests/e2e/README.md) is execution background, not proof of current behavior or safe environment configuration. Vitest's current include pattern covers `src`; tests under `supabase/functions` need their own applicable runner.

## Suggested rollout and reporting

1. Lock requirement-based acceptance criteria before implementation. Preserve the user-requested filters, white-only colors, and navigation outcomes when code differs; clarify genuinely unspecified history/privacy rules separately. Write and run failing tests first.
2. Automate a fast deterministic smoke subset: HOME-02, AUTH-01/04, UP-01, GEN-01/06/09/11, CUSTOM-02/04, CREATE-01, BAG-01, CART-01/02, CHECK-04, PAY-01/05/07, and ORDER-01/07. Run this subset against the real parallel database with mocked AI and real Printify creation/cancellation. No mocked database or Printify success counts as acceptance coverage.
3. Before release, execute all P0 cases, core P1 journeys on desktop/mobile, each provider's successful selected-subset purchase, and recorded product/placement fixtures. Triage remaining P1/P2 failures explicitly. No P0 pass may be inferred from mocked UI success alone where provider/database assertions are required.
4. Keep test runs independent. Use unit/component checks for pure prompt/price/placement/storage boundaries, integration tests for transaction/security rules, and full browser journeys to prove wiring. All tests run in the parallel-test environment; every data-dependent check uses its real database, and pure checks must not introduce a fake database substitute. Apply red–green–refactor at every level. Avoid multiplying every image/product/browser/provider combination into an expensive full purchase.

Use this result template per case/variant:

```text
Case ID / variant:
Build / commit / environment / effective test mode:
Browser / viewport / locale:
Fixture IDs / starting balance / selected items:
Expected result:
Actual result:
Status: Not run | Pass | Fail | Blocked
TDD evidence: requirement reference + meaningful red failure + green run
Database: verified test project / fixture ownership
Analytics: expected events / outbound request evidence / property receipt
Printify cleanup: order IDs / attempt counts / remotely verified final states
Evidence: redacted screenshot/trace + request/order/provider IDs + relevant DB values
Defect or decision link / owner:
Cleanup outcome:
```

## Executable suite

The isolated suite is in [`tests/acceptance`](../tests/acceptance/README.md), with [scenario traceability](../tests/acceptance/COVERAGE.md) and a [credential-name template](../tests/acceptance/environment.example). Run it through `npm run test:acceptance`; the wrapper enforces preflight and final cancellation/recovery. See the README for verified results and explicit coverage gaps. Referencing an ID in an automated test does not establish full coverage of every subcase in the row above.

The test database and supplied login have been verified. Full provider/email/analytics execution remains dependent on the missing test configuration listed by `npm run test:acceptance:preflight`. Setup failures must not be recorded as either passing acceptance or meaningful product TDD failures.
