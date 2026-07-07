-- Enable RLS on all catalog tables
ALTER TABLE catalog_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE print_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_provider_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_custom_designs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to READ catalog data (public catalog)
CREATE POLICY "Allow anonymous read on catalog_products"
  ON catalog_products FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous read on print_providers"
  ON print_providers FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous read on product_provider_availability"
  ON product_provider_availability FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous read on product_variants"
  ON product_variants FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous read on variant_pricing"
  ON variant_pricing FOR SELECT
  USING (true);

-- user_custom_designs should only be accessible by the owner
CREATE POLICY "Users can read their own designs"
  ON user_custom_designs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own designs"
  ON user_custom_designs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own designs"
  ON user_custom_designs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own designs"
  ON user_custom_designs FOR DELETE
  USING (auth.uid() = user_id);
