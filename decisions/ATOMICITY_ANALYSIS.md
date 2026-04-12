# 🔒 Database Atomicity Analysis - Edge Functions

## Executive Summary

**CRITICAL FINDING**: Yes, there are **multiple scenarios** where database corruption with orphaned/inconsistent entries can occur.

**Root Cause**: Edge functions use Supabase REST API (`supabaseRest()`) for database operations. Each call is a separate HTTP request - **NO DATABASE TRANSACTIONS** are used.

**Impact**: Multi-step operations can fail partially, leaving the database in an inconsistent state.

---

## Architecture Limitation

### The Problem

```typescript
// Edge functions use REST API - each call is separate
await supabaseRest("payment_transactions?order_id=eq.123", "PATCH", { status: "refunded" });
await supabaseRest("orders?id=eq.123", "PATCH", { payment_status: "refunded" });
```

**This is NOT atomic** - if the first succeeds and second fails:
- ✅ `payment_transactions.status = "refunded"`
- ❌ `orders.payment_status = "pending"` (unchanged)
- **Result**: Inconsistent state

### Why This Happens

1. **Supabase Edge Functions** run in Deno isolates (V8 isolates)
2. They use **HTTP REST API** for database access, not direct PostgreSQL connections
3. **No BEGIN/COMMIT** transaction support over REST API
4. Each `supabaseRest()` call is a separate, independent operation

---

## Critical Atomicity Gaps

### 🔴 GAP #1: process-refund Function

**File**: `supabase/functions/process-refund/index.ts`

**Lines**: 197-215

#### The Problem

```typescript
// Step 1: Refund via payment provider (Stripe/PayPal/Mollie)
refundId = await refundStripe(stripePaymentIntentId, amount, reason);

// Step 2: Update payment_transactions ✅
await supabaseRest(
  `payment_transactions?order_id=eq.${order_id}`,
  "PATCH",
  { status: "refunded", ... }
);

// Step 3: Update orders ❌ (could fail)
await supabaseRest(
  `orders?id=eq.${order_id}`,
  "PATCH",
  { payment_status: "refunded", ... }
);
```

#### Failure Scenarios

| Step | Stripe Refund | payment_transactions | orders | Result |
|------|---------------|---------------------|--------|--------|
| **Scenario A** | ✅ Succeeded | ✅ Updated | ❌ Failed | 🔴 **ORPHAN**: Customer refunded, transactions updated, but order shows "paid" |
| **Scenario B** | ✅ Succeeded | ❌ Failed | ⬜ Not attempted | 🔴 **ORPHAN**: Customer refunded but no DB record of refund |

#### Impact

**Scenario A - Most Critical**:
- Customer gets their money back ✅
- `payment_transactions.status = "refunded"` ✅
- `orders.payment_status = "paid"` ❌ **WRONG**
- Order dashboard shows order as "paid" when it was actually refunded
- Accounting reports will be incorrect
- May attempt to fulfill an order that was refunded

**Scenario B - Less Critical**:
- Customer gets refund ✅
- No database record of refund ❌
- Manual reconciliation needed

#### Probability

**MEDIUM-HIGH**
- Network failures between step 2 and 3
- Database connection issues
- Permission errors on orders table
- Database deadlocks

---

### 🔴 GAP #2: PayPal Webhook - Capture Completed

**File**: `supabase/functions/paypal-webhook/index.ts`

**Lines**: 50-95

#### The Problem

```typescript
// Step 1: Update payment_transactions ✅
await supabaseRest(
  `payment_transactions?paypal_order_id=eq.${orderId}`,
  "PATCH",
  { paypal_capture_id: capture.id, status: "succeeded", ... }
);

// Step 2: Get transaction to find order_id ❌ (could fail)
const txResult = await supabaseRest(
  `payment_transactions?paypal_order_id=eq.${orderId}&select=metadata`,
  "GET"
);

// Step 3: Update order payment_status ❌ (could fail)
await supabaseRest(
  `orders?id=eq.${dbOrderId}`,
  "PATCH",
  { payment_status: "paid", payment_method: "paypal", ... }
);
```

#### Failure Scenarios

| Step 1 | Step 2 | Step 3 | Result |
|--------|--------|--------|--------|
| ✅ | ❌ | ⬜ | 🟡 **Transaction updated but order lookup failed** |
| ✅ | ✅ | ❌ | 🔴 **Transaction says "paid" but order says "pending"** |

#### Impact

**Critical Inconsistency**:
- Customer charged ✅
- `payment_transactions.status = "succeeded"` ✅
- `orders.payment_status = "pending"` ❌
- Order stuck in "pending" state forever
- Won't be fulfilled because order doesn't show as "paid"
- Customer paid but receives nothing

#### Probability

**MEDIUM**
- Network failures between updates
- Webhook timeouts (PayPal has 30-second timeout)
- Race conditions with multiple webhook deliveries

---

### 🔴 GAP #3: Mollie Webhook - Payment Completed

**File**: `supabase/functions/mollie-webhook/index.ts`

**Lines**: 88-131

#### The Problem

```typescript
// Step 1: Upsert payment_transactions ✅
await supabaseRest(
  "payment_transactions?on_conflict=mollie_payment_id",
  "POST",
  { status: internalStatus, mollie_payment_id: payment.id, ... }
);

// Step 2: Update order status ❌ (could fail)
await supabaseRest(`orders?id=eq.${orderId}`, "PATCH", {
  status: "processing",
  payment_status: "paid",
  payment_method: "mollie",
  ...
});

// Step 3: Create Printify order ❌ (could fail)
await fetch(`${SUPABASE_URL}/functions/v1/create-printify-order`, ...);
```

#### Failure Scenarios

| Step 1 | Step 2 | Step 3 | Result |
|--------|--------|--------|--------|
| ✅ | ❌ | ⬜ | 🔴 **Payment recorded but order not marked as paid** |
| ✅ | ✅ | ❌ | 🟡 **Order paid but Printify failed** (handled by our recent fix) |

#### Impact

**Step 1→2 Failure**:
- Customer charged ✅
- `payment_transactions` created ✅
- `orders.payment_status = "pending"` ❌
- Order won't ship (same issue as PayPal webhook)

---

### 🟡 GAP #4: Frontend Order Creation (actions.ts)

**File**: `src/features/checkout/context/CheckoutContextSubscriber/actions.ts`

**Lines**: 235-325

#### The Problem

```typescript
// Step 1: Create order from cart ✅
const newOrderId = await createOrderFromCart.mutateAsync({...});

// Step 2: Create Printify order ❌ (could fail)
await createPrintifyOrder.mutateAsync(orderPayload);

// Step 3: Update order payment status ❌ (could fail)
await updatePaymentStatus.mutateAsync({
  orderId: createdOrderId,
  paymentStatus: "paid",
});

// Step 4: Update order status to confirmed ❌ (could fail)
await updateOrderStatus.mutateAsync({
  orderId: createdOrderId,
  status: "confirmed",
});
```

#### Failure Scenarios

| Order Created | Printify | Payment Status | Order Status | Result |
|---------------|----------|----------------|--------------|--------|
| ✅ | ❌ | ⬜ | ⬜ | 🟡 **Order exists but not sent to production** (handled by recent fix) |
| ✅ | ✅ | ❌ | ⬜ | 🟡 **Order in production but DB shows "pending"** |
| ✅ | ✅ | ✅ | ❌ | 🟢 **Minor - order paid but not "confirmed"** (non-critical) |

#### Impact

**Step 3 Failure** (most critical):
- Printify order submitted for production ✅
- `orders.payment_status = "pending"` ❌
- `orders.status = "pending"` ❌
- Product will ship but database doesn't reflect payment
- Accounting errors

---

## Orphaned Entries Analysis

### Table-by-Table Breakdown

#### 1. **payment_transactions Table**

**Orphan Scenarios**:

| Scenario | Cause | Orphan State | Impact |
|----------|-------|--------------|--------|
| Transaction without order | Webhook creates transaction before order exists | `order_id = NULL` | Can't match payment to order |
| Transaction with deleted order | Order deleted but transaction remains | `order_id` references deleted row | Referential integrity broken |
| Mismatched status | Transaction says "refunded" but order says "paid" | Status mismatch | Accounting errors |

**Database Query to Find Orphans**:
```sql
-- Payment transactions without orders
SELECT pt.*
FROM payment_transactions pt
LEFT JOIN orders o ON pt.order_id = o.id
WHERE pt.order_id IS NOT NULL AND o.id IS NULL;

-- Mismatched payment status
SELECT
  pt.order_id,
  pt.status as transaction_status,
  o.payment_status as order_payment_status
FROM payment_transactions pt
JOIN orders o ON pt.order_id = o.id
WHERE pt.status != o.payment_status
  AND pt.created_at > NOW() - INTERVAL '7 days';
```

---

#### 2. **orders Table**

**Orphan Scenarios**:

| Scenario | Cause | Orphan State | Impact |
|----------|-------|--------------|--------|
| Order without payment transaction | Order created but payment transaction insert failed | No matching transaction | Can't verify payment |
| Paid order without Printify order | Order marked paid but Printify creation failed | `printify_order_id = NULL` | Won't ship |
| Confirmed order in pending status | Status update failed after Printify | `status = "pending"` but should be "confirmed" | Dashboard shows wrong state |

**Database Query to Find Orphans**:
```sql
-- Orders without payment transactions
SELECT o.*
FROM orders o
LEFT JOIN payment_transactions pt ON pt.order_id = o.id
WHERE o.payment_status = 'paid'
  AND pt.id IS NULL;

-- Paid orders without Printify order ID (older than 5 minutes)
SELECT *
FROM orders
WHERE payment_status = 'paid'
  AND status = 'confirmed'
  AND printify_order_id IS NULL
  AND created_at < NOW() - INTERVAL '5 minutes';
```

---

#### 3. **refund_failures Table**

**Orphan Scenarios**:

| Scenario | Cause | Orphan State | Impact |
|----------|-------|--------------|--------|
| Refund failure without resolution | Failure recorded but never resolved | `status = "pending_manual_review"` forever | Customer charged, never refunded |
| Duplicate refund failures | Multiple attempts create duplicate records | Multiple rows for same payment | Confusion |

**Database Query to Find Orphans**:
```sql
-- Unresolved refund failures older than 24 hours
SELECT *
FROM refund_failures
WHERE status IN ('pending_manual_review', 'retrying')
  AND created_at < NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

---

## Concurrency Issues

### Race Conditions

#### 1. **Duplicate Webhook Processing**

**Problem**: Payment providers can send the same webhook multiple times

**Current Protection**:
- ✅ process-refund: Has idempotency check (line 148)
- ❌ PayPal webhook: No idempotency check
- ❌ Mollie webhook: No idempotency check

**What Can Happen**:
```
Webhook 1 (PayPal): Updates payment_transactions to "succeeded"
Webhook 2 (PayPal): Updates payment_transactions to "succeeded" AGAIN
Both try to update the same order → Last one wins
```

**Result**: Generally safe due to idempotent updates, but could cause:
- Duplicate Printify orders if both webhooks trigger creation
- Race conditions on order status updates

---

#### 2. **Frontend + Webhook Race**

**Problem**: Frontend finishes order creation while webhook is also processing

**Example Timeline**:
```
T0: User completes PayPal payment
T1: Frontend starts creating order
T2: PayPal webhook arrives, starts processing
T3: Frontend creates order, order_id=123
T4: Webhook tries to update order_id=123
T5: Frontend updates order status to "confirmed"
T6: Webhook updates order status to "processing"
```

**Result**: Final status depends on timing - unpredictable

---

## Recommended Solutions

### Solution 1: Database-Level Constraints (IMMEDIATE - FREE)

Add foreign key constraints and check constraints to prevent orphans:

```sql
-- Ensure order_id in payment_transactions references valid orders
ALTER TABLE payment_transactions
  ADD CONSTRAINT fk_payment_transactions_order
  FOREIGN KEY (order_id)
  REFERENCES orders(id)
  ON DELETE SET NULL;

-- Ensure consistent status values
ALTER TABLE payment_transactions
  ADD CONSTRAINT check_valid_status
  CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded', 'canceled'));

-- Ensure payment_status and status alignment
CREATE OR REPLACE FUNCTION check_order_status_alignment()
RETURNS TRIGGER AS $$
BEGIN
  -- If payment_status is 'paid', status should not be 'pending'
  IF NEW.payment_status = 'paid' AND NEW.status = 'pending' THEN
    RAISE WARNING 'Order % has payment_status=paid but status=pending', NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_status_alignment_check
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION check_order_status_alignment();
```

---

### Solution 2: PostgreSQL Stored Procedures (RECOMMENDED - MEDIUM EFFORT)

Replace multi-step edge function operations with atomic stored procedures:

```sql
-- Example: Atomic refund operation
CREATE OR REPLACE FUNCTION process_refund_atomic(
  p_order_id UUID,
  p_refund_id TEXT,
  p_reason TEXT
)
RETURNS VOID AS $$
BEGIN
  -- This is atomic - either all succeed or all rollback
  UPDATE payment_transactions
  SET status = 'refunded',
      metadata = jsonb_set(
        COALESCE(metadata, '{}'::jsonb),
        '{refund_id}',
        to_jsonb(p_refund_id)
      ),
      updated_at = NOW()
  WHERE order_id = p_order_id;

  UPDATE orders
  SET payment_status = 'refunded',
      updated_at = NOW()
  WHERE id = p_order_id;

  -- If either fails, both rollback automatically
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Refund processing failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;
```

**Usage in Edge Function**:
```typescript
// Instead of two separate updates:
await supabaseRest("rpc/process_refund_atomic", "POST", {
  p_order_id: order_id,
  p_refund_id: refundId,
  p_reason: reason
});
```

---

### Solution 3: Idempotency Keys Everywhere (HIGH PRIORITY)

Add idempotency to ALL webhooks:

```typescript
// PayPal webhook - add idempotency check
const idempotencyKey = `paypal_${event.resource.id}`;
const existing = await supabaseRest(
  `payment_transactions?paypal_capture_id=eq.${capture.id}`,
  "GET"
);

if (existing.data && existing.data.length > 0) {
  console.log("Webhook already processed, skipping");
  return new Response(JSON.stringify({ received: true, skipped: true }), ...);
}
```

---

### Solution 4: Eventual Consistency + Reconciliation Jobs

Accept that perfect atomicity is hard, implement reconciliation:

**Reconciliation Job** (runs every 5 minutes):
```sql
-- Find orders paid but not confirmed (older than 5 min)
SELECT id FROM orders
WHERE payment_status = 'paid'
  AND status = 'pending'
  AND updated_at < NOW() - INTERVAL '5 minutes';

-- Auto-fix: Update to confirmed if payment verified
UPDATE orders
SET status = 'confirmed', updated_at = NOW()
WHERE id IN (...);

-- Find payment_transactions without orders
SELECT pt.id, pt.order_id
FROM payment_transactions pt
LEFT JOIN orders o ON pt.order_id = o.id
WHERE pt.order_id IS NOT NULL AND o.id IS NULL;

-- Log for manual review
INSERT INTO order_status_reconciliation (...);
```

---

### Solution 5: Add Updated Timestamp Checks

Prevent overwriting newer data with stale data:

```sql
-- Add optimistic locking
ALTER TABLE orders ADD COLUMN version INTEGER DEFAULT 1;

CREATE OR REPLACE FUNCTION increment_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_version_trigger
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION increment_version();
```

**Usage**:
```typescript
// Only update if version matches (prevents race conditions)
await supabaseRest(
  `orders?id=eq.${orderId}&version=eq.${currentVersion}`,
  "PATCH",
  { status: "confirmed", updated_at: new Date().toISOString() }
);
```

---

## Priority Action Items

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🔴 **P0** | Add idempotency to PayPal/Mollie webhooks | 2 hours | Prevents duplicate processing |
| 🔴 **P0** | Create stored procedure for refund operations | 4 hours | Makes refunds atomic |
| 🟡 **P1** | Add foreign key constraints | 1 hour | Prevents orphaned transactions |
| 🟡 **P1** | Build reconciliation job | 8 hours | Fixes inconsistent state automatically |
| 🟢 **P2** | Add optimistic locking (version column) | 4 hours | Prevents race conditions |
| 🟢 **P2** | Add status alignment checks/triggers | 2 hours | Warns about inconsistent states |

---

## Monitoring Queries

Run these queries daily to detect orphaned/inconsistent data:

```sql
-- Daily Health Check Report
WITH orphaned_transactions AS (
  SELECT COUNT(*) as count
  FROM payment_transactions pt
  LEFT JOIN orders o ON pt.order_id = o.id
  WHERE pt.order_id IS NOT NULL AND o.id IS NULL
),
mismatched_status AS (
  SELECT COUNT(*) as count
  FROM payment_transactions pt
  JOIN orders o ON pt.order_id = o.id
  WHERE pt.status = 'succeeded' AND o.payment_status != 'paid'
),
unresolved_refunds AS (
  SELECT COUNT(*) as count
  FROM refund_failures
  WHERE status = 'pending_manual_review'
    AND created_at < NOW() - INTERVAL '24 hours'
)
SELECT
  'Orphaned Transactions' as issue,
  (SELECT count FROM orphaned_transactions) as count
UNION ALL
SELECT 'Mismatched Payment Status', (SELECT count FROM mismatched_status)
UNION ALL
SELECT 'Unresolved Refunds (>24h)', (SELECT count FROM unresolved_refunds);
```

---

**Generated**: 2026-04-11
**Status**: 🔴 **CRITICAL ATOMICITY ISSUES IDENTIFIED**
**Recommendation**: Implement P0 actions immediately
