"""Run security migration regressions in a disposable PostgreSQL cluster.

Requires PostgreSQL binaries on PATH (or PG_BINDIR). Never connects to an
existing database. Run: python3 tests/security_database_test.py
"""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import os
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
BINDIR = os.environ.get("PG_BINDIR", "")
OWNER = "00000000-0000-0000-0000-000000000001"


def binary(name):
    return str(Path(BINDIR) / name) if BINDIR else name


with tempfile.TemporaryDirectory(prefix="stamp-security-") as directory:
    cluster = Path(directory) / "data"
    subprocess.run([binary("initdb"), "-D", str(cluster), "-U", "postgres", "-A", "trust"], check=True, capture_output=True)
    subprocess.run([binary("pg_ctl"), "-D", str(cluster), "-l", str(Path(directory) / "server.log"), "-o", f"-k {directory} -c listen_addresses=''", "-w", "start"], check=True, capture_output=True)

    def sql(statement):
        result = subprocess.run([binary("psql"), "-X", "-h", directory, "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-At"], input=statement, text=True, capture_output=True)
        if result.returncode:
            raise AssertionError(result.stderr)
        return result.stdout.strip()

    def migration(name):
        sql((ROOT / "supabase/migrations" / name).read_text())

    def grant(reference):
        return sql(f"SET ROLE service_role; SELECT grant_stripe_purchase_credits('{reference}', '{OWNER}', 1000, 10, 'USD');").splitlines()[-1]

    try:
        sql("""
          CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
          CREATE SCHEMA auth; CREATE SCHEMA extensions;
          CREATE TABLE auth.users(id uuid PRIMARY KEY);
          CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS
            $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
          CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS
            $$ SELECT current_setting('request.jwt.claim.role', true) $$;
          ALTER DATABASE postgres SET search_path = public, extensions;
          GRANT USAGE ON SCHEMA auth, public, extensions TO anon, authenticated, service_role;
        """)
        for name in [
            "20260101015400_create_payment_transactions.sql",
            "20260115000000_create_core_tables.sql",
            "20260314000000_add_coins_and_deduct_coin_rpc.sql",
            "20260314000001_add_paypal_support.sql",
            "20260402000000_add_promocodes_support.sql",
            "20260414100001_remove_legacy_stripe_columns.sql",
            "20260419120001_add_user_id_to_products.sql",
            "20260415100000_drop_orders_fulfillment_status.sql",
            "20260627120000_add_missing_orders_columns.sql",
            "20260714000008_add_order_id_to_stripe_upsert.sql",
            "20260707000000_security_hardening_rls.sql",
            "20260908000000_fix_security_review.sql",
        ]:
            if name == "20260627120000_add_missing_orders_columns.sql":
                # Apply the order-column cleanup from the catalog migration,
                # without requiring its unrelated catalog tables.
                cleanup = (ROOT / "supabase/migrations/20260621000000_cleanup_unused_schema.sql").read_text()
                sql("\n".join(line for line in cleanup.splitlines() if line.startswith("ALTER TABLE orders ")))
            migration(name)

        sql(f"""
          INSERT INTO auth.users VALUES ('{OWNER}');
          INSERT INTO orders(id, user_id, order_number, customer_email, total_amount)
            VALUES ('{OWNER}', '{OWNER}', 'TEST', 'test@example.test', 10);
          GRANT SELECT, UPDATE ON orders TO authenticated;
          CREATE POLICY security_test_order_update ON orders FOR UPDATE USING (auth.uid() = user_id);
        """)
        # A legitimate update must not refer to the removed Stripe columns.
        sql(f"SET ROLE authenticated; SET request.jwt.claim.sub = '{OWNER}'; SET request.jwt.claim.role = 'authenticated'; UPDATE orders SET tracking_url = 'https://tracking.example.test/order' WHERE id = '{OWNER}';")
        try:
            sql(f"SET ROLE authenticated; SET request.jwt.claim.sub = '{OWNER}'; SET request.jwt.claim.role = 'authenticated'; UPDATE orders SET total_amount = 1 WHERE id = '{OWNER}';")
            raise AssertionError("Protected amount update unexpectedly succeeded")
        except AssertionError as error:
            assert "Not allowed to modify protected order columns" in str(error), error
        print("PASS: authenticated order updates and protected columns")

        for role in ["anon", "authenticated"]:
            try:
                sql(f"SET ROLE {role}; SELECT grant_stripe_purchase_credits('pi_forbidden', '{OWNER}', 1000, 10, 'USD');")
                raise AssertionError("Unprivileged credit grant unexpectedly succeeded")
            except AssertionError as error:
                assert "permission denied" in str(error), error
        print("PASS: credit grants restricted to service role")

        with ThreadPoolExecutor(max_workers=8) as pool:
            results = list(pool.map(grant, ["pi_duplicate"] * 8))
        assert results.count("t") == 1, results
        assert sql(f"SELECT credits FROM user_credits WHERE user_id = '{OWNER}'") == "100"
        assert sql("SELECT count(*) FROM credit_transactions WHERE reference_id = 'pi_duplicate'") == "1"
        print("PASS: concurrent duplicate delivery grants once")

        with ThreadPoolExecutor(max_workers=8) as pool:
            list(pool.map(grant, [f"pi_distinct_{i}" for i in range(8)]))
        assert sql(f"SELECT credits FROM user_credits WHERE user_id = '{OWNER}'") == "900"
        print("PASS: concurrent distinct payments do not lose credits")

        # Fail the last write to verify the claim and balance both roll back.
        sql("""CREATE FUNCTION fail_test_payment() RETURNS trigger LANGUAGE plpgsql AS $$
          BEGIN IF NEW.stripe_payment_intent_id = 'pi_retry' THEN RAISE EXCEPTION 'injected failure'; END IF; RETURN NEW; END $$;
          CREATE TRIGGER fail_test_payment BEFORE INSERT ON payment_transactions FOR EACH ROW EXECUTE FUNCTION fail_test_payment();""")
        try:
            grant("pi_retry")
            raise AssertionError("Injected failure unexpectedly succeeded")
        except AssertionError as error:
            assert "injected failure" in str(error), error
        assert sql("SELECT count(*) FROM credit_transactions WHERE reference_id = 'pi_retry'") == "0"
        assert sql(f"SELECT credits FROM user_credits WHERE user_id = '{OWNER}'") == "900"
        sql("DROP TRIGGER fail_test_payment ON payment_transactions;")
        assert grant("pi_retry") == "t"
        assert sql(f"SELECT credits FROM user_credits WHERE user_id = '{OWNER}'") == "1000"
        print("PASS: failed accounting write rolls back and retry succeeds")
    finally:
        subprocess.run([binary("pg_ctl"), "-D", str(cluster), "-m", "immediate", "-w", "stop"], check=True, capture_output=True)
