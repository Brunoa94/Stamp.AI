-- =====================================================
-- Coins Migration
-- Created: 2026-03-14
-- Description: Adds coins and coins_reset_at columns to profiles
--              and creates the deduct_coin RPC function
-- =====================================================

-- Add coins columns to profiles table (idempotent)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS coins INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS coins_reset_at DATE NOT NULL DEFAULT CURRENT_DATE;

-- =====================================================
-- deduct_coin(user_id UUID) → BOOLEAN
--
-- Locks the row, resets coins daily if needed,
-- returns FALSE when the user has no coins left,
-- otherwise deducts 1 coin and returns TRUE.
-- =====================================================
CREATE OR REPLACE FUNCTION deduct_coin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_coins         INTEGER;
  v_coins_reset_at DATE;
BEGIN
  -- Lock the row for this user so concurrent calls are serialised
  SELECT coins, coins_reset_at
    INTO v_coins, v_coins_reset_at
    FROM profiles
   WHERE id = user_id
     FOR UPDATE;

  -- Daily reset: if the last reset date is before today, refill coins
  IF v_coins_reset_at < CURRENT_DATE THEN
    v_coins          := 5;
    v_coins_reset_at := CURRENT_DATE;
  END IF;

  -- Guard: no coins left
  IF v_coins < 1 THEN
    -- Persist the (potentially updated) reset date even when returning FALSE
    UPDATE profiles
       SET coins          = v_coins,
           coins_reset_at = v_coins_reset_at,
           updated_at     = NOW()
     WHERE id = user_id;

    RETURN FALSE;
  END IF;

  -- Deduct one coin
  UPDATE profiles
     SET coins          = v_coins - 1,
         coins_reset_at = v_coins_reset_at,
         updated_at     = NOW()
   WHERE id = user_id;

  RETURN TRUE;
END;
$$;
