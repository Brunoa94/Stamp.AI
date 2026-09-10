-- =====================================================
-- Get User Coins RPC Migration
-- Created: 2026-08-07
-- Description: Adds get_user_coins RPC function that checks
--              and resets coins daily when fetching balance
-- =====================================================

-- =====================================================
-- get_user_coins(user_id UUID) → TABLE(coins INTEGER, coins_reset_at DATE)
--
-- Returns the user's current coins and reset date.
-- If the reset date is before today, automatically resets
-- coins to 5 and updates the reset date.
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_coins(p_user_id UUID)
RETURNS TABLE(coins INTEGER, coins_reset_at DATE)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_coins          INTEGER;
  v_coins_reset_at DATE;
BEGIN
  -- Lock the row for this user to handle concurrent calls
  SELECT p.coins, p.coins_reset_at
    INTO v_coins, v_coins_reset_at
    FROM profiles p
   WHERE p.id = p_user_id
     FOR UPDATE;

  -- Check if user exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user: %', p_user_id;
  END IF;

  -- Daily reset: if the last reset date is before today, refill coins
  IF v_coins_reset_at < CURRENT_DATE THEN
    v_coins          := 5;
    v_coins_reset_at := CURRENT_DATE;

    -- Persist the reset
    UPDATE profiles
       SET coins          = v_coins,
           coins_reset_at = v_coins_reset_at,
           updated_at     = NOW()
     WHERE id = p_user_id;
  END IF;

  -- Return the (potentially updated) values
  RETURN QUERY SELECT v_coins, v_coins_reset_at;
END;
$$;
