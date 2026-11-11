-- Deploy with the server-owned catalog and signed guest-session endpoints.
-- Export existing policies/grants first; validate in staging before production.
begin;

create or replace function public.is_store_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.admin_users a join auth.users u on lower(a.email) = lower(u.email)
    where u.id = auth.uid()
  );
$$;

-- Remove permissive policies rather than adding policies that would OR with them.
do $$
declare t text; policy_record record; col record; f record;
begin
  foreach t in array array['beats','purchases','orders','guests','cart_items','favorites','admin_users','upgrade_requests'] loop
    execute format('alter table public.%I enable row level security', t);
    for policy_record in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy %I on public.%I', policy_record.policyname, t);
    end loop;
    execute format('revoke all on public.%I from public, anon, authenticated', t);
    -- Table revocation alone does not remove pre-existing column grants.
    for col in select column_name from information_schema.columns where table_schema = 'public' and table_name = t loop
      execute format('revoke all (%I) on public.%I from public, anon, authenticated', col.column_name, t);
    end loop;
    execute format('grant all on public.%I to service_role', t);
    execute format('grant select on public.%I to authenticated', t);
    execute format('create policy admin_read on public.%I for select to authenticated using ((select public.is_store_admin()))', t);
  end loop;
  -- Legacy lifecycle RPCs must not bypass table protection.
  for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.prokind='f' loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.signature);
    execute format('grant execute on function %s to service_role', f.signature);
  end loop;
end $$;
grant execute on function public.is_store_admin() to anon, authenticated;
alter default privileges in schema public revoke execute on functions from public;

-- Restrictive guards also constrain any existing permissive storage policies.
create policy store_storage_read_guard on storage.objects as restrictive for select to anon, authenticated
using (bucket_id not in ('wavs','stems','licenses') or (select public.is_store_admin()));
create policy store_storage_insert_guard on storage.objects as restrictive for insert to anon, authenticated
with check (bucket_id not in ('covers','previews','wavs','stems','licenses') or (select public.is_store_admin()));
create policy store_storage_update_guard on storage.objects as restrictive for update to anon, authenticated
using (bucket_id not in ('covers','previews','wavs','stems','licenses') or (select public.is_store_admin()))
with check (bucket_id not in ('covers','previews','wavs','stems','licenses') or (select public.is_store_admin()));
create policy store_storage_delete_guard on storage.objects as restrictive for delete to anon, authenticated
using (bucket_id not in ('covers','previews','wavs','stems','licenses') or (select public.is_store_admin()));
create policy store_storage_admin on storage.objects for all to authenticated
using (bucket_id in ('covers','previews','wavs','stems','licenses') and (select public.is_store_admin()))
with check (bucket_id in ('covers','previews','wavs','stems','licenses') and (select public.is_store_admin()));

-- Public-file endpoints bypass object SELECT policies, so bucket privacy matters too.
update storage.buckets set public = false where id in ('wavs','stems','licenses');
commit;
