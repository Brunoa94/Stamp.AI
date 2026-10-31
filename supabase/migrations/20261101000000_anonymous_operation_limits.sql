-- Per-key operation limits, used to count anonymous (guest) callers per IP.
-- A guest can get a new anonymous uid on every sign-in, so the per-user
-- counters in operation_rate_limits are not enough on their own. Keys are
-- 'ip:<sha256 of the IP>'; the raw IP is never stored.
CREATE TABLE public.operation_rate_limit_keys (
  limit_key TEXT NOT NULL,
  operation TEXT NOT NULL,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  request_count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY(limit_key,operation)
);
ALTER TABLE public.operation_rate_limit_keys ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.operation_rate_limit_keys FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.operation_rate_limit_keys TO service_role;
CREATE OR REPLACE FUNCTION public.consume_operation_limit_key(p_key TEXT,p_operation TEXT,p_limit INTEGER,p_seconds INTEGER)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE requests INTEGER;
BEGIN
  IF COALESCE(auth.role(),'') <> 'service_role' THEN RAISE EXCEPTION 'Server access required' USING ERRCODE='42501'; END IF;
  IF p_limit NOT BETWEEN 1 AND 1000 OR p_seconds NOT BETWEEN 1 AND 86400 OR length(p_operation)>100 OR length(p_key) NOT BETWEEN 1 AND 200 THEN RAISE EXCEPTION 'Invalid limit'; END IF;
  INSERT INTO operation_rate_limit_keys(limit_key,operation) VALUES(p_key,p_operation)
    ON CONFLICT(limit_key,operation) DO UPDATE SET
      request_count=CASE WHEN operation_rate_limit_keys.window_started_at <= now()-make_interval(secs=>p_seconds) THEN 1 ELSE operation_rate_limit_keys.request_count+1 END,
      window_started_at=CASE WHEN operation_rate_limit_keys.window_started_at <= now()-make_interval(secs=>p_seconds) THEN now() ELSE operation_rate_limit_keys.window_started_at END
    RETURNING request_count INTO requests;
  RETURN requests<=p_limit;
END;
$$;
REVOKE ALL ON FUNCTION public.consume_operation_limit_key(TEXT,TEXT,INTEGER,INTEGER) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.consume_operation_limit_key(TEXT,TEXT,INTEGER,INTEGER) TO service_role;
