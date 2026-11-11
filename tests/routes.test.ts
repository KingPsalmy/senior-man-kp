import test from "node:test"
import assert from "node:assert/strict"
import { NextRequest } from "next/server"

// No production credentials or services are used by this suite.
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.invalid"
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-placeholder"
process.env.RESEND_API_KEY = "re_test_placeholder"
process.env.PAYSTACK_SECRET_KEY = "test-placeholder"

test("admin mutations reject anonymous requests before touching the database", async () => {
  const routes = await import("../src/app/api/admin/beats/route")
  let calls = 0
  const original = globalThis.fetch
  globalThis.fetch = async () => { calls++; throw new Error("Unexpected network request") }
  try {
    for (const method of ["POST", "PATCH", "DELETE"] as const) {
      const result = await routes[method](new Request("https://example.com/api/admin/beats", { method }))
      assert.equal(result.status, 401)
    }
    assert.equal(calls, 0)
  } finally { globalThis.fetch = original }
})

test("signed-in non-admin cannot mutate the catalog", async () => {
  const { POST } = await import("../src/app/api/admin/beats/route")
  const original = globalThis.fetch
  globalThis.fetch = async (input, init) => {
    const url = String(input)
    assert.equal(init?.method ?? "GET", "GET")
    if (url.includes("/auth/v1/user")) return Response.json({ id: "user", email: "user@example.com" })
    assert.ok(url.includes("/rest/v1/admin_users"))
    return Response.json([])
  }
  try {
    const response = await POST(new Request("https://example.com/api/admin/beats", { method: "POST", headers: { authorization: "Bearer fake-user-token" }, body: '{"title":"tampered"}' }))
    assert.equal(response.status, 403)
  } finally { globalThis.fetch = original }
})

test("email-only lookups and forged test orders cannot issue downloads", async () => {
  const { POST: lookup } = await import("../src/app/api/my-downloads/lookup/route")
  const { POST: bypass } = await import("../src/app/api/checkout/test-order/route")
  const original = globalThis.fetch
  globalThis.fetch = async () => { throw new Error("Unexpected network request") }
  try {
    const response = await lookup(new Request("https://example.com", { method: "POST", body: '{"email":"buyer@example.com"}' }))
    assert.equal(response.status, 400)
    assert.equal((await bypass()).status, 410)
  } finally { globalThis.fetch = original }
})

test("download endpoint denies expired and refunded tokens before storage signing", async () => {
  const { GET } = await import("../src/app/api/download/route")
  const original = globalThis.fetch
  try {
    globalThis.fetch = async input => {
      assert.ok(String(input).includes("payment_status=eq.success"))
      return Response.json({ beat_id: "test", download_expires_at: "2000-01-01T00:00:00Z" })
    }
    const url = "https://example.com/api/download?token=10000000-0000-4000-8000-000000000001"
    assert.equal((await GET(new NextRequest(url))).status, 410)
    globalThis.fetch = async () => Response.json({ message: "No row" }, { status: 406 })
    assert.equal((await GET(new NextRequest(url))).status, 404)
  } finally { globalThis.fetch = original }
})
