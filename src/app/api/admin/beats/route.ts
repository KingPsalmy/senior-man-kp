import { requireAdmin, serviceClient } from "@/lib/admin"
import { beatInput } from "@/lib/beat-input"
import { errorResponse, isUuid, readJson, RequestError } from "@/lib/security"
export async function POST(req: Request) {
  try {
    await requireAdmin(req)
    const values = beatInput(await readJson(req), true)
    const { data, error } = await serviceClient().from("beats").insert(values).select().single()
    if (error) throw error
    return Response.json({ success: true, beat: data })
  } catch (error) { return errorResponse(error) }
}
export async function PATCH(req: Request) {
  try {
    await requireAdmin(req)
    const body = await readJson(req)
    if (!isUuid(body.id)) throw new RequestError("Invalid beat ID")
    const { data, error } = await serviceClient().from("beats").update(beatInput(body)).eq("id", body.id).select().single()
    if (error) throw error
    return Response.json({ success: true, beat: data })
  } catch (error) { return errorResponse(error) }
}
export async function DELETE(req: Request) {
  try {
    await requireAdmin(req)
    const id = new URL(req.url).searchParams.get("id")
    if (!isUuid(id)) throw new RequestError("Invalid beat ID")
    const { error } = await serviceClient().from("beats").delete().eq("id", id)
    if (error) throw error
    return Response.json({ success: true })
  } catch (error) { return errorResponse(error) }
}
