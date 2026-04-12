# Critical Edge Cases - Deployment Guide

**Date**: 2026-04-14
**Status**: 🚀 READY TO DEPLOY

---

## ⚠️ IMPORTANT: Database Migration Required

The new code requires database changes. You **must run the migration** before deploying the application code.

---

## 📋 Pre-Deployment Checklist

- [ ] Database migration applied
- [ ] Environment variables verified
- [ ] Edge functions deployed
- [ ] Frontend code deployed
- [ ] Testing completed

---

## Step 1: Apply Database Migration

### **Using Supabase CLI** (Recommended)

```bash
# Navigate to project directory
cd /Users/brunoafonso/Desktop/imaginary-builderai

# Check migration status
supabase db diff

# Apply the migration
supabase db push

# Or if you need to reset and reapply all migrations
supabase db reset
```

### **Using Supabase Dashboard**

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Copy the contents of: `supabase/migrations/20260414000000_add_payment_recovery_and_validation.sql`
6. Paste and click **Run**

### **Verify Migration Success**

Run this query in SQL Editor to check if tables were created:

```sql
-- Check if payment_recovery table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'payment_recovery'
);
-- Should return: true

-- Check if functions were created
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'record_payment_for_recovery',
  'mark_payment_recovered',
  'get_pending_payment_recoveries',
  'increment_recovery_attempt',
  'record_amount_validation_failure'
);
-- Should return 5 rows

-- Check table structure
\d payment_recovery;
-- Should show columns: id, payment_provider, payment_intent_id, etc.
```

---

## Step 2: Verify Environment Variables

Make sure these are set in your Supabase environment:

### **Production Environment**

```bash
# Required for test mode safeguard
DENO_ENV=production
# OR
NODE_ENV=production
# OR
IS_PRODUCTION=true

# Verify in Supabase Dashboard:
# Settings → Edge Functions → Environment Variables
```

### **Development/Staging**

```bash
DENO_ENV=development
# OR leave unset (defaults to development)
```

---

## Step 3: Deploy Edge Functions

### **New Edge Function Created**

```bash
# Deploy the new payment recovery function
supabase functions deploy process-payment-recovery
```

### **Updated Edge Functions**

These existing functions were modified and need redeployment:

```bash
# Deploy updated functions
supabase functions deploy create-printify-order
supabase functions deploy mollie-webhook

# Or deploy all at once
supabase functions deploy
```

### **Verify Edge Function Deployment**

```bash
# Test the new function
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/process-payment-recovery \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "recovery_id": "test-id",
    "payment_provider": "stripe",
    "payment_intent_id": "pi_test"
  }'

# Should return error (expected - no test recovery exists)
# But confirms function is deployed and accessible
```

---

## Step 4: Deploy Frontend Code

### **Files Changed**

```
Frontend:
  src/app/dashboard/page.tsx
  src/queries/paymentRecoveryQueries.ts (new)
  src/services/paymentRecoveryService.ts (new)
  src/features/checkout/components/PaymentRecoveryBanner.tsx (new)
  src/features/checkout/context/CheckoutContextSubscriber/actions.ts
  src/features/checkout/components/index.ts

Shared Utilities:
  supabase/functions/_shared/amountValidator.ts (new)
  supabase/functions/_shared/testModeSafeguard.ts (new)

Edge Functions:
  supabase/functions/process-payment-recovery/index.ts (new)
  supabase/functions/create-printify-order/index.ts (modified)
  supabase/functions/mollie-webhook/index.ts (modified)
```

### **Using Vercel/Next.js**

```bash
# Build and test locally first
npm run build

# Check for errors
npm run lint

# Deploy to production
git add .
git commit -m "feat: add critical edge case handling (amount validation, test mode safeguard, payment recovery)"
git push origin main

# Vercel will auto-deploy on push to main
```

### **Manual Deployment**

```bash
# If using custom deployment
npm run build
npm run deploy
```

---

## Step 5: Post-Deployment Testing

### **Test 1: Database Functions**

```sql
-- Test recording a payment for recovery
SELECT record_payment_for_recovery(
  'stripe'::TEXT,
  'pi_test_123'::TEXT,
  'succeeded'::TEXT,
  'YOUR_USER_ID'::UUID,
  'test@example.com'::TEXT,
  99.99::DECIMAL,
  'USD'::TEXT,
  '{}'::JSONB,
  '{}'::JSONB,
  '[]'::JSONB,
  NULL
);
-- Should return a UUID

-- Test getting pending recoveries
SELECT * FROM get_pending_payment_recoveries(
  'YOUR_USER_ID'::UUID,
  24
);
-- Should return the recovery we just created
```

### **Test 2: Amount Validation**

1. Open your app
2. Add item to cart
3. Open browser DevTools → Network tab
4. Complete checkout
5. Find request to `create-printify-order`
6. Verify request includes:
   - `payment_amount`
   - `subtotal`
   - `shipping_cost`
   - `discount`
7. Check logs for: `✅ Amount validation passed`

### **Test 3: Test Mode Safeguard**

**In Production**:
```bash
# Try sending is_test: true to production
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/create-printify-order \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -d '{"is_test": true, "line_items": [...]}'

# Check logs - should see:
# 🚨 CRITICAL: Test mode requested in PRODUCTION!
# FORCING: is_test = false

# Check test_mode_violations table:
SELECT * FROM test_mode_violations ORDER BY created_at DESC LIMIT 1;
```

### **Test 4: Payment Recovery**

**Simulate Browser Crash**:

1. **Temporarily modify** `actions.ts` (line ~246):
   ```typescript
   await PaymentRecoveryService.recordPaymentForRecovery({...});
   throw new Error('SIMULATED CRASH FOR TESTING'); // ← ADD THIS
   ```

2. **Complete a payment** (use test mode)
   - Payment will succeed
   - Code will "crash" after recording

3. **Check database**:
   ```sql
   SELECT * FROM payment_recovery
   WHERE recovery_status = 'pending'
   ORDER BY created_at DESC
   LIMIT 1;
   -- Should see your payment
   ```

4. **Refresh app and go to `/dashboard`**
   - Should see orange recovery banner
   - Shows payment amount and provider
   - Has "Complete Order" and "Dismiss" buttons

5. **Click "Complete Order"**
   - Should show loading spinner
   - Should redirect to `/orders/{orderId}`
   - Check database:
     ```sql
     SELECT recovery_status, order_id FROM payment_recovery
     WHERE id = 'YOUR_RECOVERY_ID';
     -- Should show: recovery_status='recovered', order_id populated
     ```

6. **Remove the test code** from `actions.ts`

---

## Step 6: Monitoring Setup

### **Create Alerts**

```sql
-- Alert: Amount validation failures
CREATE OR REPLACE FUNCTION check_amount_validation_failures()
RETURNS void AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM amount_validation_failures
  WHERE created_at > NOW() - INTERVAL '1 hour';

  IF v_count > 5 THEN
    -- Send alert (integrate with your notification system)
    RAISE WARNING 'ALERT: % amount validation failures in last hour', v_count;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Alert: Test mode violations in production
CREATE OR REPLACE FUNCTION check_test_mode_violations()
RETURNS void AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM test_mode_violations
  WHERE created_at > NOW() - INTERVAL '5 minutes'
  AND is_production = true;

  IF v_count > 0 THEN
    -- Send critical alert
    RAISE WARNING 'CRITICAL: % test mode violations in production!', v_count;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### **Schedule Monitoring Queries**

Use Supabase Cron or external monitoring:

```sql
-- Daily summary of payment recoveries
SELECT
  DATE(created_at) as date,
  recovery_status,
  COUNT(*) as count,
  SUM(amount) as total_amount
FROM payment_recovery
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at), recovery_status
ORDER BY date DESC;
```

### **Grafana/DataDog Dashboards**

Create dashboards tracking:
- Payment recovery success rate
- Amount validation failure rate
- Test mode violation count
- Average recovery time

---

## Step 7: Cleanup Old Data

### **Schedule Cleanup Job**

```sql
-- Run daily via cron (requires pg_cron extension)
SELECT cron.schedule(
  'cleanup-payment-recoveries',
  '0 2 * * *',  -- Daily at 2 AM
  $$SELECT cleanup_old_payment_recoveries()$$
);

-- Verify cron job was created
SELECT * FROM cron.job WHERE jobname = 'cleanup-payment-recoveries';
```

### **Manual Cleanup** (if no cron)

Run this monthly:
```sql
SELECT cleanup_old_payment_recoveries();
-- Returns: number of rows deleted
```

---

## Rollback Plan

If you need to rollback the changes:

### **1. Rollback Frontend**

```bash
git revert HEAD
git push origin main
```

### **2. Rollback Database** (if needed)

```sql
-- Drop new tables
DROP TABLE IF EXISTS test_mode_violations CASCADE;
DROP TABLE IF EXISTS amount_validation_failures CASCADE;
DROP TABLE IF EXISTS payment_recovery CASCADE;

-- Drop new functions
DROP FUNCTION IF EXISTS record_payment_for_recovery CASCADE;
DROP FUNCTION IF EXISTS mark_payment_recovered CASCADE;
DROP FUNCTION IF EXISTS get_pending_payment_recoveries CASCADE;
DROP FUNCTION IF EXISTS increment_recovery_attempt CASCADE;
DROP FUNCTION IF EXISTS record_amount_validation_failure CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_payment_recoveries CASCADE;
```

### **3. Rollback Edge Functions**

```bash
# Redeploy previous versions
git checkout HEAD~1 supabase/functions/
supabase functions deploy
```

---

## Common Issues & Solutions

### **Issue 1: Migration Fails**

**Error**: `relation "payment_recovery" already exists`

**Solution**:
```sql
-- Check if table exists
SELECT * FROM payment_recovery LIMIT 1;

-- If it exists, migration already ran
-- No action needed
```

### **Issue 2: RPC Function Not Found**

**Error**: `function get_pending_payment_recoveries does not exist`

**Solution**:
```sql
-- Check if function exists
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'get_pending_payment_recoveries';

-- If not found, run migration again
-- Copy/paste migration SQL and run in SQL Editor
```

### **Issue 3: Banner Doesn't Appear**

**Debug**:
```typescript
// Add to dashboard page temporarily
const { pendingRecoveries, isLoading } = usePaymentRecovery();
console.log('Pending recoveries:', pendingRecoveries);
console.log('Loading:', isLoading);
```

**Check**:
1. User is logged in?
2. Recovery record exists in DB?
3. Recovery status is 'pending'?
4. Recovery is less than 24 hours old?

### **Issue 4: Edge Function Timeout**

**Error**: `Function timed out after 60 seconds`

**Solution**:
- Increase edge function timeout in Supabase settings
- Or optimize queries in `process-payment-recovery`

---

## Success Criteria

Deployment is successful when:

✅ All database functions exist and are executable
✅ Payment recovery banner appears for test recovery
✅ Amount validation logs show in edge function logs
✅ Test mode is enforced to `false` in production
✅ No TypeScript errors in build
✅ All tests pass
✅ Monitoring dashboards show data

---

## Support & Documentation

- **Implementation Details**: `CRITICAL_EDGE_CASES_IMPLEMENTATION.md`
- **Pattern Verification**: `PATTERN_VERIFICATION.md`
- **Integration Guide**: `PAYMENT_RECOVERY_INTEGRATION.md`
- **Migration SQL**: `supabase/migrations/20260414000000_add_payment_recovery_and_validation.sql`

---

## Timeline

**Estimated Deployment Time**: 30 minutes

```
Step 1: Database Migration         → 5 minutes
Step 2: Environment Variables       → 2 minutes
Step 3: Deploy Edge Functions       → 5 minutes
Step 4: Deploy Frontend             → 10 minutes
Step 5: Post-Deployment Testing     → 5 minutes
Step 6: Monitoring Setup            → 3 minutes
```

---

## Contact

If you encounter issues during deployment:

1. Check logs in Supabase Dashboard → Logs
2. Check browser console for errors
3. Run verification SQL queries above
4. Review migration file for missing steps

---

**Status**: 🟢 Ready for Production Deployment

**Next Step**: Run `supabase db push` to apply migration

**Created**: 2026-04-14
**Last Updated**: 2026-04-14
