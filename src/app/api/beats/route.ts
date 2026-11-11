export { POST, PATCH, DELETE } from "../admin/beats/route"
import { serviceClient } from "@/lib/admin"
import { PUBLIC_BEAT_FIELDS } from "@/lib/catalog"
import { errorResponse, isUuid, RequestError } from "@/lib/security"

export async function GET(req: Request) {
  try {
    const params = new URL(req.url).searchParams
    let query = serviceClient()
      .from("beats")
      .select(PUBLIC_BEAT_FIELDS)
      .eq("is_published", true)
      .eq("is_exclusive_sold", false)
      .order("created_at", { ascending: false })
    for (const key of ["slug", "genre"] as const) {
      const value = params.get(key)
      if (value && value.length > 200) throw new RequestError("Invalid filter")
      if (value) query = query.eq(key, value)
    }
    if (params.has("ids")) {
      const ids = params.get("ids")!.split(",")
      if (ids.length > 50 || !ids.every(isUuid))
        throw new RequestError("Invalid beat IDs")
      query = query.in("id", ids)
    }
    const exclude = params.get("exclude")
    if (exclude) {
      if (!isUuid(exclude)) throw new RequestError("Invalid beat ID")
      query = query.neq("id", exclude)
    }
    const limit = Number(params.get("limit") || 1000)
    if (!Number.isInteger(limit) || limit < 1 || limit > 1000)
      throw new RequestError("Invalid limit")
    const { data, error } = await query.limit(limit)
    if (error) throw error
    return Response.json({ beats: data })
  } catch (error) {
    return errorResponse(error)
  }
}
