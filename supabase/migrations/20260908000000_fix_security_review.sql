-- Correct the trigger for installations that already applied the hardening migration.
-- Payment identifiers live on payment_transactions, not orders.
CREATE OR REPLACE FUNCTION enforce_orders_protected_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF is_privileged_writer() THEN
    RETURN NEW;
  END IF;

  IF NEW.user_id                 IS DISTINCT FROM OLD.user_id
  OR NEW.order_number            IS DISTINCT FROM OLD.order_number
  OR NEW.subtotal                IS DISTINCT FROM OLD.subtotal
  OR NEW.tax_amount              IS DISTINCT FROM OLD.tax_amount
  OR NEW.discount_amount         IS DISTINCT FROM OLD.discount_amount
  OR NEW.shipping_cost           IS DISTINCT FROM OLD.shipping_cost
  OR NEW.total_amount            IS DISTINCT FROM OLD.total_amount
  OR NEW.currency                IS DISTINCT FROM OLD.currency
  OR NEW.payment_status          IS DISTINCT FROM OLD.payment_status
  OR NEW.payment_method          IS DISTINCT FROM OLD.payment_method
  OR NEW.status                  IS DISTINCT FROM OLD.status
  OR NEW.promo_code              IS DISTINCT FROM OLD.promo_code
  OR NEW.promo_value             IS DISTINCT FROM OLD.promo_value
  THEN
    RAISE EXCEPTION 'Not allowed to modify protected order columns'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  RETURN NEW;
END;
$$;

-- One purchase per provider reference. If historical duplicate purchases exist,
-- reconcile them before applying this constraint; do not silently delete money records.
CREATE UNIQUE INDEX IF NOT EXISTS credit_purchase_reference_unique
  ON public.credit_transactions(reference_id)
  WHERE transaction_type = 'purchase' AND reference_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.grant_stripe_purchase_credits(
  p_payment_intent_id TEXT,
  p_user_id UUID,
  p_amount_cents INTEGER,
  p_credit_price_cents INTEGER,
  p_currency TEXT,
  p_customer_id TEXT DEFAULT NULL,
  p_payment_method_type TEXT DEFAULT 'card',
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction_id UUID;
  v_credits INTEGER;
  v_balance INTEGER;
BEGIN
  IF p_user_id IS NULL OR p_payment_intent_id IS NULL OR p_payment_intent_id = ''
    OR p_amount_cents IS NULL OR p_amount_cents <= 0
    OR p_credit_price_cents IS NULL OR p_credit_price_cents <= 0
    OR p_currency IS NULL OR upper(p_currency) <> 'USD' THEN
    RAISE EXCEPTION 'Invalid credit purchase';
  END IF;
  v_credits := p_amount_cents / p_credit_price_cents;
  IF v_credits <= 0 OR p_amount_cents % p_credit_price_cents <> 0 THEN
    RAISE EXCEPTION 'Credit purchase must contain a whole number of credits';
  END IF;

  -- Claim the payment first. A concurrent duplicate waits here and then exits.
  -- If any subsequent write fails, the claim and balance change both roll back.
  INSERT INTO public.credit_transactions (
    user_id, transaction_type, amount, balance_after, reference_id, description
  ) VALUES (
    p_user_id, 'purchase', v_credits, 0, p_payment_intent_id,
    'Purchased ' || v_credits || ' credits'
  ) ON CONFLICT (reference_id)
    WHERE transaction_type = 'purchase' AND reference_id IS NOT NULL
    DO NOTHING
  RETURNING id INTO v_transaction_id;

  IF v_transaction_id IS NULL THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.user_credits(user_id, credits, updated_at)
    VALUES (p_user_id, v_credits, now())
    ON CONFLICT (user_id) DO UPDATE
      SET credits = COALESCE(user_credits.credits, 0) + EXCLUDED.credits,
          updated_at = now()
    RETURNING credits INTO v_balance;

  UPDATE public.credit_transactions SET balance_after = v_balance
    WHERE id = v_transaction_id;

  PERFORM public.upsert_stripe_payment_transaction(
    p_payment_intent_id, p_user_id, p_customer_id, p_amount_cents / 100.0,
    lower(p_currency), 'succeeded', p_payment_method_type,
    p_metadata || jsonb_build_object('type', 'credit_purchase')
  );
  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.grant_stripe_purchase_credits(TEXT, UUID, INTEGER, INTEGER, TEXT, TEXT, TEXT, JSONB)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_stripe_purchase_credits(TEXT, UUID, INTEGER, INTEGER, TEXT, TEXT, TEXT, JSONB)
  TO service_role;
