import { createHmac, timingSafeEqual } from "node:crypto"

export class RequestError extends Error {
  constructor(message: string, public status = 400) { super(message) }
}

export const isUuid = (value: unknown): value is string =>
  typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)

export function normalizeEmail(value: unknown): string {
  if (typeof value !== "string" || value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    throw new RequestError("Please enter a valid email address.")
  }
  return value.trim().toLowerCase()
}

export function validReference(value: unknown): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9._=-]{6,150}$/.test(value)
}

export function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)
}

export function validSignature(body: string, signature: unknown, secret: string | undefined, algorithm = "sha512") {
  if (!secret || typeof signature !== "string" || !/^[a-f0-9]+$/i.test(signature)) return false
  const expected = createHmac(algorithm, secret).update(body).digest()
  const actual = Buffer.from(signature, "hex")
  return actual.length === expected.length && signature.length === expected.length * 2 && timingSafeEqual(actual, expected)
}

export async function readText(req: Request, maxBytes = 32_768): Promise<string> {
  // Read a bounded stream; Content-Length alone is controlled by the caller.
  const reader = req.body?.getReader()
  if (!reader) throw new RequestError("Missing request body")
  const chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > maxBytes) { await reader.cancel(); throw new RequestError("Request is too large", 413) }
    chunks.push(value)
  }
  return Buffer.concat(chunks).toString("utf8")
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  const text = await readText(req)
  try {
    const body = JSON.parse(text)
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error()
    return body
  } catch { throw new RequestError("Invalid JSON body") }
}

export function errorResponse(error: unknown) {
  if (error instanceof RequestError) return Response.json({ error: error.message }, { status: error.status })
  console.error("[request failed]", error instanceof Error ? error.message : "Service error")
  return Response.json({ error: "We couldn't complete that request. Please try again." }, { status: 500 })
}
