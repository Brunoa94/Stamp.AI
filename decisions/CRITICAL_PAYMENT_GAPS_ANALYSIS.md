# 🚨 CRITICAL PAYMENT SAFETY GAPS ANALYSIS

## Executive Summary

**CRITICAL FINDING**: There are **3 scenarios** where a customer can be charged without an order being created and **WITHOUT A REFUND BEING ISSUED**.

This analysis identifies all payment flows and documents where automatic refund safety nets are missing.

---

## Payment Flow Overview

### Three Payment Providers
1. **Stripe** - Handled in frontend (actions.ts)
2. **PayPal** - Handled in frontend (actions.ts) + webhook
3. **Mollie** - Handled in return page + webhook

### Existing Safety Implementation

✅ **OrderFulfillmentService exists** with proper refund logic (lines 69-73)
❌ **OrderFulfillmentService is NOT USED** in any production payment flow (only in tests)

---

## CRITICAL GAP #1: Mollie Return Page

**File**: `src/app/checkout/mollie-return/page.tsx`

### Flow
1. User completes Mollie payment (payment succeeds)
2. Mollie redirects to `/checkout/mollie-return`
3. Page verifies payment status: **PAID** ✅
4. Page attempts to create order from cart (line 144)
5. **Order creation FAILS** ❌

### Current Behavior (Lines 151-159)
```typescript
} catch (orderError) {
  console.error(
    "Failed to create local order from cart after Mollie payment:",
    orderError,
  );
  throw new Error(
    "Payment confirmed, but order creation failed. Please contact support.",
  );
}
```

### ⚠️ THE PROBLEM
- Error is thrown
- User sees error message
- **NO REFUND IS TRIGGERED**
- Customer charged: ✅
- Order created: ❌
- Refund issued: ❌

### Impact
**SEVERITY: CRITICAL**
- Customer loses money
- No order record in database
- No product will be shipped
- Requires manual intervention and customer support ticket

### Expected Behavior
After order creation fails, should:
1. Call `RefundService.processRefund()` with retry logic
2. If refund succeeds: Show error with "refund initiated" message
3. If refund fails: Create `refund_failures` alert for manual processing

---

## CRITICAL GAP #2: Mollie Webhook - Printify Failure

**File**: `supabase/functions/mollie-webhook/index.ts`

### Flow
1. Mollie sends webhook notification
2. Webhook verifies payment status: **PAID** ✅
3. Webhook has line items and shipping address
4. Webhook attempts to create Printify order (line 136)
5. **Printify order creation FAILS** ❌

### Current Behavior (Lines 158-164)
```typescript
if (printifyResponse.ok) {
  const printifyResult = await printifyResponse.json();
  console.log("Printify order created:", printifyResult);
} else {
  const errorText = await printifyResponse.text();
  console.error("Printify order creation failed:", errorText);
}
```

### ⚠️ THE PROBLEM
- Error is logged
- Webhook returns 200 (acknowledges receipt)
- **NO REFUND IS TRIGGERED**
- Customer charged: ✅
- Printify order created: ❌
- Refund issued: ❌

### Impact
**SEVERITY: CRITICAL**
- Customer charged but no product will be manufactured
- No alert for manual intervention
- Silent failure - customer may never know until they ask "where's my order?"

### Expected Behavior
After Printify creation fails, should:
1. Check if order exists in database (might have been created earlier)
2. If no order exists: Trigger refund via `RefundService.processRefund()`
3. If order exists: Create `order_status_reconciliation` alert
4. Log to `refund_failures` or reconciliation table for manual review

---

## CRITICAL GAP #3: Mollie Return Page - Printify Failure

**File**: `src/app/checkout/mollie-return/page.tsx`

### Flow
1. User completes Mollie payment (payment succeeds)
2. Mollie redirects to `/checkout/mollie-return`
3. Page verifies payment status: **PAID** ✅
4. Page creates order from cart successfully ✅
5. Page attempts to create Printify order (line 173)
6. **Printify order creation FAILS** ❌

### Current Behavior (Lines 173)
```typescript
await PrintifyService.createPrintifyOrder(printifyPayload);
```

### ⚠️ THE PROBLEM
- If PrintifyService throws an error, it bubbles up to catch block
- Error is shown to user
- **NO REFUND IS TRIGGERED** (order was already created)
- **NO RECONCILIATION ALERT CREATED**
- Customer charged: ✅
- Order created in DB: ✅
- Printify order created: ❌
- Refund issued: ❌

### Impact
**SEVERITY: HIGH** (not critical because order exists in DB)
- Customer charged, order in database
- No product will be manufactured
- Order shows as "confirmed" but nothing will ship
- Manual intervention required
- No automated alert system

### Expected Behavior
After Printify creation fails (but order exists), should:
1. **DO NOT REFUND** (order was created successfully)
2. Create `order_status_reconciliation` alert
3. Update order status to "pending_fulfillment" or "needs_review"
4. Show user error message indicating team will contact them

---

## ✅ SAFE FLOWS (For Comparison)

### Stripe/PayPal Flow (actions.ts)

**File**: `src/features/checkout/context/CheckoutContextSubscriber/actions.ts`

**Lines 244-280** - Proper refund safety net:
```typescript
} catch (orderError) {
  // Retries have been exhausted by React Query — initiate automatic refund
  console.error("❌ All order creation attempts failed. Initiating refund...");
  try {
    await RefundService.processRefund({
      orderId: String(orderId),
      paymentProvider: provider,
      amount: state.orderAmount,
      reason: "Order creation failed after retry attempts",
      stripePaymentIntentId: provider === "stripe" ? paymentIntent.id : undefined,
      paypalCaptureId: provider === "paypal" ? captureId : undefined,
    });
    console.log("✅ Refund initiated successfully");
  } catch (refundError) {
    console.error("❌ Refund initiation failed:", refundError);
  }
  // Error message includes "A full refund has been initiated..."
}
```

✅ This is the **CORRECT pattern** - should be replicated in Mollie flows.

---

## Root Cause Analysis

### Why These Gaps Exist

1. **Inconsistent Implementation**
   - Stripe/PayPal use `actions.ts` with refund logic
   - Mollie uses separate return page and webhook WITHOUT refund logic
   - OrderFulfillmentService was created but never integrated

2. **Missing Orchestration Layer**
   - OrderFulfillmentService exists with proper refund handling
   - But it's only used in tests, not in production code
   - Each payment provider reimplements the fulfillment logic

3. **Webhook Complexity**
   - Mollie webhook is async and separate from user flow
   - Harder to propagate errors back to user
   - Easy to forget refund safety nets

---

## Recommended Fixes

### Fix #1: Update Mollie Return Page (HIGH PRIORITY)

**File**: `src/app/checkout/mollie-return/page.tsx`

**Location**: Lines 151-159

**Current Code**:
```typescript
} catch (orderError) {
  console.error("Failed to create local order from cart:", orderError);
  throw new Error("Payment confirmed, but order creation failed. Please contact support.");
}
```

**Fixed Code**:
```typescript
} catch (orderError) {
  console.error("Failed to create local order from cart:", orderError);

  // ✅ CRITICAL FIX: Trigger refund
  try {
    await RefundService.processRefund({
      orderId: `temp_mollie_${storedPaymentId}`,
      paymentProvider: "mollie",
      amount: orderAmount, // Need to add this to sessionStorage
      reason: "Order creation failed after Mollie payment",
      molliePaymentId: storedPaymentId,
    });
    console.log("✅ Refund initiated for failed Mollie order");
  } catch (refundError) {
    console.error("❌ Refund initiation failed:", refundError);
    // Create refund_failures alert handled by RefundService
  }

  throw new Error(
    "Payment was successful but order creation failed. A full refund has been initiated and will appear within 3-5 business days."
  );
}
```

**Additional Requirements**:
- Add `orderAmount` to Mollie sessionStorage (currently not stored)
- Import `RefundService` in mollie-return/page.tsx

---

### Fix #2: Update Mollie Webhook (HIGH PRIORITY)

**File**: `supabase/functions/mollie-webhook/index.ts`

**Location**: Lines 158-164

**Current Code**:
```typescript
} else {
  const errorText = await printifyResponse.text();
  console.error("Printify order creation failed:", errorText);
}
```

**Fixed Code**:
```typescript
} else {
  const errorText = await printifyResponse.text();
  console.error("Printify order creation failed:", errorText);

  // ✅ CRITICAL FIX: Check if order exists, if not, trigger refund
  if (!orderId) {
    console.error("❌ No order_id - customer charged with no order. Initiating refund...");

    // Call process-refund edge function
    const refundResponse = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/process-refund`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          order_id: `temp_mollie_${payment.id}`,
          payment_provider: "mollie",
          amount: parseFloat(payment.amount.value),
          reason: "Printify order creation failed for Mollie payment",
          mollie_payment_id: payment.id,
        }),
      }
    );

    if (!refundResponse.ok) {
      console.error("❌ Refund initiation failed:", await refundResponse.text());
      // refund_failures alert will be created by process-refund function
    } else {
      console.log("✅ Refund initiated for failed Mollie Printify order");
    }
  } else {
    // Order exists in DB, create reconciliation alert
    console.log("⚠️ Creating reconciliation alert - order exists but Printify failed");
    await supabaseRest("order_status_reconciliation", "POST", {
      order_id: orderId,
      expected_status: "confirmed",
      actual_status: "pending",
      error_message: errorText,
      reconciliation_status: "pending",
    });
  }
}
```

---

### Fix #3: Update Mollie Return Printify Failure Handling (MEDIUM PRIORITY)

**File**: `src/app/checkout/mollie-return/page.tsx`

**Location**: Line 173

**Wrap Printify call in try-catch**:
```typescript
try {
  await PrintifyService.createPrintifyOrder(printifyPayload);

  if (createdOrderId) {
    await OrderService.updateOrderStatus(createdOrderId, "confirmed");
  }
} catch (printifyError) {
  console.error("❌ Printify order creation failed:", printifyError);

  if (createdOrderId) {
    // Order exists - DO NOT REFUND
    // Update order status and create reconciliation alert
    try {
      await OrderService.updateOrderStatus(createdOrderId, "needs_review");
    } catch (statusError) {
      console.error("Failed to update order status:", statusError);
    }

    // Show user error but indicate order was placed
    setStatus("error");
    setErrorMessage(
      "Your order was placed but we encountered an issue sending it for production. Our team will review and contact you within 24 hours."
    );
    return;
  } else {
    // No order exists - this shouldn't happen at this point
    // but handle defensively
    throw printifyError;
  }
}
```

---

### Fix #4: Integrate OrderFulfillmentService (RECOMMENDED - LONG TERM)

**Goal**: Use OrderFulfillmentService uniformly for all payment providers

**Benefits**:
- Single source of truth for fulfillment logic
- Automatic retry with exponential backoff
- Automatic refund on failure
- Consistent error handling

**Implementation**:
1. Update Mollie return page to use `OrderFulfillmentService.fulfill()`
2. Update Mollie webhook to use service role to call fulfillment endpoint
3. Ensure Stripe/PayPal flows can migrate to OrderFulfillmentService
4. Deprecate duplicate fulfillment logic

---

## Testing Checklist

After implementing fixes, test these scenarios:

### Mollie Return Page
- [ ] Mollie payment succeeds, order creation fails → Refund triggered
- [ ] Mollie payment succeeds, order created, Printify fails → No refund, reconciliation alert
- [ ] Mollie payment succeeds, all steps succeed → Happy path

### Mollie Webhook
- [ ] Webhook receives PAID, no order_id, Printify fails → Refund triggered
- [ ] Webhook receives PAID, has order_id, Printify fails → Reconciliation alert
- [ ] Webhook receives PAID, all steps succeed → Happy path

### Refund Edge Cases
- [ ] Refund succeeds → User sees "refund initiated" message
- [ ] Refund fails → `refund_failures` record created
- [ ] Refund retry logic works (3 attempts with exponential backoff)

---

## Database Queries for Manual Monitoring

### Find customers charged without orders (Mollie)
```sql
SELECT
  pt.mollie_payment_id,
  pt.amount,
  pt.created_at,
  pt.user_id,
  o.id as order_id
FROM payment_transactions pt
LEFT JOIN orders o ON pt.order_id = o.id
WHERE
  pt.payment_provider = 'mollie'
  AND pt.status = 'succeeded'
  AND o.id IS NULL
  AND pt.created_at > NOW() - INTERVAL '7 days';
```

### Find pending refund failures
```sql
SELECT
  payment_id,
  payment_provider,
  amount,
  reason,
  error_message,
  retry_count,
  created_at
FROM refund_failures
WHERE status IN ('pending_manual_review', 'retrying')
ORDER BY created_at DESC;
```

### Find orders with Printify reconciliation issues
```sql
SELECT
  osr.order_id,
  osr.expected_status,
  osr.actual_status,
  osr.error_message,
  osr.created_at,
  o.order_number,
  o.customer_email
FROM order_status_reconciliation osr
JOIN orders o ON osr.order_id = o.id
WHERE osr.reconciliation_status = 'pending'
ORDER BY osr.created_at DESC;
```

---

## Summary

| Gap | Location | Severity | Customer Impact | Fix Priority |
|-----|----------|----------|----------------|--------------|
| Mollie return - order creation fails | mollie-return/page.tsx:151 | 🔴 CRITICAL | Charged, no order, no refund | **IMMEDIATE** |
| Mollie webhook - Printify fails (no order) | mollie-webhook/index.ts:158 | 🔴 CRITICAL | Charged, no order, no refund | **IMMEDIATE** |
| Mollie return - Printify fails (order exists) | mollie-return/page.tsx:173 | 🟡 HIGH | Charged, order exists but won't ship | **HIGH** |
| OrderFulfillmentService not used | - | 🟡 HIGH | Inconsistent safety across providers | **MEDIUM** |

---

**Generated**: 2026-04-11
**Status**: 🚨 REQUIRES IMMEDIATE ACTION
