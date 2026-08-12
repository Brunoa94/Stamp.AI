# Plan: Product SEO Enhancement with Printify Descriptions

## Overview
Add a dedicated SEO table for products with meta fields and automatically fetch product descriptions from Printify API during sync. The Printify description will be used across the application for product descriptions.

## Design Decisions
- **SEO Fields**: Basic SEO (meta_title, meta_description, meta_keywords, printify_description)
- **Auto-fetch**: Automatically fetch description from Printify during product sync
- **Architecture**: New `product_seo` table linked to `catalog_products`

## Current State Analysis

### What Already Works
- **Printify API**: Already fetches blueprint data including `description` field (but doesn't store it)
- **SEO Infrastructure**: Well-structured SEO system in `src/features/seo/`
- **Product Schema**: Typed `ProductData` interface ready for descriptions
- **Sync Function**: `sync-blueprint` edge function fetches from Printify

### What's Missing
- No `description` stored in database
- No SEO-specific fields per product
- Product descriptions not used in UI or metadata

---

## Implementation Plan

### Phase 1: Database Schema

**1.1 Create product_seo table**
- File: `supabase/migrations/YYYYMMDD_add_product_seo_table.sql`

```sql
CREATE TABLE product_seo (
  blueprint_id INTEGER PRIMARY KEY REFERENCES catalog_products(blueprint_id) ON DELETE CASCADE,

  -- Printify source data
  printify_description TEXT,           -- Raw description from Printify API

  -- SEO meta fields (admin-editable overrides)
  meta_title TEXT,                     -- Custom SEO title (falls back to display_title)
  meta_description TEXT,               -- Custom meta description (falls back to printify_description)
  meta_keywords TEXT[],                -- Array of keywords

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE product_seo ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access" ON product_seo FOR SELECT USING (true);
```

### Phase 2: Printify Sync Update

**2.1 Update sync-blueprint edge function**
- File: `supabase/functions/sync-blueprint/index.ts`
- Extract `blueprintData.description` from Printify response
- Upsert into `product_seo` table with `printify_description`

**2.2 Add product_seo upsert logic**
```typescript
// After syncing catalog_products, sync SEO data
await supabaseClient
  .from("product_seo")
  .upsert({
    blueprint_id: blueprintId,
    printify_description: blueprintData.description,
    updated_at: new Date().toISOString(),
  }, { onConflict: "blueprint_id" });
```

### Phase 2.5: Populate SEO Data for All Existing Products

**2.5.1 Create a one-time script to sync all products**
- Fetch all existing `catalog_products` from database
- For each product, call Printify API to get description
- Insert SEO data into `product_seo` table

**2.5.2 Run sync for all active blueprints**
- Current active blueprints: 145 (T-shirt), 553 (Tote Bag), 441/468 (Mugs), 462/496 (Socks), etc.
- Ensure all products in `catalog_products` have corresponding `product_seo` entries

### Phase 3: TypeScript Types

**3.1 Add ProductSeo type**
- File: `src/types/catalog.ts`

```typescript
export interface ProductSeo {
  blueprint_id: number;
  printify_description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  created_at: string;
  updated_at: string;
}
```

**3.2 Extend CatalogProduct with optional SEO**
- Add `seo?: ProductSeo` to CatalogProduct interface

### Phase 4: Query Service Updates

**4.1 Update CatalogQueryService**
- File: `src/services/catalogQueryService.ts`
- Add method to fetch product with SEO data
- Join `catalog_products` with `product_seo`

```typescript
static async getProductWithSeo(blueprintId: number): Promise<CatalogProductWithSeo | null> {
  const { data } = await supabase
    .from("catalog_products")
    .select(`*, product_seo(*)`)
    .eq("blueprint_id", blueprintId)
    .single();
  return data;
}
```

**4.2 Update React Query hooks**
- File: `src/queries/catalogQueries.ts`
- Add `useProductSeo` hook if needed

### Phase 5: Use Descriptions in Application

**5.1 Update product card mapper**
- File: `src/features/homepage/lib/mappers/productCardMapper.ts`
- Include `description` from SEO data

**5.2 Update product schema generation**
- File: `src/features/seo/schemas/product.ts`
- Use `printify_description` or `meta_description` for schema

**5.3 Update homepage product display**
- Show descriptions on product cards or detail views where appropriate

---

## Critical Files to Modify

| File | Changes |
|------|---------|
| `supabase/migrations/YYYYMMDD_add_product_seo_table.sql` | Create new table |
| `supabase/functions/sync-blueprint/index.ts` | Fetch & store description |
| `src/types/catalog.ts` | Add ProductSeo type |
| `src/services/catalogQueryService.ts` | Add SEO query methods |
| `src/queries/catalogQueries.ts` | Add SEO hooks |
| `src/features/homepage/lib/mappers/productCardMapper.ts` | Include description |
| `src/features/seo/schemas/product.ts` | Use description in schema |

---

## Verification Plan

1. **Database Migration**:
   - Run migration locally
   - Verify table created with correct columns
   - Check RLS policies work

2. **Sync Function Test**:
   - Call `sync-blueprint` for a test product
   - Verify `product_seo` row created with Printify description

3. **Query Test**:
   - Call `getProductWithSeo()`
   - Verify SEO data returned with product

4. **UI Verification**:
   - Check product descriptions appear in UI
   - Verify structured data includes description

---

## Implementation Order

1. **Phase 1**: Database migration (create table)
2. **Phase 2**: Update sync-blueprint function
3. **Phase 2.5**: Populate SEO data for all existing products
4. **Phase 3**: Add TypeScript types
5. **Phase 4**: Update query services
6. **Phase 5**: Use descriptions in application

## Estimated Scope
- 1 new migration file
- ~6-7 files to modify
- Main work is in sync function and query service
- One-time data population for all existing products
