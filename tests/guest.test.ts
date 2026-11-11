import test from "node:test"
import assert from "node:assert/strict"
import {
  guestSession,
  GUEST_COOKIE,
  signGuest,
  verifyGuest,
  requireSameOrigin,
} from "../src/lib/guest-session"
process.env.GUEST_SESSION_SECRET = "test-only-guest-secret-not-for-deployment"
const id = "10000000-0000-4000-8000-000000000001"
test("guest identity rejects unsigned IDs, tampering and expired sessions", () => {
  assert.equal(verifyGuest(id), null)
  assert.equal(verifyGuest(signGuest(id)), id)
  assert.equal(
    verifyGuest(signGuest(id).replace(id, id.replace(/1$/, "2"))),
    null,
  )
  assert.equal(verifyGuest(signGuest(id, Date.now() - 1)), null)
  const session = guestSession(
    new Request("https://example.com", {
      headers: { cookie: `senkp_guest_id=${id}` },
    }),
  )
  assert.notEqual(session.id, id)
  assert.match(session.cookie!, /HttpOnly; SameSite=Lax/)
  assert.equal(
    guestSession(
      new Request("https://example.com", {
        headers: { cookie: `${GUEST_COOKIE}=${signGuest(id)}` },
      }),
    ).id,
    id,
  )
})
test("guest mutations reject cross-origin and form submissions", () => {
  assert.throws(
    () =>
      requireSameOrigin(
        new Request("https://example.com/api/guest", {
          headers: {
            origin: "https://attacker.example",
            "content-type": "application/json",
          },
        }),
      ),
    /Cross-site/,
  )
  assert.throws(
    () =>
      requireSameOrigin(
        new Request("https://example.com/api/guest", {
          headers: { "content-type": "text/plain" },
        }),
      ),
    /JSON/,
  )
})
test("origin checks use the browser target host without trusting forwarded hosts", () => {
  const url = "http://localhost:3100/api/guest"
  const headers = { host: "127.0.0.1:3100", origin: "http://127.0.0.1:3100", "content-type": "application/json" }
  assert.doesNotThrow(() => requireSameOrigin(new Request(url, { headers })))
  assert.throws(() => requireSameOrigin(new Request(url, { headers: { ...headers, origin: "https://attacker.example", "x-forwarded-host": "attacker.example" } })), /Cross-site/)
  assert.throws(() => requireSameOrigin(new Request(url, { headers: { ...headers, origin: "null" } })), /Cross-site/)
  assert.throws(() => requireSameOrigin(new Request(url, { headers: { host: headers.host, "content-type": "application/json" } })), /Cross-site/)
})
test("guest endpoint scopes changes to its signed session regardless of caller-supplied IDs", async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.invalid"
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-only-placeholder"
  const { POST } = await import("../src/app/api/guest/route")
  const original = globalThis.fetch
  let removed = false
  globalThis.fetch = async (input, init) => {
    const url = String(input)
    if (url.includes("consume_request_limit")) return Response.json(true)
    assert.equal(init?.method, "DELETE")
    assert.ok(url.includes(`guest_id=eq.${id}`))
    assert.ok(!url.includes("victim"))
    removed = true
    return new Response(null, { status: 204 })
  }
  try {
    const response = await POST(
      new Request("https://example.com/api/guest", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "https://example.com",
          cookie: `${GUEST_COOKIE}=${signGuest(id)}`,
        },
        body: JSON.stringify({
          collection: "cart",
          action: "clear",
          guest_id: "victim",
        }),
      }),
    )
    assert.equal(response.status, 200)
    assert.ok(removed)
  } finally {
    globalThis.fetch = original
  }
})
