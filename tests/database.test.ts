import test from "node:test"
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { PGlite } from "@electric-sql/pglite"

test("migration enforces atomic fulfillment, replay safety, exclusive ownership and rate limits", async () => {
  const db = new PGlite()
  try {
    await db.exec(`
      create role anon; create role authenticated; create role service_role;
      create table public.beats (id uuid primary key, title text, is_published boolean default true, is_exclusive_sold boolean default false, status text default 'available', locked_at timestamptz);
      create table public.purchases (id uuid primary key default gen_random_uuid(), beat_id uuid references public.beats, customer_email text, customer_name text, artist_name text, license_type text, amount_paid numeric, paystack_reference text, payment_status text, download_token uuid, download_expires_at timestamptz);
      create table public.orders (id uuid primary key default gen_random_uuid(), guest_id uuid, email text, paystack_reference text, status text, subtotal numeric, discount numeric, total numeric, items jsonb, download_tokens jsonb);
    `)
    await db.exec(await readFile(new URL("../supabase/migrations/202611050001_security.sql", import.meta.url), "utf8"))
    const beatId = "10000000-0000-4000-8000-000000000001"
    const otherId = "10000000-0000-4000-8000-000000000002"
    await db.query("insert into public.beats(id,title) values ($1,'First'),($2,'Second')", [beatId, otherId])
    const quote = { reference: "SMKP-test-one", guest_id: beatId, email: "buyer@example.com", legal_name: "Buyer", name: "Artist", subtotal: 180000, discount: 0, total: 180000, freeItems: [], items: [{ beat_id: beatId, license_type: "exclusive", price: 180000 }] }
    const fulfill = (value: unknown) => db.query<{ result: { created: boolean } }>("select public.fulfill_verified_order($1::jsonb) as result", [JSON.stringify(value)])
    assert.equal((await fulfill(quote)).rows[0].result.created, true)
    const token = (await db.query("select download_token from public.purchases")).rows[0]
    assert.equal((await fulfill(quote)).rows[0].result.created, false)
    assert.deepEqual((await db.query("select download_token from public.purchases")).rows[0], token)
    await assert.rejects(fulfill({ ...quote, reference: "SMKP-test-two" }), /unavailable/)
    // First item would insert successfully, second is sold; entire transaction rolls back.
    await assert.rejects(fulfill({ ...quote, reference: "SMKP-test-three", items: [{ beat_id: otherId, license_type: "basic", price: 30000 }, ...quote.items] }), /unavailable/)
    assert.equal((await db.query<{ count: number }>("select count(*)::int as count from public.purchases")).rows[0].count, 1)
    assert.equal((await db.query<{ done: boolean }>("select public.record_completed_refund($1,$2) as done", [quote.reference, beatId])).rows[0].done, true)
    assert.equal((await db.query<{ done: boolean }>("select public.record_completed_refund($1,$2) as done", [quote.reference, beatId])).rows[0].done, false)
    assert.equal((await db.query<{ download_token: string | null }>("select download_token from public.purchases")).rows[0].download_token, null)
    await assert.rejects(fulfill(quote), /reconciliation/)
    for (let i = 0; i < 3; i++) {
      const result = await db.query<{ allowed: boolean }>("select public.consume_request_limit('test',2,60) as allowed")
      assert.equal(result.rows[0].allowed, i < 2)
    }
    await db.exec("set role anon")
    await assert.rejects(fulfill(quote), /permission denied/)
    await assert.rejects(db.query("select public.consume_request_limit('test',2,60)"), /permission denied/)
  } finally { await db.close() }
})
