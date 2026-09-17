-- =====================================================
-- Promocodes: lifecycle columns, private reads, atomic redemption
-- =====================================================
-- Previously: FOR SELECT USING (true) exposed every code (including unlimited
-- ones) to anyone with the anon key, and codes had no expiry or usage limit.
--
-- Reads are now restricted to the service role. The only reader is the
-- server-side /api/validate-promocode route (service-role client), which
-- applies the active / not-expired / under-limit rules. Idempotent.
-- =====================================================

ALTER TABLE promocodes
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS max_uses   INTEGER CHECK (max_uses IS NULL OR max_uses > 0),
  ADD COLUMN IF NOT EXISTS used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  ADD COLUMN IF NOT EXISTS is_active  BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN promocodes.expires_at IS 'Code is rejected at or after this instant; NULL = never expires';
COMMENT ON COLUMN promocodes.max_uses   IS 'Maximum successful redemptions; NULL = unlimited';
COMMENT ON COLUMN promocodes.used_count IS 'Successful redemptions so far (incremented by redeem_promocode)';
COMMENT ON COLUMN promocodes.is_active  IS 'Kill switch; inactive codes are rejected';

-- Reads: service role only. The service role bypasses RLS, so removing the
-- public policy (and keeping RLS enabled) is what closes the table.
ALTER TABLE promocodes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read promocodes" ON promocodes;

DROP POLICY IF EXISTS "Service role can manage all promocodes" ON promocodes;
CREATE POLICY "Service role can manage all promocodes"
  ON promocodes FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

REVOKE ALL ON TABLE promocodes FROM anon, authenticated;

-- =====================================================
-- redeem_promocode(p_code TEXT) → promocodes row
-- =====================================================
-- Atomically re-checks active / expiry / usage limit under a row lock and
-- increments used_count. Call this when an order that carries a promo code
-- is finalised (server-side only). Returns no rows when the code cannot be
-- redeemed.
CREATE OR REPLACE FUNCTION redeem_promocode(p_code TEXT)
RETURNS SETOF promocodes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'redeem_promocode may only be called by the service role'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  RETURN QUERY
    UPDATE promocodes
       SET used_count = used_count + 1
     WHERE code = UPPER(TRIM(p_code))
       AND is_active
       AND (expires_at IS NULL OR expires_at > NOW())
       AND (max_uses IS NULL OR used_count < max_uses)
    RETURNING *;
END;
$$;

REVOKE ALL ON FUNCTION redeem_promocode(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION redeem_promocode(TEXT) TO service_role;
