import { serviceClient } from "@/lib/admin"
import { errorResponse, isUuid, readJson, RequestError } from "@/lib/security"
import { rateLimit } from "@/lib/rate-limit"
export async function POST(req: Request) {
  try {
    const { beat_id } = await readJson(req)
    if (!isUuid(beat_id)) throw new RequestError("Invalid beat ID")
    await rateLimit(req, "plays", 60)
    const db = serviceClient()
    const { data, error } = await db.from("beats").select("id").eq("id", beat_id).eq("is_published", true).single()
    if (error || !data) throw new RequestError("Beat not found", 404)
    const { error: incrementError } = await db.rpc("increment_play_count", { beat_id })
    if (incrementError) throw incrementError
    return Response.json({ success: true })
  } catch (error) { return errorResponse(error) }
}
