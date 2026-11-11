import { fulfillPayment } from "@/lib/fulfillment"
import { errorResponse, normalizeEmail, readJson, RequestError, validReference } from "@/lib/security"
import { rateLimit } from "@/lib/rate-limit"
export async function POST(req: Request) {
  try {
    const body = await readJson(req)
    const email = normalizeEmail(body.customer_email)
    if (!validReference(body.reference)) throw new RequestError("Invalid payment reference")
    await rateLimit(req, "verify-payment", 30)
    const response = await fetch("https://api.paystack.co/transaction/verify/" + encodeURIComponent(body.reference), {
      headers: { Authorization: "Bearer " + process.env.PAYSTACK_SECRET_KEY }, cache: "no-store", signal: AbortSignal.timeout(15000),
    })
    if (!response.ok) throw new RequestError("Payment verification is temporarily unavailable.", 502)
    const result = await response.json()
    if (!result.status || !result.data || result.data.reference !== body.reference) throw new RequestError("Payment could not be verified.")
    if (normalizeEmail(result.data.customer?.email) !== email) throw new RequestError("Payment could not be verified.", 403)
    const purchases = await fulfillPayment(result.data)
    return Response.json({ success: true, purchases, purchase: { beat_title: purchases.map(p => p.beat_title).join(", "), license_type: purchases.length === 1 ? purchases[0].license_type : "multiple", amount_paid: result.data.amount / 100 } })
  } catch (error) { return errorResponse(error) }
}
