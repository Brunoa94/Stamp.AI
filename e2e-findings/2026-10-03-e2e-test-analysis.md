# E2E Test Analysis Report - Agent Handoff Document

**Date:** 2026-10-03
**Branch:** fixingIntegrationTests
**Status:** Acceptance E2E suite green after follow-up fixes

## Follow-up result (2026-10-03)

- Latest full Playwright run: **114 passed, 33 skipped, 0 failed** across desktop and mobile (147 total). The suite runs with one worker because cases share a test user and remote cart. Skips cover desktop-specific preview controls, database/Stripe cases run once on desktop, and existing conditional analytics cases.
- `npx tsc --noEmit`, `git diff --check`, and `npm run build` passed.
- Playwright now starts the test server with webpack because the stamp page hangs during Turbopack development compilation. Development CSP permits webpack's `unsafe-eval`; the worker source is explicitly allowed.
- Reworked tests that targeted the old stamp wizard or attempted to use protected `/stamp` without authentication. Added a real image-upload interaction, desktop and mobile journeys through design creation, cart, and checkout, plus PayPal and iDEAL checkout-selection tests that check the amount and shipping/discount payload. AI generation and Printify creation are mocked in these UI journeys to avoid spending coins or creating external products.
- Corrected checkout payment payloads: providers receive amounts in euros and the shipping/discount cents used by their price checks. The live Stripe test verifies a succeeded payment and paid order. PayPal and iDEAL initiation is covered in the browser with mocked provider responses; hosted sandbox approval/capture and return processing remain untested by this suite.
- Fixed `CartService.getOrCreateCart` to choose the newest active cart when the test user has multiple carts; the restored cart journey exposed the previous `maybeSingle()` failure.
- The original report counted 219 Playwright cases. The smaller current count reflects consolidation of repeated stamp DOM checks, removal of unauthenticated screens blocked by middleware, and replacement of obsolete provider journeys. A green run does not imply all of those original scenarios have equivalent coverage; the external PayPal/Mollie completion flows are the material remaining gap.
- The test account's coins were restored to 5 after earlier live generation tests used four coins.
- The test catalog still has a Canvas Tote Bag fixture with blueprint 145, which is not a tote blueprint for the preview configuration. The tote test overrides that catalog response with blueprint 553. This fixture should be corrected in the test project when catalog data is next refreshed.

The detailed findings below describe the original failing run and are retained as the investigation history.

---

## AGENT HANDOFF SUMMARY

### Tasks Completed
1. ✅ Ran full Playwright e2e test suite (219 tests)
2. ✅ Analyzed all test failures and categorized by root cause
3. ✅ Identified two distinct root causes for failures
4. ✅ Verified production build works (`npx next build` succeeds)
5. ✅ Isolated issue to Turbopack dev compilation

### Key Finding
**The `/stamp` page hangs during Turbopack compilation in dev mode.** Production builds work fine. This is a Turbopack-specific issue causing ~100 e2e tests to fail.

### Immediate Fix Options
1. **Option A**: Disable Turbopack for dev (use webpack) - Quick fix
2. **Option B**: Investigate Turbopack compatibility issue in stamp feature
3. **Option C**: Skip stamp tests until Turbopack is fixed

---

## Executive Summary

The Playwright e2e test suite has **219 tests** with significant failures in the Stamp-related tests. This analysis identifies the root causes and provides recommendations.

## Test Results Overview

| Category | Passing | Failing | Skipped |
|----------|---------|---------|---------|
| Auth Setup | 1 | 0 | 0 |
| Analytics | 2 | 0 | 2 |
| Orders Loading | 3 | 0 | 0 |
| Stamp Flow | 0 | ~47 | 0 |
| Stamp Coins | 0 | ~11 | 0 |
| Design Adjustment | 0 | 8 | 0 |
| Other Stamp Tests | 0 | ~30+ | 0 |

## Root Causes Identified

### Issue 1: Protected Route Redirect (Unauthenticated Tests)

**Affected Tests:**
- `stamp-coins.e2e.spec.ts` → "Unauthenticated user" describe block (5 tests)
- `coins-flow.e2e.spec.ts` → "Unauthenticated user journey" tests
- Any test using `storageState: { cookies: [], origins: [] }`

**Root Cause:**
The `/stamp` route is protected by middleware (`src/middleware.ts:162-183`):
```typescript
const PROTECTED_PREFIXES = [
  "/stamp",
  "/orders",
  // ...
];
// Redirects to "/" if no authenticated user
```

Tests that clear the storage state to test "unauthenticated user" behavior get redirected to the homepage before they can reach `/stamp`. They then fail looking for elements like `#step-2`, `coins-overlay-login`, etc. which don't exist on the homepage.

**Recommendation:**
These tests test an impossible scenario. Options:
1. **Remove these tests** - If the design is that `/stamp` requires authentication
2. **Update tests to verify redirect behavior** - Test that unauthenticated users are properly redirected
3. **Update middleware** - If the original design was to show a login overlay on `/stamp` for unauthenticated users, remove `/stamp` from `PROTECTED_PREFIXES`

### Issue 2: Stamp Page Hangs During SSR (Authenticated Tests)

**Affected Tests:**
- All `stamp-flow.e2e.spec.ts` tests (~47 tests)
- All `stamp-coins.e2e.spec.ts` "Authenticated user" tests
- All `design-adjustment.e2e.spec.ts` tests
- `coins-flow.e2e.spec.ts` authenticated tests

**Symptoms:**
- `page.goto("/stamp")` times out with `net::ERR_ABORTED`
- curl requests to `/stamp` with valid auth cookie hang indefinitely
- Other protected routes like `/orders` work fine

**Root Cause:**
The `/stamp` page hangs during server-side rendering for authenticated users. This appears to be a blocking operation somewhere in:
- `generateMetadata()` with `getTranslations()` in `src/app/stamp/page.tsx`
- Potential dependency issue during SSR compilation

**Evidence:**
- Server logs show: `○ Compiling /stamp ...` and then hangs
- `/orders` page loads in ~500ms, `/stamp` never completes
- This is NOT a Playwright issue - even `curl` hangs

**Recommendation:**
1. Debug the `/stamp` page SSR by adding logging to `generateMetadata()`
2. Check if `getTranslations("stamp.metadata")` is blocking
3. Verify all translation keys exist in `src/i18n/messages/en.json`
4. Consider making the page a client component (`"use client"`) to bypass SSR issues

### Issue 3: Printify Image 400 Errors (Non-blocking)

**Symptoms:**
```
upstream image response failed for https://images.printify.com/mockup/... 400
```

**Impact:** These are logged but don't appear to be blocking tests. The test images don't exist in the test environment.

**Recommendation:**
- Create test fixtures for mockup images
- Or configure Next.js image optimization to handle missing images gracefully

## Test Files Requiring Updates

### `src/features/stamp/__tests__/stamp-coins.e2e.spec.ts`
- Lines 18-84: "Unauthenticated user" tests - cannot work with protected route
- Lines 93-150: "Authenticated user" tests - blocked by SSR hang

### `src/features/stamp/__tests__/stamp-flow.e2e.spec.ts`
- All tests blocked by SSR hang
- `beforeEach` navigation never completes

### `src/features/stamp/__tests__/design-adjustment.e2e.spec.ts`
- All tests blocked by SSR hang

### `src/tests/e2e/coins-flow.e2e.spec.ts`
- Lines 99-145: Unauthenticated tests need rework

## Passing Tests

The following tests pass and can be used as reference:
- `src/features/auth/auth.setup.ts` - Authentication setup works
- `src/features/analytics/__tests__/analytics.e2e.spec.ts` - Basic page navigation works
- `src/features/orders/__tests__/orders-loading.e2e.spec.ts` - Protected route with auth works

## Action Items

### High Priority
1. **Fix `/stamp` SSR hang** - This is the blocker for all authenticated stamp tests
   - Investigate `generateMetadata()` and translation loading
   - Add timeout handling to prevent infinite hangs

### Medium Priority
2. **Decide on unauthenticated user testing strategy**
   - Either remove tests or update middleware

### Low Priority
3. **Add test image fixtures** for Printify mockups
4. **Consider increasing test timeouts** once SSR is fixed

## Environment Details

- Node.js: Using Turbopack (Next.js 16.1.6)
- Test Project: `tgccxydchvujhrqyzqao` (Supabase)
- Playwright Config: `playwright.config.ts`
- Auth State: `playwright/.auth/user.json`

---

## DETAILED INVESTIGATION FINDINGS

### Investigation Timeline

1. **Initial Test Run**: 219 tests, ~100+ failures in stamp-related tests
2. **First Hypothesis**: Protected route redirect causing failures
   - Confirmed: Unauthenticated tests ARE affected by middleware redirect
   - But authenticated tests also fail (different cause)

3. **Second Hypothesis**: Authentication not working
   - Tested: Auth setup passes, `/orders` page works with auth
   - Confirmed: Auth is working correctly

4. **Third Hypothesis**: Stamp page SSR blocking
   - Tested with curl: Request hangs indefinitely
   - Server shows: `○ Compiling /stamp ...` and never completes
   - Other pages (`/orders`) compile and respond in <1 second

5. **Root Cause Identified**: Turbopack compilation hang
   - `npx next build` (production) completes in 4.8s including `/stamp`
   - `npx next dev` (Turbopack) hangs on `/stamp` compilation
   - Issue is specific to Turbopack dev mode

### Test Results Summary

| Test Category | Pass | Fail | Skip | Notes |
|---------------|------|------|------|-------|
| Auth Setup | 1 | 0 | 0 | Works correctly |
| Analytics | 2 | 0 | 2 | Works (goes to /, not /stamp) |
| Orders Loading | 3 | 0 | 0 | Works correctly |
| Stamp Flow | 0 | 47 | 0 | Blocked by Turbopack hang |
| Stamp Coins | 0 | 11 | 0 | Blocked by Turbopack hang |
| Design Adjustment | 0 | 8 | 0 | Blocked by Turbopack hang |
| Other Stamp | 0 | 30+ | 0 | Blocked by Turbopack hang |

### Commands to Reproduce

```bash
# Reproduce the hang:
npm run dev:test &
sleep 15
COOKIE=$(cat playwright/.auth/user.json | jq -r '.cookies[0].value')
curl -m 30 http://localhost:3000/stamp -H "Cookie: sb-tgccxydchvujhrqyzqao-auth-token=$COOKIE"
# Observe: Server shows "Compiling /stamp" but never finishes

# Verify production build works:
npx next build
# Observe: Completes successfully including /stamp
```

### Files Examined
- `src/app/stamp/page.tsx` - Simple page with async generateMetadata
- `src/features/stamp/ui/StampPage.tsx` - Client component ("use client")
- `src/features/stamp/ui/StampCanvas.tsx` - Main canvas component
- `src/middleware.ts` - Protects /stamp route (lines 162-183)
- `playwright.config.ts` - Uses webServer with `npm run dev:test`

### Passing vs Failing Pattern
- **Passing**: Pages that don't use stamp feature imports
- **Failing**: Any page/test that triggers `/stamp` route compilation

---

## NEXT STEPS FOR FOLLOWING AGENT

### Priority 1: Fix Turbopack Hang
Check these potential causes:
1. **Circular imports** in `src/features/stamp/` - Use `madge` to detect
2. **Large static imports** that Turbopack struggles with
3. **Dynamic imports** that may be misconfigured
4. **next-intl** integration with Turbopack (generateMetadata uses getTranslations)

### Priority 2: Quick Workaround
If Turbopack fix is complex, modify `playwright.config.ts`:
```typescript
webServer: {
  // Change from: npm run dev:test
  // To: npm run dev:test -- --turbo=false
  command: "npm run dev:test -- --turbo=false",
  // ...
}
```

### Priority 3: Update Unauthenticated Tests
The 5-6 tests in "Unauthenticated user" describe blocks need updating since `/stamp` is protected.

---

## FILES CREATED/MODIFIED

1. **Created**: `e2e-findings/2026-10-03-e2e-test-analysis.md` (this file)
2. **Deleted**: `src/tests/e2e/test-stamp.e2e.spec.ts` (debug test file)
