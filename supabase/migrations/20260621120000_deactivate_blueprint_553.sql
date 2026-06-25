-- Deactivate Blueprint 553 (Cotton Tote Bag)
-- Replaced by Blueprint 1389 (Tote Bag AOP) which has better EU shipping

UPDATE catalog_products
SET is_active = false
WHERE blueprint_id = 553;
