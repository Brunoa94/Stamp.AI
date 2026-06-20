# Checkout Payment Submission Refactoring

## Overview
Refactored `usePaymentSubmission` hook to follow project patterns for services, queries, and error handling.

## Changes Made

### 1. Created PaymentService (`lib/services/paymentService.ts`)
A static service class following the project's service pattern with:
- `prepareStripePayment()` - Validates cart, builds checkout data, creates payment intent
- `preparePayPalPayment()` - Builds checkout data for PayPal processing
- `validatePaymentData()` - Validates form data and cart before processing
- Proper error handling using `ErrorClient.handleError()`
- Clear service/action naming for error tracking

**Key Features:**
- Uses `CheckoutDataBuilder` for data transformation
- Uses `CheckoutStorageService` for persisting checkout data
- Uses `StripeService` for creating payment intents
- All errors wrapped with context for debugging

### 2. Created Payment Queries (`lib/queries/paymentQueries.ts`)
TanStack Query mutation hooks following the project's query pattern:
- `usePrepareStripePayment()` - Mutation for Stripe payment preparation
- `usePreparePayPalPayment()` - Mutation for PayPal payment preparation
- Uses `useErrorHandler` for consistent error display
- `retry: false` for payment operations (no automatic retries)
- Proper mutation keys for cache management

**Pattern Alignment:**
- ✅ Uses `useMutation` from TanStack Query
- ✅ Handles errors with `useErrorHandler` hook
- ✅ No retry on payment operations
- ✅ Clear mutation keys: `["payment", "prepare-stripe"]`

### 3. Refactored usePaymentSubmission (`lib/hooks/usePaymentSubmission.ts`)

**Before:**
```typescript
- Manual error state management with useState
- Direct service calls in the hook
- Console.log for debugging
- No structured error handling
- No query invalidation or caching
```

**After:**
```typescript
- Uses PaymentService for business logic
- Uses TanStack Query mutations (usePrepareStripePayment)
- Uses useErrorHandler for consistent error handling
- Returns proper loading/error states from mutation
- Explicit Promise<void> return type for type safety
- Validates payment data before processing
```

**New Hook Signature:**
```typescript
interface UsePaymentSubmissionParams {
  cart: CartWithItems | null;
  amount: number; // NEW: Required for payment intent creation
}

Returns:
{
  submitPayment: (formData: CheckoutFormData) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
  isSuccess: boolean;
  reset: () => void;
}
```

### 4. Updated CheckoutPageContent (`ui/CheckoutPageContent.tsx`)
- Now uses `useCheckoutPricing` to get the total amount
- Passes `amount` to `usePaymentSubmission`
- Cleaner separation of concerns

**Before:**
```typescript
const { submitPayment, isSubmitting, error } = usePaymentSubmission({ cart });
```

**After:**
```typescript
const { total } = useCheckoutPricing({ cart });
const { submitPayment, isSubmitting, error } = usePaymentSubmission({
  cart,
  amount: total,
});
```

### 5. Updated Exports
- Added `PaymentService` to `lib/services/index.ts`
- Created `lib/queries/index.ts` for payment queries
- Updated `lib/index.ts` to export new queries

## Project Patterns Followed

### ✅ Service Pattern
- Static class-based services
- Single responsibility per service
- Error wrapping with `ErrorClient.handleError({ error, service, action })`
- Type-safe with Zod validation (where applicable)
- Clear naming: Service + action (e.g., "Payment - Prepare Stripe Payment")

### ✅ Query Pattern (TanStack Query)
- `useMutation` for write operations
- `onError` callbacks with `useErrorHandler`
- Proper mutation keys for cache management
- `retry: false` for non-idempotent operations
- Query invalidation for related data

### ✅ Error Handling Pattern
- All service errors go through `ErrorClient.handleError()`
- UI errors handled by `useErrorHandler` hook
- Automatic toast notifications
- Structured error objects with codes
- Error messages mapped through `ERROR_MESSAGES`

## Benefits

### 1. Consistency
- Follows established patterns across the codebase
- Same error handling as other features
- Same service/query structure as cart, orders, etc.

### 2. Maintainability
- Clear separation of concerns (service → query → hook)
- Business logic in services (testable)
- UI logic in hooks (composable)
- Centralized error handling

### 3. Developer Experience
- Better TypeScript support
- Easier to debug (structured errors with context)
- Easier to test (static services, mutations)
- Query devtools integration

### 4. User Experience
- Consistent error messages
- Toast notifications for all errors
- Loading states managed by TanStack Query
- No duplicate payment attempts (retry: false)

## File Structure

```
src/features/checkout/lib/
├── services/
│   ├── paymentService.ts          # NEW: Payment business logic
│   ├── checkoutDataBuilder.ts     # Existing: Data transformation
│   ├── checkoutStorageService.ts  # Existing: LocalStorage management
│   └── index.ts                   # Updated: Added PaymentService export
├── queries/
│   ├── paymentQueries.ts          # NEW: TanStack Query mutations
│   └── index.ts                   # NEW: Query exports
├── hooks/
│   ├── usePaymentSubmission.ts    # REFACTORED: Uses service + queries
│   └── useCheckoutPricing.ts      # Existing: Pricing calculations
└── index.ts                       # Updated: Added query exports
```

## Testing Considerations

### What to Test

1. **PaymentService**
   - `validatePaymentData()` with valid/invalid data
   - `prepareStripePayment()` with mock cart/form data
   - Error handling with various error types

2. **Payment Queries**
   - Mutation success/error callbacks
   - Error handler integration
   - Retry: false enforcement

3. **usePaymentSubmission**
   - Stripe payment flow
   - PayPal warning (shouldn't be called)
   - Validation errors
   - Loading states

## Migration Notes

### Breaking Changes
- `usePaymentSubmission` now requires `amount` parameter
- Return type explicitly `Promise<void>` (was inferred before)
- No longer returns payment data (void return)

### Backward Compatibility
- All existing functionality preserved
- Same error messages
- Same UI behavior
- Same validation logic

## Future Improvements

1. **Add Unit Tests**
   - Test PaymentService methods
   - Test mutation hooks
   - Test usePaymentSubmission

2. **Add Optimistic Updates**
   - Could update UI before payment completes
   - Revert on error

3. **Add Payment Status Tracking**
   - Query for payment intent status
   - Poll for confirmation

4. **Add Payment Recovery**
   - Use existing payment recovery service
   - Integrate with new payment flow

## References

- Service Pattern: `/src/services/orderService.ts`
- Query Pattern: `/src/queries/orderQueries.ts`
- Error Handling: `/src/services/errorClient.ts`, `/src/hooks/useErrorHandler.ts`
- Similar Refactoring: Cart, Order, PromoCode features
