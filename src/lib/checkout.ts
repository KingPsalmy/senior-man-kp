import { createHmac } from "node:crypto"
import { LICENSES, calculateDiscount } from "./discount"
import type { LicenseType } from "./cart"
import { isUuid, normalizeEmail, RequestError, validSignature } from "./security"
import { serviceClient } from "./admin"

export type CheckoutItem = { beat_id: string; title: string; license_type: LicenseType; price: number }
export type Quote = { version: 1; reference: string; email: string; guest_id: string; items: CheckoutItem[]; subtotal: number; discount: number; total: number; name: string; legal_name: string; expires_at: number }

export function parseItems(value: unknown): { beat_id: string; license_type: LicenseType }[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 30) throw new RequestError("Choose between 1 and 30 beats.")
  const seen = new Set<string>()
  return value.map(item => {
    if (!item || !isUuid(item.beat_id) || !LICENSES.includes(item.license_type) || seen.has(item.beat_id.toLowerCase())) throw new RequestError("Invalid or duplicate cart item.")
    seen.add(item.beat_id.toLowerCase())
    return { beat_id: item.beat_id.toLowerCase(), license_type: item.license_type }
  })
}

export async function priceCart(value: unknown) {
  const items = parseItems(value)
  const { data, error } = await serviceClient().from("beats")
    .select("id,title,is_published,is_exclusive_sold,basic_price,premium_price,unlimited_price,exclusive_price")
    .in("id", items.map(i => i.beat_id))
  if (error) throw new Error("Catalog unavailable")
  const priced = items.map(item => {
    const beat = data?.find(b => b.id === item.beat_id)
    if (!beat || !beat.is_published || beat.is_exclusive_sold) throw new RequestError("One of these beats is no longer available. Please update your cart.", 409)
    const price = Number(beat[`${item.license_type}_price`])
    if (!Number.isFinite(price) || price <= 0) throw new RequestError("This license is not currently available.", 409)
    return { ...item, title: beat.title as string, price }
  })
  return { ...calculateDiscount(priced), items: priced }
}

export function signQuote(quote: Quote) {
  if (!process.env.PAYSTACK_SECRET_KEY) throw new Error("Payment configuration missing")
  const payload = JSON.stringify(quote)
  const signature = createHmac("sha256", process.env.PAYSTACK_SECRET_KEY).update(`checkout:${payload}`).digest("hex")
  return { payload, signature }
}

export function verifyQuote(metadata: unknown, transaction: { reference: string; amount: number; currency: string; customer: { email: string }; paid_at: string }): Quote {
  const envelope = metadata as { checkout?: { payload?: unknown; signature?: unknown } }
  const payload = envelope?.checkout?.payload
  if (typeof payload !== "string" || !validSignature(`checkout:${payload}`, envelope?.checkout?.signature, process.env.PAYSTACK_SECRET_KEY, "sha256")) throw new RequestError("Unrecognized checkout. Please contact support.", 422)
  const quote: Quote = JSON.parse(payload)
  if (quote.version !== 1 || quote.reference !== transaction.reference || transaction.currency !== "NGN" || normalizeEmail(transaction.customer.email) !== quote.email || transaction.amount !== Math.round(quote.total * 100)) throw new RequestError("Payment details do not match the order.", 422)
  parseItems(quote.items)
  // Compare the provider's payment time, so a delayed webhook can still retry.
  const paidAt = Date.parse(transaction.paid_at)
  if (!Number.isFinite(paidAt) || !Number.isFinite(quote.expires_at) || paidAt > quote.expires_at) throw new RequestError("This checkout expired before payment. Please contact support with your reference.", 422)
  return quote
}
