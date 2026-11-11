begin;
create table public.receipt_outbox (
  reference text primary key,
  payload jsonb not null,
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.receipt_outbox enable row level security;
revoke all on public.receipt_outbox from public, anon, authenticated;
grant all on public.receipt_outbox to service_role;
create index receipt_outbox_pending on public.receipt_outbox(next_attempt_at) where sent_at is null;

create function public.enqueue_paid_receipt() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'paid' then
    insert into public.receipt_outbox(reference, payload)
    values(new.paystack_reference, jsonb_build_object('email', new.email, 'items', new.items, 'total', new.total))
    on conflict do nothing;
  end if;
  return new;
end $$;
revoke all on function public.enqueue_paid_receipt() from public, anon, authenticated;
create trigger enqueue_paid_receipt after insert on public.orders for each row execute function public.enqueue_paid_receipt();

create function public.claim_receipt(p_reference text)
returns setof public.receipt_outbox language sql security definer set search_path = '' as $$
  update public.receipt_outbox set attempts = attempts + 1, next_attempt_at = now() + interval '5 minutes'
  where reference = p_reference and sent_at is null and next_attempt_at <= now()
  returning *;
$$;
revoke all on function public.claim_receipt(text) from public, anon, authenticated;
grant execute on function public.claim_receipt(text) to service_role;
commit;
