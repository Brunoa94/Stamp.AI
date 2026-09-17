-- =====================================================
-- refund_coin(p_user_id UUID) → BOOLEAN
-- =====================================================
-- Server-side coin refund used by /api/generate-image: the route deducts a
-- coin with deduct_coin BEFORE calling the image model and returns the coin
-- if generation fails. Service role only — end users must never be able to
-- credit themselves. Idempotent: CREATE OR REPLACE + explicit grants.
--
-- The balance is capped at the daily allowance (5) so a deduct → daily reset
-- → refund sequence cannot inflate it.
-- =====================================================
CREATE OR REPLACE FUNCTION refund_coin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coins INTEGER;
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'refund_coin may only be called by the service role'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  SELECT coins
    INTO v_coins
    FROM profiles
   WHERE id = p_user_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  UPDATE profiles
     SET coins      = LEAST(COALESCE(v_coins, 0) + 1, 5),
         updated_at = NOW()
   WHERE id = p_user_id;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION refund_coin(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION refund_coin(UUID) TO service_role;
