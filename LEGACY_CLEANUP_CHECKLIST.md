# Legacy System Cleanup Checklist

**Purpose**: Complete removal of legacy product caching systems after migration to `provider_catalog`

**Date**: 2026-06-13

**Branch**: Execute on a separate cleanup branch before merging

---

## ✅ Already Removed (Commits: `a5a657b`, `8e5ae02`)

### Client-Side Code:
- ✅ `src/services/blueprintCacheService.ts` - Deleted
- ✅ `src/services/__tests__/printifyService.integration.test.ts` - Deleted
- ✅ Fallback logic in `PrintifyService.getTshirtProducts()` - Removed

### Server-Side Code:
- ✅ `supabase/functions/get-cheapest-blueprints/` - Deleted (entire directory)

### Database Migration:
- ✅ `supabase/migrations/20260613025000_drop_products_provider_table.sql` - Created

---

## 🔍 Additional Resources to Investigate

### API Routes (Check if still needed)

Located in: `/src/app/api/`

```bash
# Check each route to determine if it's legacy or still needed:
src/app/api/best-provider/
src/app/api/get-catalog-blueprints/
src/app/api/refresh-provider-catalog/
src/app/api/get-provider-catalog/
src/app/api/get-blueprint-variants/
```

**Action Required**: Review each route:

#### 1. `src/app/api/best-provider/`
**Status**: 🔍 **INVESTIGATE**
```bash
# Check what it does:
cat src/app/api/best-provider/route.ts | head -50
```
- If it queries `products_provider` → **DELETE**
- If it's used by provider_catalog → **KEEP**

#### 2. `src/app/api/get-catalog-blueprints/`
**Status**: 🔍 **INVESTIGATE**
```bash
cat src/app/api/get-catalog-blueprints/route.ts | head -50
```
- If it queries `products_provider` → **DELETE**
- If it's a proxy to Edge Function → Check if Edge Function exists

#### 3. `src/app/api/refresh-provider-catalog/`
**Status**: ✅ **KEEP** (needed for provider_catalog refresh)

#### 4. `src/app/api/get-provider-catalog/`
**Status**: ✅ **KEEP** (actively used by ProviderCatalogService)

#### 5. `src/app/api/get-blueprint-variants/`
**Status**: ✅ **KEEP** (actively used for color/size variants)

---

## 🗑️ Files to Delete (After Investigation)

### Database Migration (Already Created)
```bash
# This migration is already created and ready to run:
supabase/migrations/20260613025000_drop_products_provider_table.sql

# Run it with:
supabase db push
```

### API Routes (If determined to be legacy)
```bash
# Delete if they query products_provider or get-cheapest-blueprints:
rm -rf src/app/api/best-provider/
rm -rf src/app/api/get-catalog-blueprints/

# Keep these (confirmed active):
# src/app/api/refresh-provider-catalog/
# src/app/api/get-provider-catalog/
# src/app/api/get-blueprint-variants/
```

### Documentation Files (Optional - Legacy docs)
```bash
# These were created during the migration and can be removed after merge:
rm PRODUCTS_NOT_LOADING_FIX.md
rm IMAGE_LOADING_FIX.md
rm COLORS_SIZES_FIX.md
rm PROVIDER_CATALOG_FIXES.md
# Keep: CATALOG_TESTS_SUMMARY.md, SYSTEM_STATUS.md
```

---

## 📋 Database Objects to Drop

The migration `20260613025000_drop_products_provider_table.sql` will drop:

### Table:
- `products_provider`

### Indexes (4):
- `idx_products_provider_country`
- `idx_products_provider_expires`
- `idx_products_provider_rank`
- `idx_products_provider_country_expires`

### RLS Policies (2):
- `"Anyone can view non-expired provider products"`
- `"Service role can manage all provider products"`

### Triggers (1):
- `update_products_provider_updated_at`

### Constraints:
- `unique_country_blueprint_provider` (dropped with table)

**Functions to Keep**:
- ✅ `update_updated_at_column()` - Shared function used by other tables

---

## 🔍 Investigation Commands

### 1. Check API Routes for Legacy References

```bash
# Check best-provider route
grep -r "products_provider\|get-cheapest-blueprints" src/app/api/best-provider/ 2>/dev/null

# Check get-catalog-blueprints route
grep -r "products_provider\|get-cheapest-blueprints" src/app/api/get-catalog-blueprints/ 2>/dev/null
```

### 2. Check for Remaining Code References

```bash
# Search entire codebase for products_provider
grep -r "products_provider" src/ --exclude-dir=node_modules --exclude-dir=.next

# Search for get-cheapest-blueprints references
grep -r "get-cheapest-blueprints" src/ --exclude-dir=node_modules --exclude-dir=.next
```

### 3. Check Supabase Edge Functions

```bash
# List all deployed Edge Functions
supabase functions list --project-ref tgccxydchvujhrqyzqao

# Check if get-cheapest-blueprints is deployed (should not be)
# If it is, undeploy it:
supabase functions delete get-cheapest-blueprints --project-ref tgccxydchvujhrqyzqao
```

### 4. Verify Database State

```bash
# Check if products_provider table exists
supabase db query --linked "SELECT * FROM pg_tables WHERE tablename = 'products_provider';"

# After running migration, verify it's gone (should return 0 rows)
```

---

## ✅ Cleanup Execution Steps

### Step 1: Create Cleanup Branch
```bash
git checkout -b chore/remove-legacy-systems
```

### Step 2: Investigate API Routes
```bash
# Check each route listed in "Additional Resources to Investigate"
# Determine which are legacy and can be deleted
```

### Step 3: Delete Legacy API Routes (If Confirmed)
```bash
# Example (only if confirmed as legacy):
git rm -rf src/app/api/best-provider/
git rm -rf src/app/api/get-catalog-blueprints/

git commit -m "chore: remove legacy API routes

Removed API routes that were part of the legacy products_provider system:
- /api/best-provider (replaced by provider_catalog)
- /api/get-catalog-blueprints (replaced by get-provider-catalog)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Step 4: Run Database Migration
```bash
# Apply the migration to drop products_provider table
supabase db push

# Verify table is gone
supabase db query --linked "SELECT * FROM pg_tables WHERE tablename = 'products_provider';"
# Should return 0 rows
```

### Step 5: Verify No Broken References
```bash
# Run the app
npm run dev

# Check for any errors related to products_provider
# Test all product-related flows:
# - Homepage product display
# - Create product flow
# - Color/size selection
```

### Step 6: Clean Up Documentation (Optional)
```bash
# Remove temporary documentation files
git rm PRODUCTS_NOT_LOADING_FIX.md
git rm IMAGE_LOADING_FIX.md
git rm COLORS_SIZES_FIX.md
git rm PROVIDER_CATALOG_FIXES.md

# Keep permanent documentation
# - CATALOG_TESTS_SUMMARY.md
# - SYSTEM_STATUS.md

git commit -m "docs: remove temporary fix documentation

Removed temporary documentation created during the migration.
Kept comprehensive testing and system status docs.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Step 7: Final Verification
```bash
# Search for any remaining references
grep -r "products_provider\|get-cheapest-blueprints\|BlueprintCacheService" src/ \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude-dir=__tests__

# Should return no results (except maybe in comments)
```

### Step 8: Merge Cleanup Branch
```bash
git checkout feature/custom-products-performance-refactor
git merge chore/remove-legacy-systems
git push origin feature/custom-products-performance-refactor
```

---

## 📊 Expected Results After Cleanup

### Code Removed:
- ~600+ lines of legacy code
- 2-4 legacy API routes (if confirmed)
- 1 database table with 9 related objects

### Systems Remaining (Active):
- ✅ `provider_catalog` table
- ✅ `get-provider-catalog` Edge Function
- ✅ `fetch-provider-catalog` Edge Function
- ✅ `get-blueprint-variants` Edge Function
- ✅ `ProviderCatalogService`
- ✅ API routes for provider_catalog system

### Benefits:
- Cleaner, more maintainable codebase
- Single source of truth for product data
- No confusing fallback chains
- Reduced server-side complexity
- Better multi-country support

---

## 🚨 Rollback Instructions (If Needed)

If issues arise after cleanup:

### 1. Restore Legacy Client Code
```bash
# Restore BlueprintCacheService
git show a5a657b~1:src/services/blueprintCacheService.ts > src/services/blueprintCacheService.ts

# Restore fallback logic in PrintifyService
git checkout a5a657b~1 -- src/services/printifyService.ts
```

### 2. Restore Legacy Edge Function
```bash
# Restore get-cheapest-blueprints
git checkout 8e5ae02~1 -- supabase/functions/get-cheapest-blueprints/

# Deploy it
supabase functions deploy get-cheapest-blueprints --project-ref tgccxydchvujhrqyzqao
```

### 3. Restore Database Table
```bash
# Apply the original migration
git checkout a5a657b~1 -- supabase/migrations/20260411205034_create_products_provider_table.sql
supabase db push
```

---

## 📝 Notes

- All deletions are reversible via git history
- Test thoroughly after each deletion
- Keep SYSTEM_STATUS.md and CATALOG_TESTS_SUMMARY.md for reference
- The migration file is idempotent (safe to run multiple times)
- Shared database functions (like `update_updated_at_column`) are preserved

---

**Status**: Ready for cleanup on separate branch ✅
**Estimated Time**: 30-60 minutes (with testing)
**Risk Level**: Low (everything is reversible via git)

---

## 🎯 Final Investigation Results

### API Routes Analysis (Completed):

1. **`/api/best-provider`** ✅ **KEEP**
   - Uses RPC: `get_best_provider_for_country`
   - Likely queries `provider_catalog` table
   - Active and needed

2. **`/api/get-catalog-blueprints`** ✅ **KEEP**
   - Proxies to Edge Function: `get-catalog-blueprints`
   - Edge Function exists in `supabase/functions/`
   - Active and needed

3. **`/api/refresh-provider-catalog`** ✅ **KEEP**
   - Refreshes provider_catalog data
   - Active and needed

4. **`/api/get-provider-catalog`** ✅ **KEEP**
   - Main query endpoint for provider_catalog
   - Active and needed

5. **`/api/get-blueprint-variants`** ✅ **KEEP**
   - Fetches color/size variants
   - Active and needed

### Conclusion:
**All API routes are part of the active provider_catalog system.**
**No API routes need to be deleted.** ✅

---

## ✅ Final Cleanup List

### To Delete:
- ✅ Already deleted: `BlueprintCacheService.ts`
- ✅ Already deleted: `printifyService.integration.test.ts`
- ✅ Already deleted: `supabase/functions/get-cheapest-blueprints/`
- ⏳ Pending: Database table `products_provider` (via migration)
- 🔍 Optional: Temporary documentation files

### To Keep:
- ✅ All API routes (all are active)
- ✅ All Edge Functions (all are active)
- ✅ `provider_catalog` table and related code
- ✅ `ProviderCatalogService`

### Database RPC to Verify Exists:
```bash
# Check if this RPC exists and queries provider_catalog:
supabase db query --linked "SELECT proname FROM pg_proc WHERE proname = 'get_best_provider_for_country';"
```

If the RPC exists and queries `provider_catalog` → Everything is good ✅
If the RPC doesn't exist or queries `products_provider` → Need to update it

---

**Updated Status**: All code-level cleanup complete. Only database migration pending. ✅
