"""Negative-test harness for migration 20260925000000_security_audit_rpc_and_rls_hardening.sql.

Use ONLY an empty disposable database. No environment files, hosted services, customer
data or provider APIs are touched. Derived from build-local-repro.py: it stubs the
Supabase roles and auth.uid()/auth.role(), replays the relevant migrations plus the
hardening migration, then asserts that anon/authenticated callers are blocked and that
service-role operations still work.

Run from the repository root:
  docker run -d --rm --name stamp-audit-pg -e POSTGRES_PASSWORD=pg -p 55440:5432 postgres:17-alpine
  python3 docs/security/build-local-hardening-check.py > /tmp/hardening-check.sql
  docker exec -i stamp-audit-pg psql -X -v ON_ERROR_STOP=1 -U postgres -d postgres < /tmp/hardening-check.sql
  docker stop stamp-audit-pg
The last line of a successful run is ALL_CHECKS_PASSED.
"""
from pathlib import Path
import re
M = Path('supabase/migrations')
def migration(name): return (M/name).read_text()
def function(name, filename):
    s = migration(filename)
    m = re.search(r'CREATE OR REPLACE FUNCTION\s+(?:public\.)?' + name + r'\s*\([\s\S]*?\$(\w*)\$[\s\S]*?\$\1\$[^;]*;', s, re.I)
    assert m, name
    return m.group(0)
print(r'''\set ON_ERROR_STOP on
CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
CREATE SCHEMA auth; CREATE SCHEMA extensions;
CREATE TABLE auth.users(id uuid PRIMARY KEY);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.role',true),'') $$;
GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated, service_role;
''')
print(migration('20260115000000_create_core_tables.sql'))
print(migration('20260101015400_create_payment_transactions.sql'))
print('''
ALTER TABLE profiles ADD coins integer DEFAULT 5, ADD coins_reset_at date DEFAULT current_date;
ALTER TABLE products ADD user_id uuid;
ALTER TABLE orders ADD promo_code text, ADD promo_value numeric, ADD printify_order_id text, ADD idempotency_key text;
ALTER TABLE carts ADD email text;
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_product_id_fkey; ALTER TABLE cart_items ALTER COLUMN product_id TYPE text USING product_id::text, ALTER COLUMN variant_id TYPE text USING variant_id::text;
ALTER TABLE cart_items ADD custom_image_hash text, ADD custom_image_public_id text, ADD product_name text;
ALTER TABLE payment_transactions ALTER COLUMN order_id TYPE uuid USING order_id::uuid;
ALTER TABLE payment_transactions ADD captured_at timestamptz, ADD payment_provider text DEFAULT 'stripe', ADD paypal_order_id text, ADD paypal_capture_id text, ADD paypal_payer_id text, ADD paypal_payer_email text, ADD mollie_payment_id text, ADD mollie_status text;
CREATE TABLE refund_failures(id uuid DEFAULT gen_random_uuid() PRIMARY KEY, payment_id text, payment_provider text, order_id text, amount numeric, error_message text, retry_count int, status text, next_retry_at timestamptz);
ALTER TABLE refund_failures ENABLE ROW LEVEL SECURITY;
''')
print(migration('20260621000004_fix_guest_cart_and_product_rls.sql'))
print(migration('20260701000000_add_orders_update_policy.sql'))
print(migration('20260707000000_security_hardening_rls.sql'))
print(migration('20260715000000_add_payment_transactions_update_policy.sql'))
print(migration('20260810000000_add_is_selected_to_cart_items.sql'))
print(function('atomic_stripe_payment_capture','20260625000001_add_atomic_payment_capture.sql'))
print(function('upsert_stripe_payment_transaction','20260714000008_add_order_id_to_stripe_upsert.sql'))
print('''CREATE TABLE webhook_events(id uuid DEFAULT gen_random_uuid(), provider text, event_id text, event_type text, payload jsonb, processed_at timestamptz, created_at timestamptz, UNIQUE(provider,event_id));
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;''')
print(function('record_webhook_event_atomic','20260625000002_add_payment_upsert_functions.sql'))
print(function('get_user_coins','20260807000000_add_get_user_coins_rpc.sql'))
print(function('create_refund_failure_alert','20260412000000_add_idempotency_and_refund_failures.sql'))
print(function('upsert_cart_item','20260804000000_fix_cart_items_image_index.sql'))
print(migration('20260908000000_fix_security_review.sql').split('-- One purchase per provider reference')[0])
print('-- ===== NEW MIGRATION =====')
print(migration('20260925000000_security_audit_rpc_and_rls_hardening.sql'))
print(r"""
-- ===== FIXTURES =====
INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002');
INSERT INTO profiles(id,email,coins,coins_reset_at) VALUES ('00000000-0000-0000-0000-000000000001','a@x.invalid',3,'2000-01-01'),('00000000-0000-0000-0000-000000000002','b@x.invalid',4,'2000-01-01');
INSERT INTO carts(id,user_id,session_id,email) VALUES
 ('10000000-0000-0000-0000-000000000001',NULL,'guest-a','guest-a@example.invalid'),
 ('10000000-0000-0000-0000-000000000002',NULL,'guest-b','guest-b@example.invalid'),
 ('10000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000002','retained-session','owner-b@example.invalid');
INSERT INTO cart_items(cart_id,unit_price,custom_image_url) VALUES
 ('10000000-0000-0000-0000-000000000001',10,'x'),('10000000-0000-0000-0000-000000000002',20,'x'),('10000000-0000-0000-0000-000000000003',30,'x');
INSERT INTO orders(id,user_id,order_number,customer_email,payment_status,total_amount,printify_order_id) VALUES
 ('20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002','TEST-VICTIM','victim@example.invalid','pending',100,'provider-real'),
 ('20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','TEST-A','a@example.invalid','paid',50,NULL),
 ('20000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000001','TEST-A2','a@example.invalid','paid',50,NULL);
INSERT INTO payment_transactions(id,user_id,order_id,stripe_payment_intent_id,amount,status) VALUES
 ('30000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','pi_SYNTHETIC',100,'processing'),
 ('30000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001',NULL,'pi_A',50,'succeeded');
INSERT INTO webhook_events(provider,event_id,event_type,payload) VALUES ('paypal','EV-SYNTHETIC','payment', '{"payer_email":"victim@example.invalid"}');
INSERT INTO products(id,name,slug,base_price,is_active,user_id) VALUES ('40000000-0000-0000-0000-000000000001','custom-of-a','s1',1,true,'00000000-0000-0000-0000-000000000001'),('40000000-0000-0000-0000-000000000009','legacy','s2',1,true,NULL);

CREATE OR REPLACE FUNCTION expect_fail(sql text, label text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  BEGIN EXECUTE sql; EXCEPTION WHEN others THEN RAISE NOTICE 'OK  blocked: % (%)', label, SQLERRM; RETURN; END;
  RAISE EXCEPTION 'FAIL not blocked: %', label;
END $$;
CREATE OR REPLACE FUNCTION expect_count(sql text, n bigint, label text) RETURNS void LANGUAGE plpgsql AS $$
DECLARE c bigint; BEGIN EXECUTE sql INTO c; IF c <> n THEN RAISE EXCEPTION 'FAIL %: got % expected %', label, c, n; END IF; RAISE NOTICE 'OK  %: %', label, c; END $$;
GRANT EXECUTE ON FUNCTION expect_fail(text,text), expect_count(text,bigint,text) TO anon, authenticated;

-- ===== ANON =====
SET ROLE anon; SET request.jwt.claim.role = 'anon'; SET request.jwt.claim.sub = '';
SELECT expect_count('SELECT count(*) FROM carts', 2, 'anon sees only guest carts');
SELECT expect_count('SELECT count(*) FROM cart_items', 2, 'anon sees only guest cart items');
SELECT expect_fail('SELECT atomic_stripe_payment_capture(''pi_SYNTHETIC'',0.50,''usd'')', 'anon capture rpc');
SELECT expect_fail('SELECT record_webhook_event_atomic(''paypal'',''EV-SYNTHETIC'',''x'',''{}'')', 'anon webhook rpc');
SELECT expect_fail('SELECT upsert_stripe_payment_transaction(''pi_SYNTHETIC'',''00000000-0000-0000-0000-000000000001'',NULL,0.5,''usd'',''succeeded'',''card'',''{}'',NULL)', 'anon upsert rpc');
SELECT expect_fail('SELECT update_cart_items_selection(''10000000-0000-0000-0000-000000000003'',''{}''::uuid[])', 'anon selection on user cart');
SELECT expect_fail('SELECT upsert_cart_item(''10000000-0000-0000-0000-000000000003'',''p'',''v'',1)', 'anon upsert into user cart');
SELECT expect_fail('SELECT get_user_coins(''00000000-0000-0000-0000-000000000001'')', 'anon coins');
SELECT expect_fail('SELECT create_refund_failure_alert(''p'',''stripe'',''20000000-0000-0000-0000-000000000001'',1,''e'')', 'anon refund alert');
SELECT expect_count('SELECT count(*) FROM products', 1, 'anon sees only ownerless products');
-- guest cart operations still work
SELECT update_cart_items_selection('10000000-0000-0000-0000-000000000001','{}'::uuid[]);
SELECT (upsert_cart_item('10000000-0000-0000-0000-000000000001','p','v',1,NULL,NULL,'n',5)).quantity AS guest_upsert_ok;
RESET ROLE;

-- ===== USER 1 =====
SET ROLE authenticated; SET request.jwt.claim.role = 'authenticated'; SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
SELECT expect_fail('SELECT atomic_stripe_payment_capture(''pi_SYNTHETIC'',0.50,''usd'')', 'user capture rpc');
SELECT expect_fail('SELECT get_user_coins(''00000000-0000-0000-0000-000000000002'')', 'user reads other coins');
SELECT expect_count('SELECT coins::bigint FROM get_user_coins(''00000000-0000-0000-0000-000000000001'')', 5, 'own coins reset');
SELECT expect_fail('SELECT update_cart_items_selection(''10000000-0000-0000-0000-000000000003'',''{}''::uuid[])', 'user selection on other user cart');
SELECT expect_fail('SELECT upsert_cart_item(''10000000-0000-0000-0000-000000000001'',''p'',''v'',1)', 'user upsert into guest cart');
SELECT expect_fail('UPDATE payment_transactions SET amount=999 WHERE id=''30000000-0000-0000-0000-000000000001''', 'owner changes amount');
SELECT expect_fail('UPDATE payment_transactions SET status=''failed'' WHERE id=''30000000-0000-0000-0000-000000000001''', 'owner changes status');
SELECT expect_fail('UPDATE payment_transactions SET order_id=''20000000-0000-0000-0000-000000000002'' WHERE id=''30000000-0000-0000-0000-000000000001''', 'owner links payment to other user order');
SELECT expect_fail('INSERT INTO payment_transactions(user_id,amount,status) VALUES (''00000000-0000-0000-0000-000000000001'',1,''succeeded'')', 'owner inserts payment');
UPDATE payment_transactions SET order_id='20000000-0000-0000-0000-000000000001' WHERE id='30000000-0000-0000-0000-000000000001';
SELECT expect_count('SELECT count(*) FROM payment_transactions WHERE order_id=''20000000-0000-0000-0000-000000000001''', 1, 'owner links own payment once');
SELECT expect_fail('UPDATE payment_transactions SET order_id=''20000000-0000-0000-0000-000000000011'' WHERE id=''30000000-0000-0000-0000-000000000001''', 'owner relinks payment');
SELECT expect_fail('UPDATE orders SET printify_order_id=''x'' WHERE id=''20000000-0000-0000-0000-000000000001''', 'owner sets printify id');
SELECT expect_fail('UPDATE orders SET idempotency_key=''k'' WHERE id=''20000000-0000-0000-0000-000000000001''', 'owner sets idempotency key');
UPDATE orders SET customer_email='new@example.invalid' WHERE id='20000000-0000-0000-0000-000000000001';
SELECT expect_count('SELECT count(*) FROM products', 2, 'user sees own + ownerless products');
SELECT expect_fail('SELECT create_refund_failure_alert(''p'',''stripe'',''20000000-0000-0000-0000-000000000002'',1,''e'')', 'refund alert for other user order');
SELECT create_refund_failure_alert('p','stripe','20000000-0000-0000-0000-000000000001',1,'e',99) AS own_alert_ok;
RESET ROLE;
SELECT 'ALERT_RETRY_CLAMPED' AS check_name, retry_count, status FROM refund_failures;

-- ===== SERVICE ROLE =====
SET ROLE service_role; SET request.jwt.claim.role = 'service_role'; SET request.jwt.claim.sub = '';
SELECT atomic_stripe_payment_capture('pi_SYNTHETIC',100,'usd') IS NOT NULL AS service_capture_ok;
SELECT (record_webhook_event_atomic('paypal','EV-NEW','x','{}')).event_id AS service_webhook_ok;
UPDATE orders SET printify_order_id='real-2' WHERE id='20000000-0000-0000-0000-000000000001';
UPDATE payment_transactions SET amount=51, order_id='20000000-0000-0000-0000-000000000011' WHERE id='30000000-0000-0000-0000-000000000001';
RESET ROLE;
SELECT 'ALL_CHECKS_PASSED' AS result;
""")
