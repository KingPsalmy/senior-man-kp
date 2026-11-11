import { guestSession, requireSameOrigin } from "@/lib/guest-session"
import { serviceClient } from "@/lib/admin"
import { priceCart } from "@/lib/checkout"
import { errorResponse, normalizeEmail, readJson } from "@/lib/security"
import { rateLimit } from "@/lib/rate-limit"
export async function POST(req: Request) {
  try {
    requireSameOrigin(req)
    const session = guestSession(req)
    const body = await readJson(req)
    const email = normalizeEmail(body.email)
    await rateLimit(req, "save-pending", 20)
    const cart = await priceCart(body.items)
    const db = serviceClient()
    const { data: existing, error: lookupError } = await db
      .from("orders")
      .select("id")
      .eq("guest_id", session.id)
      .eq("email", email)
      .eq("status", "pending")
      .limit(1)
      .maybeSingle()
    if (lookupError) throw lookupError
    const record = {
      email,
      items: cart.items,
      subtotal: cart.subtotal,
      discount: cart.discount,
      total: cart.total,
    }
    const { error } = existing
      ? await db.from("orders").update(record).eq("id", existing.id)
      : await db
          .from("orders")
          .insert({
            ...record,
            guest_id: session.id,
            paystack_reference: "PENDING-" + crypto.randomUUID(),
            status: "pending",
          })
    if (error) throw error
    return Response.json(
      { success: true },
      { headers: session.cookie ? { "Set-Cookie": session.cookie } : {} },
    )
  } catch (error) {
    return errorResponse(error)
  }
}
