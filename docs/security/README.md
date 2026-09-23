# Security audit artifacts

Start with [the assessment](SECURITY-AUDIT-2026-09-23.md). Findings refer to commit `9f1f89a`; audit files are the only repository additions. The reproductions intentionally demonstrate vulnerable behavior. They are **not** regression tests that should remain passing after a fix.

## Offline payment checks

From the repository root with existing dependencies installed:

```sh
node docs/security/reproduce-payment-boundaries.cjs
```

This executes actual TypeScript modules with synthetic authentication, database and provider adapters. Every import/fetch must be explicitly mocked. It does not load environment files or contact providers. It asserts that the current vulnerable paths accept an unverified discount, create an unpaid fulfillment order, and initiate a refund after rejected manufacturer cancellation. Results are in `payment-boundary-results.txt`.

## Isolated database reproduction

`build-local-repro.py` extracts selected actual functions/policies and adds synthetic tables/records plus simplified Supabase JWT helper functions. It does not replay all migrations or inspect production. Standard Supabase table grants are modeled explicitly; PostgreSQL default function EXECUTE privileges are used. PostgreSQL 15 was available for this audit; the application targets 17.

Run only in a **new disposable local cluster**. The SQL creates roles and fixture tables and is not suitable for an existing application database. With PostgreSQL binaries on PATH, this script creates and stops a separate instance on port 55439:

```sh
set -eu
audit_dir=$(mktemp -d /tmp/imaginary-security.XXXXXX)
initdb -D "$audit_dir/data" -U postgres -A trust > "$audit_dir/init.log"
pg_ctl -D "$audit_dir/data" -l "$audit_dir/postgres.log" -o '-p 55439 -h 127.0.0.1' start
trap 'pg_ctl -D "$audit_dir/data" stop -m fast' EXIT
python3 docs/security/build-local-repro.py > "$audit_dir/repro.sql"
psql -X -v ON_ERROR_STOP=1 -h 127.0.0.1 -p 55439 -U postgres -d postgres -f "$audit_dir/repro.sql"
```

If that port is in use, choose an unused local port in both commands. Audit execution output is saved in `local-postgres-results.txt`. The fixture users, emails and payment references are synthetic. The audit cluster was stopped after execution.

## Deployment verification

`live-access-inventory.sql` runs in a read-only transaction and selects policies, ACLs, function execution privileges, triggers, bucket configuration and applied migration versions. It does not select customer records, object contents or secret values. Run it through an authorized database-admin connection to the relevant deployment, and compare results with the report. Definitions/default ACLs and old function overloads may differ from checked-in migrations. The audit did not run this against production.

`definer-declarations.json` is a search aid containing historical SECURITY DEFINER declaration candidates. It is not a list of effective privileges and includes replaced versions; use the live SQL for authoritative results.

## Test and dependency evidence

- Full existing Vitest run: 85 files passed / 9 failed; 1,147 tests passed / 15 failed. Four integration suites failed initialization because Supabase environment variables were missing. Remaining failures: analytics, coins mocks, custom-product mocks, catalog rendering and AuthDialog provider setup.
- Focused run: 12 files / 188 tests passed. Command:

```sh
npx vitest run src/tests/security-review.test.ts src/tests/payment-security.test.ts src/lib/security src/app/api/auth src/app/api/validate-promocode/route.test.ts --reporter=dot
```

- Full registry output: `npm-audit-2026-09-23.json`.
- Production dependency tree: `npm-audit-production-2026-09-23.json`.

Package advisories are time-sensitive. Re-run `npm audit` and `npm audit --omit=dev` after dependency changes; assess runtime reachability separately from severity labels. No `npm audit fix`, deployment, provider transaction or production migration was performed.
