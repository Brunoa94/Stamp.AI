-- =====================================================
-- TEST FILE FOR PROVIDER CATALOG SQL FUNCTIONS
-- =====================================================
-- Purpose: Validate SQL logic before deployment
-- Run this AFTER running the migration

-- Test 1: Insert sample data
BEGIN;

-- Clear any existing test data
DELETE FROM provider_catalog WHERE provider_name LIKE 'TEST%';

-- Insert test provider catalog entry
INSERT INTO provider_catalog (
    blueprint_id,
    provider_id,
    provider_name,
    provider_location,
    variants_data,
    shipping_profiles,
    cache_metadata,
    fetched_at,
    expires_at
) VALUES (
    12, -- Blueprint ID (T-shirt)
    99, -- Provider ID (Printify Choice)
    'TEST Provider A',
    'United States',
    '[
        {"id": 1, "title": "S / Black", "price": 920, "is_enabled": true, "options": {"color": "Black", "size": "S"}},
        {"id": 2, "title": "M / Black", "price": 950, "is_enabled": true, "options": {"color": "Black", "size": "M"}},
        {"id": 3, "title": "L / White", "price": 980, "is_enabled": true, "options": {"color": "White", "size": "L"}}
    ]'::jsonb,
    '[
        {
            "variant_ids": [1, 2, 3],
            "first_item": {"cost": 500, "currency": "USD"},
            "additional_items": {"cost": 300, "currency": "USD"},
            "countries": [
                {"code": "US", "first_item": {"cost": 400}, "additional_items": {"cost": 200}},
                {"code": "NL", "first_item": {"cost": 600}, "additional_items": {"cost": 300}},
                {"code": "GB", "first_item": {"cost": 550}, "additional_items": {"cost": 250}}
            ]
        }
    ]'::jsonb,
    '{
        "variants_count": 3,
        "colors_available": ["Black", "White"],
        "sizes_available": ["S", "M", "L"],
        "min_price": 920,
        "max_price": 980
    }'::jsonb,
    NOW(),
    NOW() + INTERVAL '36 hours'
);

-- Insert second test provider (more expensive product, cheaper shipping)
INSERT INTO provider_catalog (
    blueprint_id,
    provider_id,
    provider_name,
    provider_location,
    variants_data,
    shipping_profiles,
    cache_metadata,
    fetched_at,
    expires_at
) VALUES (
    12, -- Same blueprint
    30, -- Different provider
    'TEST Provider B',
    'Germany',
    '[
        {"id": 10, "title": "S / Red", "price": 1100, "is_enabled": true, "options": {"color": "Red", "size": "S"}},
        {"id": 11, "title": "M / Red", "price": 1150, "is_enabled": true, "options": {"color": "Red", "size": "M"}}
    ]'::jsonb,
    '[
        {
            "variant_ids": [10, 11],
            "first_item": {"cost": 300, "currency": "USD"},
            "additional_items": {"cost": 150, "currency": "USD"},
            "countries": [
                {"code": "US", "first_item": {"cost": 800}, "additional_items": {"cost": 400}},
                {"code": "NL", "first_item": {"cost": 350}, "additional_items": {"cost": 150}},
                {"code": "GB", "first_item": {"cost": 400}, "additional_items": {"cost": 200}}
            ]
        }
    ]'::jsonb,
    '{
        "variants_count": 2,
        "colors_available": ["Red"],
        "sizes_available": ["S", "M"],
        "min_price": 1100,
        "max_price": 1150
    }'::jsonb,
    NOW(),
    NOW() + INTERVAL '36 hours'
);

COMMIT;

-- =====================================================
-- TEST 2: get_providers_for_blueprint function
-- =====================================================
-- Expected: Should return both providers, sorted by min_price
SELECT '=== TEST 2: get_providers_for_blueprint ===' as test;
SELECT * FROM get_providers_for_blueprint(12);

-- Expected output:
-- provider_id | provider_name     | variants_count | min_price | colors_available | sizes_available
-- 99          | TEST Provider A   | 3              | 920       | {Black,White}    | {L,M,S}
-- 30          | TEST Provider B   | 2              | 1100      | {Red}            | {M,S}

-- =====================================================
-- TEST 3: get_best_provider_for_country function
-- =====================================================

-- Test 3a: Best provider for US
SELECT '=== TEST 3a: Best provider for US ===' as test;
SELECT * FROM get_best_provider_for_country(12, 'US');
-- Expected: Provider A (920 + 400 = 1320) is cheaper than Provider B (1100 + 800 = 1900)
-- Should return:
-- provider_id | provider_name     | total_cost | product_price | shipping_cost
-- 99          | TEST Provider A   | 1320       | 920           | 400

-- Test 3b: Best provider for NL
SELECT '=== TEST 3b: Best provider for NL ===' as test;
SELECT * FROM get_best_provider_for_country(12, 'NL');
-- Expected: Provider B (1100 + 350 = 1450) is cheaper than Provider A (920 + 600 = 1520)
-- Should return:
-- provider_id | provider_name     | total_cost | product_price | shipping_cost
-- 30          | TEST Provider B   | 1450       | 1100          | 350

-- Test 3c: Best provider for GB
SELECT '=== TEST 3c: Best provider for GB ===' as test;
SELECT * FROM get_best_provider_for_country(12, 'GB');
-- Expected: Provider A (920 + 550 = 1470) is cheaper than Provider B (1100 + 400 = 1500)
-- Should return:
-- provider_id | provider_name     | total_cost | product_price | shipping_cost
-- 99          | TEST Provider A   | 1470       | 920           | 550

-- Test 3d: Invalid country (should return no results)
SELECT '=== TEST 3d: Invalid country XX ===' as test;
SELECT * FROM get_best_provider_for_country(12, 'XX');
-- Expected: No rows returned

-- =====================================================
-- TEST 4: has_valid_catalog_cache function
-- =====================================================

SELECT '=== TEST 4a: Check cache for existing blueprint ===' as test;
SELECT has_valid_catalog_cache(ARRAY[12]);
-- Expected: true

SELECT '=== TEST 4b: Check cache for non-existent blueprint ===' as test;
SELECT has_valid_catalog_cache(ARRAY[999]);
-- Expected: false

SELECT '=== TEST 4c: Check cache for mixed blueprints ===' as test;
SELECT has_valid_catalog_cache(ARRAY[12, 999]);
-- Expected: false (one is missing)

-- =====================================================
-- TEST 5: Verify data structure
-- =====================================================

SELECT '=== TEST 5: Verify JSONB structure ===' as test;

-- Check variants_data extraction
SELECT
    blueprint_id,
    provider_name,
    jsonb_array_length(variants_data) as variant_count,
    variants_data->0->'options'->>'color' as first_variant_color
FROM provider_catalog
WHERE provider_name LIKE 'TEST%';

-- Check shipping_profiles extraction
SELECT
    provider_name,
    country->>'code' as country_code,
    (country->'first_item'->>'cost')::INTEGER as shipping_cost
FROM provider_catalog,
     jsonb_array_elements(shipping_profiles) AS profile,
     jsonb_array_elements(profile->'countries') AS country
WHERE provider_name LIKE 'TEST%'
ORDER BY provider_name, country->>'code';

-- =====================================================
-- TEST 6: Cache expiration
-- =====================================================

SELECT '=== TEST 6: Verify expiration logic ===' as test;

-- Update one provider to be expired
UPDATE provider_catalog
SET expires_at = NOW() - INTERVAL '1 hour'
WHERE provider_id = 30 AND blueprint_id = 12;

-- Should only return non-expired providers
SELECT provider_id, provider_name, expires_at < NOW() as is_expired
FROM provider_catalog
WHERE provider_name LIKE 'TEST%';

-- get_providers_for_blueprint should only return non-expired
SELECT * FROM get_providers_for_blueprint(12);
-- Expected: Only Provider A (99)

-- get_best_provider_for_country should use non-expired data
SELECT * FROM get_best_provider_for_country(12, 'NL');
-- Expected: Provider A (only one not expired)

-- =====================================================
-- CLEANUP
-- =====================================================

SELECT '=== CLEANUP: Removing test data ===' as test;
DELETE FROM provider_catalog WHERE provider_name LIKE 'TEST%';

SELECT '=== ALL TESTS COMPLETE ===' as test;
