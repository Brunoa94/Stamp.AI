-- Update Unisex Heavy Cotton Tee image to use option #8
-- Better visual representation of the product

UPDATE catalog_products
SET base_image_url = 'https://images.printify.com/66d8178f24a2566c980b1bd3'
WHERE blueprint_id = 6;
