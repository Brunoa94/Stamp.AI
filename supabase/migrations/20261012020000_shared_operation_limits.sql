CREATE TABLE public.operation_rate_limits (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation TEXT NOT NULL,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  request_count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY(user_id,operation)
);
ALTER TABLE public.operation_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.operation_rate_limits FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.operation_rate_limits TO service_role;
CREATE OR REPLACE FUNCTION public.consume_operation_limit(p_user_id UUID,p_operation TEXT,p_limit INTEGER,p_seconds INTEGER)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE requests INTEGER;
BEGIN
  IF COALESCE(auth.role(),'') <> 'service_role' THEN RAISE EXCEPTION 'Server access required' USING ERRCODE='42501'; END IF;
  IF p_limit NOT BETWEEN 1 AND 1000 OR p_seconds NOT BETWEEN 1 AND 86400 OR length(p_operation)>100 THEN RAISE EXCEPTION 'Invalid limit'; END IF;
  INSERT INTO operation_rate_limits(user_id,operation) VALUES(p_user_id,p_operation)
    ON CONFLICT(user_id,operation) DO UPDATE SET
      request_count=CASE WHEN operation_rate_limits.window_started_at <= now()-make_interval(secs=>p_seconds) THEN 1 ELSE operation_rate_limits.request_count+1 END,
      window_started_at=CASE WHEN operation_rate_limits.window_started_at <= now()-make_interval(secs=>p_seconds) THEN now() ELSE operation_rate_limits.window_started_at END
    RETURNING request_count INTO requests;
  RETURN requests<=p_limit;
END;
$$;
REVOKE ALL ON FUNCTION public.consume_operation_limit(UUID,TEXT,INTEGER,INTEGER) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.consume_operation_limit(UUID,TEXT,INTEGER,INTEGER) TO service_role;
CREATE INDEX generation_debits_user_time ON public.generation_credit_debits(user_id,created_at);
