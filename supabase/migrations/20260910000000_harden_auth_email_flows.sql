-- Database-backed controls for the custom authentication email routes.

CREATE TABLE IF NOT EXISTS public.auth_email_rate_limits (
  scope TEXT NOT NULL,
  identifier_hash TEXT NOT NULL,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  request_count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (scope, identifier_hash)
);

ALTER TABLE public.auth_email_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.auth_email_rate_limits FROM PUBLIC, anon, authenticated;
CREATE INDEX IF NOT EXISTS auth_email_rate_limits_window_idx
  ON public.auth_email_rate_limits (window_started_at);

CREATE OR REPLACE FUNCTION public.consume_auth_email_rate_limit(
  p_scope TEXT,
  p_identifier_hash TEXT,
  p_max_requests INTEGER,
  p_window_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_allowed BOOLEAN;
BEGIN
  IF p_max_requests < 1 OR p_window_seconds < 1 THEN
    RAISE EXCEPTION 'Rate-limit configuration must be positive';
  END IF;

  INSERT INTO public.auth_email_rate_limits AS limits (
    scope,
    identifier_hash,
    window_started_at,
    request_count
  )
  VALUES (p_scope, p_identifier_hash, NOW(), 1)
  ON CONFLICT (scope, identifier_hash) DO UPDATE
  SET
    window_started_at = CASE
      WHEN limits.window_started_at
        + make_interval(secs => p_window_seconds) <= NOW()
      THEN NOW()
      ELSE limits.window_started_at
    END,
    request_count = CASE
      WHEN limits.window_started_at
        + make_interval(secs => p_window_seconds) <= NOW()
      THEN 1
      ELSE limits.request_count + 1
    END
  RETURNING request_count <= p_max_requests INTO v_allowed;

  RETURN v_allowed;
END;
$$;

CREATE OR REPLACE FUNCTION public.find_unconfirmed_auth_user(p_email TEXT)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
  SELECT jsonb_build_object(
    'id', users.id,
    'email', users.email,
    'first_name', users.raw_user_meta_data ->> 'first_name'
  )
  FROM auth.users AS users
  -- Supabase stores validated auth emails normalized to lowercase, allowing
  -- its existing email index to serve this equality lookup.
  WHERE users.email = lower(trim(p_email))
    AND users.email_confirmed_at IS NULL
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.consume_auth_email_rate_limit(TEXT, TEXT, INTEGER, INTEGER)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.find_unconfirmed_auth_user(TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_auth_email_rate_limit(TEXT, TEXT, INTEGER, INTEGER)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.find_unconfirmed_auth_user(TEXT)
  TO service_role;
