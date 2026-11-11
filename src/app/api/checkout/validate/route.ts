import { guestSession, requireSameOrigin } from "@/lib/guest-session"
import { priceCart, signQuote, type Quote } from "@/lib/checkout"
import {
  errorResponse,
  normalizeEmail,
  readJson,
  RequestError,
} from "@/lib/security"
import { rateLimit } from "@/lib/rate-limit"
export async function POST(req: Request) {
  try {
    requireSameOrigin(req)
    const session = guestSession(req)
    const body = await readJson(req)
    const email = normalizeEmail(body.email)
    if (
      typeof body.name !== "string" ||
      !body.name.trim() ||
      body.name.length > 100 ||
      typeof body.legal_name !== "string" ||
      !body.legal_name.trim() ||
      body.legal_name.length > 100
    )
      throw new RequestError(
        "Please enter your name and artist name (up to 100 characters).",
      )
    await rateLimit(req, "checkout", 20)
    const cart = await priceCart(body.items)
    const quote: Quote = {
      version: 1,
      expires_at: Date.now() + 30 * 60 * 1000,
      reference: "SMKP-" + crypto.randomUUID(),
      email,
      guest_id: session.id,
      items: cart.items,
      subtotal: cart.subtotal,
      discount: cart.discount,
      total: cart.total,
      name: body.name.trim(),
      legal_name: body.legal_name.trim(),
    }
    return Response.json(
      {
        valid: true,
        ...cart,
        reference: quote.reference,
        checkout: signQuote(quote),
      },
      { headers: session.cookie ? { "Set-Cookie": session.cookie } : {} },
    )
  } catch (error) {
    return errorResponse(error)
  }
}
