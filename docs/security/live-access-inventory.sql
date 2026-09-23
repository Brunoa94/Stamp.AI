-- Read-only deployment verification. Run with an authorized database admin.
-- No customer rows or secret values are selected. This is NOT a migration.
BEGIN READ ONLY;
SELECT current_database(), version();
SELECT n.nspname AS schema_name, c.relname, c.relkind,
       c.relrowsecurity AS rls_enabled, c.relforcerowsecurity AS rls_forced
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname IN ('public','storage') AND c.relkind IN ('r','p','v','m')
ORDER BY 1,2;
SELECT schemaname,tablename,policyname,roles,cmd,qual,with_check
FROM pg_policies WHERE schemaname IN ('public','storage') ORDER BY 1,2,3;
SELECT p.oid::regprocedure AS function_signature, p.prosecdef AS security_definer,
       pg_get_userbyid(p.proowner) AS owner, p.proconfig AS function_settings,
       has_function_privilege('anon',p.oid,'EXECUTE') AS anon_execute,
       has_function_privilege('authenticated',p.oid,'EXECUTE') AS user_execute,
       has_function_privilege('service_role',p.oid,'EXECUTE') AS service_execute
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' ORDER BY 1;
SELECT grantee,table_schema,table_name,privilege_type
FROM information_schema.role_table_grants
WHERE grantee IN ('anon','authenticated','service_role')
  AND table_schema IN ('public','storage') ORDER BY 1,2,3,4;
SELECT grantee,table_name,column_name,privilege_type
FROM information_schema.column_privileges
WHERE grantee IN ('anon','authenticated') AND table_schema='public'
ORDER BY 1,2,3,4;
SELECT pg_get_userbyid(defaclrole) AS owner,
       defaclnamespace::regnamespace AS schema_name, defaclobjtype, defaclacl
FROM pg_default_acl;
SELECT id,name,public,file_size_limit,allowed_mime_types FROM storage.buckets;
SELECT t.tgrelid::regclass AS table_name,t.tgname,t.tgenabled,
       t.tgfoid::regprocedure AS function_signature
FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid
JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE NOT t.tgisinternal AND n.nspname='public' ORDER BY 1,2;
SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;
ROLLBACK;
