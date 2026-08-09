# Analytics Tracking System Implementation Plan

## Overview

Implement Google Analytics 4 (GA4) tracking across the application to track key user actions. Leverage the existing Button component from the design system and create a centralized analytics service with comprehensive test coverage.

## Architecture

### Core Components

1. **Analytics Service** (`/src/services/analyticsService.ts`)
   - Singleton service for GA4 integration
   - Type-safe event tracking methods
   - Development mode logging (no actual GA calls in dev)

2. **Analytics Context** (`/src/features/analytics/`)
   - React context for analytics state
   - Custom hooks for component-level tracking

3. **Button Enhancement** (`/src/features/ui/button.tsx`)
   - Add optional `trackingId` and `trackingData` props
   - Auto-track clicks when tracking props provided

## Implementation Steps

### Step 1: Environment Setup

**File: `.env.local` (user must add)**
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Step 2: Create Analytics Service

**File: `/src/services/analyticsService.ts`**

```typescript
// Core analytics service with:
// - gtag initialization
// - Type-safe event methods
// - Development mode support
// - Queue for events before GA loads
```

**Key Events to Track:**

| Category | Event Name | Parameters |
|----------|------------|------------|
| **Auth** | `sign_up`, `login`, `logout` | method (email/google) |
| **Stamp Flow** | `product_select`, `image_upload`, `generate_start`, `generate_complete` | product_id, step |
| **Customization** | `color_select`, `size_select`, `create_product` | color, size, product_id |
| **Cart** | `add_to_cart`, `remove_from_cart`, `view_cart` | product_id, price, quantity |
| **Checkout** | `begin_checkout`, `add_payment_info`, `purchase` | value, currency, items |
| **Navigation** | `page_view`, `step_change` | page_path, step_name |

### Step 3: Add GA Script to Layout

**File: `/src/app/layout.tsx`**

Add Google Analytics script tag with the measurement ID from environment variable.

### Step 4: Create Analytics Hook

**File: `/src/features/analytics/hooks/useAnalytics.ts`**

```typescript
export function useAnalytics() {
  return {
    trackEvent: (name, params) => analyticsService.track(name, params),
    trackPageView: (path) => analyticsService.pageView(path),
  };
}
```

### Step 5: Enhance Button Component

**File: `/src/features/ui/button.tsx`**

Add optional tracking props:
```typescript
interface ButtonProps {
  // ... existing props
  trackingId?: string;      // Event name for analytics
  trackingData?: Record<string, string | number>;  // Additional data
}
```

When `trackingId` is provided, automatically call `analyticsService.track()` on click.

### Step 6: Instrument Key Actions

**Priority 1 - E-commerce (GA4 Enhanced E-commerce)**

| File | Action | Event |
|------|--------|-------|
| `src/features/stamp/ui/sections/ProductSelectionSection/ProductCard.tsx` | Product selected | `select_item` |
| `src/features/stamp/lib/hooks/useStampCartActions.ts` | Add to cart | `add_to_cart` |
| `src/features/cart/ui/sections/CartItemCard/CartItemCardActions.tsx` | Remove from cart | `remove_from_cart` |
| `src/features/checkout/ui/sections/CheckoutSummarySection/CheckoutStripeButton.tsx` | Purchase complete | `purchase` |

**Priority 2 - Stamp Flow**

| File | Action | Event |
|------|--------|-------|
| `src/features/stamp/ui/sections/UploadSection/UploadDropzone.tsx` | Image uploaded | `stamp_image_upload` |
| `src/features/stamp/ui/sections/SynthesisSection/SynthesisForm.tsx` | Generate clicked | `stamp_generate_start` |
| `src/features/stamp/lib/hooks/useStampImageGeneration.ts` | Generation complete | `stamp_generate_complete` |
| `src/features/stamp/ui/sections/CustomizationSection/CustomizationControls.tsx` | Create product | `stamp_create_product` |

**Priority 3 - Authentication**

| File | Action | Event |
|------|--------|-------|
| `src/features/auth/login/LoginForm.tsx` | Login success | `login` |
| `src/features/auth/register/RegisterForm.tsx` | Sign up success | `sign_up` |
| `src/features/auth/components/GoogleSignInButton.tsx` | Google auth | `login`/`sign_up` with method: 'google' |

### Step 7: Create Analytics Tests

**Unit Tests: `/src/services/__tests__/analyticsService.test.ts`**

- Test event formatting
- Test development mode behavior (no gtag calls)
- Test queue functionality before GA loads
- Mock gtag and verify correct parameters

**Integration Tests: `/src/features/analytics/__tests__/`**

- Test Button tracking integration
- Test hook behavior
- Test context provider

**E2E Tests: `/e2e/analytics.spec.ts`**

- Mock `window.gtag` and verify calls during user flows
- Test stamp flow events sequence
- Test checkout events sequence
- Verify all required parameters present

## Files to Create

| File | Purpose |
|------|---------|
| `/src/services/analyticsService.ts` | Core GA4 service |
| `/src/features/analytics/index.ts` | Feature barrel export |
| `/src/features/analytics/hooks/useAnalytics.ts` | React hook |
| `/src/features/analytics/types/analyticsTypes.ts` | TypeScript definitions |
| `/src/services/__tests__/analyticsService.test.ts` | Unit tests |
| `/e2e/analytics.spec.ts` | E2E tests |

## Files to Modify

| File | Changes |
|------|---------|
| `/src/app/layout.tsx` | Add GA script |
| `/src/features/ui/button.tsx` | Add tracking props |
| `/src/features/stamp/lib/hooks/useStampCartActions.ts` | Add cart tracking |
| `/src/features/auth/login/LoginForm.tsx` | Add auth tracking |
| `/src/features/checkout/ui/sections/CheckoutSummarySection/CheckoutStripeButton.tsx` | Add purchase tracking |

## Testing Strategy

### Unit Tests (Vitest)

```typescript
// analyticsService.test.ts
describe('AnalyticsService', () => {
  it('should format events correctly');
  it('should not call gtag in development');
  it('should queue events before GA loads');
  it('should include required e-commerce params');
});
```

### E2E Tests (Playwright)

```typescript
// analytics.spec.ts
test('tracks complete stamp flow', async ({ page }) => {
  // Intercept gtag calls
  const gtagCalls: any[] = [];
  await page.addInitScript(() => {
    window.gtag = (...args) => gtagCalls.push(args);
  });

  // Complete stamp flow
  // Assert all expected events were fired
});
```

## Verification

1. **Development Testing**
   - Run `npm run dev`
   - Open browser console
   - Verify analytics events logged (not sent to GA)
   - Complete stamp flow and check event sequence

2. **Unit Tests**
   - Run `npm run test`
   - Verify all analytics tests pass

3. **E2E Tests**
   - Run `npm run test:e2e`
   - Verify analytics flow tests pass

4. **Production Verification**
   - Deploy to staging with real GA ID
   - Use GA4 DebugView to verify events
   - Check real-time reports in GA4 dashboard

## Dependencies

No new npm packages required. Uses native `gtag.js` from Google.

## Estimated Scope

- **New files**: 6
- **Modified files**: 5-8
- **Test files**: 2
