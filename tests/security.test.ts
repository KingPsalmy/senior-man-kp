import test from "node:test"
import assert from "node:assert/strict"
import { createHmac } from "node:crypto"
import { readJson, validSignature, normalizeEmail, escapeHtml } from "../src/lib/security"
import { parseItems, signQuote, verifyQuote, type Quote } from "../src/lib/checkout"
import { calculateDiscount } from "../src/lib/discount"
import { beatInput } from "../src/lib/beat-input"

process.env.PAYSTACK_SECRET_KEY = "test-only-secret-not-a-real-credential"
const ids = ["10000000-0000-4000-8000-000000000001", "10000000-0000-4000-8000-000000000002", "10000000-0000-4000-8000-000000000003"]
const quote: Quote = { version: 1, expires_at: Date.parse("2026-11-05T13:30:00Z"), reference: "SMKP-test-reference", email: "buyer@example.com", guest_id: ids[0], items: [{ beat_id: ids[0], license_type: "premium", price: 70000, title: "Test beat" }], subtotal: 70000, total: 70000, discount: 0, name: "Artist", legal_name: "Buyer" }
const transaction = { paid_at: "2026-11-05T13:00:00Z", reference: quote.reference, amount: 7000000, currency: "NGN", customer: { email: quote.email } }

test("webhook signatures reject missing, malformed, truncated and changed payloads", () => {
  const signature = createHmac("sha512", "secret").update("body").digest("hex")
  assert.equal(validSignature("body", signature, "secret"), true)
  for (const invalid of [null, "", "zz", signature.slice(2), signature + "00"]) assert.equal(validSignature("body", invalid, "secret"), false)
  assert.equal(validSignature("tampered", signature, "secret"), false)
  assert.equal(validSignature("body", signature, undefined), false)
})

test("signed checkout binds amount, currency, email and reference", () => {
  const checkout = signQuote(quote)
  assert.deepEqual(verifyQuote({ checkout }, transaction), quote)
  for (const change of [{ paid_at: "2026-11-05T14:00:00Z" }, { amount: 100 }, { currency: "USD" }, { reference: "another-reference" }, { customer: { email: "attacker@example.com" } }]) {
    assert.throws(() => verifyQuote({ checkout }, { ...transaction, ...change }))
  }
  assert.throws(() => verifyQuote({ checkout: { ...checkout, payload: checkout.payload.replace("premium", "exclusive") } }, transaction))
  assert.throws(() => verifyQuote({ items: quote.items }, transaction))
})

test("cart validation rejects duplicates, invalid tiers and excessive carts", () => {
  const item = quote.items[0]
  assert.throws(() => parseItems([item, item]))
  assert.throws(() => parseItems([{ ...item, license_type: "__proto__" }]))
  assert.throws(() => parseItems([{ ...item, beat_id: "not-a-uuid" }]))
  assert.throws(() => parseItems(Array(31).fill(item)))
  assert.throws(() => parseItems([]))
  assert.equal(parseItems([{ ...item, price: 1 }])[0].license_type, "premium")
})

test("bundle discounts use catalog prices and the cheapest eligible beat", () => {
  const items = ids.map((beat_id, i) => ({ beat_id, license_type: "basic" as const, beats: { basic_price: [50000, 20000, 30000][i] } }))
  const result = calculateDiscount(items)
  assert.equal(result.subtotal, 100000)
  assert.equal(result.discount, 20000)
  assert.equal(result.total, 80000)
  assert.deepEqual(result.freeItems, [ids[1]])
  assert.equal(calculateDiscount([items[0], { ...items[1], license_type: "premium", price: 70000 }, items[2]]).discount, 0)
})

test("request parsing rejects arrays, malformed JSON and oversized streams", async () => {
  for (const body of ["[1]", "null", "broken", JSON.stringify({ value: "x".repeat(33000) })]) {
    await assert.rejects(readJson(new Request("https://example.com", { method: "POST", body })))
  }
  assert.deepEqual(await readJson(new Request("https://example.com", { method: "POST", body: '{"ok":true}' })), { ok: true })
})

test("admin input blocks mass assignment and unsafe URLs", () => {
  assert.throws(() => beatInput({ is_exclusive_sold: false }))
  assert.throws(() => beatInput({ basic_price: -1 }))
  assert.throws(() => beatInput({ preview_url: "javascript:alert(1)" }))
  assert.throws(() => beatInput({ title: "Valid", arbitrary: true }))
  assert.deepEqual(beatInput({ title: "Updated", is_published: true }), { title: "Updated", is_published: true })
})

test("email and HTML handling reject header injection and escape untrusted text", () => {
  assert.equal(normalizeEmail(" Buyer@Example.com "), "buyer@example.com")
  assert.throws(() => normalizeEmail("a@example.com\r\nBcc: victim@example.com"))
  assert.equal(escapeHtml('<img src="x">'), "&lt;img src=&quot;x&quot;&gt;")
})
