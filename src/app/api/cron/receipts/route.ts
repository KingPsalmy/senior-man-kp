import { serviceClient } from "@/lib/admin"
import { deliverReceipt } from "@/lib/receipts"
import { errorResponse } from "@/lib/security"

export async function GET(req: Request) {
  if (
    !process.env.CRON_SECRET ||
    req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  )
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { data, error } = await serviceClient()
      .from("receipt_outbox")
      .select("reference")
      .is("sent_at", null)
      .lte("next_attempt_at", new Date().toISOString())
      .order("next_attempt_at")
      .limit(20)
    if (error) throw error
    let sent = 0,
      failed = 0
    for (const job of data ?? []) {
      try {
        if (await deliverReceipt(job.reference)) sent++
      } catch {
        failed++
      }
    }
    return Response.json({ sent, failed }, { status: failed ? 503 : 200 })
  } catch (error) {
    return errorResponse(error)
  }
}
