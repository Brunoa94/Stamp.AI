# Review of the implemented security changes

Reviewed: `securityChat`, commit `bad9732f5ef3fae2c2f26c72e6323dd761f613dd`, against baseline `69aa498` and the 23 September audit's remediation plan.

**Verdict: request changes. Do not merge this as a completed security remediation.** Several individual controls are substantially better, but the central requirement—server-owned quotes, orders, payment associations and fulfillment—was deferred. The new checks do not compensate for that missing trust boundary. I reproduced both exploitable remaining paths and a legitimate-checkout regression.

This review made no Supabase connections or deployments and performed no real payments, refunds or manufacturing operations. Reproductions used the actual application modules with synthetic adapters, and a disposable PostgreSQL 15 cluster with the repository's hardening harness. That cluster has been stopped. Application code was not modified.

## Release-blocking findings

### R1 — Critical: fulfillment still trusts a customer-authored basket and total

References: [fulfillment checks](../../supabase/functions/create-printify-order/index.ts#L183), [amount comparison](../../supabase/functions/create-printify-order/index.ts#L94), [variant-only comparison](../../supabase/functions/_shared/orderFulfillment.ts#L49), [explicitly retained owner INSERT](../../supabase/migrations/20260925000000_security_audit_rpc_and_rls_hardening.sql#L507).

The payment is genuinely verified, but its amount is compared with `orders.total_amount`, which the customer chooses at INSERT. The requested line items are compared with `order_items`, which the customer also inserts. The fulfillment handler never compares that basket with the one priced when the payment was created. Matching two attacker-controlled descriptions does not prove that the merchandise was paid for. The comparison also ignores product/blueprint/provider, artwork and destination.

**Reproduced:** the actual handler accepted an owned EUR 5 payment and created a synthetic manufacturing request for 100 items represented in a customer-authored EUR 5 order. The provider adapter supplied a genuine-paid-shaped result; no real payment was made. The new guard accepts that result regardless of the basket bought with the payment.

**Required:** persist the complete immutable server quote at payment creation; derive the order and manufacturer payload from it. Remove customer INSERT on finalized orders/items. Bind product, variant, provider, quantity, artwork and shipping choices to the quote. Do not describe the current implementation as closing the money-loss path.

### R2 — Critical: one unlinked payment can fulfill multiple orders

References: [payment reuse check](../../supabase/functions/create-printify-order/index.ts#L98), [claim scope](../../supabase/functions/_shared/orderFulfillment.ts#L77).

`verifyOrderPayment` allows `payment_transactions.order_id = NULL` and does not bind/consume that payment. The claim locks only an individual order's `printify_order_id`. A customer can omit the browser's optional link operation and call fulfillment for multiple different orders against the same unlinked payment. Separate order UUIDs bypass the per-order claim; concurrency is not necessary.

**Reproduced:** two sequential calls to the actual fulfillment handler, using the same synthetic payment reference and different order UUIDs, returned 200 and created two manufacturer requests. Each request contained 100 items. The payment remained unlinked.

**Required:** one atomic server transaction must bind a provider payment to exactly one immutable order and claim fulfillment. Reject reuse across order IDs even when the transaction starts unlinked. Test different-order reuse as well as duplicate requests for the same order.

### R3 — High: valid payments fail the new fulfillment amount check

References: [new comparison](../../supabase/functions/create-printify-order/index.ts#L94), [existing order total calculation](../../src/shared/mappers/services/orderServiceMapper.ts#L59), [order creation passes no discount](../../src/shared/services/orderService.ts#L548), [Stripe return path](../../src/app/checkout/stripe-return/StripeReturnClient.tsx#L305).

Cart `unit_price` is in cents. `calculateOrderTotals` sums it directly into `orders.total_amount`, with shipping fixed to zero and no checkout discount. The new provider verification compares major currency units against that stored value. The Stripe amount conversion was fixed at payment creation, but order persistence was not updated with it.

**Reproduced:** a 3,000-cent cart item produces `total_amount=3000`. A valid EUR 34.99 payment (EUR 30 plus EUR 4.99 shipping) returns `ORDER_AMOUNT_MISMATCH`. Fixing only division by 100 is insufficient: shipping and promotions must match too. This can leave a customer charged without fulfillment; the return page's attempted client status update is blocked by the financial-column guard, so automatic recovery/refund must not be assumed to succeed.

**Required:** persist the same server quote used for charging, using an explicit monetary unit. Cover below/above free-shipping threshold and promotional discounts through payment → order → fulfillment, for all providers.

### R4 — High: guest-cart isolation is still absent

References: [remaining policies](../../supabase/migrations/20260925000000_security_audit_rpc_and_rls_hardening.sql#L529), [ownership helper](../../supabase/migrations/20260925000000_security_audit_rpc_and_rls_hardening.sql#L73).

Adding `user_id IS NULL` prevents disclosure of authenticated carts, but every anonymous visitor can still enumerate all guest carts and modify their contents. `caller_owns_cart` explicitly treats any guest cart as owned by any anonymous caller. The existing test harness asserts that anon sees both fixture guests' carts; it therefore codifies the remaining vulnerability as an expected outcome.

**Reproduced after the new migration:** anon read both guest carts, changed the unrelated guest's email and received `true` from `caller_owns_cart` for that guest's UUID.

**Required:** signed server session ownership or authenticated anonymous identities, enforced for both REST and RPC access. This was an explicit audit release gate, not optional hardening.

### R5 — High: recovery bypasses the new end-user fulfillment checks

References: [service-role bypass](../../supabase/functions/create-printify-order/index.ts#L166), [writable snapshot pricing](../../supabase/functions/process-payment-recovery/index.ts#L104), [privileged forwarding](../../supabase/functions/process-payment-recovery/index.ts#L197).

Recovery still prices a user-writable snapshot and forwards separate user-written line items with the service-role credential. The new fulfillment handler skips payment/order-item verification for service-role callers on the assumption that upstream code verified everything. Recovery verifies ownership of a real payment, not the authoritative value of the items being manufactured. The implementation notes acknowledge this deferral, but the new service-role exemption preserves the bypass.

**Evidence:** source/data-flow review, not a provider execution. Recovery's ability to complete order insertion also depends on deployed schema/defaults; that uncertainty does not make its pricing data trustworthy.

**Required:** recovery resumes a stored server-created order/quote, not arbitrary snapshots. Avoid giving a user-facing recovery path an unchecked privileged fulfillment capability.

### R6 — High: Mollie retries still permanently lose failed payment processing

References: [dedup check](../../supabase/functions/mollie-webhook/index.ts#L68), [event recorded before processing](../../supabase/functions/mollie-webhook/index.ts#L86), [failure after recording](../../supabase/functions/mollie-webhook/index.ts#L147).

Changing the event key to payment ID plus status correctly fixes open→paid suppression. However, the event row is written before the payment/order changes. `is_webhook_processed` tests whether the row exists, not whether processing succeeded. Returning 500 after a failed upsert does not solve retries: the next delivery finds that row and returns 200/skipped.

**Reproduced:** first callback returned 500 on a synthetic transient DB error; its retry returned 200/skipped, and the failed payment write was attempted only once. PayPal's age-based “processed” heuristic also remains.

**Required:** durable received/processing/completed/failed states, transactional completion and a retryable lease. Add failure injection after event recording and before each critical write.

### R7 — High: ambiguous manufacturer failures release the fulfillment claim

Reference: [catch releases claim](../../supabase/functions/create-printify-order/index.ts#L387).

Any failure while reading the manufacturer response clears the claim, including a network disconnect or invalid/truncated JSON after the provider accepted the order. A retry can issue a new create request, or cancellation can observe no manufacturer reference and skip external cancellation. A stable `external_id` alone is not evidence of an enforced provider idempotency guarantee; that guarantee was not demonstrated by this implementation.

**Required:** retain an unknown/pending state after ambiguous failures and reconcile against the manufacturer before retry or refund. Release only when creation is known not to have happened. Coordinate cancellation and fulfillment in the same order state machine; a caller-created `status='cancelled'` is currently not rejected by the fulfillment loader/claim.

## Other incomplete controls

- **Default EXECUTE privileges:** the new migration revokes only PUBLIC's future grant. Existing explicit defaults for anon/authenticated, if present on the deployment, survive. I modeled those explicit defaults locally and a subsequently created definer function remained callable by anon. Revoke defaults for all three roles, account for actual object owners, and verify the effective ACL. This is conditional on deployed defaults, which were not queried.
- **Promotions:** server validation is an improvement, but redemption is still not reserved/consumed. Usage limits cannot be claimed to work without an atomic payment/order-bound reservation or redemption protocol.
- **Catalog authority:** pricing queries do not require active products/available variants and do not use the storefront's product-level selling-price override. Currency is still caller-selected in creation endpoints; it is not tied to a server quote/catalog currency. Add authoritative currency, availability and price selection rather than assuming that any database price is the correct checkout price.
- **Auth and expensive edge abuse:** configured Next.js CAPTCHA now fails closed on missing tokens, but direct Supabase Auth bypass and shared quotas for directly accessible expensive edge functions remain outside the implementation.
- **Refunds/disputes:** provider-owned payment checks and cancellation rejection handling improve safety. Pending refund completion, external reversals and atomic eligibility/cancellation coordination remain incomplete.

## What improved

The internal RPC execution revocations, payment-column guards, authenticated cart/coin ownership checks, explicit provider-owner checks on alternate capture/verification endpoints, refusal to refund after known manufacturer cancellation rejection, private owned products, JSON-LD escaping and bounded remote-image streaming are useful changes. The dependency bumps and removal of the public-prefixed token fallback are also appropriate. These improvements should be retained while fixing the remaining boundaries.

## Comparison with the original plan

| Audit requirement | Assessment |
|---|---|
| SEC-01: restrict privileged RPCs | Substantially addressed for enumerated signatures; deployed overload/default ACL verification remains |
| SEC-02: require immutable paid order before fulfillment | Incomplete: R1, R2 and R7 |
| SEC-03: patch framework/image dependencies | Version bumps implemented; this review did not rerun a registry advisory audit |
| SEC-04: isolate guest sessions | Not completed: R4 |
| SEC-05: server-owned financial and fulfillment records | Partial UPDATE protection; unsafe customer INSERT retained |
| SEC-06: authoritative server pricing and payment binding | Pricing improved, immutable binding absent; legitimate flow regresses in R3 |
| SEC-07: immutable recovery | Not completed: R5 |
| SEC-08: authoritative cancellation | Provider rejection fixed; race/unknown-outcome coordination incomplete |
| SEC-09: payment endpoint ownership | Substantially addressed |
| SEC-10: private custom products | Owner filtering implemented; ownerless legacy rows remain public by policy |
| SEC-11: ownership-safe user RPCs | Improved for authenticated users; guest helper still unsafe |
| SEC-12: retry-safe callbacks | Partial transition fix, R6 remains |
| SEC-13: Auth-service protection and durable quotas | Only custom route missing-token behavior addressed |
| SEC-14: bounded image handling | Meaningful bounds added; distributed resource quotas remain |

## Verification and documentation corrections

- **265 tests passed across 16 selected security/auth/payment/image test files.** Those passing tests do not cover the full payment-to-order trust boundary or the failure cases reproduced above.
- The repository's **local hardening SQL harness passed** on PostgreSQL 15. Additional checks then demonstrated cross-guest access and owner INSERT of a paid/cancelled order with an arbitrary fulfillment identifier. The application targets PostgreSQL 17; this was a targeted authorization test, not a full Supabase migration replay.
- Offline execution of actual modules reproduced R1/R2, R3 and R6. Authentication, database and provider adapters were synthetic; no production exploitability claim depends on contacting live systems.
- A Deno check of the four payment/fulfillment entrypoints failed with three diagnostics: an extensionless `supabase/types/success` import, incomplete PayPal shipping-address typing, and possibly undefined `shipping_address.zip`. These need baseline triage; I am not attributing all three to this commit.
- `tsc --noEmit --incremental false` failed because existing `.next` generated validator files still refer to the deleted PayPal creation route. This is a stale generated-artifact issue in the current workspace, not proof of a clean-build source error. I did not remove the user's build artifacts or claim a clean build.
- The earlier implementation review incorrectly says audit commit `9f1f89a` does not exist. `git cat-file -t 9f1f89a` returns `commit`. That commit's auth route required CAPTCHA in production/configured environments; baseline `69aa498` contains the later missing-token regression. Critique must distinguish these snapshots. The original audit's reported test results cannot be disproved by testing a different commit.
- The promised isolated branch `fix/security-boundaries-20260923` is still at `69aa498`; the reviewed implementation lives on `securityChat`. This review did not move commits, create a PR, push code or deploy anything.

**Next step:** fix R1–R7 with end-to-end trust-boundary and failure-injection tests before seeking approval to merge. Server quote/order creation, immutable payment binding, recovery and fulfillment must be delivered together; the current partial solution cannot safely be presented as closing the financial exploit paths.
