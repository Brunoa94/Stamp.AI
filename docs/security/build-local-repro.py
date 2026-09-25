"""Build synthetic SQL from repository policies/functions. Use ONLY an empty disposable database.
No environment files, hosted services, customer data, or provider APIs are accessed.
Run from the repository root: python3 docs/security/build-local-repro.py > /tmp/security-repro.sql
This is a targeted PostgreSQL semantics test, not a full Supabase migration replay.
"""
from pathlib import Path
import re
M = Path('supabase/migrations')
def migration(name):
    return (M / name).read_text()
def function(name, filename):
    s = migration(filename)
    pattern = r'CREATE OR REPLACE FUNCTION\s+(?:public\.)?' + name + r'\s*\([\s\S]*?\$(\w*)\$[\s\S]*?\$\1\$[^;]*;'
    m = re.search(pattern, s, re.I)
    assert m, name
    return m.group(0)
print('''\\set ON_ERROR_STOP on
CREATE ROLE anon;
CREATE ROLE authenticated;
CREATE ROLE service_role BYPASSRLS;
CREATE SCHEMA auth;
CREATE SCHEMA extensions;
CREATE TABLE auth.users(id uuid PRIMARY KEY);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.role',true),'') $$;
GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;
-- Explicitly model standard Supabase table grants. Function EXECUTE uses PostgreSQL defaults.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated, service_role;
''')
print(migration('20260115000000_create_core_tables.sql'))
print(migration('20260101015400_create_payment_transactions.sql'))
print('''
ALTER TABLE profiles ADD coins integer DEFAULT 5, ADD coins_reset_at date DEFAULT current_date;
ALTER TABLE products ADD user_id uuid;
ALTER TABLE orders ADD promo_code text, ADD promo_value numeric, ADD printify_order_id text;
ALTER TABLE carts ADD email text;
ALTER TABLE payment_transactions ALTER COLUMN order_id TYPE uuid USING order_id::uuid;
ALTER TABLE payment_transactions ADD captured_at timestamptz, ADD payment_provider text;
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
print('''
INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002');
INSERT INTO carts(id,user_id,session_id,email) VALUES
 ('10000000-0000-0000-0000-000000000001',NULL,'guest-a','guest-a@example.invalid'),
 ('10000000-0000-0000-0000-000000000002',NULL,'guest-b','guest-b@example.invalid'),
 ('10000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000002','retained-session','owner-b@example.invalid');
INSERT INTO cart_items(cart_id,unit_price) VALUES
 ('10000000-0000-0000-0000-000000000001',10),('10000000-0000-0000-0000-000000000002',20),('10000000-0000-0000-0000-000000000003',30);
INSERT INTO orders(id,user_id,order_number,customer_email,payment_status,total_amount,printify_order_id) VALUES
 ('20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002','TEST-VICTIM','victim@example.invalid','pending',100,'provider-real');
INSERT INTO payment_transactions(user_id,order_id,stripe_payment_intent_id,amount,status) VALUES
 ('00000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','pi_SYNTHETIC',100,'processing');
INSERT INTO webhook_events(provider,event_id,event_type,payload) VALUES ('paypal','EV-SYNTHETIC','payment', '{"payer_email":"victim@example.invalid"}');
SET ROLE anon;
SET request.jwt.claim.role = 'anon';
SELECT 'ANON_CART_ROWS_EXPECT_3' AS check_name, count(*) FROM carts;
SELECT 'ANON_CART_ITEM_ROWS_EXPECT_2' AS check_name, count(*) FROM cart_items;
UPDATE carts SET email='changed@example.invalid' WHERE id='10000000-0000-0000-0000-000000000002';
SELECT 'ANON_PAYMENT_ROWS_EXPECT_0' AS check_name,count(*) FROM payment_transactions;
SELECT atomic_stripe_payment_capture('pi_SYNTHETIC',0.50,'usd');
SELECT 'ANON_READS_WEBHOOK_PAYLOAD' AS check_name, (record_webhook_event_atomic('paypal','EV-SYNTHETIC','ignored','{}')).payload;
SELECT update_cart_items_selection('10000000-0000-0000-0000-000000000003','{}'::uuid[]);
RESET ROLE;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM orders WHERE order_number='TEST-VICTIM' AND payment_status='paid') THEN RAISE EXCEPTION 'Capture bypass not reproduced'; END IF;
 IF NOT EXISTS(SELECT 1 FROM carts WHERE email='changed@example.invalid') THEN RAISE EXCEPTION 'Guest tampering not reproduced'; END IF;
 IF NOT EXISTS(SELECT 1 FROM cart_items WHERE cart_id='10000000-0000-0000-0000-000000000003' AND NOT is_selected) THEN RAISE EXCEPTION 'Cart selection bypass not reproduced'; END IF;
END $$;
SET ROLE anon;
SELECT (upsert_stripe_payment_transaction('pi_SYNTHETIC','00000000-0000-0000-0000-000000000001',NULL,0.50,'usd','succeeded','card','{}',NULL)).user_id AS anonymous_reassigned_payment_owner;
RESET ROLE;
SET ROLE authenticated;
SET request.jwt.claim.role = 'authenticated';
SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
UPDATE orders SET printify_order_id=NULL WHERE order_number='TEST-VICTIM';
INSERT INTO orders(user_id,order_number,customer_email,payment_status,status,total_amount) VALUES
 ('00000000-0000-0000-0000-000000000002','TEST-FORGED','fake@example.invalid','paid','cancelled',100);
UPDATE payment_transactions SET amount=999,status='failed' WHERE user_id=auth.uid();
SELECT 'AUTH_FORGED_PAID_ORDER' AS check_name,order_number,payment_status,status FROM orders WHERE order_number='TEST-FORGED';
RESET ROLE;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM orders WHERE order_number='TEST-VICTIM' AND printify_order_id IS NULL) THEN RAISE EXCEPTION 'Fulfillment field tampering not reproduced'; END IF;
END $$;
SET ROLE authenticated;
SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
UPDATE payment_transactions SET amount=999,status='failed' WHERE user_id=auth.uid();
SELECT 'AUTH_PAYMENT_TAMPERING' AS check_name,amount,status FROM payment_transactions;
RESET ROLE;
SELECT 'TARGETED_REPRO_COMPLETE' AS result;
''')
