-- Add promocodes support

CREATE TABLE IF NOT EXISTS promocodes (
  promocode_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'numeric')),
  value DECIMAL(10,2) NOT NULL CHECK (value > 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS promo_code TEXT,
  ADD COLUMN IF NOT EXISTS promo_value DECIMAL(10,2);

CREATE INDEX IF NOT EXISTS idx_promocodes_code ON promocodes(code);
CREATE INDEX IF NOT EXISTS idx_orders_promo_code ON orders(promo_code);

ALTER TABLE promocodes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read promocodes" ON promocodes;
CREATE POLICY "Anyone can read promocodes"
  ON promocodes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role can manage all promocodes" ON promocodes;
CREATE POLICY "Service role can manage all promocodes"
  ON promocodes FOR ALL
  USING (auth.role() = 'service_role');
