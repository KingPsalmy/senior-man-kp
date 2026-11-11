-- Apply in staging first, then production BEFORE deploying this application.
-- All functions below are service-role only; browser clients cannot mint purchases.
begin;

create table if not exists public.request_limits (
  key text primary key,
  hits integer not null,
  expires_at timestamptz not null
);
alter table public.request_limits enable row level security;
create index if not exists request_limits_expiry on public.request_limits(expires_at);
revoke all on public.request_limits from anon, authenticated;

create or replace function public.consume_request_limit(p_key text, p_limit integer, p_window integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  if p_limit < 1 or p_window < 1 or p_window > 86400 then return false; end if;
  delete from public.request_limits where expires_at < now() - interval '1 day';
  insert into public.request_limits as r (key, hits, expires_at)
  values (p_key, 1, now() + make_interval(secs => p_window))
  on conflict (key) do update set
    hits = case when r.expires_at <= now() then 1 else least(r.hits + 1, p_limit + 1) end,
    expires_at = case when r.expires_at <= now() then now() + make_interval(secs => p_window) else r.expires_at end
  returning hits into n;
  return n <= p_limit;
end $$;
revoke all on function public.consume_request_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_request_limit(text, integer, integer) to service_role;

-- Fail migration if old duplicate references exist; reconcile them before retrying.
create unique index if not exists purchases_reference_beat_unique on public.purchases(paystack_reference, beat_id);
create unique index if not exists orders_reference_unique on public.orders(paystack_reference) where paystack_reference is not null;

create or replace function public.fulfill_verified_order(p_quote jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  item jsonb;
  beat public.beats%rowtype;
  existing public.orders%rowtype;
  tokens jsonb := '{}'::jsonb;
  token uuid;
  result jsonb;
  ref text := p_quote->>'reference';
begin
  -- Serialize retries and concurrent callback/webhook requests for this reference.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(ref, 0));
  select * into existing from public.orders where paystack_reference = ref;
  if found then
    if existing.status <> 'paid' or lower(existing.email) <> p_quote->>'email' then
      raise exception 'Order cannot be fulfilled';
    end if;
    select jsonb_agg(jsonb_build_object('beat_title', b.title, 'license_type', p.license_type, 'amount_paid', p.amount_paid))
      into result from public.purchases p join public.beats b on b.id = p.beat_id
      where p.paystack_reference = ref and p.payment_status = 'success';
    if jsonb_array_length(coalesce(result, '[]'::jsonb)) <> jsonb_array_length(p_quote->'items') then
      raise exception 'Order requires reconciliation';
    end if;
    return jsonb_build_object('created', false, 'purchases', result);
  end if;

  -- Consistent lock order prevents deadlocks. Locks cover every license tier so
  -- a lease and an exclusive sale cannot race each other past availability checks.
  perform b.id from public.beats b
    where b.id in (select (j->>'beat_id')::uuid from jsonb_array_elements(p_quote->'items') j)
    order by b.id for update;

  for item in select * from jsonb_array_elements(p_quote->'items') loop
    select * into beat from public.beats where id = (item->>'beat_id')::uuid;
    if not found or not beat.is_published or beat.is_exclusive_sold then
      raise exception 'Beat unavailable: manual payment reconciliation required';
    end if;
    if item->>'license_type' not in ('basic','premium','unlimited','exclusive') then
      raise exception 'Invalid license';
    end if;
    token := gen_random_uuid();
    tokens := tokens || jsonb_build_object(beat.id::text, token::text);
    insert into public.purchases(beat_id, customer_email, customer_name, artist_name, license_type, amount_paid, paystack_reference, payment_status, download_token, download_expires_at)
    values (beat.id, p_quote->>'email', p_quote->>'legal_name', p_quote->>'name', item->>'license_type',
      case when p_quote->'freeItems' ? (beat.id::text) then 0 else (item->>'price')::numeric end,
      ref, 'success', token, null);
    if item->>'license_type' = 'exclusive' then
      update public.beats set is_exclusive_sold = true, is_published = false, status = 'sold_exclusive', locked_at = null where id = beat.id;
    end if;
  end loop;

  insert into public.orders(guest_id, email, paystack_reference, status, subtotal, discount, total, items, download_tokens)
  values ((p_quote->>'guest_id')::uuid, p_quote->>'email', ref, 'paid', (p_quote->>'subtotal')::numeric,
    (p_quote->>'discount')::numeric, (p_quote->>'total')::numeric, p_quote->'items', tokens);
  delete from public.orders where guest_id = (p_quote->>'guest_id')::uuid and lower(email) = p_quote->>'email' and status = 'pending';
  select jsonb_agg(jsonb_build_object('beat_title', b.title, 'license_type', p.license_type, 'amount_paid', p.amount_paid))
    into result from public.purchases p join public.beats b on b.id = p.beat_id where p.paystack_reference = ref;
  return jsonb_build_object('created', true, 'purchases', result);
end $$;
revoke all on function public.fulfill_verified_order(jsonb) from public, anon, authenticated;
grant execute on function public.fulfill_verified_order(jsonb) to service_role;

-- This records a refund already completed in the payment provider dashboard.
create or replace function public.record_completed_refund(p_reference text, p_beat_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare purchase public.purchases%rowtype;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_reference, 0));
  perform id from public.beats where id = p_beat_id for update;
  select * into purchase from public.purchases where paystack_reference = p_reference and beat_id = p_beat_id for update;
  if not found or purchase.payment_status <> 'success' then return false; end if;
  update public.purchases set payment_status = 'refunded', download_token = null where id = purchase.id;
  if purchase.license_type = 'exclusive' then
    update public.beats set is_exclusive_sold = false, is_published = true, status = 'available', locked_at = null where id = p_beat_id;
  end if;
  return true;
end $$;
revoke all on function public.record_completed_refund(text, uuid) from public, anon, authenticated;
grant execute on function public.record_completed_refund(text, uuid) to service_role;

commit;
