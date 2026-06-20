-- Database Functions Export
-- Generated for migration to new Supabase instance

-- ========================================
-- TRIGGER HELPER FUNCTIONS (Must be created first)
-- ========================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_order_number()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
    new_order_number TEXT;
    counter INTEGER := 0;
BEGIN
    LOOP
        -- Generate order number: ORD-YYYYMMDD-XXXX
        new_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                           LPAD((FLOOR(RANDOM() * 10000)::INTEGER)::TEXT, 4, '0');

        -- Check if it already exists
        IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = new_order_number) THEN
            RETURN new_order_number;
        END IF;

        -- Prevent infinite loop
        counter := counter + 1;
        IF counter > 100 THEN
            RAISE EXCEPTION 'Could not generate unique order number after 100 attempts';
        END IF;
    END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_order_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$function$;

-- ========================================
-- BUSINESS LOGIC FUNCTIONS
-- ========================================

CREATE OR REPLACE FUNCTION public.check_order_status_alignment()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- If payment_status is 'paid', status should eventually be 'confirmed' or beyond
  IF NEW.payment_status = 'paid' AND NEW.status = 'pending' THEN
    -- Allow temporary misalignment (order just created)
    -- But log a warning if it's been more than 5 minutes
    IF NEW.created_at < NOW() - INTERVAL '5 minutes' THEN
      RAISE WARNING 'Order % has payment_status=paid but status=pending for > 5 minutes', NEW.id;
    END IF;
  END IF;

  -- If payment_status is 'refunded', order should be cancelled
  IF NEW.payment_status = 'refunded' AND NEW.status NOT IN ('cancelled', 'pending') THEN
    RAISE WARNING 'Order % has payment_status=refunded but status=%', NEW.id, NEW.status;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_pairing_sessions()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    DELETE FROM device_pairing_sessions
    WHERE expires_at < NOW();
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_refund_failure_alert(p_payment_id text, p_payment_provider text, p_order_id text, p_amount numeric, p_error_message text, p_retry_count integer DEFAULT 0)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  failure_id UUID;
BEGIN
  INSERT INTO refund_failures (
    payment_id,
    payment_provider,
    order_id,
    amount,
    error_message,
    retry_count,
    status,
    next_retry_at
  ) VALUES (
    p_payment_id,
    p_payment_provider,
    p_order_id,
    p_amount,
    p_error_message,
    p_retry_count,
    CASE
      WHEN p_retry_count < 3 THEN 'retrying'
      ELSE 'pending_manual_review'
    END,
    CASE
      WHEN p_retry_count < 3 THEN NOW() + INTERVAL '5 minutes' * POWER(2, p_retry_count)
      ELSE NULL
    END
  ) RETURNING id INTO failure_id;

  RETURN failure_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.deduct_coin(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.expire_waiting_payment_orders()
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
  affected_count INTEGER;
BEGIN
  WITH expired AS (
    UPDATE orders
    SET
      status = 'cancelled',
      cancellation_reason = 'expired',
      expired_at = NOW(),
      cancelled_at = NOW(),
      updated_at = NOW()
    WHERE status = 'waiting_payment'
      AND created_at <= NOW() - INTERVAL '24 hours'
    RETURNING id
  )
  SELECT COUNT(*) INTO affected_count FROM expired;

  RETURN affected_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_best_provider_for_country(p_blueprint_id integer, p_country_code text)
 RETURNS TABLE(provider_id integer, provider_name text, total_cost integer, product_price integer, shipping_cost integer)
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
    RETURN QUERY
    WITH provider_costs AS (
        SELECT
            pc.provider_id,
            pc.provider_name,
            (pc.cache_metadata->>'min_price')::INTEGER as min_product_price,
            -- Extract shipping cost for the specific country from shipping_profiles
            -- Real structure: profiles[{countries:["US","NL"], first_item:{cost:449}}]
            (
                SELECT MIN((profile->'first_item'->>'cost')::INTEGER)
                FROM jsonb_array_elements(pc.shipping_profiles) AS profile
                WHERE p_country_code = ANY(
                    ARRAY(SELECT jsonb_array_elements_text(profile->'countries'))
                )
            ) as country_shipping_cost
        FROM provider_catalog pc
        WHERE pc.blueprint_id = p_blueprint_id
          AND pc.expires_at > NOW()
    )
    SELECT
        pc.provider_id,
        pc.provider_name,
        (pc.min_product_price + COALESCE(pc.country_shipping_cost, 0)) as total_cost,
        pc.min_product_price as product_price,
        COALESCE(pc.country_shipping_cost, 0) as shipping_cost
    FROM provider_costs pc
    WHERE pc.country_shipping_cost IS NOT NULL
    ORDER BY total_cost ASC
    LIMIT 1;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_order_by_idempotency_key(key text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  order_uuid UUID;
BEGIN
  SELECT id INTO order_uuid
  FROM orders
  WHERE idempotency_key = key
  LIMIT 1;

  RETURN order_uuid;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_pending_payment_recoveries(p_user_id uuid, p_hours_ago integer DEFAULT 24)
 RETURNS TABLE(id uuid, payment_provider text, payment_intent_id text, amount numeric, currency text, cart_snapshot jsonb, shipping_address jsonb, line_items jsonb, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    pr.id,
    pr.payment_provider,
    pr.payment_intent_id,
    pr.amount,
    pr.currency,
    pr.cart_snapshot,
    pr.shipping_address,
    pr.line_items,
    pr.created_at
  FROM payment_recovery pr
  WHERE pr.user_id = p_user_id
    AND pr.recovery_status = 'pending'
    AND pr.created_at > NOW() - (p_hours_ago || ' hours')::INTERVAL
  ORDER BY pr.created_at DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_providers_for_blueprint(p_blueprint_id integer)
 RETURNS TABLE(provider_id integer, provider_name text, variants_count integer, min_price integer, colors_available text[], sizes_available text[])
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        pc.provider_id,
        pc.provider_name,
        (pc.cache_metadata->>'variants_count')::INTEGER as variants_count,
        (pc.cache_metadata->>'min_price')::INTEGER as min_price,
        ARRAY(SELECT jsonb_array_elements_text(pc.cache_metadata->'colors_available')) as colors_available,
        ARRAY(SELECT jsonb_array_elements_text(pc.cache_metadata->'sizes_available')) as sizes_available
    FROM provider_catalog pc
    WHERE pc.blueprint_id = p_blueprint_id
      AND pc.expires_at > NOW()
    ORDER BY (pc.cache_metadata->>'min_price')::INTEGER ASC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');

  -- Initialize user credits
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (NEW.id, 10); -- Give 10 free credits on signup

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_valid_catalog_cache(p_blueprint_ids integer[])
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
    missing_count INTEGER;
BEGIN
    SELECT COUNT(DISTINCT blueprint_id)
    INTO missing_count
    FROM unnest(p_blueprint_ids) AS blueprint_id
    WHERE NOT EXISTS (
        SELECT 1
        FROM provider_catalog pc
        WHERE pc.blueprint_id = blueprint_id
          AND pc.expires_at > NOW()
    );

    RETURN missing_count = 0;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_recovery_attempt(p_payment_intent_id text, p_payment_provider text, p_error text DEFAULT NULL::text)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_attempts INTEGER;
BEGIN
  UPDATE payment_recovery
  SET
    recovery_attempts = recovery_attempts + 1,
    last_recovery_attempt = NOW(),
    recovery_error = p_error,
    updated_at = NOW()
  WHERE payment_intent_id = p_payment_intent_id
    AND payment_provider = p_payment_provider
  RETURNING recovery_attempts INTO v_attempts;

  RETURN v_attempts;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_webhook_processed(p_provider text, p_event_id text)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM webhook_events
    WHERE provider = p_provider
      AND event_id = p_event_id
  ) INTO v_exists;

  RETURN v_exists;
END;
$function$;

CREATE OR REPLACE FUNCTION public.mark_payment_recovered(p_payment_intent_id text, p_payment_provider text, p_order_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE payment_recovery
  SET
    recovery_status = 'recovered',
    order_id = p_order_id,
    recovered_at = NOW(),
    updated_at = NOW()
  WHERE payment_intent_id = p_payment_intent_id
    AND payment_provider = p_payment_provider
    AND recovery_status = 'pending';

  RETURN FOUND;
END;
$function$;

CREATE OR REPLACE FUNCTION public.process_refund_atomic(p_order_id text, p_refund_id text, p_reason text, p_payment_provider text)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_order_uuid UUID;
  v_rows_affected INTEGER;
  v_result JSON;
BEGIN
  -- Try to parse order_id as UUID
  -- If it starts with "temp_", it's not a real order, skip order update
  IF p_order_id LIKE 'temp_%' THEN
    -- Only update payment_transactions (no order exists yet)
    UPDATE payment_transactions
    SET status = 'refunded',
        metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
          'refund_id', p_refund_id,
          'refund_reason', p_reason
        ),
        updated_at = NOW()
    WHERE (
      (p_payment_provider = 'stripe' AND stripe_payment_intent_id IS NOT NULL) OR
      (p_payment_provider = 'paypal' AND paypal_capture_id IS NOT NULL) OR
      (p_payment_provider = 'mollie' AND mollie_payment_id IS NOT NULL)
    )
    AND status != 'refunded';

    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;

    v_result = jsonb_build_object(
      'success', true,
      'transactions_updated', v_rows_affected,
      'orders_updated', 0,
      'note', 'Temporary order - only transaction updated'
    );

    RETURN v_result;
  END IF;

  -- Parse as UUID for real orders
  BEGIN
    v_order_uuid = p_order_id::UUID;
  EXCEPTION
    WHEN invalid_text_representation THEN
      RAISE EXCEPTION 'Invalid order_id format: %', p_order_id;
  END;

  -- ATOMIC OPERATION: Both updates succeed or both rollback

  -- Update payment_transactions
  UPDATE payment_transactions
  SET status = 'refunded',
      metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
        'refund_id', p_refund_id,
        'refund_reason', p_reason
      ),
      updated_at = NOW()
  WHERE order_id = v_order_uuid
    AND status != 'refunded';

  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;

  -- Update orders
  UPDATE orders
  SET payment_status = 'refunded',
      updated_at = NOW()
  WHERE id = v_order_uuid
    AND payment_status != 'refunded';

  v_result = jsonb_build_object(
    'success', true,
    'transactions_updated', v_rows_affected,
    'orders_updated', 1,
    'order_id', v_order_uuid
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- Rollback happens automatically
    RAISE EXCEPTION 'Atomic refund failed for order %: %', p_order_id, SQLERRM;
END;
$function$;

CREATE OR REPLACE FUNCTION public.record_amount_validation_failure(p_payment_provider text, p_payment_intent_id text, p_payment_amount numeric, p_payment_currency text, p_expected_amount numeric, p_user_id uuid, p_validation_context jsonb, p_error_message text)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_failure_id UUID;
BEGIN
  INSERT INTO amount_validation_failures (
    payment_provider,
    payment_intent_id,
    payment_amount,
    payment_currency,
    expected_amount,
    difference,
    user_id,
    validation_context,
    error_message,
    action_taken
  )
  VALUES (
    p_payment_provider,
    p_payment_intent_id,
    p_payment_amount,
    p_payment_currency,
    p_expected_amount,
    ABS(p_payment_amount - p_expected_amount),
    p_user_id,
    p_validation_context,
    p_error_message,
    'manual_review'
  )
  RETURNING id INTO v_failure_id;

  RETURN v_failure_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.record_payment_for_recovery(p_payment_provider text, p_payment_intent_id text, p_payment_status text, p_user_id uuid, p_user_email text, p_amount numeric, p_currency text, p_cart_snapshot jsonb, p_shipping_address jsonb, p_line_items jsonb, p_metadata jsonb DEFAULT NULL::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_recovery_id UUID;
BEGIN
  INSERT INTO payment_recovery (
    payment_provider,
    payment_intent_id,
    payment_status,
    user_id,
    user_email,
    amount,
    currency,
    cart_snapshot,
    shipping_address,
    line_items,
    metadata,
    recovery_status
  )
  VALUES (
    p_payment_provider,
    p_payment_intent_id,
    p_payment_status,
    p_user_id,
    p_user_email,
    p_amount,
    p_currency,
    p_cart_snapshot,
    p_shipping_address,
    p_line_items,
    p_metadata,
    'pending'
  )
  ON CONFLICT (payment_provider, payment_intent_id)
  DO UPDATE SET
    payment_status = EXCLUDED.payment_status,
    updated_at = NOW()
  RETURNING id INTO v_recovery_id;

  RETURN v_recovery_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.record_webhook_event(p_provider text, p_event_id text, p_event_type text, p_payload jsonb DEFAULT NULL::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_webhook_id UUID;
BEGIN
  INSERT INTO webhook_events (provider, event_id, event_type, payload)
  VALUES (p_provider, p_event_id, p_event_type, p_payload)
  ON CONFLICT (provider, event_id) DO UPDATE
    SET processed_at = NOW(),
        processing_status = 'duplicate'
  RETURNING id INTO v_webhook_id;

  RETURN v_webhook_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.refill_min_3_coins_daily()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.profiles
  SET
    coins = 3,
    coins_reset_at = current_date
  WHERE coins < 3;
END;
$function$;
