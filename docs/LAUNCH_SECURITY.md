# Launch security remediation

This branch builds on the server checkout/finalization fixes already on main.

## Changes

- Remove session-ID-based guest database access. Guests use local browser state;
  authenticated cart RPCs execute under RLS and require ownership.
- Restrict all financial mutation RPC overloads to server callers. Remove browser
  payment writes and protect order/provider fields.
- Register custom product and uploaded image ownership on the server. Prevent a
  browser from claiming a supplied shop product ID; authorize provider lookups.
- Use database-backed per-user limits for direct image/product/payment calls.
- Spend daily free edits first, then purchased credits, with a server-only debit
  receipt. Refund a failed generation at most once and to its original balance.
- Display actual edit balances and custom product counts instead of placeholders.
- Clear design/cart/address state on logout and account changes, preserving consent.
- Require configured CAPTCHA tokens, restrict image sources to named CDNs/our
  storage project, and stream image responses with size and time limits.
- Reject test fulfillment in production instead of converting it into live work.
  Require successful payment state and use the stored order destination.
- Upgrade Next.js and affected production dependencies; improve functional text
  contrast, read-only fields, mobile cookie layout and homepage length. Remove
  unsubstantiated homepage ratings/order counters and absolute security promises.

## Deployment

Apply **all** main and branch migrations in order before deploying this branch's
Next.js app and Edge Functions. The application relies on the new ownership,
operation-limit and generation-receipt tables/functions. Redeploy every Edge
Function consuming changed shared helpers, including finalization/webhooks.
Production was not changed during development; only the dedicated acceptance
project was used. The PR CI deploys and tests the dedicated test project.

After production deployment, verify RPC grants, RLS, protected-field triggers,
provider ownership, generation failure refunds, and a complete payment/fulfillment
journey with the intended live configuration. Do not infer deployment success
from the existence of migration files alone.

## Validation

New real-database acceptance cases cover anonymous financial RPC denial, cart
ownership, legacy guest-cart isolation, blocked financial/product writes, and
purchased credit usage with idempotent refunds. Both desktop and mobile security
runs passed 48 tests before the complete CI run. Unit tests passed 1,348 tests;
TypeScript, the production build and acceptance harness contracts passed.
`npm audit --omit=dev` reported zero vulnerabilities after dependency updates.
Refer to the PR's GitHub checks for validation of the final commit.

The existing CI excludes Google OAuth, delivered-email scenarios and PayPal/Mollie
purchase scenarios until their CI credentials are provisioned. This change does
not add exclusions, skips, retries or weaker assertions. Those provider-specific
journeys still require separate verification before launch.

## Deferred by the owner

The owner will fill the verified company address, registration/KvK and VAT
information in `src/features/legal/lib/constants/legalEntity.ts` later. These
remain a release prerequisite; no company facts were invented for this PR.
Operational promises (staff MFA, provider agreements, retention and incident
processes) also require the owner's confirmation, beyond code verification.
