import test from "node:test"
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { PGlite } from "@electric-sql/pglite"

test("access migration blocks anonymous/non-admin data access and retains admin reads and uploads", async () => {
  const db = new PGlite()
  try {
    await db.exec(`
      create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; create schema storage;
      create table auth.users(id uuid primary key, email text);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      create table public.admin_users(id uuid, email text);
      create table public.beats(id uuid, wav_url text);
      create table public.purchases(id uuid); create table public.orders(id uuid);
      create table public.guests(id uuid); create table public.cart_items(id uuid);
      create table public.favorites(id uuid); create table public.upgrade_requests(id uuid);
      create function public.unlock_stale_beats() returns boolean language sql security definer as $$ select true $$;
      create table storage.buckets(id text, public boolean);
      create table storage.objects(id text, bucket_id text);
      alter table storage.objects enable row level security;
      grant usage on schema public,auth,storage to anon, authenticated, service_role;
      grant all on all tables in schema public,storage to anon, authenticated;
      grant select(wav_url) on public.beats to anon;
      create policy unsafe_storage on storage.objects for all to anon, authenticated using (true) with check (true);
      insert into public.beats values(gen_random_uuid(), 'private.wav');
      insert into public.cart_items values(gen_random_uuid());
      insert into auth.users values('10000000-0000-4000-8000-000000000001','admin@example.com');
      insert into public.admin_users select id,email from auth.users;
      insert into storage.buckets values('wavs',true),('covers',true);
      insert into storage.objects values('secret','wavs'),('cover','covers');
    `)
    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/202611060002_access_control.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    )
    await db.exec("set role anon")
    await assert.rejects(
      db.query("select wav_url from public.beats"),
      /permission denied/,
    )
    await assert.rejects(
      db.query("select * from public.cart_items"),
      /permission denied/,
    )
    await assert.rejects(
      db.query("select public.unlock_stale_beats()"),
      /permission denied/,
    )
    assert.equal(
      (await db.query("select * from storage.objects")).rows.length,
      1,
    )
    await assert.rejects(
      db.query("insert into storage.objects values('attack','covers')"),
      /row-level security/,
    )
    await db.exec("reset role; set role authenticated")
    assert.equal((await db.query("select * from public.beats")).rows.length, 0)
    await assert.rejects(
      db.query(
        "insert into public.admin_users values(gen_random_uuid(),'attacker@example.com')",
      ),
      /permission denied/,
    )
    await db.query(
      "select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',false)",
    )
    assert.equal((await db.query("select * from public.beats")).rows.length, 1)
    await db.query("insert into storage.objects values('admin-cover','covers')")
    await assert.rejects(
      db.query("delete from public.purchases"),
      /permission denied/,
    )
  } finally {
    await db.close()
  }
})

test("receipt outbox is transactional, private, leased and retryable", async () => {
  const db = new PGlite()
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role;
      create table public.orders(paystack_reference text, status text, email text, items jsonb, total numeric);`)
    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/202611060003_receipt_outbox.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    )
    await db.exec(
      "begin; insert into public.orders values('rolled-back','paid','buyer@example.com','[]',100); rollback;",
    )
    assert.equal(
      (await db.query("select * from public.receipt_outbox")).rows.length,
      0,
    )
    await db.exec(
      "insert into public.orders values('paid-order','paid','buyer@example.com','[]',100)",
    )
    assert.equal(
      (await db.query("select * from public.claim_receipt('paid-order')")).rows
        .length,
      1,
    )
    assert.equal(
      (await db.query("select * from public.claim_receipt('paid-order')")).rows
        .length,
      0,
    )
    await db.exec(
      "update public.receipt_outbox set next_attempt_at = now() - interval '1 minute'",
    )
    assert.equal(
      (
        await db.query<{ attempts: number }>(
          "select * from public.claim_receipt('paid-order')",
        )
      ).rows[0].attempts,
      2,
    )
    await db.exec(
      "update public.receipt_outbox set sent_at = now(), next_attempt_at = now() - interval '1 minute'",
    )
    assert.equal(
      (await db.query("select * from public.claim_receipt('paid-order')")).rows
        .length,
      0,
    )
    await db.exec("set role anon")
    await assert.rejects(
      db.query("select * from public.receipt_outbox"),
      /permission denied/,
    )
    await assert.rejects(
      db.query("select * from public.claim_receipt('paid-order')"),
      /permission denied/,
    )
  } finally {
    await db.close()
  }
})
