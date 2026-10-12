-- Every generation debit has a receipt; retries can refund it at most once.
CREATE TABLE public.generation_credit_debits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('daily','purchased')),
  allowance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.generation_credit_debits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.generation_credit_debits FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.generation_credit_debits TO service_role;

CREATE OR REPLACE FUNCTION public.spend_generation_credit(p_user_id UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE balance INTEGER; reset_date DATE; purchased INTEGER; receipt UUID; debit_source TEXT;
BEGIN
  IF COALESCE(auth.role(),'') <> 'service_role' THEN RAISE EXCEPTION 'Server access required' USING ERRCODE='42501'; END IF;
  SELECT coins,coins_reset_at INTO balance,reset_date FROM profiles WHERE id=p_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;
  IF reset_date IS NULL OR reset_date<CURRENT_DATE THEN balance:=5; reset_date:=CURRENT_DATE; END IF;
  IF (SELECT count(*) FROM generation_credit_debits WHERE user_id=p_user_id AND created_at>now()-interval '1 minute')>=20 THEN
    RAISE EXCEPTION 'Too many generation requests' USING ERRCODE='PT429';
  END IF;
  IF balance>0 THEN
    UPDATE profiles SET coins=balance-1,coins_reset_at=reset_date,updated_at=now() WHERE id=p_user_id;
    debit_source:='daily';
  ELSE
    UPDATE profiles SET coins=COALESCE(balance,0),coins_reset_at=reset_date WHERE id=p_user_id;
    UPDATE user_credits SET credits=credits-1,updated_at=now() WHERE user_id=p_user_id AND credits>0 RETURNING credits INTO purchased;
    IF NOT FOUND THEN RETURN NULL; END IF;
    debit_source:='purchased';
  END IF;
  INSERT INTO generation_credit_debits(user_id,source) VALUES(p_user_id,debit_source) RETURNING id INTO receipt;
  IF debit_source='purchased' THEN
    INSERT INTO credit_transactions(user_id,transaction_type,amount,balance_after,reference_id,description)
      VALUES(p_user_id,'usage',-1,purchased,receipt::TEXT,'Image generation');
  END IF;
  RETURN receipt;
END;
$$;
CREATE OR REPLACE FUNCTION public.refund_generation_credit(p_debit_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE debit generation_credit_debits%ROWTYPE; balance INTEGER;
BEGIN
  IF COALESCE(auth.role(),'') <> 'service_role' THEN RAISE EXCEPTION 'Server access required' USING ERRCODE='42501'; END IF;
  SELECT * INTO debit FROM generation_credit_debits WHERE id=p_debit_id FOR UPDATE;
  IF NOT FOUND OR debit.refunded_at IS NOT NULL THEN RETURN FALSE; END IF;
  IF debit.source='daily' THEN
    -- A receipt from yesterday cannot inflate today's replenished allowance.
    UPDATE profiles SET coins=LEAST(COALESCE(coins,0)+1,5),updated_at=now()
      WHERE id=debit.user_id AND coins_reset_at=debit.allowance_date;
  ELSE
    UPDATE user_credits SET credits=credits+1,updated_at=now() WHERE user_id=debit.user_id RETURNING credits INTO balance;
    IF NOT FOUND THEN RAISE EXCEPTION 'Purchased credit account missing'; END IF;
    INSERT INTO credit_transactions(user_id,transaction_type,amount,balance_after,reference_id,description)
      VALUES(debit.user_id,'refund',1,balance,debit.id::TEXT,'Failed image generation');
  END IF;
  UPDATE generation_credit_debits SET refunded_at=now() WHERE id=debit.id;
  RETURN TRUE;
END;
$$;
REVOKE ALL ON FUNCTION public.spend_generation_credit(UUID),public.refund_generation_credit(UUID) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.spend_generation_credit(UUID),public.refund_generation_credit(UUID) TO service_role;

-- UI balance includes purchased credits, without exposing other users' ledgers.
CREATE OR REPLACE FUNCTION public.get_user_coins(p_user_id UUID)
RETURNS TABLE(coins INTEGER,coins_reset_at DATE) LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE balance INTEGER; reset_date DATE; purchased INTEGER;
BEGIN
  IF COALESCE(auth.role(),'') <> 'service_role' AND (auth.uid() IS NULL OR auth.uid() IS DISTINCT FROM p_user_id) THEN
    RAISE EXCEPTION 'Not allowed to read another user balance' USING ERRCODE='42501';
  END IF;
  SELECT p.coins,p.coins_reset_at INTO balance,reset_date FROM profiles p WHERE p.id=p_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;
  IF reset_date IS NULL OR reset_date<CURRENT_DATE THEN
    balance:=5;reset_date:=CURRENT_DATE;
    UPDATE profiles p SET coins=balance,coins_reset_at=reset_date,updated_at=now() WHERE p.id=p_user_id;
  END IF;
  SELECT credits INTO purchased FROM user_credits WHERE user_id=p_user_id;
  RETURN QUERY SELECT COALESCE(balance,0)+COALESCE(purchased,0),reset_date;
END;
$$;
REVOKE ALL ON FUNCTION public.get_user_coins(UUID) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_user_coins(UUID) TO authenticated,service_role;
