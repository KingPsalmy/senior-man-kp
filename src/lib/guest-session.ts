import { createHmac, randomUUID } from "node:crypto"
import { isUuid, RequestError, validSignature } from "./security"

export const GUEST_COOKIE =
  process.env.NODE_ENV === "production" ? "__Host-kp_guest" : "kp_guest"
const MAX_AGE = 365 * 24 * 60 * 60
function secret() {
  const key =
    process.env.GUEST_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key)
    throw new RequestError("Guest sessions are temporarily unavailable", 503)
  return key
}
export function signGuest(id: string, expires = Date.now() + MAX_AGE * 1000) {
  const payload = `guest-v1:${id}:${expires}`
  return `${id}.${expires}.${createHmac("sha256", secret()).update(payload).digest("hex")}`
}
export function verifyGuest(value: string | undefined): string | null {
  const [id, expiry, signature, extra] = (value || "").split(".")
  if (
    extra ||
    !isUuid(id) ||
    !/^\d{13}$/.test(expiry || "") ||
    Number(expiry) <= Date.now()
  )
    return null
  return validSignature(
    `guest-v1:${id}:${expiry}`,
    signature,
    secret(),
    "sha256",
  )
    ? id
    : null
}
export function guestSession(req: Request) {
  const value = req.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${GUEST_COOKIE}=`))
    ?.slice(GUEST_COOKIE.length + 1)
  const existing = verifyGuest(value)
  const id = existing || randomUUID()
  return {
    id,
    cookie: existing
      ? null
      : `${GUEST_COOKIE}=${signGuest(id)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  }
}
export function requireSameOrigin(req: Request) {
  if (!req.headers.get("content-type")?.startsWith("application/json"))
    throw new RequestError("JSON required", 415)
  // Next can reconstruct req.url with its bind hostname (localhost) rather
  // than the browser's target (127.0.0.1). Host is browser-controlled, unlike
  // client-supplied X-Forwarded-Host, which must not be trusted here.
  const target = new URL(req.url)
  const host = req.headers.get("host")
  if (host) {
    if (/[\s/@?#\\]/.test(host)) throw new RequestError("Invalid host", 403)
    target.host = host
    if (target.host !== host.toLowerCase()) throw new RequestError("Invalid host", 403)
  }
  // Support TLS termination only for the explicitly configured public host.
  const site = process.env.NEXT_PUBLIC_SITE_URL
  if (site) {
    const configured = new URL(site)
    if (target.host === configured.host && configured.protocol === "https:")
      target.protocol = "https:"
  }
  const origin = req.headers.get("origin")
  if (
    req.headers.get("sec-fetch-site") === "cross-site" ||
    !origin || origin !== target.origin
  )
    throw new RequestError("Cross-site request rejected", 403)
}
