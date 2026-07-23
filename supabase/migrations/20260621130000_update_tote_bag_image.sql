-- Update Tote Bag (AOP) image to use option #5
-- Better visual representation of the all-over print tote bag

UPDATE catalog_products
SET base_image_url = 'https://images.printify.com/66cc6ee30651a4bc3701c792'
WHERE blueprint_id = 1389;
