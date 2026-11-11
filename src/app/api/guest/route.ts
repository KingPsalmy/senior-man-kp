import { serviceClient } from "@/lib/admin"
import { PUBLIC_BEAT_FIELDS } from "@/lib/catalog"
import { guestSession, requireSameOrigin } from "@/lib/guest-session"
import { errorResponse, isUuid, readJson, RequestError } from "@/lib/security"
import { rateLimit } from "@/lib/rate-limit"

export async function GET(req: Request) {
  try {
    const session = guestSession(req)
    const db = serviceClient()
    const [cart, favorites] = await Promise.all([
      db
        .from("cart_items")
        .select(`beat_id,license_type,beats(${PUBLIC_BEAT_FIELDS})`)
        .eq("guest_id", session.id)
        .order("created_at", { ascending: false })
        .limit(100),
      db
        .from("favorites")
        .select(`beat_id,beats(${PUBLIC_BEAT_FIELDS})`)
        .eq("guest_id", session.id)
        .order("created_at", { ascending: false })
        .limit(500),
    ])
    if (cart.error || favorites.error) throw new Error("Guest data unavailable")
    return Response.json(
      { cart: cart.data, favorites: favorites.data },
      { headers: session.cookie ? { "Set-Cookie": session.cookie } : {} },
    )
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(req: Request) {
  try {
    requireSameOrigin(req)
    const body = await readJson(req)
    if (
      !["cart", "favorites"].includes(String(body.collection)) ||
      !["put", "remove", "clear"].includes(String(body.action))
    )
      throw new RequestError("Invalid action")
    if (body.action !== "clear" && !isUuid(body.beat_id))
      throw new RequestError("Invalid beat")
    if (
      body.collection === "cart" &&
      body.action === "put" &&
      !["basic", "premium", "unlimited", "exclusive"].includes(
        String(body.license_type),
      )
    )
      throw new RequestError("Invalid license")
    const session = guestSession(req)
    await rateLimit(req, "guest-write", 120)
    const db = serviceClient()
    const table = body.collection === "cart" ? "cart_items" : "favorites"
    if (body.action === "put") {
      const beat = await db
        .from("beats")
        .select("id")
        .eq("id", body.beat_id)
        .eq("is_published", true)
        .eq("is_exclusive_sold", false)
        .maybeSingle()
      if (beat.error || !beat.data)
        throw new RequestError("This beat is unavailable", 409)
      const { error } = await db
        .from(table)
        .upsert(
          {
            guest_id: session.id,
            beat_id: body.beat_id,
            ...(table === "cart_items"
              ? { license_type: body.license_type }
              : {}),
          },
          { onConflict: "guest_id,beat_id" },
        )
      if (error) throw error
    } else {
      let query = db.from(table).delete().eq("guest_id", session.id)
      if (body.action === "remove") query = query.eq("beat_id", body.beat_id)
      const { error } = await query
      if (error) throw error
    }
    return Response.json(
      { success: true },
      { headers: session.cookie ? { "Set-Cookie": session.cookie } : {} },
    )
  } catch (error) {
    return errorResponse(error)
  }
}
