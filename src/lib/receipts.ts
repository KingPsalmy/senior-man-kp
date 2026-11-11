import { serviceClient } from "./admin"
import { downloadPortalPath } from "./download-link"
import { escapeHtml } from "./security"
import { resend } from "./resend"

export async function deliverReceipt(reference: string) {
  const db = serviceClient()
  const { data, error } = await db.rpc("claim_receipt", {
    p_reference: reference,
  })
  if (error) throw new Error("Receipt queue unavailable")
  const job = data?.[0]
  if (!job) return false
  const order = job.payload as {
    email: string
    total: number
    items: { title: string; license_type: string }[]
  }
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://www.seniormankp.com"
  const { error: mailError } = await resend.emails.send(
    {
      from: `Senior Man KP <${process.env.RESEND_FROM_EMAIL || "noreply@seniormankp.com"}>`,
      to: order.email,
      subject: "Your beats are ready — Senior Man KP",
      html: `<div style="font-family:sans-serif;line-height:1.7"><h1>Payment confirmed</h1><p>Your beats are ready</p><ul>${order.items.map((i) => `<li>${escapeHtml(i.title)} — ${escapeHtml(i.license_type)}</li>`).join("")}</ul><p>Total: ₦${Number(order.total).toLocaleString("en-NG")}</p><p>Payment reference: <strong>${escapeHtml(reference)}</strong></p><p><a href="${escapeHtml(site + downloadPortalPath(order.email, reference))}">Access your downloads</a></p><p>Keep this email to return to your files anytime</p></div>`,
    },
    { idempotencyKey: `receipt/${reference}` },
  )
  if (mailError) throw new Error("Receipt provider unavailable")
  const updated = await db
    .from("receipt_outbox")
    .update({ sent_at: new Date().toISOString() })
    .eq("reference", reference)
    .eq("attempts", job.attempts)
  if (updated.error) throw new Error("Receipt confirmation could not be saved")
  return true
}
