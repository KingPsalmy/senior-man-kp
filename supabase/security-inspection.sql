-- READ ONLY. Run with a database administrator in staging and production.
-- Do not paste customer rows, secrets or raw access tokens into an audit report.
select n.nspname as schema, c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname in ('public','storage') and c.relkind = 'r'
order by 1,2;

select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies where schemaname in ('public','storage') order by 1,2,3;

select grantee, table_name, privilege_type from information_schema.role_table_grants
where table_schema = 'public' and grantee in ('anon','authenticated') order by 1,2,3;

select grantee, routine_name, privilege_type from information_schema.role_routine_grants
where routine_schema = 'public' and grantee in ('PUBLIC','anon','authenticated') order by 1,2;

select id, name, public from storage.buckets;

select count(*) as duplicate_purchase_keys from (
  select paystack_reference, beat_id from public.purchases
  group by paystack_reference, beat_id having count(*) > 1
) duplicates;

select count(*) as duplicate_order_references from (
  select paystack_reference from public.orders where paystack_reference is not null
  group by paystack_reference having count(*) > 1
) duplicates;
