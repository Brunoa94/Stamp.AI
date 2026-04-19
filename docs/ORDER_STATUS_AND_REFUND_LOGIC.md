# Order Status and Refund Logic

## Overview

This document explains the correct flow for order status updates and when refunds are processed.

**Last Updated:** 2026-04-15 (Consolidated status fields: removed `fulfillment_status` from orders table)

## Order Status Fields

The orders table has **2 status fields**:

| Field | Purpose | Values |
|-------|---------|--------|
| `status` | Order lifecycle | pending, confirmed, processing, shipped, delivered, cancelled, fulfillment_failed |
| `payment_status` | Payment state | pending, paid, failed, refunded, canceled |

Note: Item-level fulfillment tracking remains on `order_items.fulfillment_status`.

## Order Status Flow

### States

1. **pending** - Order created, payment may or may not be received
2. **confirmed** - Payment received AND Printify order successfully created
3. **processing** - Printify is manufacturing the product
4. **shipped** - Product shipped to customer
5. **delivered** - Product delivered
6. **cancelled** - Order cancelled by user or system
7. **fulfillment_failed** - ⚠️ NEW: Printify order creation failed, customer refunded

### Payment Status

1. **pending** - Payment not yet received
2. **paid** - Payment successfully received
3. **failed** - Payment failed
4. **refunded** - Payment refunded to customer
5. **canceled** - Payment cancelled

## Correct Flow: Payment → Printify → Confirmation

```
┌─────────────────────┐
│  Order Created      │
│  status: pending    │
│  payment_status:    │
│  pending            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Payment Succeeds   │
│  (Webhook)          │
│  ✅ Updates:        │
│  payment_status:    │
│  paid               │
│  ❌ Does NOT update:│
│  status (remains    │
│  pending)           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Printify Order     │
│  Created            │
│  (Fulfillment       │
│  Service)           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Order Confirmed    │
│  status: confirmed  │
│  payment_status:    │
│  paid               │
└─────────────────────┘
```

### Key Principles

1. **Webhooks** update ONLY `payment_status`, NEVER `status`
2. **Fulfillment Service** updates `status` to "confirmed" ONLY after Printify succeeds
3. **No gap** where orders show as "confirmed" but aren't in Printify

## Refund Logic

### Scenario 1: Order Creation Fails → REFUND

```
Payment Succeeds → Order Creation Fails → IMMEDIATE REFUND
```

**Why?**
- Customer charged but NO order exists in database
- Customer has no record of their purchase
- Nothing to fulfill
- Must return customer's money immediately

**Implementation:**
```typescript
// In your checkout flow
try {
  orderId = await OrderService.createOrderFromCart({ user, cart, paymentStatus: "paid" });
} catch (orderError) {
  // ⚠️ Order creation failed - REFUND
  await RefundService.processRefund({
    orderId: `temp_${payment.paymentId}`,
    paymentProvider,
    amount: orderAmount,
    reason: "Order creation failed",
  });
  return { success: false, error: "..." };
}
```

**Result:**
- No order in database
- Payment refunded
- Customer can try again later

---

### Scenario 2: Printify Fails → REFUND + Mark as Failed

```
Payment Succeeds → Order Created → Printify Fails → REFUND + STATUS = fulfillment_failed
```

**Why?** *(Changed 2026-04-13)*
- Cannot guarantee when/if Printify will be available
- Better customer experience to refund immediately
- Customer can re-order when service is stable
- Prevents orders stuck in limbo

**Implementation:**
```typescript
// In your checkout flow after creating the order
try {
  await PrintifyService.createPrintifyOrder({ ... });
  // After success, mark as confirmed
  await OrderService.updateOrderStatus(orderId, "confirmed");
} catch (printifyError) {
  // ⚠️ Printify failed - REFUND AND MARK AS FAILED
  await OrderService.handlePrintifyFailure({
    orderId,
    paymentProvider,
    amount: orderAmount,
    stripePaymentIntentId, // or paypalCaptureId, molliePaymentId
    printifyError,
  });

  return {
    success: false,
    orderId,
    error: "We're unable to fulfill your order at this time. A full refund has been initiated...",
  };
}
```

**Result:**
- Order exists in database with `status: "fulfillment_failed"`
- Payment refunded (`payment_status: "refunded"`)
- Customer receives refund within 3-5 business days
- Customer can re-order later

## Failure Scenarios

### Scenario 1: Order Creation Fails

| State | Value |
|-------|-------|
| Order in DB | ❌ No |
| Payment received | ✅ Yes |
| Customer has order | ❌ No |
| Order status | N/A |
| Payment status | `pending` |
| **Action** | **✅ Refund customer** |

### Scenario 2: Printify Fails

| State | Value |
|-------|-------|
| Order in DB | ✅ Yes |
| Payment received | ✅ Yes |
| Customer has order | ⚠️ Yes, but failed |
| Order status | `fulfillment_failed` |
| Payment status | `refunded` |
| **Action** | **✅ Refund + Mark as failed** |

### Scenario 3: Status Update Fails (Non-Critical)

| State | Value |
|-------|-------|
| Order in DB | ✅ Yes |
| Printify order created | ✅ Yes |
| Status update | ❌ Failed |
| Order status | `pending` (should be `confirmed`) |
| Payment status | `paid` |
| **Action** | **✅ Return success - Product will ship normally** |

## Testing

### Unit Tests

- `fulfillmentFailedStatus.test.ts` - Tests OrderService.handlePrintifyFailure method
- `mollie-webhook.test.ts` - Tests webhook only updates payment_status
- `paypal-webhook.test.ts` - Tests webhook only updates payment_status
- `orderService.test.ts` - Tests order creation and status updates

## Database Functions

### `update_order_payment_status_atomic`

```sql
update_order_payment_status_atomic(
  p_order_id UUID,
  p_payment_status TEXT,
  p_order_status TEXT DEFAULT NULL,  -- Optional!
  p_payment_method TEXT DEFAULT NULL
)
```

**Usage:**

```typescript
// ✅ CORRECT: Webhook updates payment_status only
await supabaseRest("rpc/update_order_payment_status_atomic", "POST", {
  p_order_id: orderId,
  p_payment_status: "paid",
  p_payment_method: "stripe",
  // NO p_order_status
});

// ❌ INCORRECT: Don't do this in webhooks!
await supabaseRest("rpc/update_order_payment_status_atomic", "POST", {
  p_order_id: orderId,
  p_payment_status: "paid",
  p_order_status: "confirmed", // ❌ Wrong!
});
```

## Common Mistakes to Avoid

### ❌ Setting order status in webhook

```typescript
// DON'T DO THIS
await updateOrderStatus.mutateAsync({
  orderId: createdOrderId,
  status: "confirmed", // ❌ Too early!
});
```

### ❌ Refunding when Printify fails

```typescript
// DON'T DO THIS
catch (printifyError) {
  await RefundService.processRefund(...); // ❌ Order exists!
}
```

### ✅ Correct webhook implementation

```typescript
// DO THIS
await updatePaymentStatus.mutateAsync({
  orderId: createdOrderId,
  paymentStatus: "paid", // ✅ Only update payment status
});
```

### ✅ Correct fulfillment implementation

```typescript
// DO THIS
await PrintifyService.createPrintifyOrder(...);
// Only after Printify succeeds:
await OrderService.updateOrderStatus(orderId, "confirmed"); // ✅
```

## Fulfillment Failed Status

### When This Status Is Used

The `fulfillment_failed` status is set when:

1. ✅ Order successfully created in database
2. ✅ Payment successfully received
3. ❌ Printify order creation fails
4. ✅ Order marked as `fulfillment_failed`
5. ✅ Immediate refund processed

### Common Causes

- Printify API timeout
- Printify API returning 500 error
- Printify rate limit exceeded
- Printify maintenance mode
- Network connectivity issues

### Customer Impact

When an order reaches `fulfillment_failed` status:

- Customer receives error message with refund information
- Automatic refund initiated immediately
- Refund appears within 3-5 business days
- Customer can re-order when service is available
- No manual intervention needed from support team

### Database State

```sql
-- Example order with fulfillment_failed status
SELECT id, status, payment_status, payment_method
FROM orders
WHERE id = 'order_123';

-- Result:
-- id: order_123
-- status: fulfillment_failed
-- payment_status: refunded
-- payment_method: stripe
```

### Business Logic

```typescript
// Workflow when Printify fails:

1. PrintifyService.createPrintifyOrder() throws error
2. OrderService.handlePrintifyFailure() is called:
   a. Updates order status to "fulfillment_failed"
   b. Processes refund via RefundService
   c. Logs error details
3. Return error message to customer
4. Customer receives refund automatically
```

## Migration History

- `20260413000000_add_atomic_operations_and_constraints.sql` - Added atomic operation
- `20260413100002_add_fulfillment_failed_status.sql` - Added fulfillment_failed status (includes optional order_status)
- `20260415100000_drop_orders_fulfillment_status.sql` - Removed redundant `fulfillment_status` column from orders table (consolidated to 2 status fields)
