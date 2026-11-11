import { serviceClient } from "@/lib/admin"
import { errorResponse, normalizeEmail, readJson, RequestError, validReference } from "@/lib/security"
import { rateLimit } from "@/lib/rate-limit"
export async function POST(req: Request) {
  try {
    const body = await readJson(req)
    const email = normalizeEmail(body.email)
    if (!validReference(body.reference)) throw new RequestError("Enter the payment reference from your receipt.")
    await rateLimit(req, "download-lookup", 10)
    const db = serviceClient()
    const { data, error } = await db.from("purchases")
      .select("id,beat_id,license_type,amount_paid,download_token,download_expires_at,created_at,payment_status")
      .eq("customer_email", email).eq("paystack_reference", body.reference).eq("payment_status", "success").order("created_at", { ascending: false })
    if (error) throw error
    if (!data?.length) throw new RequestError("No matching purchase. Check your email and payment reference.", 404)
    const { data: beats, error: beatError } = await db.from("beats").select("id,title,is_exclusive_sold").in("id", data.map(p => p.beat_id))
    if (beatError) throw beatError
    return Response.json({ success: true, purchases: data.map(p => ({ ...p, beat_title: beats?.find(b => b.id === p.beat_id)?.title ?? "Beat", beat_is_exclusive_sold: beats?.find(b => b.id === p.beat_id)?.is_exclusive_sold ?? true })) })
  } catch (error) { return errorResponse(error) }
}
